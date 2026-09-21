# Revue — Surface de traduction (périmètre « complet visible »)

Généré le 2026-09-21T15:18:04.822Z par [`audit_translation_surface.mjs`](scripts/audit_translation_surface.mjs:1).

## Synthèse

- Copie d’interface en dur : **411 chaînes** dans **71 fichiers**
- Valeurs françaises en base (périmètre public) : **551**
- Catalogue UI actuel : **50 clés** (EN : 50)

## A. Interface — fichiers les plus chargés

| Fichier | Chaînes |
|---|---|
| `src\components\sections\formation\FormationFormulesSection.tsx` | 27 |
| `src\components\sections\formation\FormationPedagogyModalities.tsx` | 24 |
| `src\components\3d\ui\CampusEditorPanel.tsx` | 22 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx` | 21 |
| `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | 16 |
| `src\app\(site)\[locale]\videos-cascadeur\page.tsx` | 15 |
| `src\components\sections\ApplicationModal.tsx` | 15 |
| `src\components\sections\contact\ContactForm.tsx` | 15 |
| `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx` | 14 |
| `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | 14 |
| `src\components\layout\footer-sections\FooterBrandAndSites.tsx` | 12 |
| `src\components\sections\events\EventsPillarsSection.tsx` | 10 |
| `src\components\sections\team\TeamProductionServices.tsx` | 10 |
| `src\components\ui\VirtualTourViewer.tsx` | 10 |
| `src\components\sections\visite\VisiteAccessTransport.tsx` | 9 |
| `src\app\(site)\[locale]\visite-virtuelle\page.tsx` | 8 |
| `src\components\sections\team\TeamProductionGalleries.tsx` | 8 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx` | 7 |
| `src\components\sections\events\EventsPartnersBanners.tsx` | 7 |
| `src\app\(site)\[locale]\team-building-cascades\page.tsx` | 6 |
| `src\components\sections\visite\VisiteHeroSection.tsx` | 6 |
| `src\components\ui\InteractiveCampusMap.tsx` | 6 |
| `src\components\ui\LightboxModal.tsx` | 6 |
| `src\app\(site)\[locale]\opengraph-image.tsx` | 5 |
| `src\app\(site)\[locale]\visite-guidee\page.tsx` | 5 |
| `src\components\3d\ui\EditorCoordinateInputs.tsx` | 5 |
| `src\app\global-error.tsx` | 4 |
| `src\components\3d\ui\CampusViewerHUD.tsx` | 4 |
| `src\components\sections\events\EventsGuaranteesSection.tsx` | 4 |
| `src\components\sections\films\CucFilmsShowcase.tsx` | 4 |
| `src\components\sections\formation\FormationDisciplinesExplorer.tsx` | 4 |
| `src\components\sections\hall-of-fame\FilmDetailsModal.tsx` | 4 |
| `src\components\sections\HallOfFame.tsx` | 4 |
| `src\components\sections\home\HomeSocialSection.tsx` | 4 |
| `src\components\sections\home\HomeTournagesSection.tsx` | 4 |
| `src\components\sections\home\HomeVirtualTourSection.tsx` | 4 |
| `src\components\sections\stages\StagesHeroSection.tsx` | 4 |
| `src\app\(site)\[locale]\contact-cuc\page.tsx` | 3 |
| `src\app\(site)\[locale]\error.tsx` | 3 |
| `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx` | 3 |
| `src\components\3d\ui\CampusJsonStudioModal.tsx` | 3 |
| `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx` | 3 |
| `src\components\sections\hall-of-fame\FilmGridCard.tsx` | 3 |
| `src\components\sections\team\TeamBannersSection.tsx` | 3 |
| `src\components\sections\visite\VisiteFacilitiesDetail.tsx` | 3 |
| `src\components\sections\visite\VisitePhotoGallery.tsx` | 3 |
| `src\components\ui\parallax-hero\HeroHudOverlay.tsx` | 3 |
| `src\components\3d\ui\CampusStudioToolbar.tsx` | 2 |
| `src\components\3d\ui\FacilitySpotlightCard.tsx` | 2 |
| `src\components\layout\footer-sections\FooterCreditsBar.tsx` | 2 |
| `src\components\layout\MobileStickyCTA.tsx` | 2 |
| `src\components\sections\contact\ContactHeroSection.tsx` | 2 |
| `src\components\sections\home\HomeAboutSection.tsx` | 2 |
| `src\components\sections\partenaires\PartenairesHeroSection.tsx` | 2 |
| `src\components\sections\team\TeamHeroSection.tsx` | 2 |
| `src\components\ui\campus-map\CampusRadarView.tsx` | 2 |
| `src\components\ui\campus-map\CampusTravelPlanner.tsx` | 2 |
| `src\components\layout\footer-sections\FooterDirectContacts.tsx` | 1 |
| `src\components\layout\navbar\NavMobileDrawer.tsx` | 1 |
| `src\components\layout\Navbar.tsx` | 1 |
| `src\components\sections\events\EventsHeroSection.tsx` | 1 |
| `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx` | 1 |
| `src\components\sections\home\HomePartnersSection.tsx` | 1 |
| `src\components\sections\home\HomeQualiopiSection.tsx` | 1 |
| `src\components\sections\partenaires\PartenairesCtaSection.tsx` | 1 |
| `src\components\ui\campus-map\CampusAppLaunchers.tsx` | 1 |
| `src\components\ui\logos\MediaLogos.tsx` | 1 |
| `src\components\ui\parallax-hero\HeroBottomControls.tsx` | 1 |
| `src\components\ui\ParallaxHero.tsx` | 1 |
| `src\components\ui\TacticalButton.test.tsx` | 1 |
| `src\lib\og-image.tsx` | 1 |

## B. Entités de données

| Entité | Table | Lignes | Valeurs FR | Détail champs |
|---|---|---|---|---|
| Pages vitrine | `site_pages` | 15 | 46 | title : 3, meta_title : 8, meta_description : 15, hero : 15, sections_data : 5 |
| Navigation | `site_navigation` | 1 | 0 | — |
| Pied de page | `site_footer` | 1 | 0 | — |
| Coachs | `site_team` | 12 | 39 | role : 6, title : 9, bio : 12, specialties : 12 |
| Programmes | `site_programs` | 6 | 15 | title : 3, description : 6, duration : 6 |
| Disciplines | `site_disciplines` | 10 | 4 | name : 4 |
| Événements | `site_events` | 3 | 4 | title : 1, description : 3 |
| Lieux du campus | `site_campus_pois` | 5 | 11 | name : 3, description : 5, category : 3 |
| Films | `site_films` | 570 | 418 | description : 418 |
| Partenaires | `site_partners` | 21 | 14 | description : 14 |
| Sessions de formation | `site_sessions` | 18 | 0 | — |

## C. Catalogues de messages

- `messages/fr.json` : 50 clés
- `messages/en.json` : 50 clés
- Clés présentes en FR mais absentes en EN : 0
