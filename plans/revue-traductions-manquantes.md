# Revue — Traductions EN manquantes (niveau champ)

Généré le 2026-09-21T14:17:21.089Z par [`audit_i18n_completeness.mjs`](scripts/audit_i18n_completeness.mjs:1).

## Synthèse

- Champs éditoriaux FR en base (`site_pages`) : **225**
- Champs couverts en EN : **225**
- **Couverture : 100 %** (seuil d'échec : 90 %)
- Pages concernées par au moins un manque : **0**
- Fichiers de composants contenant de la copie FR en dur : **73**

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
| `src\components\sections\formation\FormationFormulesSection.tsx` | 22 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx` | 20 |
| `src\components\3d\ui\CampusEditorPanel.tsx` | 19 |
| `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | 15 |
| `src\components\sections\ApplicationModal.tsx` | 15 |
| `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | 15 |
| `src\app\(site)\[locale]\videos-cascadeur\page.tsx` | 14 |
| `src\components\sections\contact\ContactForm.tsx` | 14 |
| `src\components\layout\footer-sections\FooterBrandAndSites.tsx` | 13 |
| `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx` | 12 |
| `src\components\sections\formation\FormationHeroSection.tsx` | 10 |
| `src\components\sections\visite\VisiteAccessTransport.tsx` | 10 |
| `src\components\sections\events\EventsPillarsSection.tsx` | 9 |
| `src\components\ui\VirtualTourViewer.tsx` | 9 |
| `src\components\sections\formation\FormationPedagogyModalities.tsx` | 8 |
| `src\components\sections\team\TeamProductionGalleries.tsx` | 8 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx` | 7 |
| `src\components\sections\events\EventsPartnersBanners.tsx` | 7 |
| `src\app\(site)\[locale]\opengraph-image.tsx` | 6 |
| `src\app\(site)\[locale]\visite-virtuelle\page.tsx` | 6 |
| `src\components\sections\events\EventsGuaranteesSection.tsx` | 6 |
| `src\components\sections\visite\VisiteHeroSection.tsx` | 6 |
| `src\components\ui\InteractiveCampusMap.tsx` | 6 |
| `src\components\ui\LightboxModal.tsx` | 6 |
| `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx` | 5 |
| `src\app\(site)\[locale]\team-building-cascades\page.tsx` | 5 |
| `src\components\sections\home\HomeSocialSection.tsx` | 5 |
| `src\app\(site)\[locale]\error.tsx` | 4 |
| `src\app\global-error.tsx` | 4 |
| `src\components\3d\ui\EditorCoordinateInputs.tsx` | 4 |
| `src\components\sections\films\CucFilmsShowcase.tsx` | 4 |
| `src\components\sections\home\HomeVirtualTourSection.tsx` | 4 |
| `src\components\sections\stages\StagesHeroSection.tsx` | 4 |
| `src\app\(site)\[locale]\visite-guidee\page.tsx` | 3 |
| `src\components\3d\ui\CampusViewerHUD.tsx` | 3 |
| `src\components\layout\navbar\NavMobileDrawer.tsx` | 3 |
| `src\components\layout\Navbar.tsx` | 3 |
| `src\components\sections\formation\FormationDisciplinesExplorer.tsx` | 3 |
| `src\components\sections\hall-of-fame\FilmDetailsModal.tsx` | 3 |
| `src\components\sections\hall-of-fame\FilmGridCard.tsx` | 3 |
| `src\components\sections\HallOfFame.tsx` | 3 |
| `src\components\sections\team\TeamBannersSection.tsx` | 3 |
| `src\components\sections\team\TeamHeroSection.tsx` | 3 |
| `src\components\sections\team\TeamProductionServices.tsx` | 3 |
| `src\components\sections\visite\VisiteFacilitiesDetail.tsx` | 3 |
| `src\components\sections\visite\VisitePhotoGallery.tsx` | 3 |
| `src\components\ui\campus-map\CampusRadarView.tsx` | 3 |
| `src\components\ui\campus-map\CampusTravelPlanner.tsx` | 3 |
| `src\components\ui\parallax-hero\HeroHudOverlay.tsx` | 3 |
| `src\app\(site)\[locale]\contact-cuc\page.tsx` | 2 |
| `src\components\3d\ui\CampusStudioToolbar.tsx` | 2 |
| `src\components\3d\ui\FacilitySpotlightCard.tsx` | 2 |
| `src\components\layout\footer-sections\FooterCreditsBar.tsx` | 2 |
| `src\components\sections\contact\ContactHeroSection.tsx` | 2 |
| `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx` | 2 |
| `src\components\sections\home\HomeAboutSection.tsx` | 2 |
| `src\components\sections\partenaires\PartenairesGridSection.tsx` | 2 |
| `src\components\ui\ParallaxHero.tsx` | 2 |
| `src\lib\og-image.tsx` | 2 |
| `src\components\3d\ui\CampusJsonStudioModal.tsx` | 1 |
| `src\components\layout\footer-sections\FooterDirectContacts.tsx` | 1 |
| `src\components\layout\MobileStickyCTA.tsx` | 1 |
| `src\components\sections\events\EventsHeroSection.tsx` | 1 |
| `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx` | 1 |
| `src\components\sections\home\HomePartnersSection.tsx` | 1 |
| `src\components\sections\home\HomeQualiopiSection.tsx` | 1 |
| `src\components\sections\home\HomeTournagesSection.tsx` | 1 |
| `src\components\sections\partenaires\PartenairesCtaSection.tsx` | 1 |
| `src\components\sections\partenaires\PartenairesHeroSection.tsx` | 1 |
| `src\components\ui\campus-map\CampusAppLaunchers.tsx` | 1 |
| `src\components\ui\logos\MediaLogos.tsx` | 1 |
| `src\components\ui\parallax-hero\HeroBottomControls.tsx` | 1 |
| `src\components\ui\TacticalButton.test.tsx` | 1 |
