import fs from 'fs';
import path from 'path';
import { compressPdf } from './services/pdfCompressor.js';

async function testPdfEngine() {
  console.log('--- Testing PDF Compression Engine ---');
  const dummyPdf = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kinds [] /Count 1 /Kids [3 0 R]>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792]>> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer <</Size 4 /Root 1 0 R>>
startxref
190
%%EOF`;

  const inputBuffer = Buffer.from(dummyPdf, 'utf-8');
  console.log(`Input PDF Size: ${inputBuffer.length} bytes`);

  const outputBuffer = await compressPdf(inputBuffer);
  console.log(`Output PDF Size: ${outputBuffer.length} bytes`);

  if (!outputBuffer || outputBuffer.length === 0) {
    console.error('FAILED: Output PDF is 0 bytes!');
  } else if (outputBuffer.toString().startsWith('%PDF')) {
    console.log('SUCCESS: Output PDF is a valid PDF header!');
  } else {
    console.error('FAILED: Output is not a valid PDF file!');
  }
}

testPdfEngine();
