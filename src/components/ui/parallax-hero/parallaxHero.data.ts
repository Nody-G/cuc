export interface HeroSlide {
  url: string;
  caption: string;
  sub: string;
  badge: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-6-scaled.jpg',
    caption: 'CAMPUS UNIVERS CASCADES',
    sub: 'Le plus grand centre de formation professionnelle de cascadeurs au monde',
    badge: 'DOMAINE DE 6 HECTARES • LE CATEAU-CAMBRÉSIS',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    caption: "L'ÉLITE DE LA CASCADE DE CINÉMA",
    sub: 'Combat chorégraphié, arts martiaux et cascades physiques de haut vol',
    badge: 'ACTION DESIGN & HOLLYWOOD RIGUEUR',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg',
    caption: 'CHUTES DE HAUTEUR & CÂBLAGE',
    sub: 'Multiples paliers de saut, airbag géant et câblage 3D haute voltige',
    badge: 'SÉCURITÉ ABSOLUE & CONTRÔLE DE L\'IMPACT',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
    caption: 'STUNT TEAM INTERNATIONALE',
    sub: 'Fondé en 2008 par Lucas Dollfus • Longs-métrages, Marvel & EuropaCorp',
    badge: 'AGRÉMENT QUALIOPI • PRISE EN CHARGE AFDAS 100%',
  },
];

export const HERO_QUICK_METRICS = [
  { val: '6 HECTARES', label: 'DOMAINE PRIVÉ' },
  { val: '21 MÈTRES', label: 'TOUR DE SAUT' },
  { val: 'SALLE D\'ACTION', label: 'ZOÉ BELL HALL' },
  { val: 'QUALIOPI', label: 'FORMATION CERTIFIÉE' },
];
