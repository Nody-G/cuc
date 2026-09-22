# RÈGLE PERMANENTE : NORMALISATION DES TITRES & MISE EN AVANT DES CRÉDITS

**Un seul normaliseur de titre, `creditTitleKey()`.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

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

- `creditKey()` — `src/app/admin/components/TeamView.tsx` (Cockpit)
- `normalizeTitleKey()` — `src/app/equipe-cascadeurs-pro/[slug]/CoachDetailClient.tsx` (fiche publique)
- `normalizeTitle()` / `titleKey()` — `src/lib/credit-notability.ts` (tri par notoriété)

## 3. Appariement crédit ↔ film

Toujours apparier sur le **titre normalisé** via `parseCredit(c).title` puis
`creditTitleKey(...)`. **Jamais** de `String.includes()` sur la chaîne brute
`"Titre — Rôle"` (faux positifs + échec dès qu'un rôle change).

## 4. Vérification obligatoire après toute modification

Comparer les `notable_credits` d'un coach aux titres de `site_films` avec le
normaliseur, et exiger un taux d'appariement **non nul** avant de considérer la
mise en avant fonctionnelle. Un taux de 0 % signale une régression de
normalisation, pas un manque de données.

Scripts de contrôle réutilisables :

- `node scripts/verify_featured_matching.mjs [coachId]` — taux d'appariement
  crédits ↔ catalogue + détection des mises en avant orphelines. Sort en code 2
  si l'appariement tombe à 0 (régression de normalisation).
- `node scripts/seed_michel_bouis_featured.mjs` — amorce 4 crédits réellement
  présents au catalogue et prouve la résolution de bout en bout (persistance
  `featured_credits` → résolution côté public).

## 5. Une seule liste de crédits dans le Cockpit

Le Cockpit ne doit **jamais** séparer les crédits en « catalogue » et « hors
catalogue » pour l'étoilage. La liste unique **« Tous les crédits »** (dérivée de
`allCredits`, chaque entrée portant `inCatalogue`) est la seule source
d'affichage : elle garantit que l'étoile est disponible sur **tous** les crédits,
y compris ceux qui ne sont pas encore au catalogue. Un crédit absent du catalogue
peut être créé à la volée via « Créer la fiche » (recherche sans résultat →
`upsertFilm` → ajout immédiat du crédit).
