/**
 * Données du hero d'accueil — façade de ré-export.
 *
 * La doctrine i18n et la logique de fusion vivent désormais dans le domaine
 * partagé `@/lib/data/site/hero-slides` : **aucune copie rédactionnelle** ici,
 * seulement la clé (`home.hero.slides.<key>`) et les URL média stables. Le
 * module reste le point d'import historique (`./parallaxHero.data`) pour ne
 * casser aucun appelant, mais la source unique est le domaine — partagée avec
 * l'éditeur du Cockpit.
 */
export * from '@/lib/data/site/hero-slides';
