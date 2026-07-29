async function checkHealth() {
  const urls = [
    'https://mosszip-file-compressor.onrender.com/api/health',
    'https://mosszip-file-compressor-1.onrender.com/api/health',
    'https://mosszip-api.onrender.com/api/health'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${text}\n`);
    } catch (e) {
      console.log(`URL: ${url} Failed: ${e.message}\n`);
    }
  }
}

checkHealth();
