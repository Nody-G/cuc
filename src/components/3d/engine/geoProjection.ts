/**
 * ==============================================================================
 * Projection géographique locale — Plan 3D du campus CUC
 * ==============================================================================
 * Convertit des coordonnées WGS84 (lat/lon) en coordonnées de scène Three.js
 * (x = Est, z = Sud), via une projection équirectangulaire locale centrée sur
 * le domaine réel.
 *
 * Doctrine « Zéro Invention » : les positions des bâtiments sont DÉRIVÉES des
 * empreintes OpenStreetMap réelles (`scripts/cuc_buildings.json`), jamais
 * posées à la main. Le plan de fond utilise la MÊME projection, ce qui garantit
 * l'alignement entre le sol photographique et les volumes 3D.
 *
 * Repère :
 *   - `x` croît vers l'Est   (longitude croissante)
 *   - `z` croît vers le Sud  (latitude décroissante)
 *   - origine (0,0) = centroïde du domaine
 * ==============================================================================
 */

/** Mètres par degré de latitude (constante terrestre moyenne). */
const METERS_PER_DEG_LAT = 111_320;

/** Mètres par degré de longitude à une latitude donnée. */
export function metersPerDegLon(latDeg: number): number {
  return METERS_PER_DEG_LAT * Math.cos((latDeg * Math.PI) / 180);
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface ScenePoint {
  x: number;
  z: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  centerLat: number;
  centerLon: number;
  /** Étendue Nord-Sud en mètres. */
  spanNorthSouth: number;
  /** Étendue Est-Ouest en mètres. */
  spanEastWest: number;
}

/**
 * Calcule l'emprise réelle (en mètres) d'un ensemble de points géographiques.
 */
export function computeBounds(points: GeoPoint[]): GeoBounds {
  if (points.length === 0) {
    throw new Error('computeBounds: aucun point fourni');
  }
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    centerLat,
    centerLon,
    spanNorthSouth: (maxLat - minLat) * METERS_PER_DEG_LAT,
    spanEastWest: (maxLon - minLon) * metersPerDegLon(centerLat),
  };
}

/**
 * Projette un point WGS84 vers le repère de scène.
 *
 * @param point  Coordonnée géographique à projeter.
 * @param origin Centroïde du domaine (origine du repère de scène).
 */
export function projectLatLon(point: GeoPoint, origin: GeoPoint): ScenePoint {
  const mPerLon = metersPerDegLon(origin.lat);
  return {
    x: (point.lon - origin.lon) * mPerLon,
    z: -(point.lat - origin.lat) * METERS_PER_DEG_LAT,
  };
}

/**
 * Projette une empreinte polygonale complète.
 */
export function projectPolygon(coords: GeoPoint[], origin: GeoPoint): ScenePoint[] {
  return coords.map((c) => projectLatLon(c, origin));
}

/**
 * Surface approchée d'un polygone (formule du lacet / shoelace), en m².
 * Utilisée pour apparier une installation à l'empreinte OSM la plus plausible.
 */
export function polygonArea(coords: GeoPoint[]): number {
  if (coords.length < 3) return 0;
  const refLat = coords[0].lat;
  const mPerLon = metersPerDegLon(refLat);
  const pts = coords.map((c) => ({
    x: c.lon * mPerLon,
    y: c.lat * METERS_PER_DEG_LAT,
  }));
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Centroïde géographique d'un polygone (moyenne des sommets).
 */
export function polygonCentroid(coords: GeoPoint[]): GeoPoint {
  const n = coords.length || 1;
  return {
    lat: coords.reduce((s, c) => s + c.lat, 0) / n,
    lon: coords.reduce((s, c) => s + c.lon, 0) / n,
  };
}

/**
 * Distance plan (en mètres) entre deux points géographiques.
 */
export function geoDistance(a: GeoPoint, b: GeoPoint): number {
  const mPerLon = metersPerDegLon((a.lat + b.lat) / 2);
  const dx = (a.lon - b.lon) * mPerLon;
  const dz = (a.lat - b.lat) * METERS_PER_DEG_LAT;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Dimensions (largeur Est-Ouest, profondeur Nord-Sud) d'une empreinte, en mètres.
 */
export function polygonDimensions(coords: GeoPoint[]): { width: number; depth: number } {
  const lats = coords.map((c) => c.lat);
  const lons = coords.map((c) => c.lon);
  const refLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  return {
    width: (Math.max(...lons) - Math.min(...lons)) * metersPerDegLon(refLat),
    depth: (Math.max(...lats) - Math.min(...lats)) * METERS_PER_DEG_LAT,
  };
}
