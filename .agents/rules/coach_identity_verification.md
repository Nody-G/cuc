# RÈGLE PERMANENTE : VÉRIFICATION D'IDENTITÉ & FILMOGRAPHIE DES COACHS

**Toute fiche coach doit être adossée à une identité IMDb vérifiée.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

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
