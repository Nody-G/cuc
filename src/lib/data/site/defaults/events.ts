/**
 * Données par défaut — événements — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { SiteEvent } from '../types';

export const DEFAULT_EVENTS: SiteEvent[] = [
  {
    id: 'team-building',
    title: 'Team Building Cinéma d’Action',
    subtitle: 'Immersion entreprise sur le domaine du CUC',
    badge: 'SÉMINAIRES & IMMERSION ENTREPRISE',
    description:
      'Fédérez vos équipes lors d’un séminaire d’action inoubliable : tournage de faux trailer d’action, combat cinéma, doublage vocal et saut airbag. Accueil jusqu’à 90 personnes avec hébergement et restauration.',
    features: [
      'Ateliers cinéma indoor et cascades physiques',
      'Initiation combat cinéma et axes caméra',
      'Atelier doublage de voix & effets spéciaux (SFX)',
      'Hébergement et restauration sur site',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Organiser un Team Building',
    cta_link: '/team-building-cascades',
    image_url:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/team-building-01-team-building-et-action.webp',
    order_index: 1,
    is_published: true,
  },
  {
    id: 'spectacles',
    title: 'Spectacles de Cascades & Shows Live',
    subtitle: 'Combats chorégraphiés, voltige urbaine et pyrotechnie en direct',
    badge: 'PRESTATIONS & SHOWS EN DIRECT',
    description:
      'Spectacles vivants sur-mesure pour parcs, festivals, lancements de produit et grands événements. Combats chorégraphiés, voltige, chutes de hauteur et shows thématiques.',
    features: [
      'Cascadeurs professionnels diplômés',
      'Combats chorégraphiés (James Bond, Super-Héros, Casa de Papel)',
      'Parkour, acrobaties aériennes et performances live',
      'Régie technique et sécurité intégrale',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Découvrir les Spectacles',
    cta_link: '/spectacles-cascadeurs-yamakasi',
    image_url:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-02-spectacles-et-show-live.webp',
    order_index: 2,
    is_published: true,
  },
  {
    id: 'airbag',
    title: 'Location Airbag & Animations Parkour',
    subtitle: 'Sauts dans le vide sur coussin d’air géant de cinéma',
    badge: 'SENSATIONS FORTES GRAND PUBLIC',
    description:
      'Faites vivre au grand public les sensations uniques de la chute libre sur coussin d’air géant (sauts de 4 à 8 mètres). Encadrement assuré par des cascadeurs professionnels certifiés.',
    features: [
      '+20 000 chutes encadrées en sécurité',
      'Airbag géant homologué cinéma & spectacle',
      'Ateliers d’initiation au parkour et parcours d’obstacles',
      'Assurance professionnelle et encadrement certifié',
    ],
    price_indicator: 'Sur devis',
    cta_text: 'Découvrir les Animations',
    cta_link: '/animations-airbag-parkour',
    image_url:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-03-location-airbag-et-anim.webp',
    order_index: 3,
    is_published: true,
  },
];
