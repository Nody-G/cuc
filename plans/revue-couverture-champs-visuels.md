# Revue — Couverture des champs éditables (Mode Studio)

Généré le 2026-09-22T19:37:43.221Z par `scripts/audit_cuc_fields.mjs`.

## 1. Couverture par page

| Page | Champs | Dont listes | Fichiers porteurs | Statut |
| --- | ---: | ---: | --- | --- |
| `/` | 64 | 0 | `src\components\ui\parallax-hero\HeroHudOverlay.tsx`, `src\components\ui\parallax-hero\HeroFocalContent.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\home\HomeAboutSection.tsx`, `src\components\sections\home\tournages\TournagesHeader.tsx`, `src\components\sections\home\tournages\TournagesPillarsCard.tsx`, `src\components\sections\home\HomeVirtualTourSection.tsx`, `src\components\sections\home\HomeQualiopiSection.tsx`, `src\components\sections\home\HomePartnersSection.tsx`, `src\components\sections\home\HomeSocialSection.tsx` | ✅ |
| `formation-de-cascadeur` | 24 | 9 | `src\components\sections\formation\FormationHeroSection.tsx`, `src\components\sections\formation\FormationFormulesSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\formation\FormationDisciplinesExplorer.tsx`, `src\components\sections\formation\FormationPedagogyModalities.tsx` | ✅ |
| `stages-cascades-parkour-2` | 6 | 0 | `src\components\sections\stages\StagesHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `stunt-workshop-cuc` | 25 | 0 | `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHero.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopProgram.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopInfoCards.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopApplyBox.tsx` | ✅ |
| `equipe-cascadeurs-pro` | 5 | 0 | `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `cuc-team-cascadeur` | 24 | 2 | `src\components\sections\team\TeamHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\team\TeamProductionGalleries.tsx`, `src\components\sections\team\TeamBannersSection.tsx`, `src\components\sections\team\TeamProductionServices.tsx` | ✅ |
| `cuc-events-agence` | 20 | 6 | `src\components\sections\events\EventsHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\events\pillars\StaticPillarCard.tsx`, `src\components\sections\events\EventsGuaranteesSection.tsx` | ✅ |
| `team-building-cascades` | 10 | 0 | `src\app\(site)\[locale]\team-building-cascades\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `spectacles-cascadeurs-yamakasi` | 6 | 0 | `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | ✅ |
| `animations-airbag-parkour` | 6 | 0 | `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx` | ✅ |
| `visite-virtuelle` | 5 | 0 | `src\app\(site)\[locale]\visite-virtuelle\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `visite-guidee` | 36 | 0 | `src\components\sections\visite\VisiteHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\visite\VisiteFacilitiesDetail.tsx`, `src\components\sections\visite\VisiteAccessTransport.tsx` | ✅ |
| `videos-cascadeur` | 4 | 0 | `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx` | ✅ |
| `partenaires` | 10 | 0 | `src\components\sections\partenaires\PartenairesHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\partenaires\PartenairesGridSection.tsx`, `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`, `src\components\sections\partenaires\grid\StaticPartnerCard.tsx` | ✅ |
| `contact-cuc` | 8 | 0 | `src\components\sections\contact\ContactHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | ✅ |

## 2. Croisement avec l’éditeur d’accueil

✅ Les 27 champs promis par l’éditeur d’accueil (`liveEdit`) sont annotés côté vitrine.

## 3. Natures de champs (`data-cuc-kind`)

Natures autorisées : `text`, `textarea`, `image`, `link`, `list-item`.

✅ Aucune nature inconnue.

## 4. Attributs dynamiques (non auditables par littéral)

- `src\components\sections\home\HomeAboutSection.tsx (3)`
- `src\components\sections\home\HomePartnersSection.tsx (3)`
- `src\components\sections\home\HomeSocialSection.tsx (5)`
- `src\components\sections\stages\grid\stage-render.tsx (3)`
- `src\components\sections\stages\grid\StageGridCard.tsx (8)`
- `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHighlights.tsx (2)`
- `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopProgram.tsx (2)`
- `src\components\sections\team\TeamProductionGalleries.tsx (3)`
- `src\components\sections\team\TeamBannersSection.tsx (1)`
- `src\components\sections\visite\VisiteFacilitiesDetail.tsx (7)`

## 5. Synthèse

- Pages auditées : 15
- Pages sans aucun champ : 0
- Routes absentes : 0
- Natures inconnues : 0
- Champs de liste (`itemPath`) : 17

✅ Couverture conforme : chaque page expose au moins un champ éditable.

