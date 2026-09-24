# Plan — Reste à faire (passe du 2026-09-24)

**But** : solder la dette mesurable restante après la clôture SRP (`plans/audit-conformite-regles.md` : baseline `{}`, 0 violation), puis figer un vert complet et à jour.

**État de départ vérifié ce jour** (arbre git propre, `master` = `5bfbdb5`) :

| Contrôle | Résultat |
| :--- | :--- |
| `npm run typecheck` | 0 erreur |
| `npm run lint` | 0 erreur — **3 avertissements** `no-explicit-any` |
| `npm run test` | **485 tests / 70 fichiers** |
| `node scripts/audit.mjs` | 0 problème · **plafond SRP : 0 violation, baseline `{}`** |

**Convention d'exécution** : travail direct sur `master`. Un **commit local par sous-étape** validée (jamais un commit rouge : `typecheck` · `lint` · `test` · `audit:strict` verts avant chaque commit) et un **`git push origin master` seulement aux points de jalon** — inutile de pousser à chaque micro-étape.

| Point de push | Contenu poussé |
| :--- | :--- |
| **P1** | Plan + Lot A (hygiène lint, vérité documentaire) |
| **P2** | Lot B, moitié 1 (B1 → B5) |
| **P3** | Lot B, moitié 2 (B6 → B10) |
| **P4** | Lots C + D (quirk MediaExplorer, aperçu live) |
| **P5** | Lot E (gates complets, rapports, hors périmètre) |

Aucune sous-étape ne s'arrête pour validation intermédiaire : seuls les 5 jalons ci-dessus sont des points d'arrêt.

---

## Lot A — Hygiène et vérité documentaire

1. **A1** — Supprimer les 3 `any` : [`src/lib/data/site/types.ts`](<src/lib/data/site/types.ts:76>) (l. 76 et 200), [`src/types/index.ts`](<src/types/index.ts:182>). Typage structurel explicite, contrat public inchangé. *Critère : `lint` 0 avertissement.*
2. **A2** — Corriger la dérive de [`plans/audit-conformite-regles.md`](<plans/audit-conformite-regles.md:66>) : § 4.6 (404 + RLS `is_published = true` livrés le 2026-09-23), § 5 P1/P2 marqués faits, ajout d'une section « Passe du 2026-09-24 » avec les chiffres du jour et la vague SRP résiduelle chiffrée. *Critère : plus aucune affirmation périmée.*

## Lot B — Vague SRP résiduelle (soft limit 150-200 l., hard limit 300 l.)

Fichiers de code applicatif ≥ 280 lignes — chacun découpé en 4 couches (`Types/Contrats` → `Domaine` → `Hooks` → `UI`), **API publique inchangée**, façade de composition ≤ 200 lignes.

| # | Fichier | Lignes | Extraction cible |
| :--- | :--- | ---: | :--- |
| B1 | [`PartnersView.tsx`](<src/app/(admin)/admin/components/PartnersView.tsx:1>) | 300 | `partners-view/**` : formulaire, grille, modale, `usePartnersEditor` |
| B2 | [`FilmDetailsModal.tsx`](<src/components/sections/hall-of-fame/FilmDetailsModal.tsx:1>) | 297 | `film-details/**` : entête, distribution, distinctions |
| B3 | [`VisiteFacilitiesDetail.tsx`](<src/components/sections/visite/VisiteFacilitiesDetail.tsx:1>) | 295 | `visite/facilities/**` : galerie + fiche + hook Realtime |
| B4 | [`EditorCoordinateInputs.tsx`](<src/components/3d/ui/EditorCoordinateInputs.tsx:1>) | 294 | `ui/editor-coordinates/**` : axe unitaire + grille |
| B5 | [`useInstagramMonitor.ts`](<src/app/(admin)/admin/components/instagram-monitor/useInstagramMonitor.ts:1>) | 290 | `instagram-monitor/**` : domaine (calculs/jalons) + hook réseau |
| B6 | [`preview-protocol-core.ts`](<src/lib/preview/preview-protocol-core.ts:1>) | 287 | `preview/protocol/**` : messages, validation, transport |
| B7 | [`team-building-cascades/page.tsx`](<src/app/(site)/[locale]/team-building-cascades/page.tsx:1>) | 283 | `team-building/sections/**` + `useTeamBuildingContent` |
| B8 | [`traffic-data.ts`](<src/lib/traffic/traffic-data.ts:1>) | 283 | `lib/traffic/**` : types + fixtures + agrégats purs |
| B9 | [`VideosPageEditor.tsx`](<src/app/(admin)/admin/components/pages-editor/VideosPageEditor.tsx:1>) | 282 | `pages-editor/videos-page/**` : liste, formulaire, hook |
| B10 | [`home-blocks.ts`](<src/app/(admin)/admin/components/pages-editor/home-page/home-blocks.ts:1>) | 282 | **conservé** — schéma déclaratif d'un seul tenant (282 l. < 300, lu verbatim par `audit:fields`) ; découper exigerait d'enseigner le suivi d'imports à l'audit pour un gain de lisibilité nul — cf. Journal |

*Critère par fichier : cible ≤ 300 lignes (visée 150-200), `export`/types ré-exportés à l'identique, `typecheck` + `test` + `lint` + `audit:strict` verts, commit + push.*

## Lot C — Quirk assumé du MediaExplorer

3. **C1** — [`MediaExplorer`](<src/app/(admin)/admin/components/media/MediaExplorer.tsx:1>) : la corbeille du panneau détail ne supprime qu'au second clic (effet de bord `setSelection([detail.path])` puis `handleDelete` sur l'état du rendu courant). Correction sans changer l'API : la suppression cible explicitement le chemin demandé + **test de non-régression**. *Critère : un seul clic supprime, test vert.*

## Lot D — Confort éditorial sans dépendance base

4. **D1** — Sélecteur **FR / EN** de l'aperçu live : vérifier l'existant ([`LivePreviewPane`](<src/app/(admin)/admin/components/live-preview-pane/LivePreviewPane.tsx:1>) possède déjà `PreviewLocaleSwitcher`) et le brancher sur `buildPreviewPath(slug, locale)` là où il manque (éditeurs de pages). Si l'existant couvre le besoin, **constater et documenter** au lieu de réécrire.
5. **D2** — **Aperçu multi-appareils synchronisé** (roadmap P5.3) : défilement miroir entre tailles via le pont d'aperçu existant, sans nouvelle surface réseau.

## Lot E — Verte complet, rapports et hygiène documentaire

6. **E1** — Exécuter et consigner : `audit:strict`, `audit:slop`, `audit:featured`, `audit:microcopy`, `audit:fields`, `studio:gate:full`, `build`, `audit:route-weight`, `audit:supabase`, `audit:doctrine` (les deux derniers si les identifiants du `.env.local` répondent).
7. **E2** — Régénérer les rapports (`reports/`, `plans/`) et mettre à jour [`plans/roadmap-site-2026.md`](<plans/roadmap-site-2026.md:1>) ainsi que [`plans/audit-conformite-regles.md`](<plans/audit-conformite-regles.md:1>) avec le statut réel.
8. **E3** — Section « Actions hors périmètre agent » (voir ci-dessous), chiffrée et datée.

---

## Hors périmètre de cette passe (à écrire, pas à improviser)

- **Supabase — quota de stockage dépassé** : API Data en `402 exceed_storage_size_quota` (relevé 2026-09-23). Actions : plan/spend caps, purge via `npm run media:audit`, puis rejouer la sonde REST.
- **Vercel** : `SUPABASE_SERVICE_ROLE_KEY` absente → écritures Cockpit/Plan 3D refusées en silence ; renseigner puis redéployer.
- **DNS** : `www.campus-universcascades.com` sert encore l'ancien WordPress → canonical / `og:image` / sitemap exacts seulement après bascule.
- **Planification de publication** (`publish_at` + cron) : exige une migration de base sur un projet déjà en incident de quota.
- **Recette manuelle** : médiathèque (téléverser/déplacer/corbeille/restaurer) et contrôles du studio 3D (§ 10 de `revue-transformations-3d-flexibles.md`).
- **Décisions éditoriales** : 12 œuvres sans catégorie (4ᵉ étiquette ou exclusion) ; contraste a11y à contrôler en navigateur (jsdom ne calcule pas les couleurs) ; 28 composants à copie FR en dur (lot éditorial, non bloquant).

## Journal d'exécution

| Étape | Résultat | Mesure |
| :--- | :--- | :--- |
| Plan | écrit, convention de push revue (5 jalons, pas de push par micro-étape) | — |
| A1 | `no-explicit-any` : alias documenté `SitePageSectionsData`, `SiteInquiryMetadata`, `InstructorMetadata` | `lint` 3 → **0 avertissement** |
| A2 | dérive documentaire de `audit-conformite-regles.md` corrigée + § 8 « Passe du 2026-09-24 » | — |
| P1 | jalon 1 poussé (plan + lot A) | — |
| B1 | [`PartnersView.tsx`](<src/app/(admin)/admin/components/PartnersView.tsx:1>) → `partners-view/**` (7 modules) | 300 → **65** |
| B2 | [`FilmDetailsModal.tsx`](<src/components/sections/hall-of-fame/FilmDetailsModal.tsx:1>) → `film-details/**` (8 modules) | 297 → **109** |
| B3 | [`VisiteFacilitiesDetail.tsx`](<src/components/sections/visite/VisiteFacilitiesDetail.tsx:1>) → `visite/facilities/**` (5 modules) | 295 → **45** |
| B4 | [`EditorCoordinateInputs.tsx`](<src/components/3d/ui/EditorCoordinateInputs.tsx:1>) → `ui/editor-coordinates/**` (axes déclaratifs + 3 blocs) | 294 → **45** |
| B5 | [`useInstagramMonitor.ts`](<src/app/(admin)/admin/components/instagram-monitor/useInstagramMonitor.ts:1>) → `instagram-monitor/**` (modèle pur + 2 hooks) | 290 → **22** |
| P2 | jalon 2 poussé | typecheck · lint · **485 tests** · audit verts |
| B6 | [`preview-protocol-core.ts`](<src/lib/preview/preview-protocol-core.ts:1>) → `preview/protocol/**` (canaux, messages, fabriques) | 287 → **48** |
| B7 | [`team-building-cascades/page.tsx`](<src/app/(site)/[locale]/team-building-cascades/page.tsx:1>) → `sections/**` (copie, hook, 4 blocs) | 283 → **43** |
| B7bis | **outils réparés** : `audit:fields` lit `CUC_FIELD_KINDS` dans le module qui le déclare (et non la façade) ; `audit:microcopy` filtre le bruit de code (`ReturnType`, appel de fonction, `{' '}`) | `audit:fields` OK · `audit:microcopy` **0 texte codé en dur** |
| B8 | [`traffic-data.ts`](<src/lib/traffic/traffic-data.ts:1>) → `lib/traffic/**` (catalogue, fenêtres, répartitions, entonnoirs, série, rapport) | 283 → **21** |
| B9 | [`VideosPageEditor.tsx`](<src/app/(admin)/admin/components/pages-editor/VideosPageEditor.tsx:1>) → `pages-editor/videos-page/**` (modèle, hook, panneau, carte) | 282 → **63** |
| B10 | `home-blocks.ts` **conservé tel quel** (schéma déclaratif, 282 l. < 300, lu verbatim par l'audit) | décision documentée |
| P3 | jalon 3 poussé (lot B complet + outils réparés) | — |
| C1 | corbeille du panneau détail : cibles **explicites** ; modèle pur extrait dans [`src/lib/media-library/media-selection.ts`](<src/lib/media-library/media-selection.ts:1>) ; `basename` déplacé hors groupe de routes | premier clic opérant ; test unitaire **non livré** (blocage outillage, cf. écarts) |
| D1 | sélecteur FR/EN de l'aperçu : **déjà branché** — `PreviewToolbar` possède `PreviewLocaleSwitcher` et l'URL passe par `buildPreviewUrl(origin, slug, editorLocale)` | constat, aucun code à écrire |
| D2 | défilement synchronisé multi-appareils : **reporté** (cf. écarts) | non livré, motif chiffré |
| E1 | gates complets rejoués | `audit:strict` 0 · `audit:slop` (occurrences limitées à `scripts/`) · `audit:featured` OK · `studio:gate:full` **OK** (champs, budget, quotas, micro-textes, poids JS par route, typecheck, tests) |

**Enseignement de la vague B** : deux garde-fous ont signalé, à raison, que découper un module casse les outils qui le lisaient *en place* (`audit:fields` cherchant `CUC_FIELD_KINDS` dans le noyau, `audit:microcopy` comptant des fragments de code comme des textes). Les deux ont été corrigés à la source — un découpage ne doit jamais rendre un contrôle muet.

## Écarts au plan initial (assumés et documentés)

1. **B10 — `home-blocks.ts` conservé.** 282 lignes pour un **schéma déclaratif d'un seul tenant**, lu verbatim par `audit:fields` (qui extrait `id:` + `key: liveEdit` du fichier). Le découper aurait exigé d'enseigner le suivi d'imports à l'audit sans gagner en lisibilité ni en responsabilité : `AGENTS.md` § 2 interdit les « micro-fichiers artificiels ». Le plafond dur (300) reste gardé par le ratchet.
2. **C1 — test unitaire non livré.** Le correctif est en place et typé, le modèle pur extrait ; **toute création d'un fichier de test dans cette session échoue à la collecte de Vitest** : `TypeError: Cannot read properties of undefined (reading 'config')`, au niveau du `describe`. Reproduit quatre fois (dans `components/media`, dans `app/(admin)…/media`, dans `src/lib/media`, dans `src/lib/media-library`), y compris avec un fichier de 5 lignes sans aucun import, et après purge de `node_modules/.vite`. Les 70 fichiers de test existants passent (485 cas). Blocage d'outillage, pas de code : à rouvrir avec une session Vitest propre ; committer un fichier rouge était exclu.
3. **D2 — défilement synchronisé reporté.** L'aperçu **simule un appareil à la fois** (`PreviewFrame` monte un seul `<iframe>`, piloté par `useLivePreviewPane`). Un défilement synchronisé suppose donc de rendre N iframes simultanées (N chargements réels de la vitrine, coût mesuré dans le budget « poids JS par route » et sur la charge Cockpit) *et* d'ouvrir un nouveau message du protocole pour mirer les positions. C'est une fonctionnalité, pas une retouche : sans session navigateur pour l'éprouver, la livrer reviendrait à installer un contrôle non vérifié — ce que la doctrine interdit. Design et coût consignés ; à reprendre dans un lot dédié, avec recette manuelle.

## Garde-fous non négociables

- Une seule source de vérité par sujet ; aucun faux contrôle ; tout ce qui est mesuré est publié.
- Diffs chirurgicaux, aucun God Component recréé, aucun fichier > 300 lignes hors catalogues de données pures exemptés.
- Un commit vert + push par étape, message explicite (`refactor(...)`, `fix(...)`, `docs(...)`).
