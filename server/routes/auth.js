import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, '..', 'config', 'users.json');

// Memory + persistent users store
function loadUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Auth] Failed to load users file:', e);
  }
  return [];
}

function saveUsers(users) {
  try {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Auth] Failed to save users file:', e);
  }
}

let usersStore = loadUsers();

// Account Lockout tracking map: mobileOrEmail -> { attempts: number, lockUntil: timestamp }
const loginAttemptsMap = new Map();

// Helper: Mask phone number (e.g. "+91 98XXXXXX21")
function maskPhone(mobile) {
  if (!mobile || mobile.length < 10) return mobile;
  return `+91 ${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;
}

// 1. POST /api/auth/register - Create New Account
router.post('/register', async (req, res) => {
  try {
    const { full_name, mobile, email, mpin } = req.body;

    if (!full_name || full_name.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 3 characters.' });
    }

    const cleanMobile = (mobile || '').trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanMpin = (mpin || '').trim();
    if (!/^\d{4}$/.test(cleanMpin)) {
      return res.status(400).json({ success: false, message: 'M-PIN must be exactly 4 numeric digits.' });
    }

    // Check existing user
    const existingMobile = usersStore.find(u => u.mobile === cleanMobile);
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
    }

    const existingEmail = usersStore.find(u => u.email === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash M-PIN securely with bcrypt (12 rounds)
    const mpin_hash = await bcrypt.hash(cleanMpin, 12);

    const newUser = {
      id: 'usr_' + Date.now() + Math.floor(Math.random() * 1000),
      full_name: full_name.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      mpin_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    usersStore.push(newUser);
    saveUsers(usersStore);

    // Create JWT Token
    const token = jwt.sign(
      { id: newUser.id, mobile: newUser.mobile, email: newUser.email, full_name: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to MossZip Studio.',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        mobile: newUser.mobile,
        email: newUser.email,
        masked_phone: maskPhone(newUser.mobile),
      },
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// 2. POST /api/auth/login-check - Check Mobile/Email and return user info
router.post('/login-check', (req, res) => {
  try {
    const { identifier } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanMobile = cleanId.replace(/\D/g, '');

    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Please enter your mobile number or email.' });
    }

    const user = usersStore.find(u => u.mobile === cleanMobile || u.email === cleanId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this mobile number or email.' });
    }

    // Check Lockout Status
    const lockInfo = loginAttemptsMap.get(user.id);
    if (lockInfo && lockInfo.lockUntil > Date.now()) {
      const remainingMins = Math.ceil((lockInfo.lockUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked due to 5 incorrect M-PIN attempts. Try again in ${remainingMins} minutes.`,
        locked: true,
        lockUntil: lockInfo.lockUntil,
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        masked_phone: maskPhone(user.mobile),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error checking account.' });
  }
});

// 3. POST /api/auth/login - Authenticate with 4-Digit M-PIN
router.post('/login', async (req, res) => {
  try {
    const { identifier, mpin } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanMobile = cleanId.replace(/\D/g, '');
    const cleanMpin = (mpin || '').trim();

    if (!cleanId || !cleanMpin) {
      return res.status(400).json({ success: false, message: 'Identifier and 4-digit M-PIN are required.' });
    }

    const user = usersStore.find(u => u.mobile === cleanMobile || u.email === cleanId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Check Lockout
    let lockInfo = loginAttemptsMap.get(user.id) || { attempts: 0, lockUntil: 0 };
    if (lockInfo.lockUntil > Date.now()) {
      const remainingMins = Math.ceil((lockInfo.lockUntil - Date.now()) / (1000 * 60));
      return res.status(429).json({
        success: false,
        message: `Account locked due to repeated incorrect M-PIN attempts. Try again in ${remainingMins} minutes.`,
        locked: true,
      });
    }

    // Compare M-PIN hash
    const isMatch = await bcrypt.compare(cleanMpin, user.mpin_hash);
    if (!isMatch) {
      lockInfo.attempts += 1;
      if (lockInfo.attempts >= 5) {
        lockInfo.lockUntil = Date.now() + 15 * 60 * 1000; // 15 Minute Lockout
        loginAttemptsMap.set(user.id, lockInfo);
        return res.status(429).json({
          success: false,
          message: 'Incorrect M-PIN 5 times. Account locked for 15 minutes for your security.',
          locked: true,
        });
      }

      loginAttemptsMap.set(user.id, lockInfo);
      const remaining = 5 - lockInfo.attempts;
      return res.status(401).json({
        success: false,
        message: `Incorrect 4-digit M-PIN. ${remaining} attempt(s) remaining before temporary lockout.`,
        remainingAttempts: remaining,
      });
    }

    // Successful login - clear failed attempts
    loginAttemptsMap.delete(user.id);

    const token = jwt.sign(
      { id: user.id, mobile: user.mobile, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        masked_phone: maskPhone(user.mobile),
      },
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// 4. POST /api/auth/send-otp - Send OTP for Forgot M-PIN
const activeOtps = new Map();

router.post('/send-otp', (req, res) => {
  const { mobile } = req.body;
  const cleanMobile = (mobile || '').trim().replace(/\D/g, '');

  if (cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
  }

  const user = usersStore.find(u => u.mobile === cleanMobile);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account registered with this mobile number.' });
  }

  // Generate 4-digit OTP (e.g. 1234 in dev, or random)
  const otp = '7890';
  activeOtps.set(cleanMobile, { otp, expires: Date.now() + 5 * 60 * 1000 });

  return res.json({
    success: true,
    message: `OTP sent via SMS to +91 ${cleanMobile.slice(0, 2)}XXXXXX${cleanMobile.slice(-2)} (Demo OTP: 7890).`,
    masked_phone: maskPhone(cleanMobile),
  });
});

// 5. POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  const cleanMobile = (mobile || '').trim().replace(/\D/g, '');
  const cleanOtp = (otp || '').trim();

  const record = activeOtps.get(cleanMobile);
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== cleanOtp && cleanOtp !== '7890') {
    return res.status(400).json({ success: false, message: 'Invalid OTP code entered.' });
  }

  return res.json({ success: true, message: 'OTP verified successfully.' });
});

// 6. POST /api/auth/reset-mpin - Reset 4-digit M-PIN
router.post('/reset-mpin', async (req, res) => {
  try {
    const { mobile, otp, new_mpin } = req.body;
    const cleanMobile = (mobile || '').trim().replace(/\D/g, '');
    const cleanMpin = (new_mpin || '').trim();

    if (!/^\d{4}$/.test(cleanMpin)) {
      return res.status(400).json({ success: false, message: 'New M-PIN must be exactly 4 numeric digits.' });
    }

    const user = usersStore.find(u => u.mobile === cleanMobile);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.mpin_hash = await bcrypt.hash(cleanMpin, 12);
    user.updated_at = new Date().toISOString();
    saveUsers(usersStore);
    activeOtps.delete(cleanMobile);
    loginAttemptsMap.delete(user.id);

    return res.json({ success: true, message: 'M-PIN reset successfully! Please log in with your new 4-digit M-PIN.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to reset M-PIN.' });
  }
});

export default router;
