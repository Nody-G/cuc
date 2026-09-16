import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function stitch() {
  const tilesDir = path.resolve('public/images/ortho_tiles');
  const minTileX = 133646;
  const maxTileX = 133649;
  const minTileY = 88799;
  const maxTileY = 88803;

  const cols = maxTileX - minTileX + 1; // 4
  const rows = maxTileY - minTileY + 1; // 5

  const tileWidth = 256;
  const tileHeight = 256;
  const fullWidth = cols * tileWidth;   // 1024
  const fullHeight = rows * tileHeight; // 1280

  const composites = [];

  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      const tileFile = path.join(tilesDir, `tile_${x}_${y}.jpg`);
      if (fs.existsSync(tileFile)) {
        composites.push({
          input: tileFile,
          left: (x - minTileX) * tileWidth,
          top: (y - minTileY) * tileHeight,
        });
      }
    }
  }

  const stitched = await sharp({
    create: {
      width: fullWidth,
      height: fullHeight,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  })
  .composite(composites)
  .jpeg({ quality: 95 })
  .toFile('public/images/cuc_campus_aerial_real.jpg');

  console.log('Stitched real IGN orthophoto:', stitched);
}

stitch().catch(console.error);
