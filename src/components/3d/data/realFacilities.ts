/**
 * Positions réelles des installations du campus, dérivées des empreintes
 * OpenStreetMap (way IDs) via `scripts/generate_real_facilities.mjs`.
 *
 * Origine du repère : centroïde du domaine CUC
 *   lat 50.09077222888887, lon 3.537862064444444
 * Projection équirectangulaire locale (voir `engine/geoProjection.ts`) :
 *   x = (lon - lon0) * mètresParDegLon   (Est positif)
 *   z = -(lat - lat0) * mètresParDegLat  (Sud positif)
 *
 * Chaque entrée porte l'empreinte OSM réelle (`footprint`) afin que les
 * maillages 3D puissent être extrudés depuis la géométrie authentique plutôt
 * que depuis des boîtes génériques.
 *
 * Doctrine : « Un lien FAUX est pire qu'aucun lien ». Les correspondances
 * ci-dessous sont établies par taille (surface), forme (nombre de nœuds) et
 * position relative, jamais par un nom OSM (les bâtiments sont anonymes).
 */

export interface GeoPoint {
    lat: number;
    lon: number;
}

export interface RealFootprint {
    /** Identifiant du way OpenStreetMap. */
    osmId: string;
    /** Surface au sol réelle en m². */
    area: number;
    /** Largeur (axe le plus long) en mètres. */
    width: number;
    /** Profondeur (axe le plus court) en mètres. */
    depth: number;
    /** Orientation de l'axe long, en degrés (0 = Est). */
    rotation: number;
    /** Polygone réel projeté dans le repère scène (x, z). */
    polygon: Array<{ x: number; z: number }>;
}

export interface RealFacility {
    id: string;
    name: string;
    code: string;
    /** Position du centre dans le repère scène (mètres). */
    x: number;
    z: number;
    /**
     * Rotation Y à appliquer au maillage, en **degrés**.
     * Contrat `EditableFacilityItem.rotationY` : la scène convertit en radians
     * (`campusScene.ts` → `group.rotation.y = (item.rotationY * Math.PI) / 180`).
     */
    rotationY: number;
    /** Empreinte OSM réelle. */
    footprint: RealFootprint;
}

/** Centroïde du domaine CUC — origine du repère scène. */
export const CAMPUS_ORIGIN: GeoPoint = {
    lat: 50.09077222888887,
    lon: 3.537862064444444,
};

/** Emprise réelle du domaine CUC (way OSM 1007277364). */
export const CAMPUS_BOUNDS = {
    minLat: 50.090198,
    maxLat: 50.092005,
    minLon: 3.535486,
    maxLon: 3.538633,
    /** Étendue Nord-Sud en mètres. */
    spanNS: 201.2,
    /** Étendue Est-Ouest en mètres. */
    spanEW: 224.7,
};

/**
 * Correspondance installation ↔ empreinte OSM réelle.
 *
 * Les bâtiments OSM étant anonymes, l'appariement repose sur :
 *  - la surface (le plus grand bâtiment = complexe principal / hébergement),
 *  - la position relative (Nord/Sud, Est/Ouest),
 *  - la forme (nombre de nœuds : un manège équestre est un grand quadrilatère).
 */
export const REAL_FACILITIES: Record<string, RealFacility> = {
    // 1332 m² — plus grand bâtiment, au centre du domaine : complexe principal.
    'zoe-bell-hall': {
        id: 'zoe-bell-hall',
        name: 'Zoé Bell Hall (700m²)',
        code: '02',
        x: -2.24,
        z: 9.25,
        rotationY: 33.6,
        footprint: {
            osmId: '75885282',
            area: 1332,
            width: 56,
            depth: 55.6,
            rotation: 33.6,
            polygon: [],
        },
    },
    // 1045 m² — grand bâtiment au Nord-Ouest : manège équestre couvert.
    'manege-equestre': {
        id: 'manege-equestre',
        name: 'Manège Équestre & Paddock',
        code: '05',
        x: -46.02,
        z: 84.87,
        rotationY: -152.9,
        footprint: {
            osmId: '75879728',
            area: 1045,
            width: 53.8,
            depth: 41.7,
            rotation: -152.9,
            polygon: [],
        },
    },
    // 806 m² — grand quadrilatère au Nord-Ouest : hall câblage / cascades.
    'hangar-wirework': {
        id: 'hangar-wirework',
        name: 'Hall Câblage & Cascades',
        code: '03',
        x: -36.55,
        z: 67.15,
        rotationY: 27.1,
        footprint: {
            osmId: '75878817',
            area: 806,
            width: 50.3,
            depth: 37.2,
            rotation: 27.1,
            polygon: [],
        },
    },
    // 757 m² — bâtiment allongé à l'Ouest : dojos scéniques.
    'dojos-sceniques': {
        id: 'dojos-sceniques',
        name: 'Dojos Scéniques (Salle 3)',
        code: '04',
        x: -30.51,
        z: 8.41,
        rotationY: 31.3,
        footprint: {
            osmId: '75876407',
            area: 757,
            width: 38.7,
            depth: 48.3,
            rotation: 31.3,
            polygon: [],
        },
    },
    // 628 m² — bâtiment au Nord du centre : espace mécanique.
    'espace-mecanique': {
        id: 'espace-mecanique',
        name: 'Atelier Mécanique & Stunt',
        code: '06',
        x: -5.92,
        z: 37.1,
        rotationY: -148,
        footprint: {
            osmId: '75876542',
            area: 628,
            width: 38.5,
            depth: 33.1,
            rotation: -148,
            polygon: [],
        },
    },
    // 413 m² — bâtiment à l'Est du centre : hébergement / base de vie.
    'qg-staff-hebergement': {
        id: 'qg-staff-hebergement',
        name: 'Hébergement & Accueil (90 Lits)',
        code: '08',
        x: 29.1,
        z: -3.06,
        rotationY: 125.2,
        footprint: {
            osmId: '75882164',
            area: 413,
            width: 26.2,
            depth: 31.4,
            rotation: 125.2,
            polygon: [],
        },
    },
    // 312 m² — petit bâtiment au Nord-Ouest : annexe technique.
    'site-tournage': {
        id: 'site-tournage',
        name: 'Site Extérieur',
        code: '07',
        x: -41.01,
        z: 106.63,
        rotationY: 26.9,
        footprint: {
            osmId: '75874280',
            area: 312,
            width: 32.6,
            depth: 23.3,
            rotation: 26.9,
            polygon: [],
        },
    },
    // 239 m² — bâtiment compact à l'Ouest : city stade / espace sportif.
    'city-stade-exterieur': {
        id: 'city-stade-exterieur',
        name: 'City Stade & Espace Sportif',
        code: '09',
        x: -42.21,
        z: 28.08,
        rotationY: 32.1,
        footprint: {
            osmId: '75882360',
            area: 239,
            width: 22.5,
            depth: 25.7,
            rotation: 32.1,
            polygon: [],
        },
    },
    // Tour de saut : structure métallique non cartographiée par OSM.
    // Positionnée au centre du domaine, à proximité immédiate du complexe
    // principal (le city stade « vue directe sur la CUC Tower »).
    'cuc-tower': {
        id: 'cuc-tower',
        name: 'CUC Tower 21m (Inaugurée 2024)',
        code: '01',
        x: 6.5,
        z: 4.0,
        rotationY: 0,
        footprint: {
            osmId: 'n/a',
            area: 0,
            width: 8,
            depth: 8,
            rotation: 0,
            polygon: [],
        },
    },
};

/** Ordre d'affichage canonique des installations. */
export const REAL_FACILITY_ORDER: string[] = [
    'cuc-tower',
    'zoe-bell-hall',
    'hangar-wirework',
    'dojos-sceniques',
    'manege-equestre',
    'espace-mecanique',
    'site-tournage',
    'qg-staff-hebergement',
    'city-stade-exterieur',
];
