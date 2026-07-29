import fs from 'fs';
import path from 'path';
import { getCompressionLimits } from '../routes/admin.js';

// Simple in-memory IP rate limiter: max 30 requests per minute per IP
const ipRequestCounts = new Map();

setInterval(() => {
  ipRequestCounts.clear();
}, 60 * 1000);

export function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const current = ipRequestCounts.get(ip) || 0;

  if (current >= 30) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please wait a minute before making more requests.',
    });
  }

  ipRequestCounts.set(ip, current + 1);
  next();
}

export function validateCompressionLimits(req, res, next) {
  const limits = getCompressionLimits();

  if (!limits || !limits.limits_enabled) {
    return next();
  }

  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);

  if (files.length === 0) {
    return next();
  }

  const imageExts = ['jpg', 'jpeg', 'png', 'webp'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv', '3gp'];

  let imageCount = 0;
  let videoCount = 0;
  let pdfCount = 0;
  let totalBytes = 0;

  for (const file of files) {
    const ext = (path.extname(file.originalname) || '').toLowerCase().replace('.', '');
    const mime = (file.mimetype || '').toLowerCase();
    totalBytes += (file.size || 0);

    if (imageExts.includes(ext) || mime.startsWith('image/')) {
      imageCount++;
    } else if (videoExts.includes(ext) || mime.startsWith('video/')) {
      videoCount++;
    } else if (ext === 'pdf' || mime === 'application/pdf') {
      pdfCount++;
    }
  }

  const totalMb = totalBytes / (1024 * 1024);

  // Validate Images Limit
  if (imageCount > limits.images_per_request) {
    return res.status(400).json({
      success: false,
      message: `You can compress a maximum of ${limits.images_per_request} images at a time.`,
    });
  }

  // Validate Videos Limit
  if (videoCount > limits.videos_per_request) {
    return res.status(400).json({
      success: false,
      message: `You can compress a maximum of ${limits.videos_per_request} videos at a time.`,
    });
  }

  // Validate PDFs Limit
  if (pdfCount > limits.pdfs_per_request) {
    return res.status(400).json({
      success: false,
      message: `You can compress a maximum of ${limits.pdfs_per_request} PDFs at a time.`,
    });
  }

  // Validate Total Upload Size Limit
  if (limits.max_total_upload_mb > 0 && totalMb > limits.max_total_upload_mb) {
    return res.status(400).json({
      success: false,
      message: `Total upload size exceeds maximum allowed limit of ${limits.max_total_upload_mb} MB.`,
    });
  }

  next();
}
