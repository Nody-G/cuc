async function getBldgs() {
  const query = `[out:json];
  (
    way(50.0898, 3.5350, 50.0925, 3.5390)["building"];
    way(50.0898, 3.5350, 50.0925, 3.5390)["leisure"];
    way(50.0898, 3.5350, 50.0925, 3.5390)["amenity"];
    node(50.0898, 3.5350, 50.0925, 3.5390)["man_made"];
  );
  out geom;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'User-Agent': 'CUC-Research/1.0' }
  });
  const data = await res.json();
  console.log('Features found in CUC area:', data.elements.length);
  for (const b of data.elements) {
    let avgLat = 0, avgLon = 0;
    if (b.geometry) {
      avgLat = b.geometry.reduce((acc, g) => acc + g.lat, 0) / b.geometry.length;
      avgLon = b.geometry.reduce((acc, g) => acc + g.lon, 0) / b.geometry.length;
    } else if (b.lat) {
      avgLat = b.lat;
      avgLon = b.lon;
    }
    console.log(`[${b.type} ${b.id}] ${b.tags?.name || 'unnamed'} | bldg:${b.tags?.building || ''} | amenity:${b.tags?.amenity || ''} | leisure:${b.tags?.leisure || ''} | center: (${avgLat.toFixed(6)}, ${avgLon.toFixed(6)})`);
  }
}
getBldgs().catch(console.error);
