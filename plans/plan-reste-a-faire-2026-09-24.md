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
| B10 | [`home-blocks.ts`](<src/app/(admin)/admin/components/pages-editor/home-page/home-blocks.ts:1>) | 282 | `pages-editor/home-page/blocks/**` : schéma par bloc |

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

## Garde-fous non négociables

- Une seule source de vérité par sujet ; aucun faux contrôle ; tout ce qui est mesuré est publié.
- Diffs chirurgicaux, aucun God Component recréé, aucun fichier > 300 lignes hors catalogues de données pures exemptés.
- Un commit vert + push par étape, message explicite (`refactor(...)`, `fix(...)`, `docs(...)`).
