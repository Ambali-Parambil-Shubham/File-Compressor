import fs from 'fs';
import path from 'path';

async function testProductionApi() {
  console.log('--- Testing Production HTTP API /api/compress ---');
  
  const dummyPdf = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Count 1 /Kids [3 0 R]>> endobj
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

  const blob = new Blob([dummyPdf], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, 'test.pdf');

  try {
    const res = await fetch('https://mosszip-file-compressor-1.onrender.com/api/compress', {
      method: 'POST',
      body: formData,
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('X-Original-Size:', res.headers.get('x-original-size'));
    console.log('X-Compressed-Size:', res.headers.get('x-compressed-size'));

    const arrayBuffer = await res.arrayBuffer();
    console.log(`Received Response Size: ${arrayBuffer.byteLength} bytes`);

    if (arrayBuffer.byteLength === 0) {
      console.error('CRITICAL BUG: Production server returned 0 BYTES!');
    } else {
      console.log('SUCCESS: Production server returned valid non-zero data!');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testProductionApi();
