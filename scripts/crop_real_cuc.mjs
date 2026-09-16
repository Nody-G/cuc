import sharp from 'sharp';
import path from 'path';

async function cropAndSave() {
  const src = path.resolve('public/images/cuc_campus_aerial_real_z19.jpg');
  const dest = path.resolve('public/images/cuc_campus_aerial_map.jpg');

  // Center around the CUC campus
  // left: 175, top: 165, width: 1400, height: 1400
  await sharp(src)
    .extract({ left: 175, top: 165, width: 1400, height: 1400 })
    .resize(1400, 1400)
    .jpeg({ quality: 96 })
    .toFile(dest);

  console.log('Saved real cropped CUC orthophoto to:', dest);
}

cropAndSave().catch(console.error);
