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
   - `site_disciplines` ↔ **aucune table CUC Sign** : `evaluation_disciplines` est une table d'**instance** (`session_id NOT NULL` → `evaluation_sessions.id`, `ON DELETE CASCADE`) portant 4 étiquettes courtes, alors que `site_disciplines` est un **référentiel éditorial** de 10 entrées spécialisées. Aucun appariement 1:1 n'existe et CUC Sign ne possède **aucune table de référentiel de disciplines**. Ne JAMAIS créer de FK ici — un lien faux serait pire qu'aucun lien. Cf. `plans/revue-interconnexion-disciplines.md`.
3. **Isolation et Sécurité** : Les tables du site vitrine et du cockpit sont strictement préfixées par `site_` et les clés étrangères vers CUC Sign utilisent `ON DELETE SET NULL` pour préserver l'intégrité absolue de CUC Sign.
4. **Un lien FAUX est pire qu'aucun lien** : Avant de créer une clé étrangère, prouver que la cardinalité et la granularité des deux tables sont compatibles. Une FK remplie de correspondances arbitraires propage de la fausse donnée dans toute l'application — c'est plus grave qu'une FK NULL.
5. **Publication réelle** : `site_pages.is_published` est écrit par le Cockpit et **respecté**
   en quatre points — sitemap ([`sitemap.ts`](src/app/sitemap.ts:9)), **rendu**
   ([`UnpublishedPageGate`](src/components/i18n/UnpublishedPageGate.tsx:1) branché dans
   [`SiteDataProvider`](src/components/i18n/SiteDataProvider.tsx:49) : le HTML public ne
   contient jamais un contenu non publié), **moteurs** (`robots: noindex` posé par
   [`buildRouteMetadata()`](src/lib/i18n/route-metadata.ts:24), source unique des métadonnées
   des 14 routes) et **aperçu** (l'iframe du Cockpit, `?cuc-preview=1`, neutralise la garde
   pour continuer à éditer un brouillon). Reste à faire, avec les deux voies chiffrées :
   le **statut HTTP 404** —
   [`plans/revue-diffusion-brouillons.md`](plans/revue-diffusion-brouillons.md:1).
6. **Panne de lecture** : une lecture Supabase en échec sert la **copie certifiée** du code
   (`DEFAULT_PAGE_CONTENTS`, `DEFAULT_NAVIGATION`…) — jamais une page morte. C'est déjà en
   place dans [`getLocalizedPageContent()`](src/lib/i18n/server.ts:93).

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

# DOCTRINE ÉDITION BILINGUE DU COCKPIT (FR → EN)

**Règle Permanente — Une seule fusion, un seul diff, jamais de vide publié.**

## 1. Source unique de vérité
[`localized-merge.ts`](src/lib/i18n/localized-merge.ts:1) porte à la fois la
**fusion** FR + overlay et la **production** de l'overlay à écrire. Le serveur
([`server.ts`](src/lib/i18n/server.ts:1)), le client
([`usePageDynamicContent.ts`](src/lib/hooks/usePageDynamicContent.ts:1)) et
l'éditeur bilingue du Cockpit
([`useEntityTranslation.ts`](src/lib/hooks/useEntityTranslation.ts:1)) l'importent.
**Ne JAMAIS réimplémenter une fusion locale** : un `hero` fusionné par simple
spread laissait une valeur anglaise vide effacer le français.

## 2. Invariants non négociables
1. **Aucune valeur vide persistée** : vider un champ anglais le ramène au
   français, il n'est jamais publié vide.
2. **Un tableau s'écrit en bloc** : complet ou pas du tout (même longueur que le
   français exigée). Ses clés techniques — ancres `id`, images, liens, ordres —
   sont **reprises du français**, jamais traduites.
3. **Aucune structure inventée** : `layout_sections` (libellés d'administration),
   `og_image`, `slug`, identité et états ne figurent jamais dans un payload.
4. **Divergence de structure = aucune écriture** : si la liste française a changé,
   le tableau anglais n'est pas écrit (rien plutôt qu'un tableau faux) et le
   Cockpit signale le désalignement.

## 3. Édition en place dans le Cockpit
La bascule `FR | EN` de
[`PagesEditorView.tsx`](src/app/(admin)/admin/components/PagesEditorView.tsx:1)
édite la traduction dans le **même formulaire** : les sous-éditeurs ignorent la
langue, ils reçoivent le contenu localisé (`hydrateLocalized`) et un setter.
L'aperçu live charge la locale active (`/en/<slug>`), l'onglet « Mise en page »
est verrouillé en EN, et les médias ne se modifient qu'en français.

## 4. Vérification obligatoire après toute modification
- `npx vitest run src/lib/i18n/localized-merge.test.ts` — invariants de fusion, de
  diff, de couverture et d'exclusion de `layout_sections`.
- `node scripts/verify_page_translation_invariants.mjs` — contrôle en base des
  pages : aucune valeur vide, aucune racine verrouillée, tableaux alignés et items
  complets. Produit `plans/revue-edition-en-pages.md` et sort en code 2 en cas de
  régression.
- `node scripts/audit_i18n_completeness.mjs` — couverture FR → EN feuille par
  feuille (référence historique du taux de couverture).

# DOCTRINE ÉDITION BILINGUE DU COCKPIT (FR → EN)

**Règle Permanente — Une seule fusion, un seul diff, jamais de vide publié.**

## 1. Source unique de vérité
[`localized-merge.ts`](src/lib/i18n/localized-merge.ts:1) porte à la fois la
**fusion** FR + overlay et la **production** de l'overlay à écrire. Le serveur
([`server.ts`](src/lib/i18n/server.ts:1)), le client
([`usePageDynamicContent.ts`](src/lib/hooks/usePageDynamicContent.ts:1)) et
l'éditeur bilingue du Cockpit
([`useEntityTranslation.ts`](src/lib/hooks/useEntityTranslation.ts:1)) l'importent.
**Ne JAMAIS réimplémenter une fusion locale** : un `hero` fusionné par spread
superficiel laissait une valeur anglaise vide effacer le français.

## 2. Invariants non négociables
1. **Aucune valeur vide persistée** : vider un champ anglais le ramène au
   français, il n'est jamais publié vide.
2. **Un tableau s'écrit en bloc** : complet ou pas du tout (même longueur que le
   français exigée). Ses clés techniques — ancres `id`, images, liens, ordres —
   sont **reprises du français**, jamais traduites.
3. **Aucune structure inventée** : `layout_sections` (libellés d'administration),
   `og_image`, `slug`, identité et états ne figurent jamais dans un payload.
4. **Divergence de structure = aucune écriture** : si la liste française a changé,
   le tableau anglais n'est pas écrit (rien plutôt qu'un tableau faux) et le
   Cockpit signale le désalignement.

## 3. Édition en place dans le Cockpit
La bascule `FR | EN` de [`PagesEditorView.tsx`](src/app/(admin)/admin/components/PagesEditorView.tsx:1)
édite la traduction dans le **même formulaire** : les sous-éditeurs ignorent la
langue, ils reçoivent le contenu localisé (`hydrateLocalized`) et un setter.
L'aperçu live charge la locale active (`/en/<slug>`), l'onglet « Mise en page »
est verrouillé en EN, et les médias ne se modifient qu'en français.

## 4. Vérification obligatoire après toute modification
- `npx vitest run src/lib/i18n/localized-merge.test.ts` — invariants de fusion, de
  diff, de couverture et d'exclusion de `layout_sections`.
- `node scripts/verify_page_translation_invariants.mjs` — contrôle en base des
  15 pages : aucune valeur vide, aucune racine verrouillée, tableaux alignés et
  items complets. Produit `plans/revue-edition-en-pages.md`, sort en code 2 en cas
  de régression.
- `node scripts/audit_i18n_completeness.mjs` — couverture FR → EN feuille par
  feuille (référence historique du taux de couverture).

# DOCTRINE MODE STUDIO : ÉDITION VISUELLE EN PLACE (APERÇU LIVE)

**Règle Permanente — Le brouillon voyage en mémoire ; la base ne voit qu'un enregistrement.**

## 1. Le pont Cockpit ↔ vitrine
- Protocole versionné [`preview-protocol.ts`](src/lib/preview/preview-protocol.ts:1) (v2,
  origine vérifiée des deux côtés, tolérance des bundles hérités encore en cache CDN).
- La page publique embarque `PreviewBridgeClient` (brouillon, survol, sélection) et
  `PreviewEditLayer` (saisie en place) — **strictement inertes hors iframe**, couvert par tests.
- **Aucune écriture en base depuis l'aperçu** : seul le bouton « Enregistrer » persiste,
  via les server actions existantes.

## 2. Marquer un champ éditable
- `data-cuc-field="<chemin>"` + `data-cuc-kind="text|textarea|image|link|list-item"`.
- Helpers : `cucField('hero.title')`, `itemPath('formules', index, 'title')`
  ([`cuc-field.ts`](src/lib/preview/cuc-field.ts:1)). Un chemin indisponible ne pose
  **aucun attribut** (zéro champ fantôme).
- Listes : `data-cuc-index="<i>"` sur l'item, chemin du **tableau** dans `data-cuc-field`.
- Rendu **data-first** obligatoire : `{donnée || t('clé')}` — le repli traduit reste en place.

## 2bis. Standards de la saisie en place (tenus par le code, vérifiés par tests)
- **Typographie miroir** : la saisie reprend le style **calculé** de l'élément édité
  ([`inline-style.ts`](src/lib/preview/inline-style.ts:1)) — mêmes police, corps, graisse,
  ligne, casse, alignement, couleur. Un titre s'édite en taille de titre, jamais en champ de
  12 px posé sur la page.
- **Clavier complet** : `Entrée` valide (ou `Ctrl/Cmd+Entrée` en multi-lignes), `Échap`
  annule, **`Tab` / `Maj+Tab` enchaînent les champs éditables** dans l'ordre du document
  ([`field-navigation.ts`](src/lib/preview/field-navigation.ts:1)). La valeur en cours est
  validée **avant** le passage, et le flou déclenché par ce passage ne revalide ni ne ferme
  la nouvelle sélection.
- **Étiquette du champ** : la saisie porte `bloc.clé` + la nature (`text`, `textarea`, `link`) —
  on sait toujours ce qu'on modifie.
- **Repli visible** : le texte réellement rendu sert de `placeholder`, et un champ vidé
  l'annonce (« vide → repli traduit affiché »). Vider n'écrit jamais un libellé blanc.
- **Deux modes lisibles** : en inspection le survol est en pointillés (on *désigne* le champ à
  ouvrir dans le formulaire) ; en édition le survol est discret avec curseur de saisie (on
  *écrit*), avec un curseur dédié pour les images et les items de liste.
- **Réversibilité** : `Ctrl+Z` / `Ctrl+Maj+Z` dans le Cockpit, inspecteur de modifications
  ([`draft-diff.ts`](src/lib/preview/draft-diff.ts:1)) avec retour par champ ou global — rien
  n'est écrit en base avant « Enregistrer ».

## 3. Invariants non négociables
- Aucune valeur vide persistée ; aucun item inventé (liste vide → pas d'ajout) ;
  aucune liste rendue complètement vidée ; aucune structure inventée.
- Saisie en place : `input`/`textarea` superposés — **jamais** `contentEditable` sur un
  nœud rendu par React (la réconciliation écraserait le DOM).
- Écriture du brouillon par chemin immuable :
  [`field-path.ts`](src/lib/preview/field-path.ts:1).
- Commandes de liste : moteur pur [`list-command.ts`](src/lib/preview/list-command.ts:1).

## 4. Performance et publication
- Realtime : **un seul WebSocket par client** (`subscribeTable`, canal partagé). La
  navigation, le pied de page, les réseaux, la page, ses traductions, les annonces et les
  films passent par ce canal.
- Aperçu : `?cuc-preview=1` coupe le Realtime et met les effets lourds en veille
  ([`preview-context.ts`](src/lib/preview/preview-context.ts:1)). La vitrine publique n'est
  **jamais** chargée avec ce paramètre.
- Publication : [`revalidateSite`](src/app/(admin)/admin/actions.ts:58) revalide les chemins
  FR **et** `/en/...`, **et** les tags (`site_pages`, `site_translations`, `site_navigation`,
  `site_footer`, `site_social_links`).
- **Filet local du poste de travail** : le brouillon est recopié dans `localStorage`
  ([`draft-storage.ts`](src/lib/preview/draft-storage.ts:1), TTL 7 jours, versionné, effacé
  à l'enregistrement) et proposé à la récupération après un rechargement ; un `beforeunload`
  avertit tant qu'il reste des modifications. La base ne voit **toujours** rien.
- **Concurrence** : `upsertPageContent` refuse une écriture si la page a été modifiée depuis
  son ouverture (tolérance 2 s sur `updated_at`) — deux administrateurs ou deux onglets ne
  s'écrasent jamais en silence, et le brouillon local est conservé pour rejouer la saisie.

## 5. Vérification obligatoire après toute modification
- `npm run audit:fields` — couverture des champs page par page (code 2 si une page n'expose
  aucun champ). Rapport : `plans/revue-couverture-champs-visuels.md`.
- `npm run audit:microcopy` — micro-textes visiteurs classés (annotés / données / traductions /
  codés en dur). Rapport : `plans/revue-micro-textes-visiteurs.md`.
- `npm run audit:budget` — budget performance (canal partagé, zéro requête publique nominale,
  FR + EN, aperçu allégé). Rapport : `plans/revue-budget-performance.md`.
- `npm run studio:gate` / `npm run studio:gate:full` — **gate unique** enchaînant les trois
  audits puis le typecheck et les tests ; un seul verdict, aucune vérification oubliée.
- `npm run test` (protocole, chemins, listes, inertie) + `npm run typecheck` + `npm run build`.

# DOCTRINE MICRO-TEXTES : TOUT LIBELLÉ D'INTERFACE EST ÉDITABLE

**Règle Permanente — Une seule surcharge, fusionnée dans le catalogue ; aucun site d'appel réécrit.**

## 1. Le mécanisme
- Source unique : [`microcopy.ts`](src/lib/i18n/microcopy.ts:1) — aplatissement, fusion,
  nettoyage et table éditable. **Ne jamais réimplémenter** une fusion de catalogue localement.
- Stockage : `site_settings`, clé `microcopy_overrides` →
  `{ fr: { 'home.about.title': '…' }, en: { … } }`.
- Application : [`request.ts`](src/i18n/request.ts:1) fusionne la surcharge dans le catalogue de
  la locale ; **tous** les `t()` (composants serveur ET clients) en bénéficient, sans
  redéploiement et sans toucher la vitrine.
- Édition : onglet « Micro-textes du site » du Cockpit
  ([`MicrocopyView.tsx`](src/app/(admin)/admin/components/MicrocopyView.tsx:1)) — recherche,
  groupes par namespace, FR/EN côte à côte, retour au catalogue par clé.

## 2. Invariants non négociables
1. **Aucune valeur vide publiée** : vider un champ **retire** la surcharge, le catalogue
   redevient la source — jamais de libellé blanc.
2. **Aucune structure inventée** : seules des clés de forme valide sont écrites, une valeur
   reste une chaîne (les tableaux sont hors périmètre : une liste passe par une section).
3. La surcharge **corrige** une clé existante, elle ne fabrique pas de nouvelle traduction.
4. Publication : `saveMicrocopyOverrides` revalide les 15 pages, FR **et** EN, et journalise
   l'action (`settings.microcopy`).

## 3. Vérification obligatoire après toute modification
- `npm run audit:microcopy` — les libellés `t('…')` sont éditables par la surcharge ; la
  catégorie **« codés en dur » doit rester à zéro** (les routes d'image Open Graph, les
  adresses, marques et coordonnées sont hors périmètre, les expressions JSX calculées aussi :
  un faux positif ferait mentir le rapport autant qu'un oubli).
  Rapport : `plans/revue-micro-textes-visiteurs.md`.
- Chrome transverse (`commonChrome`) : fil d'Ariane, nom du campus, accroche, ville, enseignes
  des trois entités — une seule clé par libellé, jamais un littéral dans un composant.
- `npx vitest run src/lib/i18n/microcopy.test.ts` — fusion, nettoyage, invariant du vide,
  alignement FR ↔ EN par clé (jamais par index).
- `npm run studio:gate:full` — verdict unique : champs, budget, micro-textes, TypeScript, tests.

