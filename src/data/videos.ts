/**
 * Reportages TV et vidéos d'archives du CUC — repli dépôt.
 *
 * Source de vérité publique : `site_settings` clé `videos` (lue par
 * [`getVideos()`](../lib/data/site/settings.ts:21)). Ce tableau n'est servi que
 * si cette lecture échoue ; il doit donc **mirrorer exactement** la source de
 * vérité, sans jamais pointer vers un média absent.
 *
 * Provenance des `dmId` (aucune valeur inventée) : identifiants Dailymotion
 * réellement exposés par l'ancien site
 * (`https://www.campus-universcascades.com/videos-cascadeur/`, appels
 * `loadDailymotionVideo('<id>', '<conteneur>')`) et identiques à la valeur
 * persistée dans `site_settings.videos`. Chaque page de visionnage
 * `https://www.dailymotion.com/video/<id>` répond HTTP 200 (mesuré).
 */

export interface ProgrammeTvItem {
  title: string;
  sub: string;
  img: string;
  /** Identifiant Dailymotion nu (résolu par [`resolveEmbedUrl()`](../lib/video-embed.ts:33)). */
  dmId: string;
}

export const PROGRAMMES_TV: ProgrammeTvItem[] = [
  {
    title: 'COEUR DE CASCADEURS',
    sub: 'Série TV France 2 & CUC',
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/coeur-de-cascadeurs.webp',
    dmId: 'x9uewe0',
  },
  {
    title: 'REPORTAGE TV — ÉCOLE DES CASCADEURS',
    sub: "JT 20H National & Reportage Immersion",
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/ReportageBFMTV-Alecoledescascadeurs.webp',
    dmId: 'x8581s9',
  },
  {
    title: 'HAPPY BIRTHDAY CUC',
    sub: '10 ans de cascade (2009 - 2019)',
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/HappyBirthdayCUC-2009-2019.jpeg',
    dmId: 'x858323',
  },
  {
    title: "SESSION D'AOÛT 2017",
    sub: 'Promotion CUC en formation',
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-session-Aout-2017.webp',
    dmId: 'x8583in',
  },
  {
    title: 'ZOË BELL AU CAMPUS',
    sub: 'Marraine du Campus Univers Cascades',
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/zoebell.jpeg',
    dmId: 'k2LHEg1AIHtIfYxkvcz',
  },
  {
    title: 'STUNT RIDER — CAMPUS LIFE',
    sub: 'La vie au CUC au quotidien',
    img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/StuntRider-CampusLife.webp',
    dmId: 'x8583u3',
  },
];
