const pages = [
  'https://www.campus-universcascades.com/',
  'https://www.campus-universcascades.com/formation-de-cascadeur/',
  'https://www.campus-universcascades.com/stages-cascades-parkour-2/',
  'https://www.campus-universcascades.com/stunt-workshop-cuc/',
  'https://www.campus-universcascades.com/visite-guidee/',
  'https://www.campus-universcascades.com/equipe-cascadeurs-pro/',
  'https://www.campus-universcascades.com/videos-cascadeur/',
  'https://www.campus-universcascades.com/cuc-team-cascadeur/',
  'https://www.campus-universcascades.com/cuc-events-agence/',
  'https://www.campus-universcascades.com/contact-cuc/'
];

async function run() {
  for (const pageUrl of pages) {
    console.log('====================================================');
    console.log('PAGE:', pageUrl);
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      
      // Match all <img> tags
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      const images = [];
      while ((match = imgRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const src = match[1];
        
        // Extract alt if present
        const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : '';
        
        images.push({ src, alt });
      }

      // Also look for background-image in inline styles or slider markup
      const bgRegex = /background(?:-image)?:\s*url\(['"]?([^'")]+)['"]?\)/gi;
      while ((match = bgRegex.exec(html)) !== null) {
        images.push({ src: match[1], alt: '(background-image)' });
      }

      console.log(`Found ${images.length} images:`);
      for (const img of images) {
        console.log(`  - [ALT: "${img.alt}"] ${img.src}`);
      }
    } catch (e) {
      console.error('Error fetching ' + pageUrl + ':', e.message);
    }
  }
}

run();
