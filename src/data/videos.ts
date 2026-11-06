/**
 * Reportages TV et vidéos d'archives du CUC — repli dépôt & synchronisation officielle.
 *
 * Source de vérité publique : `site_settings` clé `videos` (lue par
 * [`getVideos()`](../lib/data/site/media-settings.ts:20)).
 *
 * Provenance des données : chaîne officielle Dailymotion `@campus-univers-cascades`
 * (https://www.dailymotion.com/user/campus-univers-cascades).
 * Résolu par [`resolveEmbedUrl()`](../lib/video-embed.ts:42) via le lecteur moderne geo.dailymotion.com.
 */

export interface ProgrammeTvItem {
  title: string;
  sub: string;
  img: string;
  /** Identifiant Dailymotion nu (ex. 'xbfafoi', 'x9uewe0'). */
  dmId: string;
}

export const PROGRAMMES_TV: ProgrammeTvItem[] = [
  {
    "title": "CUC 5.0 — STUNT TEAM",
    "sub": "Plongez au cœur de l'action des cascadeurs",
    "img": "https://s2.dmcdn.net/v/TMm7I1ep9SNXcUrfk/x720",
    "dmId": "x85824y"
  },
  {
    "title": "CŒUR DE CASCADEURS",
    "sub": "Série TV France 2 (13h15) • Nania Films & CUC",
    "img": "https://s1.dmcdn.net/v/ZUpru1glYSd1qXquU/x720",
    "dmId": "x9uewe0"
  },
  {
    "title": "BFM TV — LE MÉTIER DE CASCADEUR",
    "sub": "Reportage BFM TV • Immersion au Campus Univers Cascades",
    "img": "https://s2.dmcdn.net/v/fBEZY1glHE5W5dR9G/x720",
    "dmId": "xbfafoi"
  },
  {
    "title": "QUOTIDIEN — CUC REPORTAGE",
    "sub": "Émission Quotidien (TMC) • Les coulisses de l'action",
    "img": "https://s2.dmcdn.net/v/fBERA1glgGXAdXe-u/x720",
    "dmId": "xbfaf9m"
  },
  {
    "title": "TF1 JT 20H — CUC REPORTAGE",
    "sub": "Journal Télévisé TF1 • Immersion à l'école des cascadeurs",
    "img": "https://s2.dmcdn.net/v/fAXHI1glDwZ0_ecPA/x720",
    "dmId": "xbf6gk2"
  },
  {
    "title": "DIVERSION — CUC TEAM",
    "sub": "France 2 (20h30 l'été) • Tournage action sur péniche",
    "img": "https://s2.dmcdn.net/v/V6H7x1g45iNcWbbZb/x720",
    "dmId": "x8mmmm3"
  },
  {
    "title": "KONBINI — BIENVENUE À L'ÉCOLE DES CASCADEURS",
    "sub": "Reportage Konbini • Immersion avec Sarah Belala au CUC",
    "img": "https://s1.dmcdn.net/v/Srzv81gwkZb-jEe2X/x720",
    "dmId": "x803uq0"
  },
  {
    "title": "WARLIKE — GUN FIGHT CONCEPT",
    "sub": "Concept scène d'action • Production Big Films",
    "img": "https://s2.dmcdn.net/v/U1N4b1ep9v8jKsTvO/x720",
    "dmId": "x8bvgo5"
  },
  {
    "title": "+300 MILLIONS DE VUES SUR LES RÉSEAUX",
    "sub": "Rétrospective & viralité des cascadeurs du CUC",
    "img": "https://s2.dmcdn.net/v/TXFes1gveiy-wTDnz/x720",
    "dmId": "x86v0hi"
  },
  {
    "title": "STUNT RIDER — CAMPUS LIFE",
    "sub": "Démonstrations moto • La vie au CUC au quotidien",
    "img": "https://s2.dmcdn.net/v/TMmfh1gsWfgD0qwD6/x720",
    "dmId": "x8583u3"
  },
  {
    "title": "SESSION D'AOÛT 2017",
    "sub": "Promotion CUC en formation intensive",
    "img": "https://s2.dmcdn.net/v/TMmZF1enQ3Pa0DydJ/x720",
    "dmId": "x8583in"
  },
  {
    "title": "HAPPY BIRTHDAY CUC | 2009 - 2019",
    "sub": "10 ans d'ouverture du Campus Univers Cascades",
    "img": "https://s2.dmcdn.net/v/TMmPx1en0RRCwi315/x720",
    "dmId": "x858323"
  },
  {
    "title": "CUC — HIGHFALL 2K19",
    "sub": "Chutes de hauteur • Équipe professionnelle CUC",
    "img": "https://s2.dmcdn.net/v/TMmOP1g4FvsqteRpa/x720",
    "dmId": "x8582zd"
  },
  {
    "title": "CUC PARTNER — STUNT LIFE",
    "sub": "Chorégraphie et combat cinématographique",
    "img": "https://s1.dmcdn.net/v/TMmFv1gVvKFFiaXC4/x720",
    "dmId": "x8582k9"
  },
  {
    "title": "REPORTAGE BFM TV — À L’ÉCOLE DES CASCADEURS",
    "sub": "Les équipes TV en immersion au CUC",
    "img": "https://s2.dmcdn.net/v/TMm091eoG43-n0G6C/x720",
    "dmId": "x8581s9"
  },
  {
    "title": "THE TRAP — COURT-MÉTRAGE CUC",
    "sub": "Création audiovisuelle étudiants & régleurs CUC",
    "img": "https://s2.dmcdn.net/v/6PSX11gYe0Of5mosh/x720",
    "dmId": "x1rwj7l"
  },
  {
    "title": "CREATIVE HUMAN TORCH",
    "sub": "Torches humaines artistiques • Session cascadeurs",
    "img": "https://s1.dmcdn.net/v/2ixO21gsWfgigx7Z4/x720",
    "dmId": "xqzmde"
  }
];
