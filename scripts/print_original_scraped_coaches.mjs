import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/cuc_20_coaches_scraped.json', 'utf8'));
for (const c of raw) {
  console.log(`\n#${c.index} : ${c.imageTitle}`);
  console.log('Image:', c.imageSrc);
  console.log('Links:', c.links);
  const textClean = c.text.replace(/id="panel-[^"]*"/g, '').replace(/class="[^"]*"/g, '').replace(/data-index="[^"]*"/g, '').replace(/<div/g, '').trim();
  console.log('Raw text:', textClean);
}
