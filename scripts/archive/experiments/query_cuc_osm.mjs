const query = `[out:json];
(
  way(around:350, 50.0907477, 3.5376902);
  node(around:350, 50.0907477, 3.5376902);
);
out tags center;`;

async function main() {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'User-Agent': 'CUC-Research/1.0' }
  });
  const data = await res.json();
  const interesting = data.elements.filter(e => e.tags && (e.tags.name || e.tags.building || e.tags.leisure || e.tags.amenity || e.tags.man_made || e.tags.sport || e.tags.tourism));
  console.log('Total elements:', interesting.length);
  for (const e of interesting) {
    const pos = e.center ? `${e.center.lat.toFixed(6)}, ${e.center.lon.toFixed(6)}` : (e.lat ? `${e.lat.toFixed(6)}, ${e.lon.toFixed(6)}` : '');
    console.log(`[${e.type} ${e.id}] ${e.tags.name || 'unnamed'} | bldg:${e.tags.building || ''} | amenity:${e.tags.amenity || ''} | man_made:${e.tags.man_made || ''} | leisure:${e.tags.leisure || ''} | at (${pos})`);
  }
}

main().catch(console.error);
