async function lookup() {
  const query = `[out:json];(
    node["name"~"Cascades"](around:2000,50.0903,3.5379);
    way["name"~"Cascades"](around:2000,50.0903,3.5379);
    relation["name"~"Cascades"](around:2000,50.0903,3.5379);
    way["building"](around:250,50.0903,3.5379);
  );out center;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data = await res.json();
    console.log('Total elements:', data.elements.length);
    for (const el of data.elements) {
      if (el.tags) {
        console.log(`[${el.type} ${el.id}] center:`, el.center || { lat: el.lat, lon: el.lon }, 'tags:', el.tags);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}
lookup();
