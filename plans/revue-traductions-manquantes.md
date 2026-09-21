# Revue — Traductions EN manquantes (niveau champ)

Généré le 2026-09-21T18:25:18.749Z par [`audit_i18n_completeness.mjs`](scripts/audit_i18n_completeness.mjs:1).

## Synthèse

- Champs éditoriaux FR en base (`site_pages`) : **225**
- Champs couverts en EN : **225**
- **Couverture : 100 %** (seuil d'échec : 90 %)
- Pages concernées par au moins un manque : **0**
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
| `/` | `hero.title` | CAMPUS UNIVERS CASCADES | nom de la marque |
| `/` | `sections_data.about.founder_name` | LUCAS DOLLFUS | nom de personne |
| `/` | `sections_data.partners.badge` | COLLABORATIONS & STUDIOS | terme identique en français et en anglais |
| `/` | `sections_data.qualiopi.afdas_badge` | AFDAS & AFDAS PRO | nom de l'organisme de financement |
| `/` | `sections_data.qualiopi.france_travail_badge` | FRANCE TRAVAIL (AIF) | nom de l'opérateur public |
| `contact-cuc` | `hero.badge` | CONTACT & ADMISSIONS | terme identique en français et en anglais |
| `stunt-workshop-cuc` | `meta.meta_title` | International Stunt Workshop \| Campus Univers Cascades | nom de l'événement international |
| `stunt-workshop-cuc` | `hero.title` | INTERNATIONAL STUNT WORKSHOP | nom de l'événement international |
| `team-building-cascades` | `meta.title` | Team Building | terme identique en français et en anglais |
| `team-building-cascades` | `sections_data.workshops[2].title` | Parkour & Yamakasi | discipline désignée par son nom propre |

## Détail par page — champs à traduire

## Copie FR en dur dans les composants (non traduisible en l’état)

| Fichier | Occurrences détectées |
|---|---|
| `src\components\3d\ui\CampusEditorPanel.tsx` | 19 |
| `src\components\sections\ApplicationModal.tsx` | 15 |
| `src\app\(site)\[locale]\opengraph-image.tsx` | 6 |
| `src\components\ui\LightboxModal.tsx` | 6 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx` | 5 |
| `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx` | 4 |
| `src\components\3d\ui\EditorCoordinateInputs.tsx` | 4 |
| `src\components\sections\events\EventsPartnersBanners.tsx` | 4 |
| `src\components\3d\ui\CampusViewerHUD.tsx` | 3 |
| `src\components\layout\navbar\NavMobileDrawer.tsx` | 3 |
| `src\components\layout\Navbar.tsx` | 3 |
| `src\components\sections\hall-of-fame\FilmGridCard.tsx` | 3 |
| `src\components\sections\team\TeamBannersSection.tsx` | 3 |
| `src\components\ui\InteractiveCampusMap.tsx` | 3 |
| `src\components\3d\ui\CampusStudioToolbar.tsx` | 2 |
| `src\components\3d\ui\FacilitySpotlightCard.tsx` | 2 |
| `src\components\sections\events\EventsPillarsSection.tsx` | 2 |
| `src\components\sections\visite\VisiteAccessTransport.tsx` | 2 |
| `src\lib\og-image.tsx` | 2 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx` | 1 |
| `src\app\(site)\[locale]\error.tsx` | 1 |
| `src\app\(site)\[locale]\visite-guidee\page.tsx` | 1 |
| `src\app\(site)\[locale]\visite-virtuelle\page.tsx` | 1 |
| `src\app\global-error.tsx` | 1 |
| `src\components\3d\ui\CampusJsonStudioModal.tsx` | 1 |
| `src\components\layout\footer-sections\FooterBrandAndSites.tsx` | 1 |
| `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | 1 |
| `src\components\sections\events\EventsHeroSection.tsx` | 1 |
| `src\components\sections\hall-of-fame\FilmDetailsModal.tsx` | 1 |
| `src\components\ui\logos\MediaLogos.tsx` | 1 |
| `src\components\ui\ParallaxHero.tsx` | 1 |
| `src\components\ui\TacticalButton.test.tsx` | 1 |
| `src\components\ui\VirtualTourViewer.tsx` | 1 |
