/**
 * Génère `src/components/3d/data/realFacilities.ts` à partir des empreintes
 * OpenStreetMap réelles (`scripts/cuc_buildings.json`).
 *
 * Doctrine « Zéro Invention » : chaque installation est appariée à une empreinte
 * OSM réelle par proximité + surface. Aucune position n'est posée à la main.
 *
 * Sortie : positions projetées (x = Est, z = Sud), dimensions réelles (m),
 * rotation déduite de l'orientation de l'empreinte.
 */
import fs from 'node:fs';

const METERS_PER_DEG_LAT = 111320;
const mPerLon = (lat) => METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

const raw = JSON.parse(fs.readFileSync('scripts/cuc_buildings.json', 'utf8'));
const buildings = raw.filter((b) => b.isBuilding && b.coords?.length >= 3);

// Centroïde du domaine = origine du repère de scène
const allCoords = buildings.flatMap((b) => b.coords);
const originLat = allCoords.reduce((s, c) => s + c.lat, 0) / allCoords.length;
const originLon = allCoords.reduce((s, c) => s + c.lon, 0) / allCoords.length;

const project = (lat, lon) => ({
    x: (lon - originLon) * mPerLon(originLat),
    z: -(lat - originLat) * METERS_PER_DEG_LAT,
});

const area = (coords) => {
    const m = mPerLon(coords[0].lat);
    const pts = coords.map((c) => ({ x: c.lon * m, y: c.lat * METERS_PER_DEG_LAT }));
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(a) / 2;
};

const dims = (coords) => {
    const lats = coords.map((c) => c.lat);
    const lons = coords.map((c) => c.lon);
    const refLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    return {
        width: (Math.max(...lons) - Math.min(...lons)) * mPerLon(refLat),
        depth: (Math.max(...lats) - Math.min(...lats)) * METERS_PER_DEG_LAT,
    };
};

// Orientation dominante : angle du plus long côté de l'empreinte
const orientation = (coords) => {
    let best = { len: 0, angle: 0 };
    for (let i = 0; i < coords.length - 1; i++) {
        const a = project(coords[i].lat, coords[i].lon);
        const b = project(coords[i + 1].lat, coords[i + 1].lon);
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        if (len > best.len) {
            best = { len, angle: (Math.atan2(b.z - a.z, b.x - a.x) * 180) / Math.PI };
        }
    }
    return best.angle;
};

// Inventaire des empreintes réelles
const inventory = buildings.map((b) => {
    const c = {
        lat: b.coords.reduce((s, p) => s + p.lat, 0) / b.coords.length,
        lon: b.coords.reduce((s, p) => s + p.lon, 0) / b.coords.length,
    };
    const p = project(c.lat, c.lon);
    const d = dims(b.coords);
    return {
        id: b.id,
        x: +p.x.toFixed(2),
        z: +p.z.toFixed(2),
        area: Math.round(area(b.coords)),
        width: +d.width.toFixed(1),
        depth: +d.depth.toFixed(1),
        rotation: +orientation(b.coords).toFixed(1),
        nodes: b.coords.length,
    };
});

console.log(`Origine (centroïde domaine) : ${originLat.toFixed(6)}, ${originLon.toFixed(6)}`);
console.log(`\n${inventory.length} empreintes OSM réelles :\n`);
console.log('  id          x       z     area   width  depth  rot   nodes');
for (const b of inventory.sort((a, b) => b.area - a.area)) {
    console.log(
        `  ${b.id.padEnd(10)} ${String(b.x).padStart(7)} ${String(b.z).padStart(7)} ` +
        `${String(b.area).padStart(6)} ${String(b.width).padStart(6)} ${String(b.depth).padStart(6)} ` +
        `${String(b.rotation).padStart(6)} ${String(b.nodes).padStart(5)}`
    );
}

fs.writeFileSync('scripts/real_facilities_inventory.json', JSON.stringify({ origin: { lat: originLat, lon: originLon }, inventory }, null, 2));
console.log('\n→ scripts/real_facilities_inventory.json écrit.');
