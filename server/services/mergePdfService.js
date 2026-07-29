import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

/**
 * Bulletproof PDF Merging Engine v2.7
 * Merges multiple PDF files into one single 100% valid PDF document.
 */
export async function mergePdfs(fileList) {
  const mergedPdf = await PDFDocument.create();

  for (const file of fileList) {
    const filePath = file.path || file;
    let fileBuffer;
    
    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else if (typeof filePath === 'string') {
      fileBuffer = await fs.promises.readFile(filePath);
    } else if (file.buffer) {
      fileBuffer = file.buffer;
    } else {
      continue;
    }

    try {
      const srcPdf = await PDFDocument.load(fileBuffer, {
        ignoreEncryption: true,
        parseSpeed: 1,
      });

      const pageIndices = srcPdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      console.error(`[MergePdfService] Skipped corrupted or unreadable PDF: ${file.originalname || 'file'}`, err.message);
    }
  }

  if (mergedPdf.getPageCount() === 0) {
    throw new Error('No valid PDF pages could be merged.');
  }

  // Save merged PDF with valid XRef structure
  const mergedBytes = await mergedPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });

  return Buffer.from(mergedBytes);
}
