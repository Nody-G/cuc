import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logosDir = path.resolve('public/images/logos');

const countryKeys = [
  'france',
  'usa',
  'japan',
  'germany',
  'spain',
  'italy',
  'canada',
  'australia',
  'south-korea',
  'china',
  'brazil',
  'mexico',
  'sweden',
  'switzerland',
  'belgium',
  'netherlands',
  'ireland',
  'norway',
  'south-africa'
];

const ukKeys = [
  'cuc-logo-uk-ring',
  'cuc-logo-uk-sport',
  'cuc-logo-uk-letters',
  'cuc-logo-england-stgeorge'
];

async function renderAll() {
  console.log(`Starting rendering of 19 countries + 4 UK logos...`);
  
  for (const c of countryKeys) {
    const svgFile = path.join(logosDir, `cuc-logo-${c}.svg`);
    const pngFile = path.join(logosDir, `cuc-logo-${c}.png`);
    
    if (fs.existsSync(svgFile)) {
      const buf = fs.readFileSync(svgFile);
      await sharp(buf, { density: 300 })
        .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(pngFile);
      const stat = fs.statSync(pngFile);
      console.log(`✓ cuc-logo-${c}.png (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }

  for (const k of ukKeys) {
    const svgFile = path.join(logosDir, `${k}.svg`);
    const pngFile = path.join(logosDir, `${k}.png`);
    if (fs.existsSync(svgFile)) {
      const buf = fs.readFileSync(svgFile);
      await sharp(buf, { density: 300 })
        .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(pngFile);
      const stat = fs.statSync(pngFile);
      console.log(`✓ ${k}.png (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('Finished rendering all logos!');
}

renderAll().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
