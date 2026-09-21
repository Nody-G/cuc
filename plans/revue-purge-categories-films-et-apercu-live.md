# Revue — Purge du vocabulaire marketing des films & réparation de l'aperçu live

Deux demandes traitées dans la même passe :

1. **« j'ai encore des badges ou écritures *Blockbuster*, *Cinéma International* — je n'en veux pas. La seule distinction que tu peux faire, c'est films, séries ou éventuellement courts métrages. »**
2. **« L'aperçu live ne marche pas du tout correctement : ça m'affiche des pages qui n'existent pas, avec la même image que les 4 qui défilent sur l'accueil. »**

---

## 1. Aperçu live du Cockpit

### 1.1 Cause racine (démontrée, pas supposée)

L'iframe d'aperçu ne chargeait **pas** la page publique : elle chargeait une route
dédiée `\/admin\/preview?slug=…` dont le rendu ([`PreviewRenderer`](../src/app/(admin)/admin/preview/PreviewRenderer.tsx))
ne connaissait que **7 identifiants de sections**, tous propres à l'accueil
(`hero`, `about`, `tournages`, `virtual_tour`, `qualiopi`, `partners`, `social`).

Conséquence mécanique pour **toute autre page** (`/equipe-cascadeurs-pro`,
`/formation-de-cascadeur`, `/visite-guidee`…) :

```
layout_sections vide ou inconnu → repli « sinon » du renderer
                               → ParallaxHero + About + Tournages + … (l'accueil entier)
                               → les 4 visuels du carrousel d'accueil
```

C'est exactement le symptôme décrit : « des pages qui n'existent pas avec la même
image que les 4 qui défilent sur l'accueil ». Le repli « résilient » de la route
d'aperçu était en réalité une **fabrication de page**.

### 1.2 Correction appliquée

L'aperçu encadre désormais la **vraie page publique**, sur la même origine :

| Élément | Avant | Après |
| --- | --- | --- |
| URL encadrée | `${origin}/admin/preview?slug=…` | `${origin}${chemin public}` |
| Contenu rendu | sections de l'accueil (repli) | la page réelle, mise en page réelle |
| Locale | ignorée | `fr` sans préfixe, `en` sous `/en` (cf. `localePrefix: 'as-needed'`) |
| Fidélité du brouillon | partielle | totale : chaque page consomme déjà le brouillon via `postMessage` |

Pourquoi c'est la seule implémentation correcte : les **15 pages vitrine**
consomment toutes `usePageDynamicContent(<slug>)`, et `PreviewBridgeClient`
(équipé de l'édition inline `[data-cuc-field]`) est monté par le layout racine
sur la vitrine. La page publique **est** l'aperçu ; toute route « qui rejoue les
sections » ne peut pas connaître 15 mises en page différentes.

Nouveaux artefacts :

- [`src/lib/preview/preview-url.ts`](../src/lib/preview/preview-url.ts) —
  `normalizePreviewSlug`, `buildPreviewPath`, `buildPreviewUrl` (testables, sans
  dépendance UI).
- [`src/lib/preview/preview-url.test.ts`](../src/lib/preview/preview-url.test.ts) —
  **7 tests** dont un garde-fou structurel qui échoue si :
  - la route factice `\/admin/preview` réapparaît dans `src/` ;
  - une page proposée dans l'éditeur (`SITE_PAGES_OPTIONS`) **n'a pas de route
    réelle** — c'est exactement la classe de bug « pages qui n'existent pas ».
- Route obsolète supprimée : `page.tsx`, `PreviewRenderer.tsx`, `layout.tsx`
  (le commentaire de [`robots.ts`](../src/app/robots.ts) est mis à jour ; `/admin/`
  reste exclu de l'indexation).

Encadrement autorisé côté en-têtes : `X-Frame-Options: SAMEORIGIN` et
`Content-Security-Policy: frame-ancestors 'self'` (déjà en place, `next.config.ts`).

---

## 2. Catégories de films : une seule distinction factuelle

### 2.1 Vocabulaire autorisé (source unique de vérité)

[`src/lib/film-category.ts`](../src/lib/film-category.ts) :

```
Film · Série · Court métrage
```

Tout l'ancien vocabulaire est **banni** et converti à la lecture :
`Blockbuster`, `Blockbuster US`, `Cinéma Français`, `Cinéma International`,
`Film Culte`, `Streaming Global`, `Série / Plateforme`, `Show & Événement`,
`Cinéma`.

Règle de sûreté : `normalizeFilmCategory()` renvoie `''` plutôt qu'une catégorie
inventée quand aucune correspondance factuelle n'existe. `getFilms()`
([`site-service.ts`](../src/lib/data/site-service.ts)) applique ce garde-fou de
lecture, donc **aucun reliquat en base ne peut plus atteindre l'écran**.

### 2.2 Preuves de classification (zéro jugement subjectif)

Deux sources vérifiables, aucune décision « à l'estime » :

1. **`metadata.title_type`** (typologie IMDb) — présent sur **562 lignes** du
   catalogue `site_films` :

   | `title_type` IMDb | Catégorie | Lignes |
   | --- | --- | ---: |
   | `movie` | Film | 334 |
   | `tvMovie` | Film | 22 |
   | `video` | Film | 1 |
   | `tvSeries` | Série | 117 |
   | `tvMiniSeries` | Série | 30 |
   | `short` | Court métrage | 46 |
   | `musicVideo` | *(aucune)* | 8 |
   | `videoGame` | *(aucune)* | 2 |
   | `podcastSeries` | *(aucune)* | 2 |

2. **URL Allociné** (`fichefilm_gen_cfilm` → Film, `ficheserie_gen_cserie` →
   Série) — preuve autonome pour **8 lignes** dépourvues de typologie IMDb.

**Cas assumé : 12 lignes sans catégorie.** Clips musicaux, jeux vidéo et podcasts
n'ont pas d'équivalent honnête dans la seule distinction autorisée. Aucun badge
n'est affiché — *une valeur fausse est pire qu'une valeur absente*.

### 2.3 Propagation (base + miroirs + code + interface)

| Cible | Action | Volume |
| --- | --- | ---: |
| `site_films.category` | reclassement par preuve | **558** |
| `site_films.tag` | badges marketing vidés (`BLOCKBUSTER`, …) | 3 |
| `site_settings.films` (miroir) | catégories + badges | 63 + 5 |
| `site_pages.layout_sections` | « Affiches & Blockbusters Cinéma » → **« Affiches de films »** | 1 |
| `site_settings.celebrities` | `roleType` + `highlightTag` supprimés | 11 |
| `src/data/filmography.ts` | **66** catégories réécrites | 66 |
| `src/data/celebrities.ts` | champs marketing supprimés | 11 fiches |

Interface :

- [`CelebrityDoublesGallery.tsx`](../src/components/sections/hall-of-fame/CelebrityDoublesGallery.tsx) :
  filtres « Cinéma Français (n) / Cinéma International (n) » **retirés** (cette
  segmentation ne reposait sur aucune preuve).
- [`HomeTournagesSection.tsx`](../src/components/sections/home/HomeTournagesSection.tsx) :
  `Blockbuster US` / `Cinéma Français` / `Cinéma` → `Film` (les 4 affiches sont
  des longs métrages, typologie IMDb `movie`).
- [`FilmsView.tsx`](../src/app/(admin)/admin/components/FilmsView.tsx) (Cockpit) :
  filtres et liste déroulante alimentés par `FILM_CATEGORIES` ; badge par défaut
  `Film` ; exemple de tag « COMBATS, POURSUITES, NOUVEAU ».
- [`TeamView.tsx`](../src/app/(admin)/admin/components/TeamView.tsx) (Cockpit) :
  même liste unique `FILM_CATEGORIES`, défaut `Film`.
- [`types/index.ts`](../src/types/index.ts) : `FilmCredit.category` typée
  `FilmCategoryOrEmpty` ; `DoubledCelebrity` allégé (`roleType`, `highlightTag`
  supprimés — champs qui n'étaient affichés nulle part).
- [`site-service.ts`](../src/lib/data/site-service.ts) : nom de section par défaut
  « Affiches de films ».

### 2.4 Garde-fous

[`src/lib/film-category.test.ts`](../src/lib/film-category.test.ts) — **9 tests** :

1. le vocabulaire autorisé est figé (`Film`, `Série`, `Court métrage`) ;
2. la conversion de l'ancien vocabulaire (casse, accents, absences) ne régresse pas ;
3. une valeur inconnue rend `''` (jamais une catégorie inventée) ;
4. **aucun fichier de `src/` ne contient d'étiquette marketing** (scan récursif) ;
5. les données de `filmography.ts` n'utilisent que le vocabulaire autorisé ;
6. `celebrities.ts` ne réintroduit ni `roleType` ni `highlightTag`.

### 2.5 Outils réutilisables livrés

- `node scripts/audit_film_categories.mjs` — inventaire : distribution des
  catégories (base, miroirs, sources), preuves Allociné, typologie IMDb,
  clés de métadonnées. Écrit `plans/audit-categories-films.json`.
- `node scripts/purge_marketing_film_categories.mjs` — migration **idempotente**,
  simulation par défaut, `--apply` pour écrire. Écrit
  `plans/rapport-purge-categories-films.json`.

---

## 3. Vérifications

| Contrôle | Résultat |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 erreur |
| `npx vitest run` | ✅ **145/145** (13 fichiers, dont 16 nouveaux tests) |
| `npm run build` | ✅ compilé, **93/93** pages statiques (94 − 1 route factice supprimée) |
| `npm run i18n:verify:no-flash` | ✅ HTML prérendu : EN en anglais, FR en français |
| `purge_marketing_film_categories.mjs` (relecture base) | ✅ **0** occurrence restante |
| Vocabulaire interdit dans `src/` | ✅ **0** occurrence (hors fichier de correspondance et tests) |

## 4. Reste à faire (pistes, non bloquantes)

- Les **12 œuvres sans catégorie** (clips, jeux vidéo, podcasts) restent sans
  badge : si le CUC veut les présenter, il faut une décision éditoriale (une
  quatrième étiquette ou une exclusion du catalogue), pas un rattachement forcé.
- L'aperçu live pourrait exposer un sélecteur **FR / EN** (l'URL localisée est
  déjà calculée par `buildPreviewPath(slug, locale)`) — à raccrocher au LOT 5.1
  de la feuille de route i18n.
