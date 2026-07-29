async function runAuthE2ECheck() {
  console.log('=====================================================');
  console.log(' MOSSZIP STUDIO M-PIN AUTHENTICATION E2E TEST SUITE  ');
  console.log('=====================================================\n');

  const testUser = {
    full_name: 'Ambali Parambil Shubham',
    mobile: '9876543210',
    email: 'shubham_test@mosszip.com',
    mpin: '4321',
  };

  try {
    // 1. Account Registration
    const regRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const regData = await regRes.json();
    if (regRes.ok || regData.message.includes('already exists')) {
      console.log('✅ [PASS] Registration Test:', regData.message || 'User registered');
    } else {
      throw new Error(`Registration failed: ${regData.message}`);
    }

    // 2. Login Check (Step 1)
    const checkRes = await fetch('http://localhost:3001/api/auth/login-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUser.mobile }),
    });

    const checkData = await checkRes.json();
    if (checkRes.ok && checkData.user) {
      console.log('✅ [PASS] Login Check Step 1 (Masked Phone):', checkData.user.masked_phone, '| Name:', checkData.user.full_name);
    } else {
      throw new Error(`Login check failed: ${checkData.message}`);
    }

    // 3. Login with 4-Digit M-PIN (Step 2)
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUser.mobile, mpin: testUser.mpin }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      console.log('✅ [PASS] M-PIN Login Step 2 Success! JWT Token Issued.');
    } else {
      throw new Error(`M-PIN Login failed: ${loginData.message}`);
    }

    // 4. Invalid M-PIN Attempt Test
    const failRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: testUser.mobile, mpin: '0000' }),
    });

    const failData = await failRes.json();
    if (failRes.status === 401 && failData.remainingAttempts !== undefined) {
      console.log('✅ [PASS] Invalid M-PIN Rejection:', failData.message);
    } else {
      throw new Error('Invalid M-PIN was not properly rejected');
    }

    // 5. Send OTP Test
    const otpRes = await fetch('http://localhost:3001/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testUser.mobile }),
    });

    const otpData = await otpRes.json();
    if (otpRes.ok) {
      console.log('✅ [PASS] Send OTP Request:', otpData.message);
    } else {
      throw new Error(`Send OTP failed: ${otpData.message}`);
    }

    console.log('\n=====================================================');
    console.log(' ALL M-PIN AUTHENTICATION TESTS PASSED 100% SUCCESS ');
    console.log('=====================================================');
  } catch (err) {
    console.error('❌ [FAIL] Auth E2E Test Error:', err);
    process.exit(1);
  }
}

runAuthE2ECheck();
