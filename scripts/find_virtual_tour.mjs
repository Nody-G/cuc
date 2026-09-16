import fs from 'fs';

async function checkUrl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    console.log(`\n=== CHECKING ${url} ===`);
    
    // Find iframes
    const iframes = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    console.log('IFRAMES:', iframes);
    
    // Find virtual tour keywords
    const virtualMatches = html.match(/[^<>\n]{0,80}(?:virtuelle|visite 360|matterport|google\.com\/maps|roundme|kuula|pannellum|theta)[^<>\n]{0,80}/gi) || [];
    console.log('KEYWORD MATCHES:', virtualMatches);

    // Find all links containing tour/visite/maps
    const links = html.match(/href=["']([^"']*(?:360|tour|matterport|maps|goo\.gl|panorami)[^"']*)["']/gi) || [];
    console.log('LINKS:', links);
  } catch (err) {
    console.error(`Error checking ${url}:`, err.message);
  }
}

async function run() {
  await checkUrl('https://www.campus-universcascades.com/visite-guidee');
  await checkUrl('https://www.campus-universcascades.com/');
}

run();
