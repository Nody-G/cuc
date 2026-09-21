/**
 * Données du hero d'accueil.
 *
 * Doctrine i18n : **aucune copie rédactionnelle ici**. Chaque visuel ne porte
 * que sa clé (`key`) ; les textes (légende, sous-titre, badge, étiquette)
 * vivent dans les catalogues `messages/fr.json` et `messages/en.json` sous
 * `home.hero.slides.<key>`. Les URLs d'images, elles, sont des médias stables.
 */
export interface HeroSlide {
  /** Clé d'overlay i18n : `home.hero.slides.<key>`. */
  key: 'campus' | 'combat' | 'facilities' | 'team';
  url: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    key: 'campus',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-6-scaled.jpg',
  },
  {
    key: 'combat',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.jpg',
  },
  {
    key: 'facilities',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-7-scaled.jpg',
  },
  {
    key: 'team',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg',
  },
];
