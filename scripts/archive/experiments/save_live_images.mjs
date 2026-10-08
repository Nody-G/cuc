import fs from 'fs';

const pages = [
  { slug: '/', url: 'https://www.campus-universcascades.com/' },
  { slug: '/formation-de-cascadeur', url: 'https://www.campus-universcascades.com/formation-de-cascadeur/' },
  { slug: '/stages-cascades-parkour-2', url: 'https://www.campus-universcascades.com/stages-cascades-parkour-2/' },
  { slug: '/stunt-workshop-cuc', url: 'https://www.campus-universcascades.com/stunt-workshop-cuc/' },
  { slug: '/visite-guidee', url: 'https://www.campus-universcascades.com/visite-guidee/' },
  { slug: '/equipe-cascadeurs-pro', url: 'https://www.campus-universcascades.com/equipe-cascadeurs-pro/' },
  { slug: '/videos-cascadeur', url: 'https://www.campus-universcascades.com/videos-cascadeur/' },
  { slug: '/cuc-team-cascadeur', url: 'https://www.campus-universcascades.com/cuc-team-cascadeur/' },
  { slug: '/cuc-events-agence', url: 'https://www.campus-universcascades.com/cuc-events-agence/' },
  { slug: '/contact-cuc', url: 'https://www.campus-universcascades.com/contact-cuc/' }
];

async function run() {
  const result = {};

  for (const p of pages) {
    try {
      const res = await fetch(p.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      const images = [];
      const seen = new Set();

      while ((match = imgRegex.exec(html)) !== null) {
        const fullTag = match[0];
        let src = match[1];
        
        // Skip base64 or flags
        if (src.includes('data:image') || src.includes('flags16.png') || src.includes('wp-includes')) continue;

        // Clean query strings or -300x200 if original exists
        const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : '';

        if (!seen.has(src)) {
          seen.add(src);
          images.push({ src, alt });
        }
      }

      result[p.slug] = images;
    } catch (e) {
      result[p.slug] = { error: e.message };
    }
  }

  fs.writeFileSync('scripts/live_cuc_images.json', JSON.stringify(result, null, 2));
  console.log('Saved to scripts/live_cuc_images.json');
}

run();
