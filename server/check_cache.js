async function checkCacheBust() {
  try {
    const url = `https://mosszip-file-compressor-1.onrender.com/?t=${Date.now()}`;
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
    const html = await res.text();
    const match = html.match(/src="(\/assets\/[^\"]+\.js)"/g);
    console.log('Cache Bust Script Tags:', match);
  } catch (e) {
    console.error(e);
  }
}
checkCacheBust();
