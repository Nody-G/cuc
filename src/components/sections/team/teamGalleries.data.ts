import { LightboxImage } from '@/components/ui/LightboxModal';
import { OFFICIAL_FILM_BANNERS } from '@/data/filmography';

// Les visuels ci-dessous sont des photographies réelles du campus.
// Aucune légende descriptive n'est affichée : seul le nom de la série sert
// de repère neutre dans la visionneuse.

export const STUDIO_GALLERY: LightboxImage[] = [
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/003.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/004.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/005.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' }
];

export const CASCADEUR_GALLERY: LightboxImage[] = [
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-371-e1671702083907.webp', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1000053353-scaled-e1763629965386.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/NERO-6-scaled-e1763629837156.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/20240612_191918-scaled-e1763630249952.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1000052477-scaled-e1763630640338.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-51.webp', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.webp', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.webp', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }
];

export const EQUIPMENT_GALLERY: LightboxImage[] = [
  // Visuel hérité retiré : une photo du site stockée dans le dossier des
  // affiches de films (`media/film-poster`), dossier intégralement supprimé.
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-320-e1671701864164.webp', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Airbag-vert.webp', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-462-e1671701953374.webp', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Matelas.webp', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Rigging.webp', title: 'Équipements CUC', category: 'Les Équipements' },
  { src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.webp', title: 'Équipements CUC', category: 'Les Équipements' }
];

export const BANNER_GALLERY: LightboxImage[] = OFFICIAL_FILM_BANNERS.map((b) => ({
  src: b.url,
  title: b.title,
  category: 'Affiches des Productions Coordonnées'
}));
