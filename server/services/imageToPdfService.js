import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

/**
 * Converts single or multiple images (.jpg, .png, .webp, .bmp) into a single PDF document.
 */
export async function convertImagesToPdf(fileList) {
  const pdfDoc = await PDFDocument.create();

  for (const file of fileList) {
    const filePath = file.path || file;
    let fileBuffer = typeof filePath === 'string' ? await fs.promises.readFile(filePath) : file.buffer;
    const detectedMime = file.mimetype || mime.lookup(filePath) || 'image/jpeg';

    if (!ALLOWED_MIME_TYPES.includes(detectedMime) && !file.mimetype?.startsWith('image/')) {
      throw new Error(`Unsupported image format: ${file.originalname || file.filename || 'file'}`);
    }

    // Auto-orient via Sharp & convert webp/bmp to png/jpeg for pdf-lib compatibility
    const metadata = await sharp(fileBuffer).metadata().catch(() => null);
    let processedBuffer = fileBuffer;
    let embedFormat = 'jpg';

    if (metadata) {
      let pipeline = sharp(fileBuffer).rotate(); // Auto-rotate according to EXIF

      if (metadata.format === 'png' || detectedMime === 'image/png') {
        processedBuffer = await pipeline.png().toBuffer();
        embedFormat = 'png';
      } else {
        processedBuffer = await pipeline.jpeg({ quality: 95 }).toBuffer();
        embedFormat = 'jpg';
      }
    }

    // Embed into pdf-lib document
    const image = embedFormat === 'png'
      ? await pdfDoc.embedPng(processedBuffer)
      : await pdfDoc.embedJpg(processedBuffer);

    // Standard A4 Page [595, 842]
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 20;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const imgWidth = image.width;
    const imgHeight = image.height;

    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);

    const drawW = imgWidth * scale;
    const drawH = imgHeight * scale;

    page.drawImage(image, {
      x: (pageWidth - drawW) / 2,
      y: (pageHeight - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
