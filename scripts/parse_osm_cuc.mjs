import fs from 'fs';

async function parseOSM() {
  const url = 'https://api.openstreetmap.org/api/0.6/map?bbox=3.5350,50.0898,3.5395,50.0925';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: { 'User-Agent': 'CUC-Inspection/1.0' } });
  const xml = await res.text();
  fs.writeFileSync('scripts/cuc_osm.xml', xml);
  console.log('Saved scripts/cuc_osm.xml, size:', xml.length);

  // Parse nodes
  const nodes = {};
  const nodeMatches = xml.matchAll(/<node id="(\d+)"[^>]*lat="([\d.-]+)"[^>]*lon="([\d.-]+)"/g);
  for (const m of nodeMatches) {
    nodes[m[1]] = { lat: parseFloat(m[2]), lon: parseFloat(m[3]) };
  }
  console.log('Parsed nodes:', Object.keys(nodes).length);

  // Parse ways
  const wayMatches = xml.split('<way id="');
  console.log('Way chunks:', wayMatches.length - 1);
  const buildings = [];

  for (let i = 1; i < wayMatches.length; i++) {
    const chunk = wayMatches[i];
    const idMatch = chunk.match(/^(\d+)"/);
    const id = idMatch ? idMatch[1] : 'unknown';

    const isBuilding = chunk.includes('k="building"');
    const nameMatch = chunk.match(/k="name" v="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : null;

    const nds = [...chunk.matchAll(/<nd ref="(\d+)"/g)].map(m => m[1]);
    const coords = nds.map(ref => nodes[ref]).filter(Boolean);

    if (isBuilding || name) {
      // Calculate center
      const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / (coords.length || 1);
      const avgLon = coords.reduce((sum, c) => sum + c.lon, 0) / (coords.length || 1);
      buildings.push({
        id,
        name,
        isBuilding,
        center: { lat: avgLat, lon: avgLon },
        nodeCount: coords.length,
        coords
      });
    }
  }

  console.log('Extracted buildings & named features:', buildings.length);
  for (const b of buildings) {
    console.log(`- ID: ${b.id}, Name: ${b.name || '(unnamed building)'}, Center: [${b.center.lat.toFixed(6)}, ${b.center.lon.toFixed(6)}], Nodes: ${b.nodeCount}`);
  }
  fs.writeFileSync('scripts/cuc_buildings.json', JSON.stringify(buildings, null, 2));
}

parseOSM();
