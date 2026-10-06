import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logosDir = path.resolve('public/images/logos');

const targets = [
  { svg: 'cuc-logo-uk-ring.svg', png: 'cuc-logo-uk-ring.png' },
  { svg: 'cuc-logo-uk-sport.svg', png: 'cuc-logo-uk-sport.png' },
  { svg: 'cuc-logo-uk-letters.svg', png: 'cuc-logo-uk-letters.png' },
  { svg: 'cuc-logo-england-stgeorge.svg', png: 'cuc-logo-england-stgeorge.png' }
];

async function renderLogos() {
  for (const { svg, png } of targets) {
    const svgPath = path.join(logosDir, svg);
    const pngPath = path.join(logosDir, png);
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Render at 1024x1024 with sharp, transparent background
    await sharp(svgBuffer, { density: 300 })
      .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(pngPath);
      
    const stat = fs.statSync(pngPath);
    console.log(`Rendered ${png}: ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

renderLogos().catch(err => {
  console.error('Error rendering PNGs:', err);
  process.exit(1);
});
