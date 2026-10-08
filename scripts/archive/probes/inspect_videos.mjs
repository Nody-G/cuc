async function checkVideosPage() {
  try {
    const res = await fetch('https://www.campus-universcascades.com/videos-cascadeur/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    const iframes = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('iframes:', iframes);
    const videoSources = [...html.matchAll(/<source[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('video sources:', videoSources);
    const links = [...html.matchAll(/href=["'](https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|dailymotion\.com|vimeo\.com)[^"']+)["']/gi)].map(m => m[1]);
    console.log('video links:', links);
    const mp4s = [...html.matchAll(/href=["']([^"']+\.mp4[^"']*)["']/gi)].map(m => m[1]);
    console.log('mp4 hrefs:', mp4s);

    const dmCalls = [...html.matchAll(/loadDailymotionVideo\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/gi)];
    console.log('Dailymotion calls:', dmCalls.map(m => ({ id: m[1], target: m[2] })));

    const ytCalls = [...html.matchAll(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi)];
    console.log('YouTube IDs:', [...new Set(ytCalls.map(m => m[1]))]);

    // Let's print all dm-video-container divs
    const containers = [...html.matchAll(/<div[^>]*class=["'][^"']*dm-video-container[^"']*["'][^>]*>/gi)];
    console.log('dm containers:', containers.map(m => m[0]));
  } catch (e) {
    console.error('Error:', e);
  }
}
checkVideosPage();
