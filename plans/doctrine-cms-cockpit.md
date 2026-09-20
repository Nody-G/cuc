# Doctrine CMS du Cockpit CUC

> Document de référence permanent. Toute évolution du Cockpit ou de la vitrine
> doit respecter les règles ci-dessous. Elles découlent des doctrines
> d'architecture, d'éditorial et de vérification d'identité déjà en vigueur.

---

## 1. Principe fondateur : zéro contenu orphelin

**Tout ce qui est modifiable dans le Cockpit est persisté dans Supabase.**
Aucun contenu critique ne doit dépendre uniquement du `localStorage` ou d'une
constante locale sans synchronisation base de données.

Le `localStorage` est réservé **exclusivement aux préférences d'interface** :

| Clé localStorage | Usage | Persistance base |
| --- | --- | --- |
| `cuc-cockpit-theme` | Thème clair/sombre | Non (préférence locale) |
| `cuc-cockpit-sidebar-rail` | Sidebar repliée | Non (préférence locale) |
| `cuc-cockpit-nav-collapsed` | Groupes de navigation repliés | Non (préférence locale) |
| `cuc-cockpit-nav-pins` | Favoris épinglés | Non (préférence locale) |
| `cuc-cockpit-recent-commands` | Commandes récentes (⌘K) | Non (préférence locale) |

Tout le reste (sessions, formateurs, disciplines, zones du campus, pages
vitrine, formulaires, candidatures, navigation, pied de page, réseaux sociaux,
paramètres du site) **doit** vivre en base.

---

## 2. Préfixe et isolation

- Les tables du site vitrine et du Cockpit sont **strictement préfixées `site_`**.
- Les clés étrangères vers l'application **CUC Sign** utilisent
  `ON DELETE SET NULL` pour préserver l'intégrité absolue de CUC Sign.
- RLS : lecture publique, écriture réservée aux administrateurs.

### Tables du périmètre CMS

| Table | Rôle | Interconnexion CUC Sign |
| --- | --- | --- |
| `site_navigation` | Structure de la navbar (items, enfants, CTA) | — |
| `site_footer` | Colonnes, liens légaux, marque | — |
| `site_social_links` | Réseaux sociaux | — |
| `site_pages` | Contenu des pages vitrine (`sections_data`) | — |
| `site_page_revisions` | Historique de versions (snapshots JSONB immuables) | — |
| `site_settings` | Paramètres globaux (logo, favicon, meta, CTA) | — |
| `site_team` | Formateurs | `site_team.profile_id` ↔ `profiles.id` |
| `site_films` | Catalogue de films | — |
| `site_sessions` | Sessions de formation | `site_sessions.cuc_sign_formation_id` ↔ `formations.id` |
| `site_disciplines` | Disciplines enseignées | ↔ `evaluation_disciplines` |
| `site_campus_pois` | Points d'intérêt du campus | `site_campus_pois.location_id` ↔ `locations.id` |
| `site_inquiries` | Candidatures et leads | ↔ admissions / futurs `students` / `profiles` |
| `site_audit_logs` | Journal d'audit | — |

---

## 3. Patron de repli (zéro régression)

Chaque service et chaque hook applique le **même patron de repli** :

```
1. Tenter la lecture Supabase.
2. En cas d'absence de données, d'erreur réseau ou de table manquante,
   retourner la constante locale par défaut.
3. Ne jamais lever d'exception qui casserait le rendu de la vitrine.
```

Constantes de repli canoniques :

- `DEFAULT_NAVIGATION` — [`src/data/navigation.ts`](../src/data/navigation.ts)
- `DEFAULT_FOOTER` — [`src/data/navigation.ts`](../src/data/navigation.ts)
- `DEFAULT_SOCIAL_LINKS` — [`src/data/navigation.ts`](../src/data/navigation.ts)
- `DEFAULT_SITE_SETTINGS` — [`src/lib/data/site-service.ts`](../src/lib/data/site-service.ts)
- `DEFAULT_PAGE_CONTENTS` — [`src/lib/data/site-service.ts`](../src/lib/data/site-service.ts)

**Conséquence vérifiable** : tant qu'aucune ligne n'est modifiée en base, la
vitrine publique s'affiche **à l'identique** de l'état codé en dur historique.

---

## 4. Temps réel (Realtime)

Les hooks de lecture s'abonnent aux changements Supabase et rafraîchissent
l'état sans rechargement :

- [`useNavigation()`](../src/lib/hooks/useNavigation.ts) → `site_navigation`
- [`useFooter()`](../src/lib/hooks/useNavigation.ts) → `site_footer`
- [`useSocialLinks()`](../src/lib/hooks/useNavigation.ts) → `site_social_links`

Le Cockpit s'abonne également à `site_inquiries`, `site_team`, `site_films`,
`site_pages`, `site_partners`, `site_events`, `site_settings`, `site_disciplines`
et `site_campus_pois` pour refléter immédiatement toute modification.

---

## 5. Workflow éditorial : brouillon → aperçu → publication

Toute page vitrine suit le cycle suivant :

```
Brouillon (is_published = false)
   │  édition dans PagesEditorView
   ▼
Aperçu (iframe de prévisualisation, sans impact public)
   │  validation
   ▼
Publication (is_published = true)  →  revalidateSite()
```

- La bascule est assurée par `setPagePublishState()` —
  [`src/app/admin/actions.ts`](../src/app/admin/actions.ts).
- Chaque enregistrement crée un **snapshot immuable** dans `site_page_revisions`
  via `createPageRevision()`.
- La restauration passe par `restorePageRevision()` ; le diff est calculé par
  `diffPageSnapshots()`.

---

## 6. Normalisation des titres de crédits

**Un seul normaliseur : `creditTitleKey()`** —
[`src/lib/credit-title.ts`](../src/lib/credit-title.ts).

Il applique, dans l'ordre :

1. Retrait du suffixe d'année finale `(2021)` ou `(2021-2023)`.
2. Suppression des accents (NFD + diacritiques).
3. Minuscules.
4. Ponctuation → espace.
5. Compactage des espaces.

**Ne jamais réimplémenter une clé de titre localement.** Les trois points
d'appel doivent déléguer à ce helper :

- `creditKey()` — [`TeamView.tsx`](../src/app/admin/components/TeamView.tsx)
- `normalizeTitleKey()` — [`CoachDetailClient.tsx`](../src/app/equipe-cascadeurs-pro/[slug]/CoachDetailClient.tsx)
- `normalizeTitle()` / `titleKey()` — [`credit-notability.ts`](../src/lib/credit-notability.ts)

L'appariement crédit ↔ film se fait **toujours** sur le titre normalisé via
`parseCredit(c).title` puis `creditTitleKey(...)`. Jamais de `String.includes()`
sur la chaîne brute `"Titre — Rôle"`.

**Contrôle obligatoire** : `node scripts/verify_featured_matching.mjs [coachId]`
doit retourner un taux d'appariement **non nul**. Un taux de 0 % signale une
régression de normalisation, pas un manque de données.

---

## 7. Une seule liste de crédits dans le Cockpit

Le Cockpit ne sépare **jamais** les crédits en « catalogue » et « hors
catalogue » pour l'étoilage. La liste unique **« Tous les crédits »** (dérivée de
`allCredits`, chaque entrée portant `inCatalogue`) est la seule source
d'affichage : l'étoile est disponible sur **tous** les crédits, y compris ceux
qui ne sont pas encore au catalogue. Un crédit absent peut être créé à la volée
via « Créer la fiche » (recherche sans résultat → `upsertFilm` → ajout immédiat).

---

## 8. Doctrine éditoriale : zéro « AI slop »

1. **Zéro invention ni enflure** : ne jamais inventer de titres de séquences, de
   rôles de doublures, de distinctions ou de partenariats.
2. **Ton factuel et professionnel** : bannir le sensationnalisme et les
   superlatifs creux (*« légendaire »*, *« référence suprême »*, *« élite »*).
   Utiliser un vocabulaire technique sobre (*« Combats et cascades physiques »*,
   *« Câblage en studio »*, *« Cascades de véhicules »*).
3. **Zéro gadget UI creux** : pas de faux badges marketing, pas de points
   clignotants superflus, pas de boutons à rallonge.
4. **Terminologie Parkour** : ne jamais employer l'acronyme *« ADD »* ni
   *« Art du Déplacement »*. Utiliser exclusivement **Parkour**.

---

## 9. Vérification d'identité des coachs

Toute fiche coach est adossée à une **identité IMDb vérifiée**.

- Croiser **au minimum 2 sources indépendantes** avant de figer une identité.
- Le registre canonique est
  [`scripts/lib/coach-registry.mjs`](../scripts/lib/coach-registry.mjs) —
  **seule source de vérité** pour `id`, `name`, `imdbId`, `nameVariants`,
  `discipline`.
- Le slug (`id`) reflète l'**identité réelle** (`michel-bouis`), jamais
  l'identité erronée.
- **Toujours produire un fichier de revue dans `plans/` avant de synchroniser**
  en base.

Pipeline canonique :

```
npm run coaches:scrape:imdb   # collecte brute via l'API GraphQL publique
npm run coaches:curate        # curation (dédoublonnage, tri par notoriété)
npm run coaches:apply         # écrit le fichier de revue
npm run coaches:sync          # synchronise vers Supabase
```

---

## 10. Accessibilité du Cockpit (WCAG 2.2 AA)

- **Lien d'évitement** (`skip-link`) en tête de page → `#cockpit-main`.
- **Repère principal** : `<main id="cockpit-main" tabIndex={-1} aria-label="Contenu du Cockpit">`.
- **Navigation latérale** : `<nav aria-label="Navigation principale du Cockpit">`.
- **Piège de focus** dans toutes les modales via
  [`useFocusTrap()`](../src/app/admin/components/ui/useFocusTrap.ts) —
  focus initial, bouclage Tab/Shift+Tab, restauration du focus, fermeture sur
  Échap (2.1.2 / 2.4.3).
- **Association libellé ↔ contrôle** systématique (`useId`, `aria-describedby`).
- **Régions live** pour les notifications (`role="region"`, `aria-live`).

---

## 11. Design system du Cockpit

Tous les composants d'interface proviennent de
[`src/app/admin/components/ui/`](../src/app/admin/components/ui/) et sont
réexportés par [`index.ts`](../src/app/admin/components/ui/index.ts).

| Primitive | Rôle |
| --- | --- |
| `CockpitViewHeader` | En-tête de vue (`eyebrow`, `icon`, `title`, `description`, `actions`) |
| `CockpitCard` | Conteneur de section |
| `CockpitButton` | Bouton (`variant`, `size`, `icon`, `loading`) |
| `CockpitIconButton` | Bouton icône (`icon`, `label`, `tone`) |
| `CockpitField` | Champ de formulaire libellé |
| `CockpitSelect` | Liste déroulante |
| `CockpitToggle` | Interrupteur accessible |
| `CockpitBadge` | Étiquette (`tone` : neutral/accent/success/warning/danger) |
| `CockpitEmptyState` | État vide soigné |
| `CockpitSkeletonList` | Squelette de chargement |
| `CockpitFormActions` | Barre d'actions de formulaire |
| `CockpitLoadMore` | Pagination progressive (`visibleCount`, `total`, `onLoadMore`) |

**Thème** : appliqué via `data-cockpit-theme` sur `[data-cockpit-root]`, jamais
sur `<html>`, afin de ne jamais affecter la vitrine publique.

**Performance** : rendu progressif des longues listes via
[`useProgressiveList()`](../src/app/admin/components/ui/useProgressiveList.ts)
(nombre borné de nœuds DOM initiaux + `loadMore()` + `resetKey`).

---

## 12. Modules purs et testables

Deux modules de diagnostic sont volontairement **purs** (aucun accès réseau,
aucun effet de bord) et couverts par Vitest :

| Module | Fonction | Tests |
| --- | --- | --- |
| [`cockpit-analytics.ts`](../src/lib/cockpit-analytics.ts) | `analyzeCockpit()` — KPI, tendances, entonnoir, répartitions, pression de remplissage | [`cockpit-analytics.test.ts`](../src/lib/cockpit-analytics.test.ts) |
| [`content-health.ts`](../src/lib/content-health.ts) | `analyzeContentHealth()` — liens cassés, images manquantes, orphelins, SEO | [`content-health.test.ts`](../src/lib/content-health.test.ts) |

**Invariant doctrinal** : aucune valeur n'est inventée. Un jeu de données vide
produit des zéros, jamais des chiffres fictifs.

---

## 13. Édition inline et aperçu live (contrat `data-cuc-field`)

L'aperçu live du Cockpit est un **canal `postMessage`** entre le parent
(Cockpit) et l'iframe (page vitrine réelle). Aucune écriture en base n'est
effectuée : le brouillon est poussé en mémoire.

| Fichier | Rôle |
| --- | --- |
| [`usePreviewBridge.ts`](../src/lib/hooks/usePreviewBridge.ts) | Canal `postMessage` côté Cockpit (`draft`, `ready`, `field-focus`, `field-hover`) |
| [`preview-store.ts`](../src/lib/preview/preview-store.ts) | Store global minimal du brouillon (hors base) |
| [`PreviewBridgeClient.tsx`](../src/components/preview/PreviewBridgeClient.tsx) | Client monté sur la vitrine ; **inerte hors iframe** |
| [`LivePreviewPane.tsx`](../src/app/admin/components/pages-editor/LivePreviewPane.tsx) | Panneau split-screen (appareils, rafraîchir, statut live) |

### Règle de nommage obligatoire

Tout champ éditable d'une section vitrine **doit** porter un attribut
`data-cuc-field` dont la valeur suit **exactement** le chemin de persistance :

```
data-cuc-field="sections_data.<bloc>.<champ>"
```

Exemples : `sections_data.about.title`, `sections_data.qualiopi.badge`,
`sections_data.tournages.cta_text`.

**Invariant doctrinal** : un champ sans `data-cuc-field` est invisible pour
l'édition inline — il viole le principe « zéro contenu orphelin » côté UX.
Inversement, un `data-cuc-field` sans input correspondant dans l'éditeur est un
lien mort.

### Chaîne de résolution

1. Clic sur un élément `[data-cuc-field]` dans l'iframe →
   `PreviewBridgeClient` poste `{ type: 'field-focus', field }`.
2. `usePreviewBridge` relaie au parent → `handlePreviewFieldFocus(field)`
   ([`PagesEditorView.tsx`](../src/app/admin/components/PagesEditorView.tsx)).
3. Le parent cible `[data-cuc-field="<field>"]` via `CSS.escape`, fait défiler,
   focalise, sélectionne, puis applique un surlignage temporaire
   (`data-cuc-field-active`, 1,6 s).

### Synchronisation du brouillon

[`usePageDynamicContent.ts`](../src/lib/hooks/usePageDynamicContent.ts)
s'abonne au `preview-store` : dès qu'un brouillon est poussé, il **prime** sur
le contenu Supabase (fusion via `deepMergeSectionsData`). Hors iframe, le store
est vide et la vitrine publique est strictement inchangée.

---

## 14. Checklist avant toute synchronisation en base

1. Le fichier de revue est écrit dans `plans/`.
2. Le registre canonique (`coach-registry.mjs`) est à jour si une identité change.
3. `npm run typecheck` passe (exit 0).
4. `npm run lint` passe.
5. `npm run test` passe (exit 0).
6. `npm run build` passe.
7. La vitrine publique est vérifiée sans régression.
8. L'interconnexion CUC Sign est vérifiée (`ON DELETE SET NULL` respecté).
