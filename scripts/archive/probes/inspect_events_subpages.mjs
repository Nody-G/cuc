async function inspectSubPages() {
  const pages = [
    'https://www.campus-universcascades.com/animations-airbag-parkour/',
    'https://www.campus-universcascades.com/spectacles-cascadeurs-yamakasi/',
    'https://www.campus-universcascades.com/team-building-cascades/'
  ];

  for (const p of pages) {
    console.log('====================================');
    console.log('PAGE:', p);
    const res = await fetch(p);
    const html = await res.text();
    
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    const imgs = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (!src.includes('wp-content/plugins') && !src.includes('gravatar')) {
        imgs.push(src);
      }
    }
    console.log(`Images (${imgs.length}):`, imgs.slice(0, 10));

    const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ');
    console.log('Text snippet:', cleanText.slice(0, 1200));
  }
}

inspectSubPages();
