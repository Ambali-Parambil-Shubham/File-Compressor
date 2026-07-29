async function checkProd() {
  try {
    const res = await fetch('https://mosszip-file-compressor-1.onrender.com/');
    const html = await res.text();
    console.log('HTML Status:', res.status);

    const match = html.match(/src="(\/assets\/[^\"]+\.js)"/g);
    if (match) {
      for (const m of match) {
        const scriptPath = m.match(/src="([^"]+)"/)[1];
        const jsUrl = `https://mosszip-file-compressor-1.onrender.com${scriptPath}`;
        console.log('Script URL:', jsUrl);
        const jsRes = await fetch(jsUrl);
        const jsText = await jsRes.text();
        
        console.log('Contains max_total_upload_mb: 500 ?', jsText.includes('max_total_upload_mb:500') || jsText.includes('max_total_upload_mb: 500'));
        console.log('Contains max_total_upload_mb: 10000 ?', jsText.includes('max_total_upload_mb:10000') || jsText.includes('max_total_upload_mb: 10000'));
        console.log('Contains mosszip_admin_limits ?', jsText.includes('mosszip_admin_limits'));
        console.log('Contains mosszip_limits_updated ?', jsText.includes('mosszip_limits_updated'));
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkProd();
