import fs from 'fs';

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

const lat = 50.0908;
const lon = 3.5374;

async function check() {
  for (const zoom of [16, 17, 18, 19]) {
    const x = lon2tile(lon, zoom);
    const y = lat2tile(lat, zoom);
    const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
    const ignUrl = `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX=${zoom}&TILEROW=${y}&TILECOL=${x}`;

    const rEsri = await fetch(esriUrl);
    const rIgn = await fetch(ignUrl);

    console.log(`Zoom ${zoom}: x=${x}, y=${y}`);
    console.log(`  ESRI: ${rEsri.status}, size: ${rEsri.headers.get('content-length')}`);
    console.log(`  IGN:  ${rIgn.status}, size: ${rIgn.headers.get('content-length')}`);
  }
}

check().catch(console.error);
