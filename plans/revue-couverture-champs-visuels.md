# Revue — Couverture des champs éditables (Mode Studio)

Généré le 2026-10-07T00:48:42.297Z par `scripts/audit_cuc_fields.mjs`.

## 1. Couverture par page

| Page | Champs | Dont listes | Dont gabarits | Fichiers porteurs | Statut |
| --- | ---: | ---: | ---: | --- | --- |
| `/` | 13 | 0 | 2 | `src\components\ui\parallax-hero\HeroFocalContent.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `formation-de-cascadeur` | 24 | 9 | 0 | `src\components\sections\formation\FormationHeroSection.tsx`, `src\components\sections\formation\FormationFormulesSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\formation\FormationDisciplinesExplorer.tsx`, `src\components\sections\formation\FormationPedagogyModalities.tsx` | ✅ |
| `stages-cascades-parkour-2` | 15 | 0 | 9 | `src\components\sections\stages\StagesHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\stages\grid\StageGridCard.tsx` | ✅ |
| `stunt-workshop-cuc` | 29 | 0 | 4 | `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHero.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHighlights.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopProgram.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopInfoCards.tsx`, `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopApplyBox.tsx` | ✅ |
| `equipe-cascadeurs-pro` | 5 | 0 | 0 | `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `cuc-team-cascadeur` | 28 | 2 | 4 | `src\components\sections\team\TeamHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\team\TeamProductionGalleries.tsx`, `src\components\sections\team\TeamBannersSection.tsx`, `src\components\sections\team\TeamProductionServices.tsx` | ✅ |
| `cuc-events-agence` | 20 | 6 | 0 | `src\components\sections\events\EventsHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\events\pillars\StaticPillarCard.tsx`, `src\components\sections\events\EventsGuaranteesSection.tsx` | ✅ |
| `team-building-cascades` | 14 | 0 | 4 | `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingHero.tsx`, `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingOverview.tsx`, `src\lib\preview\cuc-field.ts`, `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingWorkshops.tsx` | ✅ |
| `spectacles-cascadeurs-yamakasi` | 6 | 0 | 0 | `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | ✅ |
| `animations-airbag-parkour` | 6 | 0 | 0 | `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx` | ✅ |
| `visite-virtuelle` | 5 | 0 | 0 | `src\app\(site)\[locale]\visite-virtuelle\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `visite-guidee` | 42 | 0 | 6 | `src\components\sections\visite\VisiteHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\visite\facilities\FacilityDetailPanel.tsx`, `src\components\sections\visite\facilities\FacilitiesHeader.tsx`, `src\components\sections\visite\facilities\FacilitiesSelector.tsx`, `src\components\sections\visite\VisiteAccessTransport.tsx` | ✅ |
| `videos-cascadeur` | 4 | 0 | 0 | `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx` | ✅ |
| `partenaires` | 10 | 0 | 0 | `src\components\sections\partenaires\PartenairesHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\partenaires\PartenairesGridSection.tsx`, `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`, `src\components\sections\partenaires\grid\StaticPartnerCard.tsx` | ✅ |
| `contact-cuc` | 14 | 0 | 0 | `src\components\sections\contact\ContactHeroSection.tsx`, `src\lib\preview\cuc-field.ts`, `src\components\sections\contact\ContactCoordinatesSidebar.tsx` | ✅ |

## 2. Promesses des éditeurs (édition en place)

Chaque champ promis par un éditeur du Cockpit (`liveEdit`, formulaires, items d’ateliers, de formules et de stages) doit porter une annotation côté vitrine. Les champs de lien (`*_link`, `*_url`) en sont exclus : ils se règlent avec le sélecteur du formulaire.

| Page | Champs promis | Manquants | Statut |
| --- | ---: | ---: | --- |
| `/` | 47 | 47 | ❌ |
| `team-building-cascades` | 7 | 0 | ✅ |
| `formation-de-cascadeur` | 8 | 0 | ✅ |
| `stages-cascades-parkour-2` | 3 | 0 | ✅ |
| `contact-cuc` | 4 | 0 | ✅ |

❌ 47 champ(s) promis sans annotation — ils ne seront pas cliquables dans l’aperçu :

- `/` : `sections_data.about.tag`, `sections_data.about.subtag`, `sections_data.about.title`, `sections_data.about.description`, `sections_data.about.image_url`, `sections_data.about.cta_primary_text`, `sections_data.about.cta_secondary_text`, `sections_data.tournages.badge`, `sections_data.tournages.title`, `sections_data.tournages.subtitle`, `sections_data.tournages.team_tag`, `sections_data.tournages.cta_text`, `sections_data.tournages.pillar1_title`, `sections_data.tournages.pillar1_desc`, `sections_data.tournages.pillar2_title`, `sections_data.tournages.pillar2_desc`, `sections_data.tournages.pillar3_title`, `sections_data.tournages.pillar3_desc`, `sections_data.tournages.cta_production`, `sections_data.tournages.cta_catalog`, `sections_data.virtual_tour.badge`, `sections_data.virtual_tour.title`, `sections_data.virtual_tour.subtitle`, `sections_data.virtual_tour.tag`, `sections_data.virtual_tour.cta_text`, `sections_data.virtual_tour.installations_cta`, `sections_data.virtual_tour.hud_title`, `sections_data.virtual_tour.hud_hint`, `sections_data.virtual_tour.image_url`, `sections_data.qualiopi.badge`, `sections_data.qualiopi.title`, `sections_data.qualiopi.subtitle`, `sections_data.qualiopi.afdas_badge`, `sections_data.qualiopi.afdas_text`, `sections_data.qualiopi.france_travail_badge`, `sections_data.qualiopi.france_travail_text`, `sections_data.qualiopi.opco_badge`, `sections_data.qualiopi.opco_text`, `sections_data.qualiopi.cta_text`, `sections_data.qualiopi.logo_url`, `sections_data.social.badge`, `sections_data.social.title`, `sections_data.social.subtitle`, `sections_data.social.handle`, `sections_data.social.join_text`, `sections_data.social.see_instagram`, `sections_data.social.avatar_url`

## 3. Natures de champs (`data-cuc-kind`)

Natures autorisées : `text`, `textarea`, `image`, `link`, `list-item`.

✅ Aucune nature inconnue.

## 4. Attributs dynamiques (non auditables par littéral)

- `src\components\sections\stages\grid\stage-render.tsx (3)`

## 5. Synthèse

- Pages auditées : 15
- Pages sans aucun champ : 0
- Routes absentes : 0
- Promesses d'éditeurs : 69 champ(s), 47 manquant(s)
- Natures inconnues : 0
- Champs de liste (`itemPath`) : 17

❌ Régression de couverture : une page ou une promesse n’est pas tenue.

