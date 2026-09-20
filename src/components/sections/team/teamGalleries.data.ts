import { LightboxImage } from '@/components/ui/LightboxModal';
import { OFFICIAL_FILM_BANNERS } from '@/data/filmography';

// Les visuels ci-dessous sont des photographies réelles du campus.
// Aucune légende descriptive n'est affichée : seul le nom de la série sert
// de repère neutre dans la visionneuse.

export const STUDIO_GALLERY: LightboxImage[] = [
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/003.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/004.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/005.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }
];

export const CASCADEUR_GALLERY: LightboxImage[] = [
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-371-e1671702083907.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1000053353-scaled-e1763629965386.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/NERO-6-scaled-e1763629837156.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/20240612_191918-scaled-e1763630249952.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1000052477-scaled-e1763630640338.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-51.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }
];

export const EQUIPMENT_GALLERY: LightboxImage[] = [
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-320-e1671701864164.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/3-Le-site-photos-du-bas-2.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Airbag-vert.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-462-e1671701953374.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Matelas.png', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Rigging.jpg', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }
];

export const BANNER_GALLERY: LightboxImage[] = OFFICIAL_FILM_BANNERS.map((b) => ({
  src: b.url,
  title: b.title,
  category: 'Affiches des Productions Coordonnées'
}));
