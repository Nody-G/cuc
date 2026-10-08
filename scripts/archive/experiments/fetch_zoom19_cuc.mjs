import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const zoom = 19;
const minTileX = 267292;
const maxTileX = 267298;
const minTileY = 177599;
const maxTileY = 177605;

const cols = maxTileX - minTileX + 1; // 7
const rows = maxTileY - minTileY + 1; // 7

async function run() {
  const outDir = path.resolve('public/images/ortho_z19');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`Downloading ${cols * rows} tiles at zoom 19...`);
  const composites = [];

  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      const tileFile = path.join(outDir, `tile_${x}_${y}.jpg`);
      if (!fs.existsSync(tileFile)) {
        const ignUrl = `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=${zoom}&TILEROW=${y}&TILECOL=${x}`;
        const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
        let res = await fetch(ignUrl);
        if (!res.ok) res = await fetch(esriUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(tileFile, buf);
      }
      composites.push({
        input: tileFile,
        left: (x - minTileX) * 256,
        top: (y - minTileY) * 256,
      });
    }
  }

  console.log('Stitching zoom 19 orthophoto...');
  const targetPath = path.resolve('public/images/cuc_campus_aerial_real_z19.jpg');
  await sharp({
    create: {
      width: cols * 256,
      height: rows * 256,
      channels: 3,
      background: { r: 10, g: 12, b: 16 }
    }
  })
  .composite(composites)
  .jpeg({ quality: 95 })
  .toFile(targetPath);

  console.log('Saved zoom 19 orthophoto to:', targetPath);
}

run().catch(console.error);
