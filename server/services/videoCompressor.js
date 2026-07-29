import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Configure FFmpeg binary path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * MossZip Ultra-Fast Video Compressor Engine (5GB+ Large File Support)
 * Codec: H.264 (libx264) with CRF 28, AAC 128k audio, yuv420p, +faststart, ultrafast preset & all CPU threads.
 */
export async function compressVideoFile(tempInputPath, extension = 'mp4') {
  const uuid = crypto.randomUUID();
  const tempOutputPath = path.join(os.tmpdir(), `output_${uuid}.mp4`);

  try {
    // Execute FFmpeg direct disk-to-disk compression with 10-minute timeout & sandboxing
    await new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .inputOptions(['-nostdin'])
        .outputOptions([
          '-c:v libx264',
          '-crf 28',
          '-preset ultrafast',
          '-threads 0',
          '-c:a aac',
          '-b:a 128k',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-max_muxing_queue_size 2048',
          '-map_metadata 0',
        ])
        .output(tempOutputPath)
        .timeout(600) // 10 minute execution limit to prevent infinite encoding loops
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    return tempOutputPath;
  } catch (err) {
    console.error('[VideoCompressor] FFmpeg compression error:', err);
    return tempInputPath;
  }
}

export async function compressVideo(buffer, extension = 'mp4') {
  const ext = (extension || 'mp4').toLowerCase().replace('.', '');
  const uuid = crypto.randomUUID();
  const tempInputPath = path.join(os.tmpdir(), `input_${uuid}.${ext}`);

  try {
    await fs.promises.writeFile(tempInputPath, buffer);
    const outputPath = await compressVideoFile(tempInputPath, extension);
    const compressedBuffer = await fs.promises.readFile(outputPath);

    try {
      if (fs.existsSync(tempInputPath)) await fs.promises.unlink(tempInputPath);
      if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
    } catch (e) {}

    return (compressedBuffer && compressedBuffer.length < buffer.length) ? compressedBuffer : buffer;
  } catch (err) {
    try {
      if (fs.existsSync(tempInputPath)) await fs.promises.unlink(tempInputPath);
    } catch (e) {}
    return buffer;
  }
}
