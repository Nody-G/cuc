# Revue — Traductions EN manquantes (niveau champ)

Généré le 2026-10-01T16:46:03.496Z par [`audit_i18n_completeness.mjs`](scripts/audit_i18n_completeness.mjs:1).

## Synthèse

- Champs éditoriaux FR en base (`site_pages`) : **239**
- Champs couverts en EN : **226**
- **Couverture : 94.6 %** (seuil d'échec : 90 %)
- Pages concernées par au moins un manque : **1**
- Fichiers de composants contenant de la copie FR en dur : **33**

## Deux gisements, deux traitements

| Gisement | Nature | Traitement |
|---|---|---|
| `site_pages` (hero, sections_data) | Donnée éditable | Traduisible dès maintenant via l’overlay `site_translations` (déjà fusionné par `usePageDynamicContent`) |
| Copie en dur dans les `.tsx` | Code | **Non traduisible en l’état** : à déplacer vers la base ou `messages/*.json` |

## Textes identiques par conception (noms propres)

Ces valeurs sont volontairement identiques en FR et EN : noms propres ou termes employés tels quels. Elles ne sont **pas** comptées comme manquantes, et l’exception tombe d’elle-même si le contenu FR change.

| Page | Champ | Valeur | Motif |
|---|---|---|---|
| `/` | `sections_data.about.founder_name` | LUCAS DOLLFUS | nom de personne |
| `/` | `sections_data.partners.badge` | COLLABORATIONS & STUDIOS | terme identique en français et en anglais |
| `/` | `sections_data.qualiopi.afdas_badge` | AFDAS & AFDAS PRO | nom de l'organisme de financement |
| `/` | `sections_data.qualiopi.france_travail_badge` | FRANCE TRAVAIL (AIF) | nom de l'opérateur public |
| `stunt-workshop-cuc` | `meta.meta_title` | International Stunt Workshop \| Campus Univers Cascades | nom de l'événement international |
| `stunt-workshop-cuc` | `hero.title` | INTERNATIONAL STUNT WORKSHOP | nom de l'événement international |
| `team-building-cascades` | `meta.title` | Team Building | terme identique en français et en anglais |
| `team-building-cascades` | `sections_data.workshops[2].title` | Parkour & Yamakasi | discipline désignée par son nom propre |

## Détail par page — champs à traduire

### `videos-cascadeur` — 13/21 champ(s) manquant(s)


| Champ | Valeur FR à traduire |
|---|---|
| `sections_data.reels.items[0].title` | Encore un pare-brise... 🤭 |
| `sections_data.reels.items[0].description` | Encore un pare-brise... 🤭👌 Impact, trajectoire et réception sur pare-brise par les cascadeurs du Campus Univers Cascades. |
| `sections_data.reels.items[1].title` | Concert de PLK au Stade de France |
| `sections_data.reels.items[1].description` | Concert de PLK au Stade de France 🔥 Expérience de folie avec l’équipe de cascadeurs et performers CUC. |
| `sections_data.reels.items[2].title` | Piñata Party 😅 |
| `sections_data.reels.items[2].description` | Piñata Party au campus 😅🥳 Vie du domaine, esprit d’équipe et bonne humeur entre deux entraînements intensifs. |
| `sections_data.reels.items[3].title` | Just Training 🤝 |
| `sections_data.reels.items[3].description` | Just training 🤝😅 Répétitions chorégraphiques de combat scénique et coordination des axes caméra. |
| `sections_data.reels.items[4].title` | Moto 1 - Voiture 0 🤭 |
| `sections_data.reels.items[4].description` | Moto 1 - Voiture 0 🤭👌 Cascade d’action mécanique et impact percutant tourné sur les pistes du campus. |
| `sections_data.reels.items[5].title` | Team CUC — Fight Training ✌️ |
| `sections_data.reels.items[5].description` | Just training ✌️ Session d’entraînement physique et combat au contact avec les membres de la CUC Team. |
| `sections_data.reels.title` | VIDEOS INSTAGRAM |

## Copie FR en dur dans les composants (non traduisible en l’état)

| Fichier | Occurrences détectées |
|---|---|
| `src\components\3d\ui\editor-panel\StudioShortcutsHelp.tsx` | 5 |
| `src\components\i18n\UnpublishedPageGate.test.tsx` | 5 |
| `src\components\ui\InstagramFollowerBadge.tsx` | 5 |
| `src\components\3d\ui\editor-panel\ExportActions.tsx` | 4 |
| `src\components\3d\ui\editor-panel\GizmoToolBar.tsx` | 3 |
| `src\components\3d\ui\editor-panel\SnapAndDragControls.tsx` | 3 |
| `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | 2 |
| `src\components\3d\ui\CampusStudioToolbar.tsx` | 2 |
| `src\components\3d\ui\editor-panel\ObjectSelector.tsx` | 2 |
| `src\components\i18n\UnpublishedPageGate.tsx` | 2 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx` | 1 |
| `src\app\(site)\[locale]\opengraph-image.tsx` | 1 |
| `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopApplyBox.tsx` | 1 |
| `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSection.tsx` | 1 |
| `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSortBar.tsx` | 1 |
| `src\app\global-error.tsx` | 1 |
| `src\components\3d\ui\CampusEditorPanel.tsx` | 1 |
| `src\components\3d\ui\CampusJsonStudioModal.tsx` | 1 |
| `src\components\3d\ui\editor-coordinates\DimensionsBlock.tsx` | 1 |
| `src\components\3d\ui\editor-coordinates\OrientationBlock.tsx` | 1 |
| `src\components\3d\ui\editor-coordinates\PositionBlock.tsx` | 1 |
| `src\components\3d\ui\editor-panel\PanelSaveStatus.tsx` | 1 |
| `src\components\3d\ui\editor-panel\VisibilityActions.tsx` | 1 |
| `src\components\layout\footer-sections\FooterBrandAndSites.tsx` | 1 |
| `src\components\layout\navbar\NavMobileDrawer.tsx` | 1 |
| `src\components\layout\Navbar.tsx` | 1 |
| `src\components\sections\events\spectacles\SpectacleTypeCard.tsx` | 1 |
| `src\components\sections\hall-of-fame\film-details\FilmExternalLinks.tsx` | 1 |
| `src\components\ui\InteractiveCampusMap.tsx` | 1 |
| `src\components\ui\logos\MediaLogos.tsx` | 1 |
| `src\components\ui\parallax-hero\HeroFocalContent.tsx` | 1 |
| `src\components\ui\TacticalButton.test.tsx` | 1 |
| `src\lib\og-image.tsx` | 1 |
