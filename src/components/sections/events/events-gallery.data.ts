import type { LightboxImage } from '@/components/ui/LightboxModal';

const BASE_EVENTS_URL =
  'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events';

/**
 * Galerie complète des photographies événementielles issues du dossier
 * `06 - EVENTS / 02 - SPECTACLES CASCADES et PARKOUR`.
 *
 * Les 8 premières photos constituent les deux premières rangées visibles par défaut (2x4).
 * Les 17 suivantes sont révélées via le bouton déroulant comme sur la page Tournage.
 */
export const EVENTS_SPECTACLES_GALLERY: LightboxImage[] = [
  {
    title: 'Show Parkour & Acrobatie',
    src: `${BASE_EVENTS_URL}/spectacles-01-show-parkour-acrobatie.webp`,
    category: 'Show Urbain & Parkour',
  },
  {
    title: 'Show James Bond 007',
    src: `${BASE_EVENTS_URL}/spectacles-02-show-james-bond.webp`,
    category: 'Show Espionnage & Cascades',
  },
  {
    title: 'Show Super-Héros',
    src: `${BASE_EVENTS_URL}/spectacles-03-show-super-heros.webp`,
    category: 'Grand Spectacle Pop Culture',
  },
  {
    title: 'Show Casa de Papel',
    src: `${BASE_EVENTS_URL}/spectacles-04-show-casa-de-papel.webp`,
    category: 'Happening Immersif & Braquage',
  },
  {
    title: 'Show Acro & Performances',
    src: `${BASE_EVENTS_URL}/spectacles-05-show-acro-performances.webp`,
    category: "Comédie d'Action & Scène",
  },
  {
    title: 'Show Parkour & Saut de Véhicule en Direct',
    src: `${BASE_EVENTS_URL}/spectacles-bonus-2.webp`,
    category: 'Grand Événement Live',
  },
  {
    title: 'Démonstration Acrobatique Salon & Événement',
    src: `${BASE_EVENTS_URL}/spectacles-bonus-1.webp`,
    category: 'Show Parkour & Acrobatie',
  },
  {
    title: 'Performance Live Lancement de Marque',
    src: `${BASE_EVENTS_URL}/spectacles-bonus-3.webp`,
    category: 'Événementiel Entreprise',
  },
  {
    title: 'Cascade Acrobatique sur Plateau Télévisé',
    src: `${BASE_EVENTS_URL}/spectacles-parkour-acro.webp`,
    category: 'Plateau TV & Médias',
  },
  {
    title: 'Show Pirates & Escrime Artistique',
    src: `${BASE_EVENTS_URL}/spectacles-sse-4.webp`,
    category: 'Spectacles à Thèmes',
  },
  {
    title: 'Show James Bond 007 — Action Scénique',
    src: `${BASE_EVENTS_URL}/spectacles-james-bond-5.webp`,
    category: 'Show James Bond',
  },
  {
    title: 'Show Mission Impossible & Action Tactique',
    src: `${BASE_EVENTS_URL}/spectacles-mission-impossible.webp`,
    category: 'Spectacles à Thèmes',
  },
  {
    title: 'Show Pirates des Caraïbes — Duels au Sabre',
    src: `${BASE_EVENTS_URL}/spectacles-pirates-des-caraibes.webp`,
    category: 'Cape & Épée',
  },
  {
    title: 'Créations & Spectacles à Thèmes',
    src: `${BASE_EVENTS_URL}/spectacles-spectacles-a-themes.webp`,
    category: 'Spectacles à Thèmes',
  },
  {
    title: 'Cascade Scénique & Percussion Urbaine',
    src: `${BASE_EVENTS_URL}/spectacles-banc-cascades.webp`,
    category: 'Cascades Physiques',
  },
  {
    title: 'Tricks & Acrobatie de Scène',
    src: `${BASE_EVENTS_URL}/spectacles-tricks-acrobatie-25-jpg.webp`,
    category: 'Tricking & Voltige',
  },
  {
    title: 'Performance Scénique CUC Events #1',
    src: `${BASE_EVENTS_URL}/spectacles-sse-1.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #2',
    src: `${BASE_EVENTS_URL}/spectacles-sse-3.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #3',
    src: `${BASE_EVENTS_URL}/spectacles-sse-5.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #4',
    src: `${BASE_EVENTS_URL}/spectacles-sse-12.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #5',
    src: `${BASE_EVENTS_URL}/spectacles-sse-15.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #6',
    src: `${BASE_EVENTS_URL}/spectacles-sse-16.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #7',
    src: `${BASE_EVENTS_URL}/spectacles-sse-19.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Performance Scénique CUC Events #8',
    src: `${BASE_EVENTS_URL}/spectacles-sse-20.webp`,
    category: 'Archives Spectacles',
  },
  {
    title: 'Show Live & Cascades en Extérieur',
    src: `${BASE_EVENTS_URL}/spectacles-1359-img_2517.webp`,
    category: 'Archives Spectacles',
  },
];
