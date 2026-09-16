import fs from 'fs';

async function audit() {
  const res = await fetch('https://www.campus-universcascades.com/');
  const html = await res.text();
  
  // Extract nav
  const navMatch = html.match(/<nav[\s\S]*?<\/nav>/gi);
  console.log('--- NAV ---');
  if (navMatch) {
    const navLinks = [...navMatch[0].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    navLinks.forEach(m => {
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      console.log(`NAV: [${text}] -> ${m[1]}`);
    });
  }

  // Extract footer
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/gi);
  console.log('--- FOOTER ---');
  if (footerMatch) {
    const footerLinks = [...footerMatch[0].matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    footerLinks.forEach(m => {
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      console.log(`FOOTER: [${text}] -> ${m[1]}`);
    });
  }

  // Check the 5 extra pages
  const extraPages = [
    'https://www.campus-universcascades.com/partenaires/',
    'https://www.campus-universcascades.com/animations-airbag-parkour/',
    'https://www.campus-universcascades.com/spectacles-cascadeurs-yamakasi/',
    'https://www.campus-universcascades.com/team-building-cascades/',
    'https://www.campus-universcascades.com/stages-cascades-parkour-2-2/'
  ];

  for (const p of extraPages) {
    console.log('\n--- PAGE:', p);
    const pRes = await fetch(p);
    const pHtml = await pRes.text();
    // Get headings
    const headings = [...pHtml.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(h => h[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    console.log('Headings:', headings.slice(0, 8));
    // Check key text snippet
    const bodyText = pHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Snippet:', bodyText.slice(0, 300));
  }
}

audit();
