# RÈGLE PERMANENTE : VÉRIFICATION D'IDENTITÉ & FILMOGRAPHIE DES COACHS

**Toute fiche coach doit être adossée à une identité IMDb vérifiée, et 100 % de ses crédits doivent correspondre à une fiche film dans `site_films`.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Sources de vérité (par ordre d'autorité)

1. **Site officiel du campus** (`https://www.campus-universcascades.com/equipe/`) : nom affiché, rôle officiel, avatar. L'avatar est un indice fort : le nom du fichier (`14-michel.png`) révèle souvent le prénom réel.
2. **IMDb** : identité (`nmXXXXXXX`) et filmographie complète via l'API GraphQL publique (`api.graphql.imdb.com`, aucune clé API requise).
3. **Site personnel du coach** (ex. `michel-bouis-cascade.fr`) : complément, mais peut être hors ligne — ne jamais en dépendre.

## 2. Méthode de vérification d'identité & Règle d'Arrêt en cas de doute

- **Arrêt & Clarification Utilisateur obligatoires** : dès qu'un doute subsiste sur un rôle (ex. réalisateur vs coordinateur des cascades sur *Johnny* `tt37205945`), une identité, une règle de catégorisation ou le périmètre d'affichage public, **s'arrêter et poser la question à l'utilisateur avant d'écrire en base**.
- Ne JAMAIS se fier au seul nom affiché dans le cockpit : il peut être erroné (cas réel : « Michaël Troude » était en fait **Michel Bouis**, et **Niels Dalery** est crédité uniquement sur *Loin du périph (2022)* et jamais sur *Sous la Seine*).
- Croiser **au minimum 2 sources indépendantes** avant de figer une identité.
- Vérifier que l'`imdbId` d'un film pointe bien vers `/title/ttXXXXXXX/` et **jamais** vers une fiche personne `/name/nmXXXXXXX/`.

## 3. Doctrine des Rôles : Unification des « Doublures » en « Cascadeur »

- **Sur le site public et dans les champs principaux (`site_films.metadata.cuc_team_roles`, `site_team.notable_credits`, `site_team.metadata.film_roles`, `src/data/filmography.ts`, `src/data/team.ts`)** :
  - Toute doublure est un cascadeur : **aucun rôle `"Doublure"` ou `"Doublure de [Acteur]"` ne doit figurer comme libellé de rôle public**. Il est systématiquement enregistré et affiché sous **`"Cascadeur"`**.
  - Sur les fiches coachs (`CoachFilmography.tsx`), seuls les filtres **Tous**, **Coordinateur** et **Cascadeur** sont affichés (le filtre séparé `Doublure` est proscrit).
  - **Préservation en métadonnée interne** : le nom du comédien doublé et l'intitulé d'origine sont conservés dans `site_films.metadata.cuc_team_doubled_actors`, `site_films.metadata.cuc_team_roles_detail`, `site_films.doubled_actors` et `site_team.metadata.doubled_actors_by_film`.
  - **Sous-rôles techniques préservés** : `Coordinateur des cascades`, `Assistant coordinateur des cascades`, `Coordinateur de rigging`, `Rigger` et `Cascadeur mécanique` restent distincts.

## 4. Pipeline canonique du scraper IMDb & Complétude du Catalogue (`site_films`)

```
npm run coaches:scrape:imdb   # collecte brute via l'API GraphQL publique
npm run coaches:curate        # curation (dédoublonnage, tri par notoriété)
npm run coaches:apply         # écrit le fichier de revue
npm run coaches:sync          # synchronise vers Supabase
node scripts/sync_imdb_catalog_and_doublures.mjs # synchronise 100 % des films IMDb des 20 coachs + unification Doublures -> Cascadeur
```

- Client IMDb : `scripts/lib/imdb-client.mjs` (supporte le requêtage GraphQL par lots de 20 titres via alias `t0: title(id: "tt...")`).
- Registre canonique des **20 coachs** : `scripts/lib/coach-registry.mjs` + `scripts/coaches_scraped_full_imdb.json`.
- **Invariants d'insertion dans `site_films`** :
  1. Tout crédit présent dans `site_team.notable_credits` doit avoir une fiche correspondante dans `site_films` (et `src/data/filmography.ts`) afin que `findRelatedFilms()` affiche 100 % de la filmographie en cartes posters sur la fiche du coach.
  2. Le champ `category` de `site_films` est strictement limité au vocabulaire `['Film', 'Série', 'Court métrage']` (vérifié par `src/lib/film-category.test.ts`).
  3. Lors d'un `upsert` par lots dans `site_films`, toujours renseigner `created_at` sur les nouvelles lignes et placer `stunt_coordinator` dans `metadata.stunt_coordinator` (pas en colonne racine).

## 5. Propagation d'une correction d'identité ou de filmographie (checklist)

Lorsqu'une identité ou une filmographie est corrigée, mettre à jour **dans cet ordre** :

1. `scripts/lib/coach-registry.mjs` (registre canonique)
2. `src/data/team.ts` (fiche publique : `id`, `name`, `role`, `title`, `specialties`, `bio`, `notableCredits`, `imdb`, `externalUrl`, `metadata.film_roles`)
3. `src/data/filmography.ts` (`cuc_team_involved` + `cuc_team_roles`)
4. **Supabase** : `site_team`, `site_films` (`cuc_team_involved` + `metadata.cuc_team_roles`), `site_settings` clé `team` (miroir)

## 6. Règle de nommage des slugs

Le slug (`id`) doit refléter l'**identité réelle** (`michel-bouis`), jamais l'identité erronée. Un slug erroné se propage dans les URLs publiques, les clés étrangères et les métadonnées.
