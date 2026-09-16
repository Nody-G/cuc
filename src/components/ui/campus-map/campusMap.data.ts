export interface POI {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: string;
  coordinates: string;
  badge: string;
  xPercent: number; // For tactical radar layout
  yPercent: number;
}

export interface TravelRoute {
  id: string;
  origin: string;
  tag: string;
  train: {
    time: string;
    details: string;
    station: string;
  };
  car: {
    time: string;
    distance: string;
    details: string;
  };
}

export const CAMPUS_POIS: POI[] = [
  {
    id: 'tower-21m',
    name: 'Tour de Saut Extrême 21m',
    category: 'Hauteur & Chutes Libres',
    description:
      "Inaugurée fin 2024, c'est la plus haute tour de saut d'entraînement d'Europe. Paliers à 5m, 8m, 12m, 16m et 21m pour sauts sur matelas d'air géant.",
    specs: 'Hauteur 21m • 5 paliers • Poutre de largage • Certifiée APAVE',
    coordinates: '50.0912° N, 3.5380° E',
    badge: 'INAUGURÉE OCT. 2024',
    xPercent: 52,
    yPercent: 32,
  },
  {
    id: 'grand-dojo',
    name: 'Grand Dojo & Tatamis 600m²',
    category: 'Combat & Arts Martiaux',
    description:
      'Espace couvert dédié aux chorégraphies martiales, combats cinématographiques, projections et acrobaties au sol avec sol amortissant.',
    specs: '600m² tatamis • Sacs de frappe • Mur de brique mobile • Ring',
    coordinates: '50.0906° N, 3.5368° E',
    badge: 'ESPACE CHORÉGRAPHIE',
    xPercent: 35,
    yPercent: 58,
  },
  {
    id: 'airbag-zone',
    name: 'Fosse de Chute & Airbag Géant',
    category: 'Sécurité Impact',
    description:
      'Zone extérieure de réception sécurisée pour chutes de hauteur, cascades en torche humaine et éjections de véhicules.',
    specs: 'Airbag gonflable 15x15m • Tapis de chute 60cm • Fosse à cubes',
    coordinates: '50.0915° N, 3.5372° E',
    badge: 'ZONE IMPACT',
    xPercent: 68,
    yPercent: 44,
  },
  {
    id: 'rigging-cables',
    name: 'Structure Câblage 3D & Rigging',
    category: 'Effets Spéciaux Câbles',
    description:
      'Portiques et treuils de vol à haute vitesse pour simuler les propulsions explosives, envolées super-héros et cascades câblées Hollywood.',
    specs: 'Treuils motorisés • Harnais Jerk vest • Lignes de vol 35m',
    coordinates: '50.0908° N, 3.5385° E',
    badge: 'RIGGING 3D',
    xPercent: 72,
    yPercent: 65,
  },
  {
    id: 'mfr-residence',
    name: 'Résidence Stagiaires & Réfectoire',
    category: 'Hébergement & Logistique',
    description:
      'Chambres collectives, internat, réfectoire pour la pension complète et salles de debriefing vidéo sur le parc arboré de 6 hectares.',
    specs: 'Capacité 60 lits • Cuisine pro • Foyer stagiaires • Parc 6 ha',
    coordinates: '50.0902° N, 3.5360° E',
    badge: 'PENSION COMPLÈTE',
    xPercent: 25,
    yPercent: 78,
  },
];

export const TRAVEL_ROUTES: TravelRoute[] = [
  {
    id: 'paris',
    origin: 'Paris',
    tag: 'Accès Rapide',
    train: {
      time: '1h40',
      details:
        'Gare du Nord direct TER / Intercités vers Gare du Cateau. Navette campus sur demande.',
      station: 'Gare du Cateau-Cambrésis (à 3 min du campus)',
    },
    car: {
      time: '1h55',
      distance: '175 km',
      details:
        'Autoroute A1 puis A2 (sortie Cambrai ou Valenciennes), direction Le Cateau-Cambrésis.',
    },
  },
  {
    id: 'lille',
    origin: 'Lille & Région Nord',
    tag: 'Proximité',
    train: {
      time: '1h10',
      details: 'Lille Flandres direct vers Le Cateau via Valenciennes.',
      station: 'Gare du Cateau-Cambrésis',
    },
    car: {
      time: '1h15',
      distance: '85 km',
      details:
        "Autoroute A23 direction Valenciennes, puis D932 jusqu'au Cateau.",
    },
  },
  {
    id: 'bruxelles',
    origin: 'Bruxelles & Belgique',
    tag: 'International',
    train: {
      time: '1h45',
      details:
        'Bruxelles-Midi vers Mons puis correspondance Aulnoye-Aymeries / Le Cateau.',
      station: 'Gare du Cateau',
    },
    car: {
      time: '1h30',
      distance: '115 km',
      details:
        'Autoroute E19 / E42 via Mons, direction Maubeuge puis Le Cateau.',
    },
  },
  {
    id: 'airports',
    origin: 'Aéroports Internationaux',
    tag: 'Monde & DOM-TOM',
    train: {
      time: '1h30',
      details:
        'Depuis Roissy-CDG : TGV Haute-Picardie ou liaison Gare du Nord.',
      station: 'Roissy-CDG ou Charleroi Bruxelles-Sud',
    },
    car: {
      time: '1h15 / 1h30',
      distance: '95 km (Charleroi) / 155 km (CDG)',
      details:
        "Idéal pour les élèves arrivant de l'étranger, Canada, Réunion, Guadeloupe ou Suisse.",
    },
  },
];
