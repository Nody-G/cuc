# Revue — Couverture des champs éditables (Mode Studio)

Généré le 2026-09-22T00:54:27.860Z par `scripts/audit_cuc_fields.mjs`.

## 1. Couverture par page

| Page | Champs | Dont listes | Fichiers porteurs | Statut |
| --- | ---: | ---: | --- | --- |
| `/` | 64 | 0 | `src\components\ui\ParallaxHero.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\ui\parallax-hero\HeroHudOverlay.tsx`, `src\components\sections\home\HomeAboutSection.tsx`, `src\components\sections\home\HomeTournagesSection.tsx`, `src\components\sections\home\HomeVirtualTourSection.tsx`, `src\components\sections\home\HomeQualiopiSection.tsx`, `src\components\sections\home\HomePartnersSection.tsx`, `src\components\sections\home\HomeSocialSection.tsx` | ✅ |
| `formation-de-cascadeur` | 24 | 9 | `src\components\sections\formation\FormationHeroSection.tsx`, `src\components\sections\formation\FormationFormulesSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\formation\FormationDisciplinesExplorer.tsx`, `src\components\sections\formation\FormationPedagogyModalities.tsx` | ✅ |
| `stages-cascades-parkour-2` | 5 | 0 | `src\components\sections\stages\StagesHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `stunt-workshop-cuc` | 6 | 0 | `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx` | ✅ |
| `equipe-cascadeurs-pro` | 5 | 0 | `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `cuc-team-cascadeur` | 17 | 2 | `src\components\sections\team\TeamHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\team\TeamBannersSection.tsx`, `src\components\sections\team\TeamProductionServices.tsx` | ✅ |
| `cuc-events-agence` | 13 | 6 | `src\components\sections\events\EventsHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\events\EventsPillarsSection.tsx` | ✅ |
| `team-building-cascades` | 6 | 0 | `src\app\(site)\[locale]\team-building-cascades\page.tsx` | ✅ |
| `spectacles-cascadeurs-yamakasi` | 6 | 0 | `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | ✅ |
| `animations-airbag-parkour` | 6 | 0 | `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx` | ✅ |
| `visite-virtuelle` | 5 | 0 | `src\app\(site)\[locale]\visite-virtuelle\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `visite-guidee` | 7 | 0 | `src\components\sections\visite\VisiteHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `videos-cascadeur` | 4 | 0 | `src\app\(site)\[locale]\videos-cascadeur\page.tsx` | ✅ |
| `partenaires` | 9 | 0 | `src\components\sections\partenaires\PartenairesHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\partenaires\PartenairesGridSection.tsx` | ✅ |
| `contact-cuc` | 4 | 0 | `src\components\sections\contact\ContactHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |

## 2. Croisement avec l’éditeur d’accueil

✅ Les 27 champs ciblés par l’éditeur d’accueil sont annotés côté vitrine.

## 3. Natures de champs (`data-cuc-kind`)

Natures autorisées : `text`, `textarea`, `image`, `link`, `list-item`.

✅ Aucune nature inconnue.

## 4. Attributs dynamiques (non auditables par littéral)

- `src\components\sections\home\HomeAboutSection.tsx (3)`
- `src\components\sections\home\HomePartnersSection.tsx (3)`
- `src\components\sections\home\HomeSocialSection.tsx (5)`
- `src\components\sections\stages\StagesGridSection.tsx (11)`
- `src\components\sections\team\TeamBannersSection.tsx (1)`

## 5. Synthèse

- Pages auditées : 15
- Pages sans aucun champ : 0
- Routes absentes : 0
- Natures inconnues : 0
- Champs de liste (`itemPath`) : 17

✅ Couverture conforme : chaque page expose au moins un champ éditable.

