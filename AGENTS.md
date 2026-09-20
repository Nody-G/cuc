<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DOCTRINE ARCHITECTURE & DONNÉES : INTERCONNEXION CUC ↔ CUC SIGN

**Règle Fondamentale Permanente :**
1. **Zéro Texte ni Valeur Orpheline** : Tout ce qui est modifiable dans le Cockpit CUC (sessions, formateurs, disciplines, zones du campus, pages vitrine, formulaires, candidatures) doit être directement persisté dans Supabase (`https://xkbkcsypftvspmkfnrfm.supabase.co`). Aucun contenu critique ne doit dépendre uniquement du `localStorage` ou de constantes locales sans synchronisation base de données.
2. **Interconnexion Bidirectionnelle Maximale** : Dès que c'est utile et pertinent, les tables du site vitrine/cockpit CUC doivent être interconnectées avec les tables de l'application **CUC Sign** (branchée sur la même base de données Supabase) :
   - `site_sessions.cuc_sign_formation_id` ↔ `formations.id` (CUC Sign)
   - `site_team.profile_id` ↔ `profiles.id` (CUC Sign - coachs et directeurs)
   - `site_campus_pois.location_id` ↔ `locations.id` (CUC Sign - lieux et installations d'entraînement)
   - `site_inquiries` (candidatures et leads) ↔ admissions et futurs comptes élèves (`students` / `profiles`)
   - `site_disciplines` ↔ `evaluation_disciplines` (CUC Sign)
3. **Isolation et Sécurité** : Les tables du site vitrine et du cockpit sont strictement préfixées par `site_` et les clés étrangères vers CUC Sign utilisent `ON DELETE SET NULL` pour préserver l'intégrité absolue de CUC Sign.

# DOCTRINE ÉDITORIALE & RÉDACTIONNELLE : ZÉRO "AI SLOP", SOBRIÉTÉ & VÉRITÉ STRICTE

**Règle Permanente Non-Négociable :**
1. **Zéro Invention ni Enflure** : Ne JAMAIS inventer de titres de séquences (ex: fausses scènes d'escaliers ou d'action), de faux rôles de doublures (ex: faire passer une intervention de cascadeur de combat pour une doublure corps exclusive), de distinctions ou de partenariats inexistants.
2. **Ton Factuel et Professionnel** : Bannir tout sensationnalisme et superlatifs creux (*"légendaire"*, *"référence suprême"*, *"gun-fu cinématique"*, *"chutes massives"*, *"dossier pro complet"*, *"élite"*). Utiliser un vocabulaire technique sobre, direct et crédible pour les professionnels du cinéma (ex: *"Combats et cascades physiques"*, *"Câblage en studio"*, *"Cascades de véhicules"*).
3. **Zéro Gadget UI Creux** : Ne pas saturer les interfaces de faux badges marketing (*"HOLLYWOOD ACTION"*, *"PRO STAFF"*, *"WORLDWIDE"*), de points clignotants superflus ou de boutons à rallonge. Rester épuré, élégant et factuel.
4. **Terminologie Parkour & Malik Diouf** : Ne JAMAIS employer l'acronyme *"ADD"* ni l'expression *"Art du Déplacement"* pour Malik Diouf ou les modules d'entraînement. Utiliser exclusivement le terme **Parkour**.

# DOCTRINE VÉRIFICATION D'IDENTITÉ & FILMOGRAPHIE DES COACHS

**Règle Permanente — Toute fiche coach doit être adossée à une identité IMDb vérifiée.**

## 1. Sources de vérité (par ordre d'autorité)
1. **Site officiel du campus** (`https://www.campus-universcascades.com/equipe/`) : nom affiché, rôle officiel, avatar. L'avatar est un indice fort : le nom du fichier (`14-michel.png`) révèle souvent le prénom réel.
2. **IMDb** : identité (`nmXXXXXXX`) et filmographie complète via l'API GraphQL publique.
3. **Site personnel du coach** (ex. `michel-bouis-cascade.fr`) : complément, mais peut être hors ligne — ne jamais en dépendre.

## 2. Méthode de vérification d'identité (obligatoire avant toute écriture)
- Ne JAMAIS se fier au seul nom affiché dans le cockpit : il peut être erroné (cas réel : « Michaël Troude » était en fait **Michel Bouis**).
- Croiser **au minimum 2 sources indépendantes** avant de figer une identité.
- Vérifier que l'`imdbId` correspond bien à la personne : comparer le volume et la nature des crédits (un cascadeur français prolifique ≠ un homonyme).
- Scripts de vérification réutilisables :
  - `node scripts/verify_michel_bouis.mjs` — résolution nominative + comparaison de filmographies + rapport dans `plans/`.
  - `node scripts/extract_michel_bouis_campus.mjs` — extraction du bloc bio/rôle depuis le site campus.
  - `node scripts/dump_michel_bouis_credits.mjs` — export JSON structuré des crédits IMDb.

## 3. Pipeline canonique du scraper IMDb
```
npm run coaches:scrape:imdb   # collecte brute via l'API GraphQL publique
npm run coaches:curate        # curation (dédoublonnage, tri par notoriété)
npm run coaches:apply         # écrit le fichier de revue
npm run coaches:sync          # synchronise vers Supabase
```
- Client IMDb : `scripts/lib/imdb-client.mjs` (cache disque `.cache/imdb/`, rate-limit 20 req/10 s, en-têtes navigateur obligatoires).
- Registre canonique des 12 coachs : `scripts/lib/coach-registry.mjs` — **seule source de vérité** pour `id`, `name`, `imdbId`, `nameVariants`, `discipline`.
- Curation : `scripts/lib/credit-curator.mjs`.
- Doctrine : **toujours produire un fichier de revue dans `plans/` avant de synchroniser** en base.

## 4. Propagation d'une correction d'identité (checklist)
Lorsqu'une identité est corrigée, mettre à jour **dans cet ordre** :
1. `scripts/lib/coach-registry.mjs` (registre canonique)
2. `src/data/team.ts` (fiche publique : `id`, `name`, `role`, `title`, `specialties`, bio, `notableCredits`, `imdb`, `externalUrl`, `metadata.film_roles`)
3. `src/data/filmography.ts` (`cuc_team_involved` + `cuc_team_roles`)
4. `scripts/seed_team_film_links.mjs` et autres scripts de seed
5. **Supabase** : `site_team` (ligne renommée), `site_films.cuc_team_involved` + `metadata.cuc_team_roles`, `site_settings` clé `team` (miroir)
6. Marquer les scripts historiques obsolètes d'un en-tête d'avertissement plutôt que de les supprimer (traçabilité).

## 5. Règle de nommage des slugs
Le slug (`id`) doit refléter l'**identité réelle** (`michel-bouis`), jamais l'identité erronée. Un slug erroné se propage dans les URLs publiques, les clés étrangères et les métadonnées.

# DOCTRINE VÉRIFICATION D'IDENTITÉ & FILMOGRAPHIE DES COACHS

**Règle Permanente — Toute fiche coach doit être adossée à une identité IMDb vérifiée.**

## 1. Sources de vérité (par ordre d'autorité)
1. **Site officiel du campus** (`https://www.campus-universcascades.com/equipe/`) : nom affiché, rôle officiel, avatar. L'avatar est un indice fort : le nom du fichier (`14-michel.png`) révèle souvent le prénom réel.
2. **IMDb** : identité (`nmXXXXXXX`) et filmographie complète via l'API GraphQL publique.
3. **Site personnel du coach** (ex. `michel-bouis-cascade.fr`) : complément, mais peut être hors ligne — ne jamais en dépendre.

## 2. Méthode de vérification d'identité (obligatoire avant toute écriture)
- Ne JAMAIS se fier au seul nom affiché dans le cockpit : il peut être erroné (cas réel : « Michaël Troude » était en fait **Michel Bouis**).
- Croiser **au minimum 2 sources indépendantes** avant de figer une identité.
- Vérifier que l'`imdbId` correspond bien à la personne : comparer le volume et la nature des crédits (un cascadeur français prolifique ≠ un homonyme).
- Scripts de vérification réutilisables :
  - `node scripts/verify_michel_bouis.mjs` — résolution nominative + comparaison de filmographies + rapport dans `plans/`.
  - `node scripts/extract_michel_bouis_campus.mjs` — extraction du bloc bio/rôle depuis le site campus.
  - `node scripts/dump_michel_bouis_credits.mjs` — export JSON structuré des crédits IMDb.

## 3. Pipeline canonique du scraper IMDb
```
npm run coaches:scrape:imdb   # collecte brute via l'API GraphQL publique
npm run coaches:curate        # curation (dédoublonnage, tri par notoriété)
npm run coaches:apply         # écrit le fichier de revue
npm run coaches:sync          # synchronise vers Supabase
```
- Client IMDb : `scripts/lib/imdb-client.mjs` (cache disque `.cache/imdb/`, rate-limit 20 req/10 s, en-têtes navigateur obligatoires).
- Registre canonique des 12 coachs : `scripts/lib/coach-registry.mjs` — **seule source de vérité** pour `id`, `name`, `imdbId`, `nameVariants`, `discipline`.
- Curation : `scripts/lib/credit-curator.mjs`.
- Doctrine : **toujours produire un fichier de revue dans `plans/` avant de synchroniser** en base.

## 4. Propagation d'une correction d'identité (checklist)
Lorsqu'une identité est corrigée, mettre à jour **dans cet ordre** :
1. `scripts/lib/coach-registry.mjs` (registre canonique)
2. `src/data/team.ts` (fiche publique : `id`, `name`, `role`, `title`, `specialties`, bio, `notableCredits`, `imdb`, `externalUrl`, `metadata.film_roles`)
3. `src/data/filmography.ts` (`cuc_team_involved` + `cuc_team_roles`)
4. `scripts/seed_team_film_links.mjs` et autres scripts de seed
5. **Supabase** : `site_team` (ligne renommée), `site_films.cuc_team_involved` + `metadata.cuc_team_roles`, `site_settings` clé `team` (miroir)
6. Marquer les scripts historiques obsolètes d'un en-tête d'avertissement plutôt que de les supprimer (traçabilité).

## 5. Règle de nommage des slugs
Le slug (`id`) doit refléter l'**identité réelle** (`michel-bouis`), jamais l'identité erronée. Un slug erroné se propage dans les URLs publiques, les clés étrangères et les métadonnées.

# DOCTRINE NORMALISATION DES TITRES & MISE EN AVANT DES CRÉDITS

**Règle Permanente — Un seul normaliseur de titre, `creditTitleKey()`.**

## 1. Le piège structurel (bug réel corrigé)
Les crédits issus d'IMDb sont stockés avec leur **année** dans le titre :
`"Lupin (2021) — Cascadeur"`. Or `site_films.title` ne contient que le titre
**nu** : `"Lupin"`. Toute comparaison qui ne retire pas le suffixe `(YYYY)`
échoue **systématiquement** — cas réel : Michel Bouis, **0/44 crédits appariés**,
mise en avant totalement inopérante.

## 2. Source unique de vérité
`src/lib/credit-title.ts` → `creditTitleKey(title)` applique, dans l'ordre :
1. Retrait du suffixe d'année finale `(2021)` ou `(2021-2023)`.
2. Suppression des accents (NFD + diacritiques).
3. Minuscules.
4. Ponctuation → espace.
5. Compactage des espaces.

**Ne JAMAIS réimplémenter une clé de titre localement.** Les trois points
d'appel doivent déléguer à ce helper :
- `creditKey()` — [`TeamView.tsx`](src/app/admin/components/TeamView.tsx) (Cockpit)
- `normalizeTitleKey()` — [`CoachDetailClient.tsx`](src/app/equipe-cascadeurs-pro/[slug]/CoachDetailClient.tsx) (fiche publique)
- `normalizeTitle()` / `titleKey()` — [`credit-notability.ts`](src/lib/credit-notability.ts) (tri par notoriété)

## 3. Appariement crédit ↔ film
Toujours apparier sur le **titre normalisé** via `parseCredit(c).title` puis
`creditTitleKey(...)`. **Jamais** de `String.includes()` sur la chaîne brute
`"Titre — Rôle"` (faux positifs + échec dès qu'un rôle change).

## 4. Vérification obligatoire après toute modification
Comparer les `notable_credits` d'un coach aux titres de `site_films` avec le
normaliseur, et exiger un taux d'appariement **non nul** avant de considérer la
mise en avant fonctionnelle. Un taux de 0 % signale une régression de
normalisation, pas un manque de données.

