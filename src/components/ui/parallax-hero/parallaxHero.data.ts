export interface HeroSlide {
  url: string;
  caption: string;
  sub: string;
  badge: string;
  tag: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-6-scaled.jpg',
    caption: 'CAMPUS UNIVERS CASCADES',
    sub: 'Le plus grand centre de formation professionnelle de cascadeurs au monde',
    badge: 'DOMAINE DE 6 HECTARES • LE CATEAU-CAMBRÉSIS',
    tag: 'Domaine & Campus',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    caption: "L'EXCELLENCE DE LA CASCADE DE CINÉMA",
    sub: 'Combat chorégraphié, arts martiaux et cascades physiques de haut vol',
    badge: 'ACTION DESIGN & CHORÉGRAPHIE',
    tag: 'Combat & Action',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg',
    caption: 'PLATEAUX TECHNIQUES DU DOMAINE',
    sub: 'Plateformes de saut, airbag géant et câblage 3D haute voltige',
    badge: 'SÉCURITÉ & RIGGING CINÉMA',
    tag: 'Plateaux & Rigging',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
    caption: 'STUNT TEAM INTERNATIONALE',
    sub: 'Fondé en 2008 par Lucas Dollfus • Longs-métrages, Marvel & EuropaCorp',
    badge: 'CERTIFIÉ QUALIOPI • ÉLIGIBLE AFDAS',
    tag: 'Stunt Team Pro',
  },
];

export const HERO_QUICK_METRICS = [
  { val: 'DEPUIS 2008', label: 'SAVOIR-FAIRE CUC' },
  { val: 'IMMERSION', label: 'PÉDAGOGIE ACTIVE' },
  { val: 'CINÉMA & TV', label: 'INSERTION PRO' },
  { val: 'QUALIOPI', label: 'FORMATION CERTIFIÉE' },
];
