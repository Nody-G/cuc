import { LightboxImage } from '@/components/ui/LightboxModal';
import { OFFICIAL_FILM_BANNERS } from '@/data/filmography';

export const STUDIO_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/001.jpg', title: 'Studio CUC — Dojo & Espace Tatamis 600m²', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/002.jpg', title: 'Studio CUC — Parcours Obstacles & Parkour', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/003.jpg', title: 'Studio CUC — Espace Répétitions Chorégraphies', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/004.jpg', title: 'Studio CUC — Portique Rigging Câblage 3D', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/005.jpg', title: 'Studio CUC — Fosse de Chute Sécurisée', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/006.jpg', title: 'Studio CUC — Zone Musculation & Renforcement', category: 'Le Studio et la Salle' }
];

export const CASCADEUR_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-371-e1671702083907.jpg', title: 'Chute au sol & Roulade de sécurité', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/1000053353-scaled-e1763629965386.jpg', title: 'Action Tournage — Répétition sur plateau cinéma', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/NERO-6-scaled-e1763629837156.jpg', title: 'Cascade Équestre & Chute synchronisée', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/20240612_191918-scaled-e1763630249952.jpg', title: 'Plateau Action — Coordination des scènes d\'armes', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/1000052477-scaled-e1763630640338.jpg', title: 'Équipe Cascadeurs CUC en tournage officiel', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-51.jpg', title: 'Chute d\'escalier technique et maîtrisée', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/défenestration.jpg', title: 'Défenestration & Chute de grande hauteur', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-203-e1671702096970.jpg', title: 'Impacts violents & Chorégraphie martiale', category: 'Les Cascadeurs' }
];

export const EQUIPMENT_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-320-e1671701864164.jpg', title: 'Crash mat haute densité aux normes APAVE', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/3-Le-site-photos-du-bas-2.jpg', title: 'Domaine CUC 6 Hectares — Vue globale installations', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Airbag-vert.jpg', title: 'Airbag géant 15x15m pour chutes extrêmes', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-462-e1671701953374.jpg', title: 'Tapis articulés de réception cinéma', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Matelas.png', title: 'Matelas de chute 60cm certifiés', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Rigging.jpg', title: 'Structure de Rigging & Câblages 3D Hollywood', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/MG_5464-1.jpg', title: 'Fosse de réception amortissante à cubes', category: 'Les Équipements' }
];

export const BANNER_GALLERY: LightboxImage[] = OFFICIAL_FILM_BANNERS.map((b) => ({
  src: b.url,
  title: `${b.title} — ${b.description}`,
  category: 'Affiches Officielles des Productions Coordonnées'
}));
