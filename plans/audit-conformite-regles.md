# Audit de conformité aux règles — 2026-09-22

**Périmètre** : application vs `AGENTS.md` (SRP, tailles, protocole) et les 8 règles canoniques de `.agents/rules/`.
**Méthode** : analyse statique (recherches ciblées) + métriques `reports/audit-2026.metrics.json` (générées le 2026-09-21, head `03c81c4`). Les gates `npm run …` n'ont pas été exécutés dans cette passe — commandes en §6.

---

## 1. Verdict par règle

| Règle | Verdict | Preuve principale |
| :--- | :--- | :--- |
| SRP — 4 couches étanches | ✅ écarts résorbés | P0.a : 5 écarts réseau UI migrés (hooks `useRealtimeRefresh` / couche Données) ; `login` documenté (flux auth) |
| SRP — plafond 300 lignes | ✅ dette intégralement résorbée | 54 God Components app découpés (P0.b → P0.g.47) ; **0 fichier restant en baseline** — ratchet au plancher (§7) |
| Protocole agent / diffs chirurgicaux | ✅ | interventions récentes conformes ; typage strict en place |
| Éditorial — zéro AI slop | ✅ | 0 badge/superlatif dans `src` ; arbitrage P2 appliqué : « mythiques » / « iconic » reformulés (FR+EN) |
| Identité coachs (IMDb) | ✅ | registre + pipeline + `audit:featured` opérationnels |
| Normalisation des titres | ✅ | `creditTitleKey()` unique ; 4 consommateurs délèguent ; 0 réimplémentation locale |
| Édition bilingue FR → EN | ✅ | `mergeLocalized` unique (serveur + hooks + actions) ; tests d'invariants présents |
| Mode Studio | ✅ | aucun `contentEditable` rendu ; brouillon localStorage limité à `draft-storage.ts` |
| Micro-textes | ✅ | mécanique unique `microcopy.ts` + fusion dans `request.ts` ; gate disponible |
| Interconnexion / persistance | ✅ | FKs `SET NULL` conformes ; **aucune FK `site_disciplines`** ; ordre 404 → RLS respecté |
| Durabilité | ✅ | roadmap + CI + rapport de revue présents |

---

## 2. Violations SRP — taille (hard limit : 300 lignes)

Constat : `scripts/audit.mjs` affiche le TOP 15 des fichiers les plus volumineux **mais ne sort jamais en erreur** au-delà d'un seuil — la loi des 300 lignes n'est donc gardée par aucun gate (à corriger, §5-P1).

| Fichier | Lignes | Nature | Extraction cible |
| :--- | ---: | :--- | :--- |
| `src/app/(admin)/admin/actions.ts` | 2502 | God Module (server actions) | découper par domaine + façade |
| `src/lib/data/site-service.ts` | 2234 | God Service | modules par entité + façade |
| `src/app/(admin)/admin/components/TeamView.tsx` | 1414 | God Component | liste + formulaire + éditeur de crédits + hook |
| `src/data/filmography.ts` | 1202 | données statiques | hors plafond composant — priorité basse |
| `src/app/(admin)/admin/components/media/MediaExplorer.tsx` | 1057 | God Component | explorateur + grille + panneau détail |
| `src/app/(admin)/admin/CockpitApp.tsx` | 1052 | shell + Realtime + état | shell + hook Realtime + onglets |
| `src/app/(admin)/admin/components/InquiriesView.tsx` | 1012 | God Component | tableau + détail + actions |

Scripts d'outillage > 800 lignes (`audit_full_app.mjs` 1031, `generate_metrics_report.mjs` 956, `generate_audit_report.mjs` 841) : hors plafond composant, non bloquant.

---

## 3. Violations SRP — orchestration réseau dans la couche UI

Le chemin canonique existe (`useRealtimeRefresh`, utilisé par 13 fichiers : `InteractiveCampusMap`, `HomeTournagesSection`, `CoachDetailClient`, `PartenairesGridSection`, `EventsPillarsSection`, `FormationDisciplinesExplorer`, `NavActionsBar`, `FooterDirectContacts`, `MobileStickyCTA`, `FilmDetailsModal`, `CelebrityDoublesGallery`, `VisiteFacilitiesDetail`, page `videos-cascadeur`). Écarts restants à migrer :

| Fichier | Écart | Correctif |
| :--- | :--- | :--- |
| `src/components/sections/films/CucFilmsShowcase.tsx:78` | `createClient()` + `subscribeTable` inline dans le composant | passer par `useRealtimeRefresh(['site_films'], loadFilms)` |
| `src/components/layout/AnnouncementBanner.tsx:38` | idem (`site_announcements` + repli `site_settings`) | hook dédié `useAnnouncement` ou `useRealtimeRefresh` |
| `src/app/(site)/[locale]/equipe-cascadeurs-pro/page.tsx:18` | `createClient` + `subscribeTable` inline dans la page | hook d'orchestration partagé |
| `src/app/(admin)/admin/components/TranslationsView.tsx:4` | client Supabase importé dans la vue (les écritures passent par action ✅) | lecture via hook, écriture via action existante |
| `src/app/(admin)/admin/CockpitApp.tsx:68` | `createClient` + `createSafeChannel` dans le shell (couplé au God Component §2) | extraire `useCockpitRealtime` |
| `src/app/(admin)/admin/login/page.tsx:6` | client direct pour l'auth | acceptable (flux auth) — à documenter |

---

## 4. Points de vigilance (non bloquants)

1. **`animate-pulse`** — la plupart sont fonctionnels (skeletons `CockpitSkeleton`/`MediaExplorer`, statuts Realtime, compteurs de leads). Seul candidat « gadget » : cercles pulsants décoratifs dans `src/app/(admin)/admin/components/CampusZonesView.tsx:133`. **Résolu (P2) : `animate-pulse` retiré ; les `animate-ping` (statut radar, repères de zones) sont fonctionnels et conservés.**
2. **`messages/fr.json:877`** — « séquences d'action mythiques » : adjectif marketing léger, à arbitrer éditorialement. **Résolu (P2) : reformulé sans adjectif — FR « séquences d'action de vos films préférés », EN « action sequences » (suppression d'« iconic »).**
3. **Realtime 90 %** (2 tables non couvertes selon les métriques) — vérifier avec `npm run audit:supabase` / `audit:doctrine`. **Résolu (P2) : `audit:supabase` → Realtime publiées 24/24 (0 manquante), dérives de miroirs 0 ; `audit:doctrine` → 0 violation sur 14 tables.**
4. **localStorage restant = préférences UI uniquement** (`soundFx` son, thème Cockpit, repli groupes/épingles sidebar, récents palette, placements 3D en repli public) — **conforme** : aucun contenu critique n'y vit (le Cockpit écrit dans `site_settings`).
5. **Anciens orphelins (M1 du vieil audit) : résolus** — `TelemetryHUD`, `CareerSimulatorModal`, `TowerPhysicsWidget`, `TimecodeHUD` : 0 occurrence ; `soundFx` est bien utilisé (5 fichiers).
6. **Ordre 404 → RLS : LIVRÉ (2026-09-23).** Le 404 de brouillon est posé **d'abord** (`getPublicPageContent()`, aperçu déplacé sur `/[locale]/preview` et gardé par la session admin, `buildPreviewUrl()` reciblé) **puis** la policy RLS de `site_pages` a été durcie à `is_published = true` (migration appliquée ; sonde Postgres : 0 brouillon visible, 15 pages publiées intactes). Preuves : `plans/revue-diffusion-brouillons.md` § 6 et `plans/revue-rls-site-pages.md`.

---

## 5. Plan de remédiation (ordre protocole : contrats → hooks → UI)

> **Statut au 2026-09-24 : intégralement livré.** P0 → § 7 (P0.a → P0.g.47) ; P1 → § 7 « P1 — Garde-fou SRP » ; P2 → § 7 « P2 — TERMINÉ ». Cette section est conservée comme trace du raisonnement initial, plus comme liste de travail.

**P0 — Structurel (God Components / God Modules)**

1. Découper `src/app/(admin)/admin/actions.ts` par domaine (`pages`, `team`, `films`, `navigation`, `settings`…) dans `src/lib/admin/actions/*.ts`, avec façade ré-exportée — zéro changement d'API.
2. Découper `src/lib/data/site-service.ts` par entité (pages, films, équipe, événements, réglages…), façade d'import inchangée.
3. `TeamView.tsx` → shell + `TeamMemberForm`, `TeamCreditsEditor`, `TeamMembersList` + hook `useTeamEditing` (état + écritures).
4. `CockpitApp.tsx` → shell + `useCockpitRealtime` + onglets extraits.
5. `MediaExplorer.tsx` et `InquiriesView.tsx` → extraction sous-composants + hooks.
6. Migrer les 4 écartes réseau UI (§3) vers `useRealtimeRefresh`/hooks dédiés (`login` documenté à part).

**P1 — Garde-fou SRP**
7. Ajouter à `scripts/audit.mjs` un contrôle de taille : sortie en erreur si un fichier app dépasse 300 lignes (allowlist justifiée : fichiers de données, façade d'extraction en cours) + brancher dans la CI/gate unique.
8. Exécuter les gates complets (§6).

**P2 — Arbitrages**
9. Retirer/justifier les `animate-pulse` décoratifs ; arbitrer « mythiques » dans `fr.json`.
10. Contrôler les 2 gaps Realtime et l'état doctrine en base.

---

## 6. Gates à exécuter (mode Code)

```bash
npm run audit:strict            # liens, ancres, hrefs suspects
node scripts/audit.mjs          # TOP 15 tailles (constat §2)
npm run audit:slop              # chasse aux clichés LLM (doctrine éditoriale)
npm run studio:gate:full        # champs + budget + micro-textes + typecheck + tests
npm run audit:featured          # appariement crédits ↔ catalogue
npm run audit:supabase          # état base : FK, Realtime, tables
npm run audit:doctrine          # doctrine en base (interconnexion)
npm run typecheck && npm run test && npm run build
```

Dernier état connu : 157/157 tests passés, 681/681 clés i18n, 0 erreur sur les 10 familles `auditErrors` (métriques du 2026-09-21).

---

## 7. Remédiation — exécution du 2026-09-22 (statut vérifié)

**P1 — Garde-fou SRP : FAIT.**

- `scripts/audit.mjs` : plafond de 300 lignes encodé en **ratchet** (baseline `scripts/size-baseline.json` ; 53 fichiers en dette à la pose, **49 après les vagues P0.b → P0.f**, « ne peut que rétrécir ») ; catalogues de données pures exemptés (`src/data/**`, `src/lib/data/site/defaults/**`). Nouvelle commande `npm run audit:size:baseline`. **Durci (post-P2) : `--write-size-baseline` n'inscrit plus les exemptés et la baseline a été régénérée (49 entrées suivies) — les entrées périmées d'anciens God Components (TeamView, CockpitApp, MediaExplorer, InquiriesView, actions.ts…) ne peuvent plus autoriser une re-croissance silencieuse.**
- Faux positifs corrigés : routes préfixées `[locale]` et `?query` (136 → 0) ; ids en syntaxe objet (`id: 'x'`) reconnus.
- 9 liens morts réels corrigés (ancres `#dates`, `#certifications`, `#formulaire`, `#viewer`, `#plan-3d-campus`, `#tf1`, `#france2`, `#apply` ; CTA Partenaires reciblé vers la page Formation).
- `audit:strict` : **0 problème** (exit 0), déjà branché dans la CI. `studio:gate` re-vérifié vert après adaptation de l'audit budget à la façade des actions.

**P0.a — Réseau dans la couche UI : FAIT.** `CucFilmsShowcase`, `AnnouncementBanner`, page équipe → `useRealtimeRefresh` ; `TranslationsView` → couche Données `src/lib/data/translations.ts`.

**P0.b — `site-service.ts` : FAIT.** 2253 → façade 27 lignes + `src/lib/data/site/**` (18 modules de 15 à 245 lignes ; data pures exemptées). Codemod `scripts/refactor_site_service.mjs` (OBSOLÈTE conservé, traçabilité).

**P0.c — `actions.ts` : FAIT.** 2765 → façade 33 lignes + `actions/**` (21 modules `'use server'` de 32 à 229 lignes, + `media-internals.ts` pour les helpers non-async). Règle découverte au build : **un fichier `'use server'` refuse les ré-exports** → la façade est un module neutre (la référence d'action est résolue à la source). Build : 93/93 pages.

**P0.d — `TeamView.tsx` : TERMINÉ — sous le plafond.** 1414 → **~160 lignes** (composition pure). Livré en trois vagues vérifiées :

- **Contrats & helpers** : `team-view/team-credits.ts` (`ROLE_OPTIONS`, `buildCreditString`, `extractRoleFromCredit`, types `TeamCreditRow` / `TeamCreditIndexEntry` / `NewFilmDraft` / `TeamFeaturedEntry`).
- **UI du modal** : `TeamMemberIdentityFields`, `TeamCreditAdder`, `TeamFeaturedCatalogue`, `TeamCreditsList`, `TeamCreditsPanel`, `TeamMemberEditorModal` ; **grille** : `TeamMembersGrid` (barre d'outils, cartes, pagination locale).
- **Orchestration** : `useTeamEditing` (fiche en édition, enregistrement optimiste + Server Action, suppression) ; `useCreditModel` (états + dérivations) et `useCreditActions` (écritures crédits, création de fiche film) — chaque module ≤ 300 lignes.
- Élagage automatique des imports morts (codemods `refactor_teamview_modal.mjs`, OBSOLÈTE conservés). **`TeamView` est sorti de la dette baseline** (≤ 300 ✅).

**P0.e — `CockpitApp.tsx` : TERMINÉ — sous le plafond.** 1064 → **~205 lignes** (composition). Livré dans `cockpit/**` :

- `useCockpitData` — états locaux + chargement initial (repli copie certifiée) et dérivations (`totalSessions`, `fullSessions`, `userRole`).
- `useCockpitRealtimeSync` — canal partagé `cockpit:all_changes` (tables `site_*` + `group_memberships` → sync CUC Sign des places).
- `useCockpitShortcuts` — `switchTab` (pushState), Ctrl+K, Ctrl+/, Ctrl+B, Ctrl+Maj+B/H, Alt+1..6, Échap, Popstate.
- `cockpit-nav` — `TabType`, `TAB_ROUTES`, `resolveTabFromPath`, `buildNavSections` (masquage par rôle, jamais par CSS).
- `CockpitTopbar`, `CockpitTabContent` + `CockpitCoreTabs` / `CockpitCmsTabs` (20 onglets répartis, coquille commune).
- `TabType` reste ré-exporté par `CockpitApp` — Dashboard, Palette et Sidebar inchangés. Le ratchet a attrapé 2 fichiers intermédiaires > 300 lignes, redécoupés séance tenante.

**P0.f — `MediaExplorer.tsx` : TERMINÉ — sous le plafond.** 1057 → **~215 lignes** (façade de composition). Livré dans `media/**` :

- **Contrats & présentation** : `media-explorer-shared.ts` (`PAGE_SIZE`, `ExplorerView`, `KIND_ICON`, `KIND_LABEL`), `MediaTile`, `MediaTreeAside`, `MediaToolbar`, `MediaBulkActions`, `MediaDetailPanel`, `MediaBrowser` (dépôt, sous-dossiers, grille/liste, pagination).
- **Orchestration** : `useMediaNavigation` (arborescence, parcours de dossier, recherche globale différée, tri/filtres, ouverture détail) et `useMediaSelection` (multi-sélection + plage Maj, téléversement, création de dossier, déplacement, corbeille, index d'usage paresseux).
- `navigateTo` réinitialise toujours sélection + destination (comportement d'origine restauré par le wrapper de composition) ; **`MediaExplorer` sorti de la dette baseline** (1057 → ≤ 300 ✅).
- Normalisation assumée : le double-clic d'une vignette charge désormais l'index d'usage comme la vue liste (fin du « Vérification de l'usage… » perpétuel), conformément à l'intention documentée du hook.
- Quirk hérité conservé à l'identique (candidat P2) : la corbeille du panneau détail passe par `setSelection([detail.path])` puis `handleDelete` sur l'état du rendu courant — le premier clic ne supprime que si la sélection contenait déjà la fiche.

**P0.f — `InquiriesView.tsx` : TERMINÉ — sous le plafond.** 1012 → **~120 lignes** (façade de composition). Livré dans `inquiries/**` :

- **Domaine** : `templates.ts` (4 modèles de réponse email), `checklist.ts` (parse/serialize du suivi `CUC_CHECKLIST`), `build-csv.ts` (génération CSV + téléchargement navigateur).
- **Orchestration** : `useInquiriesData` (chargement, statut, notes, suppression, session, passerelle CUC Sign), `useInquiryFilters` (recherche, filtre, KPI, rendu progressif), `useInquiryDetail` (fiche ouverte **dérivée de la liste par identifiant** — la double synchronisation `selectedInquiry`/`inquiries` disparaît, toute mutation se répercute dans la modale).
- **UI** : `InquiryStatusBadge`, `InquiriesHeader`, `InquiryListToolbar` (KPI + filtres), `InquiryRow`, `InquiryList`, sections `InquiryChecklistSection` / `InquiryTemplatesSection` / `InquiryNotesSection` / `InquiryCucSignSection`, coquille `InquiryDetailModal`.
- Comportements d'origine conservés : garde-fou CSV vide, toast de réassignation de session, silence du toggle checklist en échec, confirmation avant suppression ; **`InquiriesView` sortie de la dette baseline** (1012 → ≤ 300 ✅).

**Validation de fin de vague P0.f (InquiriesView) :** typecheck OK · 308 tests OK · `lint` 0 erreur · `audit:strict` 0 problème (**baseline 50 → 49 fichiers**) · `build` 93/93 pages · **`InquiriesView` hors dette** (≤ 300).

**Validation de fin de vague P0.f (MediaExplorer) :** typecheck OK · 308 tests OK · `lint` 0 erreur · `audit:strict` 0 problème (**baseline 51 → 50 fichiers**) · `build` 93/93 pages · **`MediaExplorer` hors dette** (≤ 300).

**Validation de fin de vague P0.e :** typecheck OK · 308 tests OK · `lint` 0 erreur · `audit:strict` 0 problème · `studio:gate` OK · `build` 93/93 pages · **`CockpitApp` hors dette** (≤ 300).

**P2 — TERMINÉ.** Pulse décoratif retiré (`CampusZonesView`), « mythiques »/« iconic » reformulés (FR+EN), Realtime vérifiée (`audit:supabase` : 24/24, 0 manquante) et doctrine base 0 violation (`audit:doctrine`, 14 tables). **Validation : 308 tests OK · `lint` 0 erreur · `audit:slop` : occurrences limitées aux garde-fous `scripts/`.**

**P0.g.1 — `PagesEditorView.tsx` : TERMINÉ — sous le plafond.** 1352 → **≤ 300 lignes** (façade stricte). Livré dans `pages-editor/**` (16 modules) :

- **Domaine** : `pages-options.ts` (onglets + sélecteur — déplacé ; `preview-url.test.ts` pointe désormais dessus), `page-draft.ts` (`composePageDraft` : la triple fusion défauts + base est dédupliquée), `focus-field.ts` (focus inverse aperçu → champ).
- **Orchestration** : `useEditorHistory` (undo/redo + raccourcis clavier), `useDraftPersistence` (snapshot local, reprise après crash, alerte de sortie), `usePageEditorDraft` (formulaire FR ↔ overlay EN, diff inspecteur, commits champs/listes), `usePageSaveActions` (enregistrement FR sous verrou `expectedUpdatedAt`, traduction EN, publication, réinitialisation), `useSectionHandlers` (ateliers / formules / stages / chiffres clés).
- **UI** : `PageEditorTopBar`, `EditorTabsBar`, `LayoutTabPanel`, `ContentEditorsSwitch`, `PreviewTabPanel`, `SeoTabPanel`, `RevisionsSection`.
- Comportements conservés : garde-fou traduction EN non enregistrée, brouillons FR/EN distincts (historique remis à zéro), structure réservée au FR, aperçu `quiet` de la vraie page. **`PagesEditorView` sorti de la dette baseline** (1352 → ≤ 300 ✅).

**P0.g.2 — `CampusPlan3D.tsx` : TERMINÉ — sous le plafond.** 782 → **~250 lignes** (façade de composition ; `export default` et ré-exports de types conservés). Livré dans `campus-plan/**` :

- `placement-storage.ts` (repli `localStorage` : clé, lecture normalisée v1→v2, écriture), `useFacilityHistory` (état + historique annulable — fusion 700 ms, plafond 60 — et chargement Supabase > navigateur > défauts), `usePlacementPersist` (écriture différée 400 ms, reprise unique 2,5 s, vidage `pagehide`/démontage, sonde de diagnostic, contrôle préalable de la clé de service), `useCampusStudioShortcuts` (raccourcis clavier du studio), `useStudioTools` (copie / téléchargement / import JSON, réinitialisation, ajout de repère).
- Comportements conservés : écriture contrôlée `{ success, error }`, lecture **inconditionnelle** des placements (vitrine comprise), repli navigateur, verrouillage public du studio (`?studio=1` / prop). **`CampusPlan3D` sorti de la dette baseline** (782 → ≤ 300 ✅).

**P0.g.3 — `DisciplinesView.tsx` : TERMINÉ — sous le plafond.** 730 → **~130 lignes** (façade de composition). Livré dans `disciplines-view/**` (10 modules) :

- **Domaine** : `discipline-form.ts` (`LEVEL_FILTERS`, `normalizeDisciplineEquipment` — chaînes CSV héritées gérées sans `any`, `disciplineLevelBadgeClass`, `createEmptyDiscipline`).
- **Orchestration** : `useDisciplineEditor` (fiche en cours, enregistrement optimiste + Server Actions en transition, suppression, liaisons croisées, image) ; `useDisciplineFilters` (niveau, recherche, rendu progressif).
- **UI** : `DisciplinesHeader`, `DisciplineFiltersBar`, `DisciplineCard` + `DisciplineGrid` (résolution des interconnexions), `DisciplineEditorFields`, `DisciplineLinksSection`, coquille `DisciplineEditorModal`.
- Effet de bord positif : 4 avertissements lint de l'ancien fichier disparaissent (`hasMoreDisciplines` inutilisé, `any` du matériel). **`DisciplinesView` sorti de la dette baseline** (730 → ≤ 300 ✅).

**P0.g.4 — `FilmsView.tsx` : TERMINÉ — sous le plafond.** 697 → **~95 lignes** (façade de composition). Livré dans `films-view/**` (10 modules) :

- **Domaine** : `film-form.ts` (`normalizeDoubledActors` — chaînes CSV héritées sans `any`, `createEmptyFilm`).
- **Orchestration** : `useFilmEditor` (fiche en cours, enregistrement optimiste + mapping `upsertFilm`, suppression, intervenants CUC avec rôles par membre, affiche) ; `useFilmFilters` (recherche titre/réalisateur/année, catégorie, rendu progressif).
- **UI** : `FilmsHeader` (titre + recherche + création), `FilmCategoryChips`, `FilmCard` + `FilmGrid` (résolution staff CUC / modules de cascade), `FilmEditorFields`, `FilmEditorTeamSection` (rôles qualifiés), coquille `FilmEditorModal`.
- Effet de bord positif : 4 avertissements lint de l'ancien fichier disparaissent (`hasMoreFilms` inutilisé, `any` de `doubledActors`). **`FilmsView` sorti de la dette baseline** (697 → ≤ 300 ✅).

**P0.g.5 — `CoachDetailClient.tsx` : TERMINÉ — sous le plafond.** 697 → **~150 lignes** (façade de composition). Livré dans `[slug]/coach-detail/**` (8 modules) :

- **Domaine** : `coach-films.ts` (`normalizeTitleKey`, `findRelatedFilms` — appariement par titre normalisé, `buildFeaturedOrder`, `sortCoachFilms` — mise en avant puis tri visiteur, `createCoachFilmRoleResolver` — rôles rendus traduits).
- **Orchestration** : `useCoachDetailData` (repli statique puis chargement serveur, Realtime `site_team`/`site_films`, overlays EN coachs + films, crédits parsés, films liés/triés, autres formateurs).
- **UI** : `CoachPortrait` (photo + liens officiels), `CoachProfile` (bio, expertise, doublures, CTA), `CoachFilmography` (tri + affiches + rôle par film), `CoachOtherMembers`, `CoachNotFound` — traducteurs typés `ReturnType<typeof useTranslations<'…'>>`.
- Garde d'affichage maintenue APRÈS tous les hooks ; **`CoachDetailClient` sorti de la dette baseline** (697 → ≤ 300 ✅).

**P0.g.6 — `CommandPalette.tsx` : TERMINÉ — sous le plafond.** 694 → **~180 lignes** (façade de composition). Livré dans `command-palette/**` (5 modules) :

- **Domaine** : `command-definitions.ts` (contrats + catalogue des 31 commandes, actions injectées), `command-search.ts` (`normalize`, `fuzzyScore`, `scoreCommands`), `command-recents.ts` (récentes, repli `localStorage`).
- **Orchestration** : `useCommandPalette` (recherche floue, historique, clavier flèches/Home/End/Entrée/Échap, scroll auto) ; **UI** : `CommandRow`.
- Enseignement React Compiler consigné : **les refs ne transitent pas par l'objet retourné d'un hook** (erreur « Cannot access refs during render ») — input/liste créées dans la façade, piège de focus `useFocusTrap` dans la façade, refs passées au hook en paramètres. **`CommandPalette` sortie de la dette baseline** (694 → ≤ 300 ✅).

**P0.g.7 — `SettingsView.tsx` : TERMINÉ — sous le plafond.** 674 → **~150 lignes** (façade de composition). Livré dans `settings-view/**` (9 modules) :

- **Domaine** : `settings-sections.ts` (onglets, `ACCENT_COLORS`, `SettingsChangeHandler` typé sur l'union des valeurs — fini les `any`).
- **Orchestration** : `useSettingsForm` (état, section active, message de statut, écriture `updateSiteSettings('general', …)`, réinitialisation).
- **UI** : `SettingsHeader`, `SettingsSectionCard` (en-tête partagé + `headerExtra` pour la bascule d'urgence), `IdentitySection`, `CertificationsSection`, `CtaSection`, `EmergencySection`, `ContactSection`, `SocialLinksRedirectSection` (renvoi anti-doublon).
- Effet de bord : 2 avertissements lint disparaissent (`value: any` + catch générique). **`SettingsView` sorti de la dette baseline** (674 → ≤ 300 ✅).

**P0.g.8 — `CampusZonesView.tsx` : TERMINÉ — sous le plafond.** 590 → **~70 lignes** (façade de composition). Livré dans `zones-view/**` (13 modules) :

- **Domaine** : `zone-form.ts` (les 9 UUID CUC Sign sortis du JSX en constante `CUC_SIGN_LOCATIONS`, `createEmptyZone` — valeurs par défaut de la zone vierge).
- **Orchestration** : `useCampusZoneFilters` (catégories dérivées + POIs filtrés/triés par `order_index`), `useCampusZoneEditor` (édition, `updateDraft` par patch, sauvegarde optimiste `upsertCampusPOI` + `updateSiteSettings('campus_pois', …)`, suppression avec confirmation).
- **UI** : `ZonesHeader`, `ZoneRadarPreview` (radar + marqueurs cliquables), `ZoneCategoryFilters`, `ZoneCard` + `ZoneGrid` (disciplines associées résolues par carte), `ZoneEditorModal` décomposé en `ZoneEditorFields`, `ZoneSignSection` (liaison CUC Sign), `ZoneGeoSection` (ordre/GPS/radar), `ZoneStatusToggle` (Brouillon/Publié). **`CampusZonesView` sorti de la dette baseline** (590 → ≤ 300 ✅).

**P0.g.9 — `FooterView.tsx` : TERMINÉ — sous le plafond.** 584 → **~65 lignes** (façade de composition). Livré dans `footer-view/**` (10 modules) :

- **Domaine** : `footer-form.ts` (opérations pures sur `FooterStructure` — tri/réindexation, déplacement de colonnes et de liens avec réindexation, ajout/suppression ; `null` quand un déplacement est hors limites), `footer-ui.ts` (classe de champ partagée).
- **Orchestration** : `useFooterEditor` (chargement `getFooter('main')`, sauvegarde `upsertFooter` + indicateur de publication, reset `DEFAULT_FOOTER`, colonne dépliée).
- **UI** : `FooterHeader` (enregistrer/réinitialiser), `FooterPublishToggle`, `FooterBrandCard` (nom, accroche, description), `FooterColumnsEditor` → `FooterColumnCard` → `FooterLinkRow` (déplacement, visibilité, liens), `FooterLegalCard` (copyright `{year}` + liens légaux). **`FooterView` sorti de la dette baseline** (584 → ≤ 300 ✅).

**P0.g.10 — `AuditLogView.tsx` : TERMINÉ — sous le plafond.** 543 → **~90 lignes** (façade de composition). Livré dans `audit-log-view/**` (9 modules) :

- **Domaine** : `audit-format.ts` (gammes 24 h/7 j/30 j, formats de date, regroupement par jour, construction CSV pure + téléchargement BOM UTF-8), `audit-visuals.ts` (icône/tonalité d'action, icône d'entité).
- **Orchestration** : `useAuditLogData` (chargement `getAuditLogsExtended(500)`, horodatage `now` anti-impur, stats 24 h/auteurs), `useAuditLogFilters` (recherche, filtres action/entité/période, options dérivées, réinitialisation), `useAuditLogExport`.
- **UI** : `AuditStatsCards`, `AuditFiltersBar`, `AuditLogList` (groupes par jour) → `AuditLogEntryCard`.
- Enseignement React Compiler consigné : **un tag JSX ne peut pas provenir d'un appel de fonction** (règle `static-components`, « Cannot create components during render ») — `resolveEntityVisual` retourne `{ icon }`, l'accès par propriété (`visual.icon`) est sûr. Effet de bord : warning `hasMore` inutilisé éliminé. **`AuditLogView` sorti de la dette baseline** (543 → ≤ 300 ✅).

**P0.g.11 — `HomePageEditor.tsx` : TERMINÉ — sous le plafond.** 533 → **~45 lignes** (façade de composition). Livré dans `pages-editor/home-page/**` (4 modules) :

- **Domaine** : `home-blocks.ts` — schéma déclaratif des 6 blocs `sections_data` (`about`, `tournages`, `virtual_tour`, `qualiopi`, `partners`, `social`) : lignes/colonnes, `liveEdit` (attribut `data-cuc-field` pour l'aperçu live), `media` (bouton Médiathèque). ~460 lignes de JSX répétitif remplacées par des données typées.
- **Orchestration** : `useHomePageSections` (`data` de `sections_data`, `updateBlock` verbatim en mise à jour immuable).
- **UI** : `HomeEditorBlock` (carte + `BlockHeader` stable + grilles 2/3 en classes **littérales** — Tailwind ne lit pas les classes construites dynamiquement) → `HomeBlockFieldControl` (champ unitaire, `data-cuc-field` conditionnel, picker média). **`HomePageEditor` sorti de la dette baseline** (533 → ≤ 300 ✅).

**P0.g.12 — `NavigationView.tsx` : TERMINÉ — sous le plafond.** 531 → **~85 lignes** (façade de composition). Livré dans `navigation-view/**` (9 modules) :

- **Domaine** : `navigation-form.ts` (tri/réindexation, déplacement d'entrées et de sous-entrées, ajout avec identifiant retourné pour dépliage, `TYPE_LABELS`), `navigation-ui.ts` (classe de champ partagée).
- **Orchestration** : `useNavigationEditor` (chargement `getNavigation('main')`, sauvegarde `upsertNavigation` + publication, reset `DEFAULT_NAVIGATION`, entrée dépliée, CTA).
- **UI** : `NavigationHeader`, `NavigationPublishToggle`, `NavigationItemsEditor` → `NavItemCard` → `NavChildRow`, `NavigationCtaCard`. **`NavigationView` sorti de la dette baseline** (531 → ≤ 300 ✅).

**P0.g.13 — `ui/primitives.tsx` (design system) : TERMINÉ — sous le plafond.** 519 → **~70 lignes** (baril de ré-export `'use client'`). Livré dans `ui/design-system/**` (11 modules) :

- **Fondations** : `cockpit-classes.ts` (`cx`, `COCKPIT_INPUT_CLASS`, `COCKPIT_LABEL_CLASS`).
- **Modules par primitive** : `CockpitViewHeader`, `CockpitCard`, `CockpitButton` (+ `CockpitIconButton`), `CockpitFields` (Field/Input/Textarea/Select), `CockpitToggle` (a11y `useId`), `CockpitBadge`, `CockpitEmptyState`, `CockpitSkeleton` (+ liste), `CockpitFormActions`, `CockpitLoadMore` — variantes et tons en constantes locales, API publique inchangée (`ui/index.ts` et les imports directs de `cx` restent intacts). **`primitives.tsx` sorti de la dette baseline** (519 → ≤ 300 ✅).

**P0.g.14 — `stunt-workshop-cuc/page.tsx` : TERMINÉ — sous le plafond.** 515 → **~70 lignes** (façade de composition). Livré dans `stunt-workshop-cuc/sections/**` (7 modules) :

- **Domaine** : `workshop-copy.ts` (types de surcharge Studio, `HIGHLIGHTS_DEFAULT`, `CURRICULUM_DEFAULT`, `WORKSHOP_MEDIA` — les 5 visuels sortis du JSX).
- **Orchestration** : `useWorkshopContent` (hero + 6 blocs résolus avec replis certifiés, `mergeSectionItems` par index, traducteur `stuntWorkshop`).
- **UI** : `WorkshopHero` (breadcrumb + titre à dernier mot accentué + CTA), `WorkshopHighlights`, `WorkshopProgram` (curriculum + 4 visuels), `WorkshopInfoCards` (location/housing/certificate), `WorkshopApplyBox` (ancre `#apply`). **`page.tsx` sorti de la dette baseline** (515 → ≤ 300 ✅).

**P0.g.15 — `PreviewEditLayer.tsx` (Mode Studio) : TERMINÉ — sous le plafond.** 505 → **~65 lignes** (façade). Livré dans `preview-edit-layer/**` (6 modules) :

- **Domaine** : `overlay-model.ts` (états overlay/média/liste, `measure`, `buildOverlay`, `ListCommand`), `preview-edit-apply.ts` (`applyPreviewEditState` + `repositionPreviewEdit` — application de l'état d'édition et repositionnement, extraits du hook après **alerte du ratchet sur un nouveau fichier > 300 l.**, preuve que le garde-fou fonctionne).
- **Orchestration** : `usePreviewEditLayer` (embarquement iframe, commit/flou/clavier — Tab/Échap/Entrée, focus/curseur, commandes liste & média) ; `inputRef` fournie par la façade (règle React Compiler : les refs ne transitent pas par le retour d'un hook).
- **UI** : `ListCommandOverlay`, `MediaReplaceOverlay`, `TextEditOverlay`. Garde-fou d'inertie hors iframe conservé (test `PreviewEditLayer.test.tsx` vert). **`PreviewEditLayer` sorti de la dette baseline** (505 → ≤ 300 ✅).

**P0.g.16 — `AnalyticsView.tsx` : TERMINÉ — sous le plafond.** 486 → **~95 lignes** (façade de composition). Livré dans `analytics-view/**` (12 modules) :

- **Domaine/services** : `analytics-format.ts` (fenêtres 7/30/90 j, `formatHours`) ; **nouveau service partagé [`src/lib/csv-export.ts`](src/lib/csv-export.ts:1)** (`escapeCsvCell`, `toCsv`, `downloadCsv`) qui **dédoublonne** l'export CSV entre audit (P0.g.10) et analytique — `audit-format.ts` ré-exporte `downloadCsv` (surface inchangée).
- **Orchestration** : `useAnalyticsData` (chargement candidatures + audit, `analyzeCockpit` mémoïsé, fenêtre), `useAnalyticsExport` (lignes CSV verbatim + téléchargement + toast).
- **UI** : `TrendBadge`, `Sparkline`, `DistributionBar`, `AnalyticsWindowSelector`, `AnalyticsKpiGrid`, `AnalyticsFunnelCard`, `AnalyticsDistributionsRow`, `AnalyticsSessionPressureCard`, `AnalyticsActivityRow`. **`AnalyticsView` sorti de la dette baseline** (486 → ≤ 300 ✅).

**P0.g.17 — `useCampusPointerDrag.ts` (engine 3D) : TERMINÉ — sous le plafond.** 475 → **~50 lignes** (façade de wiring des écouteurs). Livré dans `engine/campus-pointer/**` (5 modules) :

- **Session & options** : `pointer-options.ts` (`PointerEventsSetupOptions`, `PointerSession` + `createPointerSession`, `PAN_BOUNDS`, `Axis`).
- **Caméra/pan** : `pointer-camera.ts` (`updateMouseVector`, `beginPan`, `applyPan`).
- **Gizmo** : `pointer-gizmo.ts` (`lacetAngleAt`, `beginGizmoDrag`, `resolveGizmoDragTransform` — le switch de drag extrait en fonction pure, `rayPlanePoint`/`getObjectFrame` réutilisés depuis `gizmoMath`).
- **Handlers** : `pointer-press.ts` (pointerdown + move : gizmo/sélection/pan/orbite), `pointer-release.ts` (pointerup + molette + menu contextuel).
- Comportement du studio 3D préservé (tests `useCampusGizmo.test.ts` verts). **`useCampusPointerDrag` sorti de la dette baseline** (475 → ≤ 300 ✅).

**P0.g.18 — `useCampusGizmo.ts` (engine 3D) : TERMINÉ — sous le plafond.** 470 → **~25 lignes** (baril de ré-export, surface publique inchangée). Livré dans `engine/campus-gizmo/**` (5 modules) :

- **Constantes** : `gizmo-constants.ts` (liste exhaustive des poignées + set, couleurs d'axes, groupes exclusifs, opacités de l'anneau).
- **Picking** : `gizmo-picking.ts` (`handleToDragType`, `findGizmoHandle` avec contrôle de visibilité, `handleToMode`, `findFirstGizmoHandle` filtré, `findBuildingGroup`, `snapValue`).
- **Visibilité** : `gizmo-visibility.ts` (`setGizmoMode`, `setRotateRingEmphasis`, `setGizmoScale`).
- **Builders** : `gizmo-builders.ts` (flèches, poignées d'échelle, anneau de lacet, `createCampusGizmo`), `gizmo-highlight.ts` (`createCampusHighlight`, `setHighlightRadius`).
- Tests `useCampusGizmo.test.ts` (7) verts sans modification. **`useCampusGizmo` sorti de la dette baseline** (470 → ≤ 300 ✅).

**P0.g.19 — `CockpitSidebar.tsx` : TERMINÉ — sous le plafond.** 458 → **~100 lignes** (façade de composition). Livré dans `cockpit-sidebar/**` (7 modules) :

- **Types publics** : `sidebar-types.ts` (`CockpitNavItem`, `CockpitNavSection`, `CockpitSidebarProps`) — tous ré-exportés par la façade, surface inchangée.
- **Persistance** : `sidebar-storage.ts` (clés localStorage, `readStringArray`, `readRailCollapsed`, `TOGGLE_SIDEBAR_EVENT` ré-exporté).
- **Orchestration** : `useCockpitSidebar` (recherche, groupes repliés, épingles, rail Ctrl/Cmd+B, `roleLabel`).
- **UI** : `SidebarHeader` (logo + badge Realtime), `SidebarSearch`, `SidebarNav` (favoris, sections animées, raccourcis), `SidebarFooter` (profil + déconnexion), `SidebarShell` (aside desktop + tiroir mobile). **`CockpitSidebar` sortie de la dette baseline** (458 → ≤ 300 ✅).

**P0.g.20 — `content-health.ts` + `content-health.test.ts` : TERMINÉS — sous le plafond.** Lib : 423 → **~120 lignes** (façade). Test : 446 → **5 fichiers** répartis par famille. Livré :

- **Modules** : `content-health/types.ts` (contrats + `SEVERITY_WEIGHT` + `PushIssue`), `url-rules.ts` (URL externe/ancre/placeholder, normalisation), `path-collectors.ts` (routes statiques, chemins pages/nav/footer), et 4 vérificateurs — `checks-links`, `checks-images`, `checks-orphans`, `checks-seo` (verbatim, ordre d'émission préservé pour des ids déterministes).
- **Tests** : `content-health.fixtures.ts` (4 fabriques) + 5 fichiers (`broken-links` 6, `images` 6, `orphans` 5, `seo` 5, `score` 7) — **29 cas identiques**, l'ancien fichier supprimé (33 → 37 fichiers de test, 308 tests inchangés).
- **`content-health.ts` (423) et `content-health.test.ts` (446) sortis de la dette baseline** (≤ 300 ✅).

**P0.g.21 — `videos-cascadeur/page.tsx` : TERMINÉ — sous le plafond.** 415 → **~85 lignes** (façade de composition, JSON-LD conservé). Livré dans `videos-cascadeur/sections/**` (7 modules) :

- **Domaine** : `videos-copy.ts` (types `VideoCopy`/`MediaItem`/`VideosProgram`, `VIDEOS_MEDIA` — posters et sources des 2 reportages sortis du JSX).
- **Orchestration** : `useVideosPage` (programmes TV `site_videos` + Realtime `site_settings`, ancres `#tf1`/`#france2`, copie éditoriale par `dmId`, hero Studio + `labels` i18n pré-résolues).
- **UI** : `VideosHero` (titre scindé sur `&`), `VideosPlayer` (onglets TF1/France 2, lecteurs), `VideosDocusGrid` (documentaires Dailymotion), `DmVideoModal`, `VideosMediaSection` (chaînes + réseaux). **`page.tsx` sorti de la dette baseline** (415 → ≤ 300 ✅).

**P0.g.22 — `SessionsView.tsx` : TERMINÉ — sous le plafond.** 414 → **~80 lignes** (façade de composition). Livré dans `sessions-view/**` (7 modules) :

- **Domaine** : `session-form.ts` (types `ProgramSession`/`SessionStatus`/`NewSessionStatus`, `STATUS_COLORS` littéral, `countSessionCandidates` — appariement `program_id`/`program_title` + dates, `seatBarColor` — jauge rose/ambre/émeraude).
- **Orchestration** : `useSessionsEditor` (états `selectedProgramId`/modale/date/statut, `handleSyncSeats` [CUC Sign], `handleStatusChange` optimiste, `handleAddSession`, `handleDeleteSession`, `startDuplicateSession`).
- **UI** : `SessionsHeader`, `ProgramSelector`, `SessionCard` (statuts, candidats, badge ✓ CUC Sign, jauge, dupliquer/supprimer), `ProgramSessionsPanel` (badges Realtime/Sync), `AddSessionModal`. **`SessionsView.tsx` sorti de la dette baseline** (414 → ≤ 300 ✅).
- **Bonus qualité** : `catch (err: any)` → narrowing `err instanceof Error` (−1 warning de lint).

**P0.g.23 — `cockpit-analytics.ts` + `cockpit-analytics.test.ts` : TERMINÉS — sous le plafond.** Lib : 413 → **~45 lignes** (façade baril). Test : 406 → **4 fichiers** répartis par famille. Livré :

- **Modules** : `cockpit-analytics/types.ts` (contrats), `time.ts` (`safeDate`, `startOfDay`…), `distribution.ts` (`buildDistribution`), `series.ts` (`buildDailySeries` + `seriesToPolyline`), `inquiry-metrics.ts` / `session-metrics.ts` / `activity-metrics.ts` (3 computeurs purs), `breakdowns.ts` (entonnoir + répartitions statut/programme), `analyze.ts` (`analyzeCockpit` — assemblage verbatim).
- **Tests** : `cockpit-analytics.fixtures.ts` (5 fabriques) + 4 fichiers (`empty` 9, `inquiries` 6, `entities` 6, `series` 4) — **25 cas identiques**, l'ancien fichier supprimé (37 → 40 fichiers de test, 308 tests inchangés).
- **`cockpit-analytics.ts` (413) et `cockpit-analytics.test.ts` (406) sortis de la dette baseline** (≤ 300 ✅).

**P0.g.24 — `ParallaxHero.tsx` : TERMINÉ — sous le plafond.** 410 → **~110 lignes** (façade de composition). Livré dans `parallax-hero/**` (3 modules) :

- **Orchestration** : `useParallaxHero` (mode calme tactile/`prefers-reduced-motion`/iframe aperçu, ressorts hydrauliques scroll + pointeur, transforms de tilt 3D, fondu du plan focal, avancement automatique des visuels, handlers pointeur). La ref de section est créée par la façade et passée en paramètre (jamais retournée par le hook).
- **UI** : `HeroBackground3D` (fond photographique Ken-Burns + tilt inertiel, variante « une seule image peinte » en mode calme, vignettes cinématiques), `HeroFocalContent` (badge, titre, sous-titre crossfade, métriques éditables, 3 CTA — plan focal 100 % stable).
- **`ParallaxHero.tsx` (410) sorti de la dette baseline** (≤ 300 ✅) ; l'API publique (`heroData`) est inchangée pour `HomeView`.

**P0.g.25 — `equipe-cascadeurs-pro/page.tsx` : TERMINÉ — sous le plafond.** 406 → **~80 lignes** (façade de composition). Livré dans `equipe-cascadeurs-pro/sections/**` (6 modules) :

- **Orchestration** : `useEquipeCascadeursData` (état initial `CUC_TEAM`/`FILMOGRAPHY_CREDITS`, `getTeam`/`getFilms`, Realtime `site_team` + `site_films` sur un seul canal, overlays EN coachs et films, contenu éditable du hero).
- **UI** : `EquipeHeroSection` (image de fond éditable, fil d'Ariane, titre scindé sur le dernier mot), `CoachCard` (portrait, rôle, bio, spécialités, ancre `#{id}`), `CoachCreditsList` (4 crédits + « autres », couleur par catégorie), `CoachFilmThumbs` (3 miniatures cliquables → modale film), `EquipeCallout` (CTA formation).
- **`page.tsx` sorti de la dette baseline** (406 → ≤ 300 ✅) ; l'API (`usePageDynamicContent('equipe-cascadeurs-pro')`, ancres, `FilmDetailsModal`) est inchangée.

**P0.g.26 — `SocialLinksView.tsx` : TERMINÉ — sous le plafond.** 390 → **~65 lignes** (façade de composition). Livré dans `social-links-view/**` (6 modules) :

- **Domaine** : `social-links-form.ts` (`SOCIAL_PLATFORMS`, classes de champs, `reindexSocialLinks`, `createSocialLink` — première plateforme libre).
- **Orchestration** : `useSocialLinksEditor` (chargement `site_social_links`, `update`/`move`/`addLink`, enregistrement `upsertSocialLink` en transition, suppression avec confirmation, reset aux défauts).
- **UI** : `SocialLinksHeader` (titre + réinitialiser/enregistrer), `SocialLinkRow` (ordre, aperçu teinté, plateforme/libellé/URL, activer/supprimer), `SocialLinkDetailsRow` (handle, indice, couleur ×2, emplacements), `ToggleButton` (bascule extraite du corps du composant — plus de composant créé au render). **`SocialLinksView.tsx` sorti de la dette baseline** (390 → ≤ 300 ✅).

**P0.g.27 — `EventsView.tsx` : TERMINÉ — sous le plafond.** 383 → **~85 lignes** (façade de composition). Livré dans `events-view/**` (5 modules) :

- **Domaine** : `events-form.ts` (classes de champs, `createEmptyEvent` — id horodaté, atouts par défaut, ordre en fin de liste).
- **Orchestration** : `useEventsEditor` (édition optimiste locale, `handleSave` avec `onEventSaved` immédiat + `upsertEvent` distant, suppression confirmée + `deleteEvent`, atouts ajout/retrait, `applySelectedImage` du MediaPicker).
- **UI** : `EventsHeader` (titre + « Ajouter une offre »), `EventCard` (visuel, badge, aperçu 3 atouts, prix, modifier/supprimer), `EventEditModal` (formulaire complet). **`EventsView.tsx` sorti de la dette baseline** (383 → ≤ 300 ✅).

**P0.g.28 — `ApplicationModal.tsx` : TERMINÉ — sous le plafond.** 379 → **~95 lignes** (façade de composition). Livré dans `application-modal/**` (5 modules) :

- **Domaine** : `application-form.ts` (`ProfileType`, `resolveProfileType`, `PROGRAM_TITLES` [références cockpit], `AFDAS_VALUES`, état initial).
- **Orchestration** : `useApplicationForm` (profil synchronisé sur `defaultProgramId` en phase render, verrou de scroll + Échap, envoi `submitInquiry` → `site_inquiries`).
- **UI** : `ApplicationFormBody` (en-tête, onglets de profil, formulaire complet), `ApplicationFields` (identité : nom/âge/e-mail/téléphone), `ApplicationSuccessView` (accusé + coordonnées). **`ApplicationModal.tsx` sorti de la dette baseline** (379 → ≤ 300 ✅) ; le contrat `{ isOpen, onClose, defaultProgramId }` est inchangé.

**P0.g.29 — `PageRevisionsPanel.tsx` : TERMINÉ — sous le plafond.** 376 → **~140 lignes** (façade de composition). Livré dans `page-revisions-panel/**` (4 modules) :

- **Domaine** : `revision-format.ts` (`STATUS_LABELS`/`STATUS_TONES`, `formatDate` FR, `summarizeValue`, `FIELD_LABELS`).
- **Orchestration** : `usePageRevisions` (chargement par slug — `eslint-disable` `set-state-in-effect` conservé, sélection/comparaison, restauration avec confirmation, suppression, diff mémoïsé vs version de référence).
- **UI** : `RevisionListItem` (n° + statut + auteur + horodatage + comparer/restaurer/supprimer), `RevisionDiffView` (détail et différences « Avant / Après »). **`PageRevisionsPanel.tsx` sorti de la dette baseline** (376 → ≤ 300 ✅) ; le contrat de props est inchangé.

**P0.g.30 — `ContentHealthView.tsx` : TERMINÉ — sous le plafond.** 373 → **~105 lignes** (façade de composition). Livré dans `content-health-view/**` (5 modules) :

- **Méta** : `health-meta.ts` (`KIND_META`/`SEVERITY_META` icône+ton, `scoreTone`, type `HealthTab`).
- **Orchestration** : `useContentHealth` (collecte des 6 sources en parallèle, `analyzeContentHealth`, filtres kind/sévérité mémoïsés, `eslint-disable` conservés pour la synchro distante et le run initial).
- **UI** : `HealthScoreCard` (jauge /100 + compteurs cliquables par sévérité), `HealthKindFilters` (4 tuiles catégories), `HealthIssueList` (groupes par sévérité, bouton « Corriger » → module cible). **`ContentHealthView.tsx` sorti de la dette baseline** (373 → ≤ 300 ✅).

**P0.g.31 — `useNavigation.ts` : TERMINÉ — sous le plafond.** 371 → **~15 lignes** (façade baril). Livré dans `lib/hooks/navigation/**` (4 modules) :

- **Helpers** : `navigation-labels.ts` (`currentLocale`, `fetchLabelOverlay` [repli FR], `applyItemLabels`, `applyFooterLabels` — conventions `[col.id]` / `brand.*` / `legal.*`).
- **Hooks** : `useNavigation` (init serveur → zéro flash, Realtime `site_navigation`), `useFooter` (même doctrine sur `site_footer`), `useSocialLinks` (`site_social_links` + overlays EN `social_link`). **`useNavigation.ts` sorti de la dette baseline** (371 → ≤ 300 ✅) ; les trois exports historiques sont conservés par la façade.

**P0.g.32 — `useCampusScene.ts` : TERMINÉ — sous le plafond.** 366 → **~215 lignes** (hook d'orchestration). Livré dans `engine/campus-scene/**` (2 modules) :

- **`scene-init.ts`** : `initCampusSceneGraph` — renderer, groupes (bâtiments/balises/gizmo/surbrillance), état mutable `ThreeSceneContext` initial et `applyPlanMode` initial.
- **`scene-animate.ts`** : `createSceneRenderLoop` — boucle 60 fps (interpolation caméra, télémétrie React throttlée ~120 ms, pulsations gizmo/surbrillance/balises) ; `threeRef` et sink de télémétrie passés en paramètres.
- **`useCampusScene.ts` sorti de la dette baseline** (366 → ≤ 300 ✅) ; l'API retournée (`bearing`, `cameraDistance`, `focusFacility`, `handleReset`) est inchangée. Les tests gizmo restent verts sans modification.

**P0.g.33 — `LivePreviewPane.tsx` : TERMINÉ — sous le plafond.** 365 → **~130 lignes** (façade de composition). Livré dans `live-preview-pane/**` (6 modules) :

- **Domaine** : `preview-devices.ts` (appareils, largeurs, icônes, libellés, langues).
- **Orchestration** : `useLivePreviewPane` (appareil simulé, rechargement par clé locale, plein écran avec Échap + scroll figé, largeur/hauteur du cadre).
- **UI** : `PreviewToolbar` (appareil + langue + édition en place + état Live + actions), `PreviewDeviceSwitcher`, `PreviewLocaleSwitcher`, `PreviewFrame` (iframe `reloadKey`+`localKey`, repli « Initialisation… »). **`LivePreviewPane.tsx` sorti de la dette baseline** (365 → ≤ 300 ✅) ; le contrat de props est inchangé.

**P0.g.34 — `PartenairesGridSection.tsx` : TERMINÉ — sous le plafond.** 355 → **~180 lignes** (façade de composition). Livré dans `partenaires/grid/**` (5 modules) :

- **Domaine** : `partner-localization.ts` (types `PartnerCopy`/`PartnerLike`, `createPartnerLocalizer` — appariement par nom, `CATEGORY_KEYS`).
- **Orchestration** : `usePartnersGrid` (catalogue certifié `CUC_PARTNERS` + fiches CMS `site_partners`, Realtime, dédup par nom, suivi des échecs d'images).
- **UI** : `PartnerLogoBox` (repli sur le nom), `AdditionalPartnerCard` (fiches CMS, badge paramétrable), `StaticPartnerCard` (catalogue certifié, `bgVariant`). **`PartenairesGridSection.tsx` sorti de la dette baseline** (355 → ≤ 300 ✅).

**P0.g.35 — `DashboardView.tsx` : TERMINÉ — sous le plafond.** 353 → **~230 lignes** (façade de composition). Livré dans `dashboard-view/**` (6 modules) :

- **Orchestration** : `useAuditLogs` (journal d'audit du tableau de bord).
- **UI** : `DashboardHeader`, `DashboardModuleCard` (carte générique : libellé, icône teintée, valeur, sous-titre, CTA — les 9 modules deviennent déclaratifs), `DashboardActivityLog`, `DashboardBackupPanel`, `DashboardPerformanceNote`. **`DashboardView.tsx` sorti de la dette baseline** (353 → ≤ 300 ✅) ; les props (compteurs du Cockpit) sont inchangées.

**P0.g.36 — `campusScene.ts` : TERMINÉ — sous le plafond.** 353 → **~35 lignes** (façade baril). Livré dans `engine/campus-scene/**` (3 modules) :

- **`scene-factory.ts`** : `initCampusScene` + `CampusWebGLContext` + `degToRad` (scène, caméra, renderer, sol photographique 248 m, lumières, ombres).
- **`scene-buildings.ts`** : `setupCampusBuildings` (9 bâtiments procéduraux depuis `transformOf`, garde-fou `|| 1`, balises holographiques).
- **`scene-plan-mode.ts`** : `applyPlanMode` + palettes par rôle (`DAYLIGHT`/`SATELLITE`), `resolveMaterialRole`, `applyRolePalette`. **`campusScene.ts` sorti de la dette baseline** (353 → ≤ 300 ✅) ; les 13 exports historiques (builders inclus) sont conservés par la façade.

**P0.g.37 — `CampusEditorPanel.tsx` : TERMINÉ — sous le plafond.** 353 → **~150 lignes** (façade de composition). Livré dans `ui/editor-panel/**` (7 modules) :

- **UI** : `GizmoToolBar` (outil actif + annuler/rétablir), `PanelSaveStatus` (ton + détail d'écriture), `ObjectSelector` (sélecteur + cadrage), `SnapAndDragControls` (aimantation, clic gauche), `VisibilityActions` (masquer/afficher + ajout de repère), `ExportActions` (copie JSON / téléchargement / import / reset), `StudioShortcutsHelp` (raccourcis réellement disponibles). **`CampusEditorPanel.tsx` sorti de la dette baseline** (353 → ≤ 300 ✅) ; le contrat de props et `EditorCoordinateInputs` sont inchangés.

**P0.g.38 — `EventsPillarsSection.tsx` : TERMINÉ — sous le plafond.** 339 → **~60 lignes** (façade de composition). Livré dans `events/pillars/**` (3 modules) :

- **Orchestration** : `useEventsPillars` (textes éditoriaux en place `sections_data.events_pillars`, événements `site_events` + Realtime, overlays EN, `STATIC_PILLAR_IMAGES`).
- **UI** : `DbEventPillarCard` (carte alimentée par le CMS, alternance de mise en page), `StaticPillarCard` (carte de repli paramétrée par index, champs `cucField` préservés). **`EventsPillarsSection.tsx` sorti de la dette baseline** (339 → ≤ 300 ✅).

**P0.g.39 — `MicrocopyView.tsx` : TERMINÉ — sous le plafond.** 336 → **~75 lignes** (façade de composition). Livré dans `microcopy-view/**` (3 modules) :

- **Orchestration** : `useMicrocopyEditor` (catalogue `loadMicrocopyCatalog`, surcharges `site_settings`, valeurs `fr:`/`en:`, détection dirty/overridden, filtre groupe+recherche, `handleSave` — aucune valeur vide publiée, resynchronisation après écriture).
- **UI** : `MicrocopyToolbar` (description, compteurs clés/surcharges/modifications, recherche, groupes, bascule FR|EN, Publier), `MicrocopyEntryRow` (clé, badges « surchargé »/« modifié », champ input/textarea auto selon longueur, valeur miroir de l'autre langue, retour au catalogue). **`MicrocopyView.tsx` sorti de la dette baseline** (336 → ≤ 300 ✅).

**P0.g.40 — `StagesGridSection.tsx` : TERMINÉ — sous le plafond.** 336 → **~45 lignes** (façade de composition). Livré dans `stages/grid/**` (3 modules) :

- **Domaine/Rendu** : `stage-render.tsx` (types `StageCopy`/`StageOverride`, `pickCopy`, `renderIcon`, `renderBadge`).
- **Orchestration** : `useStagesGrid` (liste CMS éventuelle `customStages`, copie traduite appariée par `id`, correctifs Mode Studio par index) — **bonus** : `customStages` typé structurellement (`unknown[]` + `CustomStageInput`), le `cs: any` disparaît (−1 warning).
- **UI** : `StageGridCard` (badges, texte, détails, CTA + PDF, affiche ; champs `cucField` préservés). **`StagesGridSection.tsx` sorti de la dette baseline** (336 → ≤ 300 ✅).

**Validation de fin de vague P0.g.40 (StagesGridSection) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (**80 avertissements, −1**) · `audit:strict` 0 problème (**baseline 8 → 7 fichiers**) · `build` 93/93 pages · **grille des stages hors dette**.

**P0.g.41 — `HomeTournagesSection.tsx` : TERMINÉ — sous le plafond.** 329 → **~50 lignes** (façade de composition). Livré dans `home/tournages/**` (4 modules) :

- **Domaine/Données** : `home-tournages-data.ts` (types `HighlightProject`/`HomeTournagesData`/`HomeVirtualTourData` + `FEATURED_PRODUCTIONS` — sélection éditoriale vérifiée, jaquettes IMDb verbatim en dernier recours d'affichage).
- **Orchestration** : `useHomeTournages` (libellés éditoriaux `sections_data.tournages` ou traduction, catalogue `site_films` + Realtime, résolution par titre normalisé `creditTitleKey`, `captionFor` — rôles réellement enregistrés uniquement, aucune auto-référence).
- **UI** : `TournagesHeader` (badge + team_tag + titre + sous-titre + CTA équipe), `TournagesPillarsCard` (3 piliers, CTA production/catalogue, sélection 2×2 de `FilmCard` — ex-`FilmPosterCard`, unifié le 2026-09-24) — champs `data-cuc-field` `sections_data.tournages.*` préservés verbatim. **`HomeTournagesSection.tsx` sorti de la dette baseline** (329 → ≤ 300 ✅) ; types ré-exportés (API publique inchangée) ; **bonus** : import `Clapperboard` inutilisé retiré du nouveau module (lint stable à 80 après correction).

**Validation de fin de vague P0.g.41 (HomeTournagesSection) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (80 avertissements, aucun ajout net) · `audit:strict` 0 problème (**baseline 7 → 6 fichiers**) · `build` 93/93 pages · **bloc tournages Accueil hors dette**.

**P0.g.42 — `SystemHealthModal.tsx` : TERMINÉ — sous le plafond.** 324 → **~150 lignes** (façade de composition). Livré dans `components/system-health/**` (6 modules) :

- **Domaine/État** : `health-state.tsx` (`STATE_STYLES` — badge/icône/libellé par état de santé, `REALTIME_STYLES` — badge/libellé du canal Realtime, types `HealthStateStyle`/`RealtimeStatus`).
- **Orchestration** : `useSystemHealthProbe` (sonde `getSystemHealth` auto à l'ouverture + relance manuelle avec toast, revalidation du cache vitrine, état global dérivé, horodatage de mesure — toasts et séquences verbatim).
- **UI** : `SystemHealthHeader` (identité, latence Supabase, relance/fermeture), `SystemHealthMetricCard` (mesure réelle), `SystemHealthStatusCards` (`RealtimeStatusCard`, `QualiopiCard`, `ActivityIndicatorsCard`), `CacheRevalidationCard` (action cache ISR). **`SystemHealthModal.tsx` sorti de la dette baseline** (324 → ≤ 300 ✅) ; contrat de props inchangé (`RealtimeStatus` réutilisé) ; textes et classes verbatim (apostrophe droite du libellé « Indicateurs d'Activité Immédiate » préservée).

**Validation de fin de vague P0.g.42 (SystemHealthModal) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (80 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 6 → 5 fichiers**) · `build` 93/93 pages · **moniteur système hors dette**.

**P0.g.43 — `localized-merge.test.ts` : TERMINÉ — sous le plafond.** 324 → **~250 lignes**. Livré dans `lib/i18n/**` (1 module + suite allégée) :

- **Fixtures** : `localized-merge.fixtures.ts` (`PAGE` — contenu représentatif hero/chiffres/catalogue à ancres, `EN_EDITED` — overlays EN tels que le formulaire les produit, `catalogueItems` — accès typé au catalogue, remplace 2 casts `any`). Les 26 cas de test, leurs libellés (apostrophes typographiques) et leurs attentes restent inchangés. **`localized-merge.test.ts` sorti de la dette baseline** (324 → ≤ 300 ✅) ; **bonus** : `lint` −2 avertissements.

**Validation de fin de vague P0.g.43 (localized-merge.test) :** typecheck OK · 308 tests OK (40 fichiers, suite localized-merge inchangée 26 cas) · `lint` 0 erreur (**78 avertissements, −2**) · `audit:strict` 0 problème (**baseline 5 → 4 fichiers**) · `build` 93/93 pages · **suite de fusion FR/EN hors dette**.

**P0.g.44 — `lib/i18n/server.ts` : TERMINÉ — sous le plafond.** 307 → **~194 lignes**. Livré dans `lib/i18n/**` (2 modules + façade) :

- **Lecture micro-textes** : `server-microcopy.ts` (`getMicrocopyOverrides` — `'use cache'` + tag `site_settings`, lecture unique, catalogue embarqué intact en cas d'échec).
- **Collections & réseaux** : `server-entities.ts` (`getEntityOverlays` — overlays indexés par identifiant, `getLocalizedSocialLinks` — réseaux sociaux FR + overlay EN résolus serveur).
- `server.ts` conserve la résolution de page, navigation et pied de page, plus l'import `LocalizedChromeData` remonté en tête (il était déclaré au milieu du fichier) ; **ré-exports explicites** (`getMicrocopyOverrides`, `getEntityOverlays`, `getLocalizedSocialLinks`) : les 4 points d'import publics (`i18n/request.ts`, `[locale]/layout.tsx`, `equipe-cascadeurs-pro/[slug]/page.tsx`…) sont inchangés. **`server.ts` sorti de la dette baseline** (307 → ≤ 300 ✅) ; directives `'use cache'`/`cacheTag` déplacées **avec** leurs fonctions.

**Validation de fin de vague P0.g.44 (i18n/server) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (78 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 4 → 3 fichiers**) · `build` 93/93 pages · **résolution serveur i18n hors dette**.

**P0.g.45 — `lib/i18n/localized-merge.ts` : TERMINÉ — sous le plafond.** 526 → **~55 lignes** (façade baril). Livré dans `lib/i18n/**` (5 modules + façade) :

- **Types/Constantes** : `localized-merge-types.ts` (`LocaleCode`, racines verrouillées, motifs techniques, `OverlayOptions`/`StaleArray`/`TranslationCoverage`, `MISSING_PATHS_LIMIT`).
- **Fusion** : `localized-merge-core.ts` (`mergeLocalized`, `hydrateLocalized` — sémantique verbatim : vide ignoré, tableau non vide en bloc).
- **Surface traduisible** : `localized-merge-editorial.ts` (`flattenEditorial`, `isEditorialLeaf`, `isTechnicalKey`, `lastKeyOf` interne).
- **Production** : `localized-merge-diff.ts` (`diffTranslation`, `diffNode`, `diffLeaf`, `materializeArray` — ancres/médias repris du FR, feuille vidée → FR).
- **Mesure/Contrôle** : `localized-merge-audit.ts` (`translationCoverage`, `findStaleArrays`, `sanitizeOverlayPayload`).
- Le barrel conserve l'en-tête de doctrine (source de vérité unique + invariants) et **ré-exporte les 9 fonctions et 5 types** : aucun import externe modifié (`server.ts`, `usePageDynamicContent`, `useEntityTranslation`, `translations.ts`, `PageEditorTopBar`). **`localized-merge.ts` sorti de la dette baseline** (526 → ≤ 300 ✅) ; aucun `next/*`/React importé (contrainte frontière serveur/client respectée) ; 26 cas de test inchangés.

**Validation de fin de vague P0.g.45 (localized-merge) :** typecheck OK · 308 tests OK (40 fichiers, 26 cas fusion verts) · `lint` 0 erreur (78 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 3 → 2 fichiers**) · `build` 93/93 pages · **fusion FR/EN hors dette**.

**P0.g.46 — `components/3d/engine/campusBuildingMeshes.ts` : TERMINÉ — sous le plafond.** 695 → **~30 lignes** (façade baril). Livré dans `engine/campus-meshes/**` (5 modules) :

- **Socle** : `shared.ts` (`MaterialRole`, `tagRole`, `SceneMaterials`, `createSceneMaterials`, helpers de façade `addWindowBand`/`addDoor`/`addPlinth` — exportés pour les modules voisins, non exposés au barrel).
- **Tour** : `acrobatics.ts` (`buildTowerMesh` — structure, escaliers, plateformes, airbag, cible).
- **Halls** : `halls.ts` (`buildZoeBellMesh`, `buildHangarMesh`, `buildDojosMesh`).
- **Terrains** : `grounds.ts` (`buildCityStadeMesh`, `buildOutdoorMesh`).
- **Équipements** : `facilities.ts` (`buildMecaniqueMesh`, `buildQgMesh`, `buildManegeMesh`).
- Le barrel conserve **exactement** les 10 exports consommés (`createSceneMaterials` + 9 builders, vérifiés dans `campusScene.ts`) et le type `MaterialRole` utilisé par `scene-plan-mode.ts` ; géométries, positions, `userData.materialRole` et noms de groupes verbatim. **`campusBuildingMeshes.ts` sorti de la dette baseline** (695 → ≤ 300 ✅).

**Validation de fin de vague P0.g.46 (campusBuildingMeshes) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (78 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 2 → 1 fichier**) · `build` 93/93 pages · **maillages 3D du campus hors dette**.

**P0.g.47 — `src/app/globals.css` : TERMINÉ — sous le plafond.** 705 → **~25 lignes** (façade d'imports ordonnés). Livré dans `src/app/styles/**` (6 modules CSS) :

- **Base** : `globals-base.css` (`:root` — palette + contrastes WCAG, `body`, text-wrap, container queries, sélection, scrollbar, focus visible et `prefers-reduced-motion` globaux).
- **Typographie** : `globals-typography.css` (`.font-display/.font-tech/.font-mono-tech`, `.text-muted/.text-subtle/.text-faint`).
- **Visuels** : `globals-visuals.css` (motifs hazard, HUD, grille cinéma, strokes, chamfer, glows, marquee, orfèvrerie dorée, verre tactique, lens-flares, `luxury-metric-card`, shimmer).
- **Surcouches** : `globals-overlays.css` (View Transitions, popover, dialog natif).
- **Cockpit** : `globals-cockpit-light.css` (thème clair scopé `[data-cockpit-theme='light']`).
- **Conteneur** : `globals-page-shell.css` (`.page-shell` canonique 1600 px).
- `globals.css` réduit à `@import "tailwindcss"` + 6 imports **dans l'ordre historique des blocs** : cascade strictement préservée (notamment la media query `prefers-reduced-motion` de `.luxury-metric-card` maintenue avant sa règle de survol, comme dans l'original). **Garde-fou renforcé** : `global-styles.test.ts` suit désormais les imports relatifs (`readCssWithImports`) — l'invariant « fond sombre servi » reste vérifié sur la chaîne complète. Contrôle de non-perte : marqueurs `.page-shell`, `.hazard-stripes`, `.text-shimmer-gold`, `cockpit-theme`, `--cuc-text-muted`, `view-transition`, `cuc-dialog-in`, `.luxury-metric-card` tous présents dans le CSS compilé. **`globals.css` sorti de la dette baseline** (705 → ≤ 300 ✅).

**Validation de fin de vague P0.g.47 (globals.css) :** typecheck OK · **308 tests OK (40 fichiers)** — dont le garde-fou `global-styles.test.ts` étendu (3 cas) · `lint` 0 erreur (78 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 1 → 0 fichier, dette SRP intégralement résorbée**) · `build` 93/93 pages + vérification des marqueurs dans le CSS émis.

**Validation de fin de vague P0.g.39 (MicrocopyView) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 9 → 8 fichiers**) · `build` 93/93 pages · **éditeur de micro-textes hors dette**.

**Validation de fin de vague P0.g.38 (EventsPillarsSection) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 10 → 9 fichiers**) · `build` 93/93 pages · **piliers d'agence hors dette**.

**Validation de fin de vague P0.g.37 (CampusEditorPanel) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 11 → 10 fichiers**) · `build` 93/93 pages · **panneau Studio 3D hors dette**.

**Validation de fin de vague P0.g.36 (campusScene) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 12 → 11 fichiers**) · `build` 93/93 pages · **scène 3D (graphe) hors dette**.

**Validation de fin de vague P0.g.35 (DashboardView) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 13 → 12 fichiers**) · `build` 93/93 pages · **tableau de bord hors dette**.

**Validation de fin de vague P0.g.34 (PartenairesGridSection) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 14 → 13 fichiers**) · `build` 93/93 pages · **grille partenaires hors dette**.

**Validation de fin de vague P0.g.33 (LivePreviewPane) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 15 → 14 fichiers**) · `build` 93/93 pages · **aperçu live hors dette**.

**Validation de fin de vague P0.g.32 (useCampusScene) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 16 → 15 fichiers**) · `build` 93/93 pages · **scène 3D (orchestration) hors dette**.

**Validation de fin de vague P0.g.31 (useNavigation) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, mêmes occurrences `any` migrées vers les modules) · `audit:strict` 0 problème (**baseline 17 → 16 fichiers**) · `build` 93/93 pages · **hooks de vitrine hors dette**.

**Validation de fin de vague P0.g.30 (ContentHealthView) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 18 → 17 fichiers**) · `build` 93/93 pages · **diagnostic de santé hors dette**.

**Validation de fin de vague P0.g.29 (PageRevisionsPanel) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 19 → 18 fichiers**) · `build` 93/93 pages · **historique des versions hors dette**.

**Validation de fin de vague P0.g.28 (ApplicationModal) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 20 → 19 fichiers**) · `build` 93/93 pages · **fenêtre de candidature hors dette**.

**Validation de fin de vague P0.g.27 (EventsView) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 21 → 20 fichiers**) · `build` 93/93 pages · **éditeur de prestations hors dette**.

**Validation de fin de vague P0.g.26 (SocialLinksView) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 22 → 21 fichiers**) · `build` 93/93 pages · **éditeur réseaux sociaux hors dette**.

**Validation de fin de vague P0.g.25 (équipe cascadeurs) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 23 → 22 fichiers**) · `build` 93/93 pages · **page équipe hors dette**.

**Validation de fin de vague P0.g.24 (ParallaxHero) :** typecheck OK · 308 tests OK (40 fichiers) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 24 → 23 fichiers**) · `build` 93/93 pages · **hero d'accueil hors dette**.

**Validation de fin de vague P0.g.23 (cockpit-analytics) :** typecheck OK · 308 tests OK (**40 fichiers**) · `lint` 0 erreur (81 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 26 → 24 fichiers**) · `build` 93/93 pages · **moteur analytique hors dette**.

**Validation de fin de vague P0.g.22 (SessionsView) :** typecheck OK · 308 tests OK (37 fichiers) · `lint` 0 erreur (**81 avertissements, −1**) · `audit:strict` 0 problème (**baseline 27 → 26 fichiers**) · `build` 93/93 pages · **`SessionsView` hors dette**.

**Validation de fin de vague P0.g.21 (videos-cascadeur) :** typecheck OK · 308 tests OK (37 fichiers) · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 28 → 27 fichiers**) · `build` 93/93 pages · **page vidéos hors dette**.

**Validation de fin de vague P0.g.20 (content-health) :** typecheck OK · 308 tests OK (37 fichiers) · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 30 → 28 fichiers**) · `build` 93/93 pages · **santé du contenu hors dette**.

**Validation de fin de vague P0.g.19 (CockpitSidebar) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 31 → 30 fichiers**) · `build` 93/93 pages · **`CockpitSidebar` hors dette**.

**Validation de fin de vague P0.g.18 (useCampusGizmo) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 32 → 31 fichiers**) · `build` 93/93 pages · **engine gizmo hors dette**.

**Validation de fin de vague P0.g.17 (useCampusPointerDrag) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 33 → 32 fichiers**) · `build` 93/93 pages · **engine pointeur hors dette**.

**Validation de fin de vague P0.g.16 (AnalyticsView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 34 → 33 fichiers**) · `build` 93/93 pages · **`AnalyticsView` hors dette**.

**Validation de fin de vague P0.g.15 (PreviewEditLayer) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 35 → 34 fichiers**) · `build` 93/93 pages · **PreviewEditLayer hors dette**.

**Validation de fin de vague P0.g.14 (stunt-workshop) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 36 → 35 fichiers**) · `build` 93/93 pages · **page stunt-workshop hors dette**.

**Validation de fin de vague P0.g.13 (design system) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 37 → 36 fichiers**) · `build` 93/93 pages · **design system hors dette**.

**Validation de fin de vague P0.g.12 (NavigationView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 38 → 37 fichiers**) · `build` 93/93 pages · **`NavigationView` hors dette**.

**Validation de fin de vague P0.g.11 (HomePageEditor) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 39 → 38 fichiers**) · `build` 93/93 pages · **`HomePageEditor` hors dette**.

**Validation de fin de vague P0.g.10 (AuditLogView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (82 avertissements, −1) · `audit:strict` 0 problème (**baseline 40 → 39 fichiers**) · `build` 93/93 pages · **`AuditLogView` hors dette**.

**Validation de fin de vague P0.g.9 (FooterView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (83 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 41 → 40 fichiers**) · `build` 93/93 pages · **`FooterView` hors dette**.

**Validation de fin de vague P0.g.8 (CampusZonesView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (83 avertissements, aucun ajout) · `audit:strict` 0 problème (**baseline 42 → 41 fichiers**) · `build` 93/93 pages · **`CampusZonesView` hors dette**.

**Validation de fin de vague P0.g.7 (SettingsView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (83 avertissements, −2) · `audit:strict` 0 problème (**baseline 43 → 42 fichiers**) · `build` 93/93 pages · **`SettingsView` hors dette**.

**Validation de fin de vague P0.g.6 (CommandPalette) :** typecheck OK · 308 tests OK · `lint` 0 erreur (85 avertissements — retour au niveau antérieur) · `audit:strict` 0 problème (**baseline 44 → 43 fichiers**) · `build` 93/93 pages · **`CommandPalette` hors dette**.

**Validation de fin de vague P0.g.5 (CoachDetailClient) :** typecheck OK · 308 tests OK · `lint` 0 erreur · `audit:strict` 0 problème (**baseline 45 → 44 fichiers**) · `build` 93/93 pages · **`CoachDetailClient` hors dette**.

**Validation de fin de vague P0.g.4 (FilmsView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (85 avertissements, −4) · `audit:strict` 0 problème (**baseline 46 → 45 fichiers**) · `build` 93/93 pages · **`FilmsView` hors dette**.

**Validation de fin de vague P0.g.3 (DisciplinesView) :** typecheck OK · 308 tests OK · `lint` 0 erreur (89 avertissements, −4) · `audit:strict` 0 problème (**baseline 47 → 46 fichiers**) · `build` 93/93 pages · **`DisciplinesView` hors dette**.

**Validation de fin de vague P0.g.2 (CampusPlan3D) :** typecheck OK · 308 tests OK · `lint` 0 erreur · `audit:strict` 0 problème (**baseline 48 → 47 fichiers**) · `build` 93/93 pages · **`CampusPlan3D` hors dette**.

**Validation de fin de vague P0.g.1 (PagesEditorView) :** typecheck OK · **308 tests OK** (pointeur du test `preview-url` mis à jour vers `pages-options.ts`) · `lint` 0 erreur · `audit:strict` 0 problème (**baseline 49 → 48 fichiers**) · `build` 93/93 pages · **`PagesEditorView` hors dette**.

**Validation de fin de vague P0.d (modal + hooks + grille) :** typecheck OK · **308 tests OK** · **`lint` : 0 erreur** · `audit:strict` 0 problème (TeamView ≤ 300, hors dette) · `studio:gate` OK · `build` 93/93 pages · `audit:slop` : occurrences uniquement dans `scripts/`.

**Bonus lint — 8 erreurs préexistantes ou induites, toutes corrigées :** `TranslationsView` remis sur le patron async-dans-effet (règle `react-hooks/set-state-in-effect`) ; déps de mémoïsation élargies à `[block]` (`TeamBannersSection`, `TeamProductionGalleries` ×3) ; `UnpublishedPageGate` passé à `useSyncExternalStore` + `next/link` (hydratation identique, 4 tests verts) ; imports morts de `films.ts` retirés après extraction.

---

## 8. Passe du 2026-09-24 — statut vérifié (arbre git propre)

**Gates rejoués ce jour** (les § 4.6 et § 5 ci-dessus, rédigés le 2026-09-22, ne décrivent plus l'état réel) :

| Contrôle | Résultat |
| :--- | :--- |
| `npm run typecheck` | ✅ 0 erreur |
| `npm run lint` | ✅ **0 erreur, 0 avertissement** (les 3 `no-explicit-any` restants sont traités, voir ci-dessous) |
| `npm run test` | ✅ **485 tests / 70 fichiers** |
| `node scripts/audit.mjs` | ✅ 0 problème (liens, ancres, hrefs suspects) — plafond SRP : **0 violation**, baseline `scripts/size-baseline.json` = `{}` |
| `npm run studio:gate:full` | ✅ **Gate OK** — champs, budget, quotas, micro-textes, poids JS par route, typecheck, tests |
| `npm run audit:fields` | ✅ couverture et promesses complètes (15 pages) |
| `npm run audit:microcopy` | ✅ **0 texte codé en dur** (431 éditables : 309 annotés, 107 données, 15 traduction) |
| `npm run audit:slop` | ✅ occurrences limitées aux garde-fous de `scripts/` |

**Hygiène de typage (Lot A du plan de suite)**

- `SitePageSectionsData` : alias **unique et documenté** pour `site_pages.sections_data` (JSON CMS dont la forme varie par page et que 25 sites de lecture exploitent en accès libre). Un seul `eslint-disable` justifié remplace le `any` de contrat, au lieu d'un `any` laissé sans explication.
- `SiteInquiry.metadata` → `SiteInquiryMetadata` : clés CUC Sign réellement utilisées typées (`cuc_sign_student_id`, `cuc_sign_formation_id` nullable, `converted_at`), reste en `unknown`.
- `Instructor.metadata` → `InstructorMetadata` : `film_roles` typé `Record<string, string>`, reste en `unknown`.

**Vague B/C du 2026-09-24 — 9 fichiers résorbés** (tous désormais très en deçà du plafond)

| Fichier | Avant | Après | Découpage |
| :--- | ---: | ---: | :--- |
| [`PartnersView.tsx`](src/app/(admin)/admin/components/PartnersView.tsx:1) | 300 | **65** | `partners-view/**` (modèle, hook, 5 blocs) |
| [`FilmDetailsModal.tsx`](src/components/sections/hall-of-fame/FilmDetailsModal.tsx:1) | 297 | **109** | `film-details/**` (rôle pur, hook, 5 blocs) |
| [`VisiteFacilitiesDetail.tsx`](src/components/sections/visite/VisiteFacilitiesDetail.tsx:1) | 295 | **45** | `visite/facilities/**` (modèle, hook, 3 blocs) |
| [`EditorCoordinateInputs.tsx`](src/components/3d/ui/EditorCoordinateInputs.tsx:1) | 294 | **45** | `ui/editor-coordinates/**` (axes déclaratifs, 3 blocs) |
| [`useInstagramMonitor.ts`](src/app/(admin)/admin/components/instagram-monitor/useInstagramMonitor.ts:1) | 290 | **22** | `instagram-monitor/**` (modèle + 2 hooks) |
| [`preview-protocol-core.ts`](src/lib/preview/preview-protocol-core.ts:1) | 287 | **48** | `preview/protocol/**` (canaux, messages, fabriques) |
| [`team-building-cascades/page.tsx`](src/app/(site)/[locale]/team-building-cascades/page.tsx:1) | 283 | **43** | `sections/**` (copie, hook, 4 blocs) |
| [`traffic-data.ts`](src/lib/traffic/traffic-data.ts:1) | 283 | **21** | `lib/traffic/**` (6 modules purs) |
| [`VideosPageEditor.tsx`](src/app/(admin)/admin/components/pages-editor/VideosPageEditor.tsx:1) | 282 | **63** | `pages-editor/videos-page/**` (modèle, hook, 2 blocs) |

**Dette SRP résiduelle** (aucune violation : tout est sous le plafond dur de 300 ; ces fichiers ne sont plus que les plus proches de la cible douce de 150-200)

| Fichier | Lignes | Nature |
| :--- | ---: | :--- |
| [`home-blocks.ts`](src/app/(admin)/admin/components/pages-editor/home-page/home-blocks.ts:1) | 282 | schéma déclaratif — **conservé** (lu verbatim par `audit:fields`) |
| [`admin/actions/campus.ts`](src/app/(admin)/admin/actions/campus.ts:1) | 281 | Server Actions (studio 3D) |
| [`PagesEditorView.tsx`](src/app/(admin)/admin/components/PagesEditorView.tsx:1) | 278 | façade d'édition de pages |
| [`usePageDynamicContent.ts`](src/lib/hooks/usePageDynamicContent.ts:1) | 277 | hook de contenu vitrine |
| [`useVideosPage.ts`](src/app/(site)/[locale]/videos-cascadeur/sections/useVideosPage.ts:1) | 276 | hook de page vitrine |
| [`PreviewBridgeClient.tsx`](src/components/preview/PreviewBridgeClient.tsx:1) | 276 | pont d'aperçu (vitrine) |
| [`UsersRolesView.tsx`](src/app/(admin)/admin/components/UsersRolesView.tsx:1) | 272 | onglet Cockpit |
| [`ContactForm.tsx`](src/components/sections/contact/ContactForm.tsx:1) | 271 | formulaire de contact |

**Outils corrigés au passage** (un découpage ne doit jamais rendre un contrôle muet) : `audit:fields` lit désormais `CUC_FIELD_KINDS` dans le module qui le **déclare** (et non dans la façade de ré-export) ; `audit:microcopy` filtre le bruit de code (`ReturnType<…>`, appel de fonction isolé, `{' '}` de mise en page).

**Correctif fonctionnel de la même passe** : la corbeille du panneau détail de la médiathèque supprime **au premier clic** (cibles explicites, modèle pur `src/lib/media-library/media-selection.ts`) — le quirk hérité documenté en § 7 (P0.f) est soldé.

Pilotage et jalons : [`plans/plan-reste-a-faire-2026-09-24.md`](plans/plan-reste-a-faire-2026-09-24.md:1) (journal + écarts au plan assumés).
