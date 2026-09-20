# Pipeline de scraping des crédits coachs (IMDb + TMDB)

Pipeline de recensement des participations à des tournages pour l'ensemble des
coachs du CUC.

**Source primaire : IMDb** (API GraphQL publique). IMDb est très largement plus
exhaustif que TMDB pour les cascadeurs — à titre d'exemple, Amédéo Cazzella
compte **113 crédits IMDb** contre **0 sur TMDB**. TMDB reste disponible comme
source secondaire.

## Principe directeur

Le pipeline **n'écrit jamais directement en base**. Il produit un artefact de
revue, qui est validé manuellement, puis appliqué par un script distinct. Cela
garantit la conformité à la doctrine éditoriale *Zéro Invention*.

```
IMDb (GraphQL public)                    TMDB API (secondaire)
   ↓                                        ↓
scrape_coach_credits_imdb.mjs          resolve_tmdb_person_ids.mjs
   → scripts/imdb_person_resolution.json   → scripts/tmdb_person_resolution.json
   → scripts/coach_credits_review_imdb.json
   → plans/revue-credits-coachs-imdb.md
   ↓
curate_coach_credits.mjs   ← CURATION ÉDITORIALE (filtre + fusion + plafond)
   → scripts/coach_credits_curated_imdb.json
   → plans/revue-credits-coachs-curated.md
   ↓
[ VALIDATION HUMAINE ]
   ↓
apply_verified_coach_credits.mjs → src/data/team.ts
   ↓
sync_coach_credits_supabase.mjs  → Supabase site_team + site_films
```

## Prérequis

1. **Aucune clé requise pour IMDb.** Le client utilise l'API GraphQL publique
   d'IMDb (`api.graphql.imdb.com`) avec des en-têtes navigateur, plus l'API de
   suggestion (`v3.sg.media-imdb.com`) pour la résolution nominative.

2. **Clé TMDB** (optionnelle, source secondaire) : ajoutez dans `.env.local` :

   ```
   TMDB_API_KEY=votre_cle_api_v3
   ```

   Alternative : `TMDB_ACCESS_TOKEN=votre_token_v4` (Bearer).

3. Node.js 18+.

## Utilisation — pipeline IMDb (recommandé)

### 1. Scraper les crédits IMDb

```bash
npm run coaches:scrape:imdb          # avec cache disque
npm run coaches:scrape:imdb:fresh    # force le re-fetch
```

Le script :

1. résout l'identité IMDb de chaque coach (registre `coach-registry.mjs`, puis
   API de suggestion en repli) ;
2. récupère la filmographie complète via GraphQL (pagination par 250) ;
3. filtre les catégories Stunts / Crew pertinentes (et Acting pour les profils
   Parkour) ;
4. normalise les catégories IMDb vers la terminologie CUC sobre ;
5. croise avec les crédits déclarés dans `src/data/team.ts` ;
6. produit les artefacts de revue.

Produit :

- `scripts/imdb_person_resolution.json` — résolution d'identité
- `scripts/coach_credits_review_imdb.json` — artefact machine
- `plans/revue-credits-coachs-imdb.md` — rapport lisible

### 2. Curater la sélection éditoriale

Le scraping IMDb produit un **vrac fiable mais non publiable** (clips, publicités,
émissions, fonds de catalogue) et écrase les rôles déclarés riches sous la
catégorie technique générique « Cascadeur ». La curation transforme ce vrac en
sélection publiable.

```bash
npm run coaches:curate              # curation (plafond 24 crédits/coach)
npm run coaches:curate:excluded     # idem + détail des crédits exclus
node scripts/curate_coach_credits.mjs --limit=30   # plafond personnalisé
```

Le curateur applique trois règles issues de la doctrine éditoriale :

1. **Filtre non cinématographique** — exclut clips musicaux, publicités,
   émissions de plateau, cérémonies, making-of, jeux, podcasts.
2. **Préservation des rôles précis** — un rôle déclaré riche
   (« Coordinateur des cascades », « Doublure Keanu Reeves », « Câblage 3D »)
   n'est **jamais** écrasé par « Cascadeur », et n'est **jamais** écarté par le
   plafond (doctrine « zéro appauvrissement »).
3. **Assainissement doctrinal** — neutralise les termes interdits ou
   sensationnalistes (« ADD » → « Parkour », « gun-fu » → « Combats rapprochés »,
   superlatifs creux).

Produit :

- `scripts/coach_credits_curated_imdb.json` — sélection machine
- `plans/revue-credits-coachs-curated.md` — revue lisible

### 3. Valider manuellement

Ouvrez `plans/revue-credits-coachs-imdb.md`. Chaque crédit porte un statut :

| Statut | Signification | Action |
| --- | --- | --- |
| ✅ CONFIRMÉ | IMDb et déclaration cohérents | Aucune |
| 🆕 NOUVEAU | Trouvé dans IMDb, absent de la fiche | Vérifier puis conserver |
| ⚠️ CONTRADICTOIRE | Rôle déclaré ≠ rôle IMDb | Corriger le rôle |
| ❓ NON VÉRIFIABLE | Déclaré mais introuvable dans IMDb | Arbitrer manuellement |

Pour rejeter un crédit, passez son statut à `REJETÉ` dans
`scripts/coach_credits_review_imdb.json`. Pour corriger un rôle, éditez
`imdbRole`.

### 4. Appliquer dans `src/data/team.ts`

```bash
npm run coaches:apply:preview   # aperçu, aucune écriture
npm run coaches:apply           # écriture réelle (crée un .bak)
```

Réécrit `notableCredits`, `metadata.film_roles` et conserve les crédits
`NON VÉRIFIABLE` (aucune perte de donnée). Le script lit le rapport IMDb brut ;
pour appliquer la sélection curatée, validez d'abord
`plans/revue-credits-coachs-curated.md`.

### 5. Synchroniser Supabase

```bash
npm run coaches:sync:preview    # aperçu
npm run coaches:sync            # écriture réelle
```

Met à jour :

- `site_team` : `notable_credits`, `doubled_actors`, `metadata.film_roles`, `imdb`
- `site_films` : `cuc_team_involved`, `metadata.cuc_team_roles`
- `site_settings` (clé `team`) : miroir complet

Upsert idempotent : relancer le script ne crée aucun doublon.

## Utilisation — pipeline TMDB (secondaire)

```bash
npm run coaches:resolve         # résolution des identifiants TMDB
npm run coaches:scrape          # scraping TMDB
npm run coaches:scrape:fresh    # force le re-fetch
```

Produit `scripts/tmdb_person_resolution.json`, `scripts/coach_credits_review.json`
et `plans/revue-credits-coachs.md`.

## Architecture des fichiers

| Fichier | Rôle |
| --- | --- |
| `scripts/lib/imdb-client.mjs` | Client IMDb (GraphQL + suggestion, rate-limit 20 req/10s, retry, cache) |
| `scripts/lib/tmdb-client.mjs` | Client TMDB (rate-limit 40 req/10s, retry, cache) |
| `scripts/lib/coach-registry.mjs` | Registre d'identité des 12 coachs (IMDb + TMDB) |
| `scripts/lib/credit-normalizer.mjs` | Normalisation des catégories IMDb / jobs TMDB → terminologie CUC |
| `scripts/lib/credit-verifier.mjs` | Croisement sources ↔ déclarations actuelles |
| `scripts/lib/credit-curator.mjs` | Curation éditoriale (filtre non-cinéma, préservation des rôles précis, assainissement doctrinal, plafond) |
| `scripts/scrape_coach_credits_imdb.mjs` | Scraping IMDb et génération de la revue |
| `scripts/curate_coach_credits.mjs` | Génération de la sélection curatée (JSON + revue) |
| `scripts/resolve_tmdb_person_ids.mjs` | Résolution des identifiants TMDB |
| `scripts/scrape_coach_credits.mjs` | Scraping TMDB et génération de la revue |
| `scripts/apply_verified_coach_credits.mjs` | Écriture dans `src/data/team.ts` |
| `scripts/sync_coach_credits_supabase.mjs` | Synchronisation Supabase |

## Notes techniques IMDb

- L'endpoint GraphQL public d'IMDb **rejette (HTTP 400)** les requêtes utilisant
  des variables GraphQL (`$id: ID!`), le champ `characters`, ou une pagination
  supérieure à 250. La forme fiable est une requête **inline sans variables**
  avec `credits(first: 250)` et pagination via `pageInfo.endCursor`.
- La résolution nominative exige une correspondance **exacte** du nom (accents
  et casse normalisés) **et** une description mentionnant une activité de
  cascade/parkour/acrobatie. À défaut, le résultat est rejeté (`null`) plutôt
  que de risquer un homonyme non pertinent.

## Conformité doctrinale

- **Terminologie Parkour** : le normaliseur bannit `ADD` et
  `Art du Déplacement`, remplacés systématiquement par **Parkour**.
- **Ton factuel** : les rôles sont issus de catégories IMDb / jobs TMDB réels,
  sans superlatif.
- **Isolation CUC Sign** : seules les tables `site_*` sont écrites. Aucune
  table CUC Sign (`formations`, `profiles`, `locations`) n'est touchée.
- **Zéro invention** : aucun crédit n'est créé sans source vérifiable.
- **Zéro appauvrissement** : le curateur (`credit-curator.mjs`) protège les
  rôles précis (ex. `Cascadeur & Doublure Tomer Sisley`) du plafond éditorial ;
  ils ne sont jamais remplacés par le générique « Cascadeur ».
- **Assainissement du curateur** : `sanitizeRoleText()` applique les mêmes
  règles que le normaliseur (`ADD` → Parkour, `gun-fu` → Combats rapprochés,
  suppression des superlatifs) et déduplique les redondances créées par un
  remplacement (ex. `Combats rapprochés & Combats` → `Combats rapprochés`).
- **Filtre non-cinéma** : clips musicaux, publicités, émissions, cérémonies,
  making-of, jeux vidéo et podcasts sont écartés de la sélection éditoriale.

## Coachs sans IMDb

`Niels Dalery` n'a pas de fiche IMDb identifiable (aucun profil « cascade »
correspondant). Sa résolution est marquée `INTROUVABLE` et aucun crédit n'est
appliqué automatiquement. Pour obtenir des données fiables, renseignez son
`imdbId` dans `scripts/lib/coach-registry.mjs`.

## Cache

Le cache disque est stocké dans `.cache/imdb/` et `.cache/tmdb/` (exclus de
Git). Pour le vider :

```bash
rm -rf .cache/imdb .cache/tmdb
```

Sur Windows (cmd) :

```cmd
rmdir /s /q .cache\imdb
rmdir /s /q .cache\tmdb
```
