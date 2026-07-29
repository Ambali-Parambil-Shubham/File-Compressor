import JSZip from 'jszip';
import sharp from 'sharp';

/**
 * Ultra-Optimized Office Document Compressor (.pptx, .docx, .xlsx)
 * Preserves internal image extensions to avoid Word/PowerPoint repair warnings.
 */
export async function compressOfficeDoc(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);

    for (const fileName of files) {
      const file = zip.files[fileName];
      if (file.dir) continue;

      const isMediaImage = fileName.match(/(media|images|pictures)\/.*\.(png|jpg|jpeg|webp|tiff)$/i);
      if (isMediaImage) {
        try {
          const imgBuffer = await file.async('nodebuffer');
          const metadata = await sharp(imgBuffer).metadata().catch(() => null);

          if (metadata && metadata.width && metadata.height) {
            const maxDim = 400;
            let pipeline = sharp(imgBuffer).rotate();

            if (metadata.width > maxDim || metadata.height > maxDim) {
              pipeline = pipeline.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });
            }

            let optimizedBuffer;
            const lowerName = fileName.toLowerCase();

            if (lowerName.endsWith('.png')) {
              optimizedBuffer = await pipeline
                .png({ compressionLevel: 9, palette: true, quality: 60 })
                .toBuffer();
            } else if (lowerName.endsWith('.webp')) {
              optimizedBuffer = await pipeline
                .webp({ quality: 30, effort: 5 })
                .toBuffer();
            } else {
              optimizedBuffer = await pipeline
                .jpeg({ quality: 25, mozjpeg: true, progressive: true })
                .toBuffer();
            }

            if (optimizedBuffer && optimizedBuffer.length < imgBuffer.length) {
              zip.file(fileName, optimizedBuffer);
            }
          }
        } catch (imgErr) {}
      }
    }

    const compressedZipBytes = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return compressedZipBytes.length < buffer.length ? compressedZipBytes : buffer;
  } catch (err) {
    console.error('[OfficeCompressor] Error:', err);
    return buffer;
  }
}
