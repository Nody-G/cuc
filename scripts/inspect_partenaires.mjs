async function inspectPartenaires() {
  const res = await fetch('https://www.campus-universcascades.com/partenaires/');
  const html = await res.text();
  
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  console.log('--- IMAGES ON PARTENAIRES ---');
  while ((match = imgRegex.exec(html)) !== null) {
    const full = match[0];
    const src = match[1];
    const alt = full.match(/alt=["']([^"']*)["']/i)?.[1] || '';
    if (!src.includes('wp-content/plugins')) {
      console.log(`[ALT: ${alt}] -> ${src}`);
    }
  }

  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ');
  console.log('--- TEXT PREVIEW ---');
  console.log(text.slice(0, 1000));
}

inspectPartenaires();
