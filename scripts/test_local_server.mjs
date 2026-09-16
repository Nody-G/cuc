async function testAllRoutes() {
  const routes = [
    '/',
    '/visite-guidee',
    '/visite-virtuelle',
    '/partenaires',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/stunt-workshop-cuc',
    '/equipe-cascadeurs-pro',
    '/videos-cascadeur',
    '/cuc-team-cascadeur',
    '/cuc-events-agence',
    '/spectacles-cascadeurs-yamakasi',
    '/animations-airbag-parkour',
    '/team-building-cascades',
    '/contact-cuc'
  ];

  console.log('Testing local dev server on http://localhost:3000 :');
  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3000' + r);
      const text = await res.text();
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'OK';
      console.log(`[STATUS ${res.status}] ${r} -> ${title} (${text.length} bytes)`);
    } catch(e) {
      console.error('Error on ' + r + ':', e.message);
    }
  }
}
testAllRoutes();
