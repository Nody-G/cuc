import { LightboxImage } from '@/components/ui/LightboxModal';
import { OFFICIAL_FILM_BANNERS } from '@/data/filmography';

// Les visuels ci-dessous sont des photographies réelles du campus.
// Aucune légende descriptive n'est affichée : seul le nom de la série sert
// de repère neutre dans la visionneuse.

export const STUDIO_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/001.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/002.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/003.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/004.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/005.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }
];

export const CASCADEUR_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-371-e1671702083907.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/1000053353-scaled-e1763629965386.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/NERO-6-scaled-e1763629837156.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/20240612_191918-scaled-e1763630249952.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/11/1000052477-scaled-e1763630640338.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-51.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/12/défenestration.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }
];

export const EQUIPMENT_GALLERY: LightboxImage[] = [
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-320-e1671701864164.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/3-Le-site-photos-du-bas-2.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Airbag-vert.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/CUC-5.0-462-e1671701953374.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Matelas.png', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Rigging.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }
];

export const BANNER_GALLERY: LightboxImage[] = OFFICIAL_FILM_BANNERS.map((b) => ({
  src: b.url,
  title: b.title,
  category: 'Affiches Officielles des Productions Coordonnées'
}));
