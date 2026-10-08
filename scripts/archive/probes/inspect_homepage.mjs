async function inspectHomePage() {
  const res = await fetch('https://www.campus-universcascades.com/');
  const html = await res.text();
  
  // Headings
  const headings = [...html.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi)].map(h => ({
    tag: 'h' + h[1],
    text: h[2].replace(/<[^>]+>/g, '').trim()
  }));
  console.log('Homepage headings:');
  headings.forEach(h => console.log(`  <${h.tag}>: ${h.text}`));

  // Check buttons / CTA links
  const ctas = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(m => m.text.length > 2 && !m.href.includes('wp-content'));
  console.log('\nFound CTAs / Links on Homepage:');
  ctas.forEach(c => console.log(`  [${c.text}] -> ${c.href}`));
}

inspectHomePage();
