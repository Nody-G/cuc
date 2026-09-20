# Doctrine CMS — Contrat d'édition commun du Cockpit CUC

> Règle permanente. Toute vue du Cockpit doit respecter ce contrat.
> Objectif : **homogénéité** — une capacité disponible dans une vue doit l'être
> dans toutes les vues qui manipulent le même type de donnée.

## 1. Le contrat d'édition commun (6 capacités)

Toute vue Cockpit qui gère une collection éditable doit offrir :

| # | Capacité | Règle |
| --- | ---------- | ------- |
| C1 | **Créer** | Bouton « Ajouter » visible, formulaire vide pré-rempli de valeurs par défaut sûres (`order_index` = `length + 1`, `is_published` = `true`). |
| C2 | **Modifier** | Bouton crayon par ligne → formulaire pré-rempli. |
| C3 | **Supprimer** | Bouton corbeille + confirmation explicite (nom de l'élément dans le message). |
| C4 | **Réordonner** | Champ `order_index` numérique éditable, ou flèches monter/descendre. Jamais d'ordre implicite. |
| C5 | **Publier / Dépublier** | Bascule `is_published` (ou `is_active`) avec état visuel (badge vert « Publié » / ambre « Brouillon »). |
| C6 | **Sélecteur de média** | Tout champ d'URL d'image DOIT avoir un bouton « Médiathèque » ouvrant [`MediaPickerModal`](src/app/admin/components/MediaPickerModal.tsx:22). La saisie manuelle reste possible en repli. |

Capacités transverses obligatoires :

| # | Capacité | Règle |
| --- | ---------- | ------- |
| T1 | **Toast de retour** | Chaque écriture appelle `showToast(...)` avec un message factuel (succès ou échec). Jamais d'écriture silencieuse. |
| T2 | **Persistance Supabase** | Doctrine « Zéro Valeur Orpheline » (AGENTS.md) : aucune donnée critique uniquement en `localStorage`. |
| T3 | **Server Action** | L'écriture passe par une Server Action de [`actions.ts`](src/app/admin/actions.ts:1), jamais par un appel Supabase direct depuis le client. |
| T4 | **Revalidation** | Après écriture, revalider les chemins publics concernés (`revalidateSite`). |

## 2. Matrice d'audit des vues Cockpit

Légende : ✅ présent · ❌ absent · ⚠️ partiel

| Vue | C1 Créer | C2 Modifier | C3 Suppr. | C4 Réord. | C5 Publier | C6 Média | T1 Toast | T2 Supabase |
| ----- | :--------: | :-----------: | :---------: | :---------: | :----------: | :--------: | :--------: | :-----------: |
| [`TeamView`](src/app/admin/components/TeamView.tsx:63) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`FilmsView`](src/app/admin/components/FilmsView.tsx:30) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`PartnersView`](src/app/admin/components/PartnersView.tsx:25) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`EventsView`](src/app/admin/components/EventsView.tsx:1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`DisciplinesView`](src/app/admin/components/DisciplinesView.tsx:1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`PagesEditorView`](src/app/admin/components/PagesEditorView.tsx:54) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`NavigationView`](src/app/admin/components/NavigationView.tsx:1) | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| [`FooterView`](src/app/admin/components/FooterView.tsx:37) | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| [`SocialLinksView`](src/app/admin/components/SocialLinksView.tsx:46) | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| [`AnnouncementsView`](src/app/admin/components/AnnouncementsView.tsx:1) | ✅ | ✅ | — | — | ✅ | — | ✅ | ✅ |
| [`CampusZonesView`](src/app/admin/components/CampusZonesView.tsx:23) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [`SessionsView`](src/app/admin/components/SessionsView.tsx:1) | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | ✅ |
| [`InquiriesView`](src/app/admin/components/InquiriesView.tsx:1) | — | ✅ | ✅ | — | — | — | ✅ | ✅ |
| [`SettingsView`](src/app/admin/components/SettingsView.tsx:17) | — | ✅ | — | — | — | ❌ | ✅ | ✅ |
| [`MediaLibraryView`](src/app/admin/components/MediaLibraryView.tsx:29) | ✅ | — | ✅ | — | — | — | ✅ | ✅ |

## 3. Manques identifiés (par priorité)

### 3.1 `CampusZonesView` — ✅ COMBLÉ

| manque | résolution |
| -------- | -------- |
| **C6 Média** | Champ `image_url` + bouton « Médiathèque » (`MediaPickerModal`) + vignette de prévisualisation dans le formulaire et sur la carte. |
| **C5 Publier** | Bascule `is_active` (badge « Publié » / « Brouillon ») dans le formulaire et sur la carte. |
| **C4 Réordonner** | Champ `order_index` numérique éditable ; tri de la grille et du radar par `order_index`. |
| **T2 Supabase** | Écriture `localStorage` (`cuc_campus_pois`) **supprimée** de `handleSave` et `handleDelete` — Supabase est l'unique source de vérité. |

Propagation complétée : `POI` (`image_url`, `order_index`), `upsertCampusPOI`
(colonnes `image_url`, `order_index`), `getCampusPOIs` (lecture + tri).

### 3.2 `SettingsView` — ✅ CONFORME (audit initial erroné)

`SettingsView` ne contient **aucun** champ `og_image` : il gère l'identité du
campus, les certifications, les CTA et les contacts. Le champ `og_image` vit dans
[`PagesEditorView`](src/app/admin/components/PagesEditorView.tsx:746) et
[`HeroSeoEditor`](src/app/admin/components/pages-editor/HeroSeoEditor.tsx:92),
qui disposent **tous deux** du bouton Médiathèque. Aucun manque.

### 3.3 `AnnouncementsView` — pas de suppression ni de réordonnancement (priorité basse)

Une annonce ne peut être ni supprimée ni ordonnée. Acceptable si le modèle
`site_announcements` est mono-ligne (une seule annonce active), à confirmer.

### 3.4 Vues sans média — légitime

`NavigationView`, `FooterView`, `SocialLinksView`, `SessionsView`, `InquiriesView`
ne manipulent aucune URL d'image : l'absence de C6 est **conforme**, pas un manque.

## 4. Plan de comblement

| ordre | cible | action | état |
| ------- | ------- | -------- | ----- |
| 1 | `CampusZonesView` | Ajouter C6 (bouton Médiathèque + champ `image_url`), C5 (`is_active`), C4 (`order_index`) ; retirer l'écriture `localStorage` redondante. | ✅ Fait |
| 2 | `SettingsView` | Ajouter le bouton Médiathèque sur `og_image`. | ✅ Sans objet (champ absent) |
| 3 | `AnnouncementsView` | Ajouter la suppression si le modèle le permet. | ⏳ À confirmer |

## 5. Vérification

Après comblement, la matrice §2 ne doit plus contenir de ❌ sur les colonnes
C1–C6 pour les vues qui manipulent le type de donnée concerné. Les ❌ restants
doivent être justifiés par la nature de la vue (cf. §3.4).
