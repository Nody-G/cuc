# Rapport de réécriture des URLs médias

- Généré : 2026-09-20T21:49:08.551Z
- Mode : **ÉCRITURE RÉELLE**
- Entrées de correspondance : 221

## Base de données

- Lignes mises à jour : **15**
- Remplacements : **161**

| Table | Lignes lues | Lignes modifiées | Remplacements | Note |
| --- | ---: | ---: | ---: | --- |
| `site_pages` | 15 | 0 | 36 | — |
| `site_films` | 570 | 0 | 0 | — |
| `site_team` | 12 | 12 | 12 | — |
| `site_partners` | 8 | 0 | 0 | — |
| `site_events` | 3 | 3 | 3 | — |
| `site_settings` | 10 | 0 | 110 | — |
| `site_disciplines` | 0 | 0 | 0 | Could not find the table 'public.site_disciplines' in the schema cache |
| `site_campus_pois` | 0 | 0 | 0 | Could not find the table 'public.site_campus_pois' in the schema cache |
| `site_navigation` | 0 | 0 | 0 | Could not find the table 'public.site_navigation' in the schema cache |
| `site_footer` | 0 | 0 | 0 | Could not find the table 'public.site_footer' in the schema cache |
| `site_social_links` | 0 | 0 | 0 | Could not find the table 'public.site_social_links' in the schema cache |

### Erreurs base

- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_pages#undefined : column site_pages.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist
- site_settings#undefined : column site_settings.id does not exist

## Code source

- Fichiers modifiés : **37**
- Remplacements : **310**

| Fichier | Remplacements |
| --- | ---: |
| `src\app\admin\components\PagesEditorView.tsx` | 1 |
| `src\app\animations-airbag-parkour\page.tsx` | 2 |
| `src\app\equipe-cascadeurs-pro\page.tsx` | 1 |
| `src\app\spectacles-cascadeurs-yamakasi\page.tsx` | 3 |
| `src\app\stunt-workshop-cuc\page.tsx` | 5 |
| `src\app\team-building-cascades\page.tsx` | 6 |
| `src\app\videos-cascadeur\page.tsx` | 3 |
| `src\components\layout\footer-sections\FooterBrandAndSites.tsx` | 1 |
| `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | 2 |
| `src\components\sections\contact\ContactHeroSection.tsx` | 1 |
| `src\components\sections\events\EventsHeroSection.tsx` | 1 |
| `src\components\sections\events\EventsPillarsSection.tsx` | 3 |
| `src\components\sections\formation\FormationHeroSection.tsx` | 3 |
| `src\components\sections\home\HomeAboutSection.tsx` | 1 |
| `src\components\sections\home\HomeQualiopiSection.tsx` | 1 |
| `src\components\sections\home\HomeSocialSection.tsx` | 4 |
| `src\components\sections\home\HomeTournagesSection.tsx` | 4 |
| `src\components\sections\home\HomeVirtualTourSection.tsx` | 1 |
| `src\components\sections\partenaires\partenaires.data.tsx` | 1 |
| `src\components\sections\partenaires\PartenairesHeroSection.tsx` | 1 |
| `src\components\sections\stages\stages.data.ts` | 6 |
| `src\components\sections\stages\StagesGridSection.tsx` | 1 |
| `src\components\sections\stages\StagesHeroSection.tsx` | 2 |
| `src\components\sections\team\teamGalleries.data.ts` | 21 |
| `src\components\sections\team\TeamHeroSection.tsx` | 1 |
| `src\components\sections\visite\VisiteHeroSection.tsx` | 1 |
| `src\components\sections\visite\visitePhotos.data.ts` | 16 |
| `src\components\ui\parallax-hero\parallaxHero.data.ts` | 4 |
| `src\data\all_official_films.ts` | 63 |
| `src\data\campus.ts` | 9 |
| `src\data\disciplines.ts` | 10 |
| `src\data\filmBanners.ts` | 6 |
| `src\data\filmography.ts` | 63 |
| `src\data\programs.ts` | 3 |
| `src\data\team.ts` | 12 |
| `src\data\videos.ts` | 6 |
| `src\lib\data\site-service.ts` | 41 |
