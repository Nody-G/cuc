# Revue — Contact multi-projets, pipelines & blocs de pages

**Date :** 2026-09-29
**Périmètre :** page Contact du Cockpit, bug de saisie du curseur, éditeur de pages vitrine
**Doctrine :** SRP (`AGENTS.md` § 1-2), interconnexion CUC Sign (`cuc_sign_interconnection.md`), aucune écriture avalée ni chiffre inventé (`durability_health.md` § 8)

---

## 1. Constat de départ

| Signalement | Réalité constatée |
| :--- | :--- |
| « Contact trop tourné vers la formation, avec des admis ou des refusés » | Le sélecteur portait déjà 9 intentions (dont `tournage-production`, `cuc-events`), mais **un seul vocabulaire d'étapes** : `nouveau · en_cours · admis · refuse · archive` ([`types.ts`](../src/lib/data/site/types.ts:228)). Checklist et bouton « Créer le compte CUC Sign » étaient figés sur l'admission formation. |
| « Pour la longue durée, il faut passer par une session découverte de 2 semaines » | Le tunnel existait **éditorialement** (Formule Découverte 12 j « verdict d'admission », cursus pro exigeant la Découverte validée — [`programs.ts`](../src/data/programs.ts:75)) mais **aucune étape** ne le matérialisait dans le Cockpit. |
| « Impossible de modifier le milieu d'une barre de texte » | Quatre champs normalisaient la valeur **à chaque frappe** (`split(',')` → `trim` → `join`), ce qui faisait réécrire l'`<input>` par React et replaçait le curseur en fin de champ. |
| « Plus de pages que dans le header ; on dirait des blocs » | La liste était **codée en dur** (15 entrées — [`pages-options.ts`](../src/app/(admin)/admin/components/pages-editor/pages-options.ts:10)) alors que le header expose 9 entrées principales. Et `layout_sections` n'est lu que par **7 pages** : ailleurs, le gestionnaire de blocs s'affichait sans effet. |
| « Pouvoir ajouter/supprimer/réagencer des blocs » | Réordonnancement et visibilité existaient ; **l'ajout d'un bloc retiré n'existait pas**. |

---

## 2. Décisions

### 2.1 Contacts : un **pipeline** par projet, une **étape** par dossier

- Catalogue unique : `formation`, `production`, `evenement`, `presse` — chacun avec ses étapes, sa checklist et son vocabulaire ([`pipelines.ts`](../src/lib/inquiries/pipelines.ts:1)).
- **Stockage sans migration** : l'étape vit dans la colonne `site_inquiries.status` (TEXT, sans contrainte SQL) et le pipeline dans `metadata.pipeline` (défaut `formation` pour les dossiers existants). `site_inquiries` est partagée avec CUC Sign : aucune altération de schéma.
- Les anciens statuts sont résolus vers les étapes courantes (`nouveau → recue`, `en_cours → qualification`, `admis → admis`, …).

### 2.2 Verrou Découverte → Cursus Pro

L'étape `admis` (cursus long) est **inatteignable** tant que `metadata.discovery_verdict` n'est pas `favorable`. Le refus vient du serveur ; toute autre correction de dossier reste permise (une équipe doit pouvoir rattraper une saisie).

### 2.3 Re-catégorisation

Un dossier classé dans le mauvais projet est déplaçable : il repart à la **première étape** du pipeline cible, et le motif — obligatoire — est conservé dans `metadata.reclassifications` (borné à 20 entrées).

### 2.4 Bug du curseur : ne jamais réécrire la saisie

[`CommaListField`](../src/app/(admin)/admin/components/ui/CommaListField.tsx:1) est **non contrôlé** : la frappe met à jour le parent sans que React réécrive le champ ; la forme canonique n'est appliquée qu'au **blur**. Le domaine pur est isolé dans [`comma-list.ts`](../src/lib/comma-list.ts:1) (4 champs corrigés : équipements, spécialités coach, doublures coach, doublures film).

### 2.5 Pages et blocs : dire la vérité

- La liste des pages se dérive des **pages réellement en base**, groupées « Pages du menu principal » / « Autres pages (hors menu) » ([`page-options.ts`](../src/lib/data/site/page-options.ts:1)).
- Le gestionnaire de blocs n'est proposé que sur les pages qui appliquent `layout_sections` (`BLOCK_STRUCTURE_PAGES`, vérifié dans le code des routes) ; ailleurs, un message l'explique au lieu d'afficher un réglage inerte.
- Un bloc retiré de l'agencement peut être **réintégré** depuis le catalogue de la page.

### 2.6 Mesure honnête

Le **taux d'admission** est restreint au pipeline Formation ([`inquiry-metrics.ts`](../src/lib/cockpit-analytics/inquiry-metrics.ts:1)) : un tournage n'est ni admis ni refusé. Les décompositions par étape se lisent désormais dans le catalogue des pipelines, plus dans une liste de statuts codée en dur.

---

## 3. Fichiers principaux

**Domaine**
`src/lib/inquiries/pipelines.ts` · `inquiry-stats.ts` · `reclassify.ts` · `src/lib/comma-list.ts` · `src/lib/data/site/page-options.ts`
**Actions serveur**
`src/app/(admin)/admin/actions/inquiries-pipeline.ts` (`updateInquiryStage`, `reclassifyInquiry`, `setDiscoveryVerdict`) · `inquiries-mutations.ts` (mutations + audit mutualisés) · `inquiries-mirror.ts` (`findInquiryRow`) · `inquiries.ts`
**Orchestration & UI Cockpit**
`useInquiriesData` · `useInquiryFilters` · `InquiryStatusBadge` · `InquiryListToolbar` · `InquiryRow` · `InquiryList` · `InquiryDetailModal` · `InquiryChecklistSection` · `InquiryReclassifySection` · `InquiriesView`
**Éditeur de pages**
`PagesEditorView` · `PageEditorTopBar` · `LayoutTabPanel` · `PageLayoutManager`
**UI partagée**
`src/app/(admin)/admin/components/ui/CommaListField.tsx`

---

## 4. Gate qualité

| Contrôle | Résultat |
| :--- | :--- |
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ exit 0 — 0 erreur, 8 avertissements préexistants |
| Tests ciblés | ✅ **70 tests** (pipelines 11, re-catégorisation 7, comptages 6, options de pages 8, comma-list 10, CommaListField 3, analytics 25) |
| `npm run build` | ✅ exit 0 — 128 pages générées |
| Plafond 300 lignes | voir le contrôle de fin de chantier (`node -e` sur les modules créés) |

Dette préexistante inchangée : 4 suites échouent à l'import dès la base propre (`instagram-feed`, `inquiries-fetch`, `film-doublings-domain`, `film-filters-domain`) — constat déjà documenté dans [`revue-comptes-acces-cockpit.md`](revue-comptes-acces-cockpit.md:1).

---

## 5. Reste à faire (non silencieux)

1. **Modèles email par pipeline** : [`templates.ts`](../src/app/(admin)/admin/components/inquiries/templates.ts:1) reste orienté admission ; ajouter les modèles Production (devis), Événementiel (devis) et Presse (réponse), et filtrer par pipeline.
2. **Analytique par pipeline** : `byPipeline` est calculé mais pas encore affiché ; l'entonnoir reste formation-centré (il l'est désormais explicitement). Prévoir un entonnoir Découverte → Cursus Pro dédié.
3. **Blocs libres** : insérer un bloc *arbitraire* (au-delà du catalogue de la page) exige d'étendre les renderers de la vitrine ; hors périmètre, à chiffrer avant promesse.
4. **Recette manuelle** : déplacer un dossier d'un pipeline à l'autre, tenter « Admis » sans verdict Découverte (doit être refusé), puis avec verdict favorable (doit passer).

---

## 6. Règle ajoutée au projet

**Un vocabulaire d'étapes appartient à son pipeline, jamais à la page qui l'affiche.** Toute nouvelle catégorie de demande (casting, location de plateau, formation continue…) s'ajoute dans `PIPELINE_CATALOG` — elle hérite automatiquement de la file, des filtres, des compteurs, du badge et du journal.

---

## 7. Candidature répétée & mémoire de la personne

Deux cas réels, traités sans créer de faux élèves :

1. **Un candidat recalé re-postule.** Chaque passage crée un **nouveau dossier** (on ne rouvre jamais l'ancien : la chronologie reste vraie), mais la personne est reconnue par son email : la liste l'étiquette *« Ancien candidat · n dossiers »* et la fiche affiche un bloc **« Candidatures antérieures »** (dates, nature de la demande, décision rendue).
2. **Une session Découverte suivie sans suite.** Le verdict est déjà sur le dossier ; il est désormais mémorisé **au niveau de la personne** (`discoveryNotRetained`), donc il survit à la clôture et réapparaît si elle candidate à nouveau.

**Aucun stockage supplémentaire côté vitrine** : l'historique est *dérivé* des dossiers déjà conservés (table `site_inquiries` + miroir), regroupés par email normalisé (`applicant-history.ts`). Rien à synchroniser, rien à désynchroniser.

### La règle qui tranche : participation ⇒ profil CUC Sign

**Décision client (2026-09-29) : dès qu'une personne participe à un stage ou à une formation, elle doit avoir son profil dans CUC Sign.**

- Le catalogue marque les étapes de **participation** du parcours Formation (`decouverte_planifiee`, `decouverte_en_cours`, `decouverte_validée`, `admis`).
- `updateInquiryStage` **refuse** ces étapes tant qu'aucun profil CUC Sign n'existe pour l'email, avec un message qui renvoie au bouton « Créer le compte CUC Sign ». Le profil n'est jamais créé silencieusement depuis la vitrine.
- À l'inverse, une simple demande de renseignement, un devis de tournage, un événement ou une sollicitation presse **ne créent aucun profil** : pas de faux « élèves », pas de fiche médicale sans objet, et la suppression ultérieure n'est pas un problème à gérer.

### Écriture dans le profil CUC Sign

- `syncApplicantHistoryToProfile(email)` verse l'historique dans **`profiles.applicant_history`** (JSONB) **si un profil existe** ; sinon elle ne fait rien (`synced: false`) — ce n'est pas une erreur.
- Déclencheurs : verdict Découverte, changement d'étape, re-catégorisation, et **juste après une conversion** (le profil vient d'être créé, son passé le suit).
- Si la colonne n'existe pas encore, l'erreur est traduite en message explicite (« appliquez la migration ») — jamais avalée.

### Migration (additive, idempotente)

| Élément | Valeur |
| :--- | :--- |
| SQL | [`scripts/schema_profiles_applicant_history.sql`](../scripts/schema_profiles_applicant_history.sql:1) — une colonne JSONB nullable, aucune contrainte, aucune donnée touchée |
| Application | `npm run db:migrate:applicant-history` (simulation) puis `:write` |
| Preuve | l'applier relève le **nombre de lignes de `profiles` avant/après** et échoue si la colonne manque ou si le compte change |
| **État** | ✅ **appliquée le 2026-09-29** — colonne `applicant_history` présente (`jsonb`), 13 profils intacts avant/après ; réessai à blanc : colonne détectée, `IF NOT EXISTS` sans effet (idempotent) |

### Fichiers

`src/lib/inquiries/applicant-history.ts` (+ 12 tests) · `pipeline-read.ts` (`requiresProfileFor`) · `actions/applicant-history.ts` · `actions/user-guards.ts` (`findProfileIdByEmail`) · `actions/inquiries-pipeline.ts` (garde-fou + synchronisation) · `actions/inquiries-conversion.ts` · `components/inquiries/InquiryApplicantHistorySection.tsx` · `InquiryRow` / `InquiryList` / `InquiriesView` / `InquiryDetailModal`.

**Reste à faire sur ce sujet :** rien de bloquant. À vérifier en recette : refuser une étape de participation sans profil (doit être refusé), puis la même après création du compte CUC Sign (doit passer).
