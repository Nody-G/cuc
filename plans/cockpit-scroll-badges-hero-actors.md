# Plan — Cockpit plein écran, badges, HUD du hero, fiches acteurs

## Objectif

1. Les pages du Cockpit ne doivent plus être tronquées par une hauteur de bloc imposée : le défilement doit se faire au niveau de la fenêtre (« page la plus grande possible »).
2. Supprimer les badges inutiles du Cockpit (« Syncing », « Live » et pastilles décoratives).
3. Supprimer les deux textes en haut de la page d'accueil (« Hauts-de-France • Domaine privé » et « Le Cateau-Cambrésis »).
4. Retirer le petit icône double flèche jaune sur les fiches acteurs et afficher une très courte description sur chaque carte.

## Décisions validées

- Défilement au niveau de la fenêtre, avec barre supérieure et barre latérale **collantes** (`sticky`).
- Suppression des badges : `Realtime` / `Syncing`, `Live` / `Connexion…`, et toutes les pastilles purement décoratives.
- Hero : suppression de toute la ligne HUD (Hauts-de-France / Domaine privé) et du libellé de la pilule Maps ; on conserve la pilule Maps **en icône seule** (épingle).
- Description acteur : **dérivée de la biographie existante** (`bio`), sans rédaction de contenu nouveau.

---

## 1. Défilement au niveau de la fenêtre

Cause actuelle : la coquille du Cockpit est figée à la hauteur de l'écran, et le défilement vit dans un conteneur centré et encadré (`max-w-7xl mx-auto`), donc la zone hors du bloc ne réagit pas à la molette.

| Fichier | Modification |
| :--- | :--- |
| [`CockpitApp.tsx`](src/app/(admin)/admin/CockpitApp.tsx:107) | Colonne de contenu : `h-screen overflow-hidden` → flux naturel (`min-h-screen`, suppression de `overflow-hidden`). |
| [`CockpitTabContent.tsx`](src/app/(admin)/admin/cockpit/CockpitTabContent.tsx:67) | `<main>` : suppression de `overflow-y-auto` et de `flex-1` figé ; conservation de la largeur canonique et du padding. |
| [`CockpitTopbar.tsx`](src/app/(admin)/admin/cockpit/CockpitTopbar.tsx:39) | En-tête en `sticky top-0` (z-index conservé) pour rester visible pendant le défilement. |
| [`SidebarShell.tsx`](src/app/(admin)/admin/components/cockpit-sidebar/SidebarShell.tsx:20) | Barre latérale desktop : `sticky top-0 h-screen` ; la liste garde son propre défilement interne ([`SidebarNav.tsx`](src/app/(admin)/admin/components/cockpit-sidebar/SidebarNav.tsx:103)). |

Justification : le défilement revient au document ; plus aucune marge morte autour du contenu ne peut bloquer la molette. Les volets qui ont un défilement métier (aperçu Studio, médiathèque, plan 3D) conservent leurs conteneurs internes.

## 2. Suppression des badges

| Fichier | Élément retiré |
| :--- | :--- |
| [`SidebarHeader.tsx`](src/app/(admin)/admin/components/cockpit-sidebar/SidebarHeader.tsx:44) | Pilule `Realtime` / `Syncing` (+ pastille `animate-pulse`). |
| [`PreviewToolbar.tsx`](src/app/(admin)/admin/components/pages-editor/live-preview-pane/PreviewToolbar.tsx:69) | Pilule `Live` / `Connexion…`. |
| [`CockpitTopbar.tsx`](src/app/(admin)/admin/cockpit/CockpitTopbar.tsx:92) | Pastille verte décorative à côté de « Système ». |
| [`DashboardActivityLog.tsx`](src/app/(admin)/admin/components/dashboard-view/DashboardActivityLog.tsx:18) | Mention `Temps réel`. |
| [`DashboardView.tsx`](src/app/(admin)/admin/components/DashboardView.tsx:76) | Pastille `N new` (le compteur reste affiché). |
| [`DashboardView.tsx`](src/app/(admin)/admin/components/DashboardView.tsx:94) | Pastille `Certifié` (la valeur reste affichée). |
| [`UserRoleRow.tsx`](src/app/(admin)/admin/components/users-view/UserRoleRow.tsx:50) | Badges `Vous` et `Actif` / `Inactif` (l'état reste piloté par le bouton d'activation). |
| [`TrafficKpiOverview.tsx`](src/app/(admin)/admin/components/traffic-monitor/TrafficKpiOverview.tsx:68) | Animation `ping` + icône `Radio` + libellé clignotant `En Direct` (remplacés par un libellé statique). |
| [`TrafficMonitorView.tsx`](src/app/(admin)/admin/components/TrafficMonitorView.tsx:95) | Pastille verte `animate-pulse` de l'encart hébergement. |

À conserver (porteurs d'information) : scores de santé, statuts de révision, rôles, statuts de pipeline candidatures, sévérités, badges de type de média.

Nettoyage induit : `realtimeStatus` ne sert plus à l'affichage mais reste requis par [`SystemHealthModal`](src/app/(admin)/admin/components/SystemHealthModal.tsx:116) — on retire seulement le passage de prop vers la barre latérale ([`CockpitSidebar`](src/app/(admin)/admin/components/CockpitSidebar.tsx:32), [`sidebar-types.ts`](src/app/(admin)/admin/components/cockpit-sidebar/sidebar-types.ts:21)) et la prop `isReady` devenue inutile dans la barre d'outils d'aperçu.

## 3. Hero de la page d'accueil

| Fichier | Modification |
| :--- | :--- |
| [`HeroHudOverlay.tsx`](src/components/ui/parallax-hero/HeroHudOverlay.tsx:41) | Suppression du bloc localisation + domaine privé ; pilule Maps réduite à l'épingle (icône seule, `title` conservé pour l'accessibilité) ; simplification du conteneur et des imports (`cucReach` / `cucField` / variables de texte). |
| [`HeroHudEditor.tsx`](src/app/(admin)/admin/components/pages-editor/hero-editor/HeroHudEditor.tsx:55) | Suppression des champs Localisation, Nature du domaine et Libellé de la pilule ; conservation du seul champ « cible de la carte ». |
| [`types.ts`](src/lib/data/site/types.ts:63) | Suppression de `hud_location`, `hud_private_domain`, `hud_map_label` (conservation de `hud_map_url`). |
| [`messages/fr.json`](messages/fr.json:550) / [`messages/en.json`](messages/en.json:550) | Suppression des clés `hudLocation`, `hudPrivateDomain`, `hudMapLabel` (conservation de `hudMapTitle`). |
| [`field-reachability.test.ts`](src/lib/preview/field-reachability.test.ts:56) / [`preview-protocol.test.ts`](src/lib/preview/preview-protocol.test.ts:76) | Vérification/actualisation des fixtures qui citent `hero.hud_location`. |

## 4. Fiches acteurs (comédiens doublés)

| Fichier | Modification |
| :--- | :--- |
| [`CelebrityCard.tsx`](src/components/sections/hall-of-fame/CelebrityCard.tsx:78) | Suppression du bloc d'affordance jaune `Maximize2` (+ import). |
| [`CelebrityCard.tsx`](src/components/sections/hall-of-fame/CelebrityCard.tsx:88) | Ajout d'une description courte sous le nom : `stuntSpecialty` (déjà localisé FR/EN) si présent, sinon dérivé de `bio`, limité à deux lignes (`line-clamp-2`) avec hauteur stabilisée pour l'alignement de la grille. |
| Nouveau `src/lib/celebrity-copy.ts` + `src/lib/celebrity-copy.test.ts` | Fonction pure et testée `shortActorDescription({ specialty, bio })` (première phrase, longueur bornée, repli déterministe). Couche domaine, hors cycle de vie UI. |
| [`CelebrityDoublesGallery.tsx`](src/components/sections/hall-of-fame/CelebrityDoublesGallery.tsx:48) | Inchangé sur la donnée (l'overlay `specialty` continue de primer) ; la carte consomme le helper pur. |

Note éditoriale : les biographies sont en français et déjà affichées telles quelles dans la fiche détaillée ([`CelebrityDetailsModal.tsx`](src/components/sections/hall-of-fame/CelebrityDetailsModal.tsx:127)). Aucune paraphrase n'est inventée : on réutilise le texte vérifié, tronqué proprement.

## 5. Vérifications

- `npm run typecheck`, `npm run lint`, `npm test`.
- `npm run i18n:verify:texts` (les clés de surcouche supprimées ne doivent plus être attendues) et `npm run audit:microcopy`.
- Contrôle manuel, en clair et en sombre, largeur étroite et large : Comptes & Accès, Équipe & Coachs, Filmographie, Candidatures, Trafic, Éditeur de pages (Studio + aperçu), Campus 3D.
- Contrôle du hero d'accueil (FR/EN) et de la grille des comédiens doublés.
