async function checkAllUrls() {
  const urls = [
    'https://mosszip-file-compressor-1.onrender.com',
    'https://mosszip-studio.onrender.com',
    'https://mosszip-api.onrender.com',
    'https://mosszip.onrender.com',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(`${url}/?t=${Date.now()}`);
      const text = await res.text();
      console.log(`URL: ${url} | Status: ${res.status} | Length: ${text.length}`);
      const scripts = text.match(/src="(\/assets\/[^\"]+\.js)"/g);
      console.log('  Scripts:', scripts);
    } catch (e) {
      console.log(`URL: ${url} | Error: ${e.message}`);
    }
  }
}

checkAllUrls();
