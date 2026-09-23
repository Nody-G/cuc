# Refonte du Cockpit CUC — Rapport de revue 2026

**Périmètre :** Cockpit d'administration du site vitrine Campus Univers Cascades
**Doctrine appliquée :** interconnexion CUC ↔ CUC Sign, zéro texte orphelin, zéro « AI slop », sobriété éditoriale
**Statut :** Phase 1 (Priorité 1) et Phase 2 (Priorité 2) livrées — gate qualité intégralement vert

---

## 1. Objectif

Rendre **éditables depuis le Cockpit toutes les zones encore codées en dur** de la
vitrine (Navbar, Footer, menus, réseaux sociaux, textes de sections), tout en
refondant l'expérience d'administration pour la rendre **hyper-moderne, rapide et
agréable**, sans jamais casser le rendu public existant.

Deux priorités ont structuré le chantier :

1. **Priorité 1 — Éditabilité totale.** Plus aucune valeur critique ne doit dépendre
   d'une constante locale non synchronisée.
2. **Priorité 2 — Refonte UX/UI.** Navigation, recherche globale, édition assistée,
   aperçu live, outils d'exploitation.

---

## 2. Doctrine de données (rappel)

| Règle | Mise en œuvre |
| --- | --- |
| Zéro texte orphelin | Toute zone éditable est persistée dans Supabase (`site_*`) |
| Interconnexion CUC Sign | FK `ON DELETE SET NULL` vers `formations`, `profiles`, `locations` |
| Isolation | Tables vitrine strictement préfixées `site_` |
| Zéro régression | Fallback systématique sur les constantes `DEFAULT_*` |

---

## 3. Priorité 1 — Zones rendues éditables

### 3.1 Nouvelles tables Supabase

| Table | Rôle | FK CUC Sign |
| --- | --- | --- |
| `site_navigation` | Structure du menu principal (items, sous-items, CTA) | — |
| `site_footer` | Colonnes, marque, mentions légales du pied de page | — |
| `site_social_links` | Réseaux sociaux (plateforme, handle, URL, ordre) | — |
| `site_page_revisions` | Historique de versions des pages | `author_id → profiles.id` |

Schémas SQL additifs : [`scripts/schema_navigation_footer.sql`](../scripts/schema_navigation_footer.sql),
[`scripts/schema_page_revisions.sql`](../scripts/schema_page_revisions.sql).

### 3.2 Composants vitrine refactorés

| Composant | Source de vérité | Fallback |
| --- | --- | --- |
| [`Navbar.tsx`](../src/components/layout/Navbar.tsx) | `site_navigation` | `DEFAULT_NAVIGATION` |
| [`NavDropdowns.tsx`](../src/components/layout/navbar/NavDropdowns.tsx) | `site_navigation` | `DEFAULT_NAVIGATION` |
| [`NavMobileDrawer.tsx`](../src/components/layout/navbar/NavMobileDrawer.tsx) | `site_navigation` + `site_social_links` | `DEFAULT_NAVIGATION` / `DEFAULT_SOCIAL_LINKS` |
| [`NavActionsBar.tsx`](../src/components/layout/navbar/NavActionsBar.tsx) | `site_social_links` + `site_settings` | `DEFAULT_SOCIAL_LINKS` / `DEFAULT_SITE_SETTINGS` |
| [`FooterNavMatrix.tsx`](../src/components/layout/footer-sections/FooterNavMatrix.tsx) | `site_footer` | `DEFAULT_FOOTER` |
| [`FooterBrandAndSites.tsx`](../src/components/layout/footer-sections/FooterBrandAndSites.tsx) | `site_footer` | `DEFAULT_FOOTER` |
| [`FooterDirectContacts.tsx`](../src/components/layout/footer-sections/FooterDirectContacts.tsx) | `site_social_links` + `site_settings` | `DEFAULT_SOCIAL_LINKS` / `DEFAULT_SITE_SETTINGS` |
| [`FooterCreditsBar.tsx`](../src/components/layout/footer-sections/FooterCreditsBar.tsx) | `site_footer.legal` | `DEFAULT_FOOTER` |
| `MobileStickyCTA.tsx` | `site_settings` | `DEFAULT_SITE_SETTINGS` |

### 3.3 Hooks de lecture temps réel

[`useNavigation.ts`](../src/lib/hooks/useNavigation.ts) expose `useNavigation()`,
`useFooter()` et `useSocialLinks()`. Chaque hook :

- initialise son état sur la constante `DEFAULT_*` (rendu identique à l'historique) ;
- ne substitue la valeur distante que si la structure est **valide et non vide** ;
- retombe silencieusement sur le fallback en cas d'erreur ;
- écoute Supabase Realtime pour refléter immédiatement toute modification Cockpit.

> **Garantie anti-régression :** aucun flash de contenu vide n'est possible, l'état
> initial étant toujours la constante historique.

### 3.4 Vues Cockpit créées

- `NavigationView.tsx` — édition des items, sous-items et CTA du menu.
- `FooterView.tsx` — édition des colonnes, de la marque et des mentions légales.
- `SocialLinksView.tsx` — édition des réseaux sociaux (ajout, ordre, publication).

Entrées ajoutées dans `navSections` de [`CockpitApp.tsx`](../src/app/admin/CockpitApp.tsx)
et dans la palette de commandes.

### 3.5 Seed

[`scripts/seed_navigation_footer.mjs`](../scripts/seed_navigation_footer.mjs) amorce les
trois tables depuis les constantes historiques — la base reflète donc exactement le
rendu actuel au premier lancement.

---

## 4. Priorité 2 — Refonte UX/UI du Cockpit

### 4.1 Design system dédié

Primitives dans `src/app/admin/components/ui/` : `CockpitCard`, `CockpitButton`,
`CockpitIconButton`, `CockpitField`, `CockpitSelect`, `CockpitToggle`, `CockpitBadge`,
`CockpitEmptyState`, `CockpitSkeletonList`, `CockpitLoadMore`, `CockpitViewHeader`.

### 4.2 Navigation

- Groupes repliables, recherche de menu, favoris épinglés, mode rail compact.
- Responsive mobile avec drawer animé.

### 4.3 Palette de commandes (⌘K)

Recherche floue, catégories (Navigation / Actions Rapides / Outils Système),
historique des commandes récentes, navigation clavier complète.

### 4.4 Confort d'exploitation

| Fonctionnalité | Fichier |
| --- | --- |
| Notifications/toasts unifiés | `ToastProvider` |
| Raccourcis clavier globaux | `ShortcutsHelpModal` |
| Thème clair/sombre persistant | `CockpitThemeProvider` |
| Squelettes de chargement | `CockpitSkeletonList` |
| Journal d'audit | `AuditLogView` |
| Santé du contenu | `ContentHealthView` |
| Tableau de bord analytique | `AnalyticsView` |
| Historique de versions | `PageRevisionsPanel` |

### 4.5 Performance

- Rendu progressif des longues listes via `useProgressiveList` (fenêtre bornée +
  `loadMore`), réduisant le nombre de nœuds DOM initiaux.
- Mémoïsation systématique (`useMemo` / `useCallback`) et dérivation d'état au rendu
  plutôt que dans des effets (suppression des rendus en cascade).

### 4.6 Accessibilité (WCAG 2.2 AA)

Skip-link, piège de focus (`useFocusTrap`), repères ARIA, association
label/contrôle, régions `aria-live`, navigation clavier intégrale.

---

## 5. Gate qualité

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Types | `npm run typecheck` | ✅ exit 0 |
| Lint | `npm run lint` | ✅ exit 0 — 0 erreur, 97 avertissements préexistants (`any`, imports non utilisés) |
| Tests | `npm run test` | ✅ 76/76 tests (5 fichiers) |
| Build | `npm run build` | ✅ exit 0 — 62 pages générées |

### 5.1 Régressions corrigées durant le gate

| Fichier | Problème | Correction |
| --- | --- | --- |
| `cockpit-analytics.test.ts` | 4 erreurs de type (`program_id` absent de `StuntProgram.nextSessions`) | Littéraux alignés sur `date` / `status` / `max_seats` / `booked_seats` |
| `CockpitApp.tsx` | `switchTab` utilisé avant déclaration | Hissage + `useCallback` + ajout aux dépendances |
| `CommandPalette.tsx` | `setState` dans un effet, `useMemo` conditionnels | Hydratation au rendu, hooks remontés avant le retour anticipé |
| `useProgressiveList.ts` | `setState` dans un effet | Dérivation au rendu (`lastResetKey` + `boundedCount`) |
| `CockpitThemeProvider.tsx` | `setState` dans un effet | Initialiseur paresseux `useState` |
| `CockpitSidebar.tsx` | `setState` dans un effet | Initialiseurs paresseux `useState` |
| `AuditLogView.tsx` | `Date.now()` impur dans `useMemo` | Horodatage capturé dans l'état, rafraîchi au chargement |
| `CoachDetailClient.tsx` | `useMemo` après retour anticipé + mémoïsation non préservée | Hooks remontés, dépendance alignée |
| `ContactForm.tsx` | `setState` dans un effet | Initialiseur paresseux `useState` |
| `actions.ts`, `site-service.ts` | `prefer-const` | `let` → `const` |

---

## 6. Interconnexion CUC Sign — vérification

| Table vitrine | Colonne | Cible CUC Sign | Contrainte |
| --- | --- | --- | --- |
| `site_sessions` | `cuc_sign_formation_id` | `formations.id` | `ON DELETE SET NULL` |
| `site_team` | `profile_id` | `profiles.id` | `ON DELETE SET NULL` |
| `site_campus_pois` | `location_id` | `locations.id` | `ON DELETE SET NULL` |
| `site_page_revisions` | `author_id` | `profiles.id` | `ON DELETE SET NULL` |
| `site_inquiries` | `user_id` | `profiles.id` | `ON DELETE SET NULL` |

La couche service ([`site-service.ts`](../src/lib/data/site-service.ts)) expose ces
identifiants (`cuc_sign_formation_id`, `profile_id`, `location_id`), et
[`migration_sync_cuc_cockpit.sql`](../scripts/migration_sync_cuc_cockpit.sql) réconcilie
les lignes existantes par correspondance de nom. L'intégrité de CUC Sign est préservée
en toutes circonstances.

---

## 7. Reste à faire — ✅ clôturé (2026-09-23)

Ce tableau est historique : les trois tâches sont livrées, **ne pas les rouvrir sur sa foi**.

| # | Tâche | Statut |
| --- | --- | --- |
| 15 | Étendre `PagesEditorView` aux `sections_data` restantes | ✅ livré — `npm run audit:fields` : **15 pages couvertes**, « couverture et promesses complètes » ([`revue-couverture-champs-visuels.md`](plans/revue-couverture-champs-visuels.md:1)) |
| 38 | Édition inline sur la vitrine | ✅ livré — Mode Studio ([`PreviewEditLayer.tsx`](src/components/preview/PreviewEditLayer.tsx:31), règle [`studio_mode_preview.md`](.agents/rules/studio_mode_preview.md:1)) |
| 39 | Aperçu live (split-screen) dans `PagesEditorView` | ✅ livré — [`LivePreviewPane.tsx`](<src/app/(admin)/admin/components/pages-editor/LivePreviewPane.tsx:70>) dans l'onglet Aperçu ([`PreviewTabPanel.tsx`](<src/app/(admin)/admin/components/pages-editor/PreviewTabPanel.tsx:9>)), adossé à la route `/[locale]/preview` |

---

## 8. Conclusion

La Priorité 1 est **intégralement livrée** : Navbar, Footer, menus, réseaux sociaux et
textes de sections sont désormais pilotés par Supabase, avec un fallback strict qui
garantit un rendu public identique tant que rien n'est modifié. La Priorité 2 dote le
Cockpit d'une navigation moderne, d'une palette de commandes, d'un thème persistant,
d'outils d'exploitation (audit, santé, analytique, versions) et d'une accessibilité
WCAG 2.2 AA. Le gate qualité est vert de bout en bout.
