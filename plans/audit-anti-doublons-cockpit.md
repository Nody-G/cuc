# Audit anti-doublons & cohérence du Cockpit CUC

**Date :** 2026-09-20
**Périmètre :** `src/app/admin/**`, `src/lib/data/site-service.ts`
**Objectif :** garantir une source de vérité unique par réglage, un routage
cohérent et une expérience stable pour tous les opérateurs du Cockpit.

---

## 1. Méthode

1. Inventaire exhaustif des vues du Cockpit et de leurs points d'entrée
   (sidebar, header, palette de commandes, tableau de bord).
2. Recherche croisée des réglages écrits depuis plusieurs endroits.
3. Vérification de la cohérence du routage (deep-linking, Précédent/Suivant).
4. Comparaison des vues potentiellement redondantes (santé, analytique).
5. Correction, puis validation par la porte qualité complète.

---

## 2. Doublon confirmé et corrigé — Réseaux Sociaux

### Constat

Les liens de réseaux sociaux étaient éditables depuis **deux endroits** :

| Emplacement | Stockage | Statut |
| --- | --- | --- |
| `SettingsView` (onglet « Réseaux Sociaux ») | `site_settings` clé `general` → champs `instagram`, `youtube`, `linkedin`, `facebook`, `tiktok`, `footer_copyright` | **Orphelin** |
| `SocialLinksView` (onglet « Réseaux Sociaux ») | table `site_social_links` | **Canonique** |

La vitrine publique ne lit **que** `useSocialLinks()` (table `site_social_links`).
Les champs `settings.*` n'étaient référencés nulle part ailleurs que dans
`SettingsView` : toute saisie y était silencieusement perdue.

### Correction

- `SettingsView` : la section dupliquée est remplacée par un **panneau de renvoi**
  vers les éditeurs canoniques (boutons « Éditer les réseaux sociaux » →
  onglet `social`, « Éditer le pied de page » → onglet `footer`).
- Nouvelle prop `onNavigateToTab?: (tab: 'social' | 'footer') => void`, branchée
  sur `switchTab` depuis `CockpitApp`.
- `SiteSettings` : suppression des champs morts `instagram`, `youtube`,
  `linkedin`, `facebook`, `tiktok`, `footer_copyright`, remplacés par un
  commentaire explicatif pointant vers les tables canoniques.
- `DEFAULT_SITE_SETTINGS` : suppression des valeurs par défaut correspondantes.

---

## 3. Incohérence confirmée et corrigée — Routage des onglets

### Constat

`getTabFromPath()` et `handlePopState()` ne couvraient qu'un **sous-ensemble**
des 20 onglets. Les onglets `navigation`, `footer`, `social`, `disciplines`,
`campus`, `audit`, `health` et `analytics` étaient absents :

- un rafraîchissement direct sur `/admin/navigation` retombait sur le tableau de bord ;
- le bouton Précédent/Suivant du navigateur ne restaurait pas ces vues ;
- deux listes de correspondance maintenues en parallèle, donc divergentes par construction.

### Correction

Introduction d'une **source de vérité unique** dans `CockpitApp.tsx` :

```ts
const TAB_ROUTES: ReadonlyArray<{ tab: TabType; segment: string }> = [ /* 19 entrées */ ];

function resolveTabFromPath(path: string): TabType | null {
  const match = TAB_ROUTES.find(({ segment }) => path.includes(`/${segment}`));
  return match ? match.tab : null;
}
```

`getTabFromPath()` et `handlePopState()` délèguent désormais tous deux à
`resolveTabFromPath()`. Ajouter une vue ne demande plus qu'une seule ligne.

---

## 4. Incohérence corrigée — Numérotation des commentaires

Le switch de rendu de `CockpitApp` comportait des numéros erronés
(« 5. BANDEAU FLASH » après « 6. FILMOGRAPHIE », suffixes « 11 bis/ter/quater »).
Les 20 blocs sont renumérotés séquentiellement (1 → 20) dans l'ordre réel de rendu.

---

## 5. Vérifications : pas de doublon réel

### `ContentHealthView` vs `SystemHealthModal` — **complémentaires**

- `ContentHealthView` : diagnostic de **qualité éditoriale** (contenus orphelins,
  liens cassés, images manquantes, score de complétude).
- `SystemHealthModal` : moniteur d'**infrastructure** (base de données, flux
  Realtime, revalidation du cache).
Aucun chevauchement fonctionnel : l'un audite le contenu, l'autre le système.

### `AnalyticsView` vs `DashboardView` — **complémentaires**

- `DashboardView` : vue opérationnelle de pilotage quotidien (compteurs, raccourcis).
- `AnalyticsView` : rapport analytique approfondi (tunnel de conversion, KPI,
  pression sur les sessions, export CSV).
Deux niveaux de lecture distincts, tous deux légitimes.

### `BackupRestoreModal` — **convenance assumée**

Accessible depuis la sidebar, le header, la palette de commandes et le tableau de
bord. Quatre points d'entrée vers une même modale : redondance d'accès
intentionnelle, pas un défaut.

---

## 6. Validation

| Contrôle | Résultat |
| --- | --- |
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ 0 erreur (96 avertissements préexistants) |
| `npm run test` | ✅ 76/76 |
| `npm run build` | ✅ 62 pages générées |

---

## 7. Règle permanente

> **Un réglage = une source de vérité.**
> Si un contenu est piloté par une table dédiée (`site_social_links`,
> `site_footer`, `site_navigation`), aucun autre écran ne doit proposer de le
> modifier. Un écran secondaire doit **renvoyer** vers l'éditeur canonique.
