# Revue — Purge des visuels de films hérités de l'ancien site

**Date :** 2026-09-21
**Demande :** « Je ne veux plus des images qui étaient stockées à la base sur le site
du CUC. Je sais qu'il reste des images d'affiches et de bannières d'affiches de film
qui existaient, mais je les veux plus, on peut les supprimer. Je veux qu'on se base
sur les vraies affiches des films comme tu as fait pour les plus de 500 films. »
**Statut :** ✅ Appliqué et vérifié.

---

## 1. Inventaire avant opération

| Gisement | Volume | Nature |
| --- | --- | --- |
| Storage `media/film-poster/` | **64 fichiers, ~21 Mo** | Affiches de l'ancien site (`1-Valerian.jpg`, `11-Le-Transporteur-HCritage.jpg`, `18-Yamakasi.jpg`…) |
| Storage `media/cuc-visual/` | **6 fichiers** | Frises composites d'anciennes affiches : `Bandes-affiches-film-1-1.png`, `-3.png`, `-4.png`, `Bandeau-2023-scaled.jpg`, `Bandeau-images-films.png`, `Bandeau-Films-Lucas-CUC-bis-scaled.jpg` |
| `site_settings.films` (miroir) | **63 entrées** | Toutes pointaient vers `media/film-poster/` |
| `site_settings.film_banners` | 6 entrées | Les frises ci-dessus |
| `site_films` | **1 fiche sur 570** | Seule la fiche de Braqueurs (corrigée juste avant) pointait encore vers ce dossier |
| Code | **3 fichiers, 130 références** | [`filmography.ts`](../src/data/filmography.ts:1) (63), [`all_official_films.ts`](../src/data/all_official_films.ts:1) (63), [`HomeTournagesSection.tsx`](../src/components/sections/home/HomeTournagesSection.tsx:1) (4) |
| Galerie équipe | 1 entrée | [`teamGalleries.data.ts`](../src/components/sections/team/teamGalleries.data.ts:30) — une photo du site stockée dans le dossier des affiches |

Constat : les **569 autres fiches films utilisaient déjà de vraies affiches**
(sources officielles IMDb/TMDB) — l'héritage ne concernait que cette liste de
63 « films officiels » et les 6 frises.

## 2. Méthode de remplacement

Aucun visuel n'a été remplacé « au jugé ». Pour chacun des 63, résolution en cascade
([`purge_legacy_film_visuals.mjs`](../scripts/purge_legacy_film_visuals.mjs:1)) :

1. **Catalogue `site_films`** — même titre normalisé **et** même année → on réutilise
   l'affiche déjà en place (source officielle). 58 cas.
2. **Tolérance d'année (±1)** pour les écarts de sortie FR : *Bac Nord* (2021→2020),
   *Alraid Dingue* et *Alibi.com* (2017→2016), *Taken 3* (2015→2014). Titre identique
   exigé, écart explicitement tracé.
3. **TMDB** pour les 5 restants : *The 355*, *Sentinelle*, *Family Business*,
   *Dunkerque*, *The Hunger Games (Mockingjay 1)*, *Mesrine : L'Ennemi public n°1*.

Garde-fous appliqués :

- une fiche **non publiée** est écartée — un doublon peut porter une affiche erronée
  (c'est exactement le cas de Braqueurs, dont le doublon contenait la photo de Ricki Lake) ;
- une image **encore héritée** n'est jamais réutilisée comme « vraie affiche » ;
- un appariement **sur le titre seul** est refusé si l'année diverge de plus d'un an.
  Exemple concret : « Sentinelle » (2021, Netflix) a été **refusé** sur la fiche
  homonyme de 2023 présente au catalogue, et résolu vers le bon film via TMDB.

## 3. Actions appliquées

1. **63 URLs réécrites** dans `filmography.ts`, `all_official_films.ts` et
   `HomeTournagesSection.tsx` (affiches réelles, sources officielles).
2. **Miroir `site_settings.films`** : 63 visuels remplacés.
3. **`site_settings.film_banners`** vidé ; [`filmBanners.ts`](../src/data/filmBanners.ts:1)
   renvoie une liste vide (structure conservée pour ne pas casser `getFilmBanners`)
   et [`TeamBannersSection`](../src/components/sections/team/TeamBannersSection.tsx:17)
   ne rend plus rien.
4. **Photo héritée retirée** de la galerie « Équipements » (elle vivait dans le
   dossier des affiches de films).
5. **`image.tmdb.org`** autorisé dans [`next.config.ts`](../next.config.ts:66) — aucune
   copie n'est plus stockée pour ces films.
6. **Suppression Storage : 70 objets** (64 affiches + 6 frises).
7. La fiche de Braqueurs, dont l'affiche avait été replacée manuellement dans le
   Storage, bascule elle aussi sur la source TMDB — afin que le dossier
   `media/film-poster` soit vidé **entièrement**.

## 4. Vérifications (post-exécution)

| Contrôle | Résultat |
| --- | --- |
| Objets restants dans `media/film-poster/` | **0** |
| Références héritées restantes dans `src/` | **aucune** |
| Visuels hérités restants dans le miroir | **0** |
| Nouvelles affiches joignables (HEAD) | **63/63** |
| `npm test` | 129 / 129 |
| `npx eslint --quiet` | 0 erreur |
| `npm run build` | ✅ 94 routes |

## 5. Conséquence

Le catalogue ne dépend plus d'aucun visuel produit pour l'ancien site : les affiches
proviennent des sources officielles (IMDb/Amazon et TMDB), en cohérence avec les
569 fiches déjà conformes. Le risque d'une affiche « plausible mais étrangère »,
révélé par l'incident Braqueurs, est éliminé à la source : il n'existe plus de
copie locale susceptible d'être mal indexée.

Détail technique complet (correspondances une à une, objets supprimés) :
`.cache/legacy-visual-purge.json`.
