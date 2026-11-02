# RÈGLE PERMANENTE : NORMALISATION DES TITRES & MISE EN AVANT DES CRÉDITS

**Un seul normaliseur de titre, `creditTitleKey()`, et une seule séparation titre/rôle, `' — '` (`parseCredit`).**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Le piège structurel (bugs réels corrigés)

1. **Suffixe d'année `(YYYY)`** : Les crédits issus d'IMDb sont stockés avec leur **année** dans le titre :
   `"Lupin (2021) — Cascadeur"`. Or `site_films.title` ne contient que le titre
   **nu** : `"Lupin"`. Toute comparaison qui ne retire pas le suffixe `(YYYY)`
   échoue **systématiquement** — cas réel : Michel Bouis, **0/44 crédits appariés**,
   mise en avant totalement inopérante.
2. **Séparateur Titre / Rôle (`' — '`)** : Un crédit est formaté `"Titre (Année) — Rôle"` avec un **tiret cadratin entouré d'espaces (`' — '`)**. Ne **JAMAIS** découper un crédit avec une expression régulière incluant le trait d'union simple `-` (`/\s+[—–-]\s+/`), car cela tronque les titres composés (ex. *Les Profs 3 - Retour vers le passé*, *Fantômas - Le nouveau monde*, *Mission: Impossible - Fallout*, *Shaârghot - Black Wave*) et brise l'appariement avec `site_films`. Toujours utiliser `parseCredit(raw)` (`src/types/index.ts`) ou découper sur `' — '`.

## 2. Source unique de vérité

`src/lib/credit-title.ts` → `creditTitleKey(title)` applique, dans l'ordre :

1. Retrait du suffixe d'année finale `(2021)` ou `(2021-2023)`.
2. Suppression des accents (NFD + diacritiques).
3. Minuscules.
4. Ponctuation → espace.
5. Compactage des espaces.

**Ne JAMAIS réimplémenter une clé de titre localement.** Les trois points
d'appel doivent déléguer à ce helper :

- `creditKey()` — `src/app/admin/components/TeamView.tsx` (Cockpit)
- `normalizeTitleKey()` — `src/lib/coach-films.ts` (fiche & carte publiques)
- `normalizeTitle()` / `titleKey()` — `src/lib/credit-notability.ts` (tri par notoriété)

## 3. Appariement crédit ↔ film

Toujours apparier sur le **titre normalisé** via `parseCredit(c).title` puis
`creditTitleKey(...)`, en plus des liens explicites (`film.cuc_team_involved.includes(member.id)`, `film.cuc_team_roles[member.id]` et `member.film_ids.includes(film.id)`). **Jamais** de `String.includes()` sur la chaîne brute `"Titre — Rôle"`.

## 4. Vérification obligatoire après toute modification

Comparer les `notable_credits` des 20 coachs aux titres de `site_films` avec `findRelatedFilms()`, et exiger que **100 % des crédits de chaque coach** trouvent leur fiche dans `site_films`.

Scripts de contrôle réutilisables :

- `node scripts/verify_featured_matching.mjs [coachId]` — taux d'appariement
  crédits ↔ catalogue + détection des mises en avant orphelines. Sort en code 2
  si l'appariement tombe à 0 (régression de normalisation).
- `node scripts/sync_imdb_catalog_and_doublures.mjs` — garantit que 100 % des crédits IMDb des 20 coachs possèdent leur fiche film dans `site_films` et `src/data/filmography.ts`.

## 5. Une seule liste de crédits dans le Cockpit

Le Cockpit ne doit **jamais** séparer les crédits en « catalogue » et « hors
catalogue » pour l'étoilage. La liste unique **« Tous les crédits »** (dérivée de
`allCredits`, chaque entrée portant `inCatalogue`) est la seule source
d'affichage : elle garantit que l'étoile est disponible sur **tous** les crédits,
y compris ceux qui ne sont pas encore au catalogue. Un crédit absent du catalogue
peut être créé à la volée via « Créer la fiche » (recherche sans résultat →
`upsertFilm` → ajout immédiat du crédit).
