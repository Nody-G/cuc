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
    sub: 'Centre de formation professionnelle de cascadeurs',
    badge: 'DOMAINE DE 6 HECTARES • LE CATEAU-CAMBRÉSIS',
    tag: 'Domaine & Campus',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg',
    caption: "CASCADES & COMBATS DE CINÉMA",
    sub: 'Combats chorégraphiés, arts martiaux et cascades physiques',
    badge: 'ACTION DESIGN & CHORÉGRAPHIE',
    tag: 'Combat & Action',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg',
    caption: 'INSTALLATIONS & PLATEAUX TECHNIQUES',
    sub: 'Plateformes de saut, airbag et ateliers câblage',
    badge: 'SÉCURITÉ & RIGGING CINÉMA',
    tag: 'Plateaux & Rigging',
  },
  {
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg',
    caption: 'ÉQUIPE DE CASCADEURS PROFESSIONNELS',
    sub: 'Fondé en 2008 par Lucas Dollfus • Tournages cinéma, séries et spectacle',
    badge: 'CERTIFIÉ QUALIOPI • ÉLIGIBLE AFDAS',
    tag: 'Équipe Cascades',
  },
];

export const HERO_QUICK_METRICS = [
  { val: 'DEPUIS 2008', label: 'SAVOIR-FAIRE CUC' },
  { val: 'IMMERSION', label: 'PÉDAGOGIE ACTIVE' },
  { val: 'CINÉMA & TV', label: 'INSERTION PRO' },
  { val: 'QUALIOPI', label: 'FORMATION CERTIFIÉE' },
];
