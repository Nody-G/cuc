import fs from 'fs';
import path from 'path';

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

function tile2lon(x, z) {
  return (x / Math.pow(2, z)) * 360 - 180;
}
function tile2lat(y, z) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

const zoom = 18;
const minLat = 50.0895;
const maxLat = 50.0925;
const minLon = 3.5350;
const maxLon = 3.5395;

const minTileX = lon2tile(minLon, zoom);
const maxTileX = lon2tile(maxLon, zoom);
const minTileY = lat2tile(maxLat, zoom);
const maxTileY = lat2tile(minLat, zoom);

console.log(`Zoom ${zoom}:`);
console.log(`  X tiles: ${minTileX} to ${maxTileX} (${maxTileX - minTileX + 1} cols)`);
console.log(`  Y tiles: ${minTileY} to ${maxTileY} (${maxTileY - minTileY + 1} rows)`);

async function downloadTiles() {
  const outDir = path.resolve('public/images/ortho_tiles');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      // Try IGN first
      const ignUrl = `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=${zoom}&TILEROW=${y}&TILECOL=${x}`;
      const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;

      let buffer;
      const resIgn = await fetch(ignUrl);
      if (resIgn.ok) {
        buffer = Buffer.from(await resIgn.arrayBuffer());
        console.log(`Tile ${x}_${y} from IGN: ${buffer.length} bytes`);
      } else {
        const resEsri = await fetch(esriUrl);
        buffer = Buffer.from(await resEsri.arrayBuffer());
        console.log(`Tile ${x}_${y} from ESRI: ${buffer.length} bytes`);
      }
      fs.writeFileSync(path.join(outDir, `tile_${x}_${y}.jpg`), buffer);
    }
  }
}

downloadTiles().catch(console.error);
