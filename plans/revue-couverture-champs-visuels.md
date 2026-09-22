# Revue — Couverture des champs éditables (Mode Studio)

Généré le 2026-09-22T00:26:30.784Z par `scripts/audit_cuc_fields.mjs`.

## 1. Couverture par page

| Page | Champs | Dont listes | Fichiers porteurs | Statut |
| --- | ---: | ---: | --- | --- |
| `/` | 27 | 0 | `src\components\sections\home\HomeAboutSection.tsx`, `src\components\sections\home\HomeTournagesSection.tsx`, `src\components\sections\home\HomeVirtualTourSection.tsx`, `src\components\sections\home\HomeQualiopiSection.tsx`, `src\components\sections\home\HomePartnersSection.tsx`, `src\components\sections\home\HomeSocialSection.tsx` | ✅ |
| `formation-de-cascadeur` | 18 | 9 | `src\components\sections\formation\FormationHeroSection.tsx`, `src\components\sections\formation\FormationFormulesSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `stages-cascades-parkour-2` | 4 | 0 | `src\components\sections\stages\StagesHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `stunt-workshop-cuc` | 0 | 0 | — | ❌ 0 champ |
| `equipe-cascadeurs-pro` | 4 | 0 | `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `cuc-team-cascadeur` | 5 | 0 | `src\components\sections\team\TeamHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `cuc-events-agence` | 7 | 0 | `src\components\sections\events\EventsHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `team-building-cascades` | 0 | 0 | — | ❌ 0 champ |
| `spectacles-cascadeurs-yamakasi` | 0 | 0 | — | ❌ 0 champ |
| `animations-airbag-parkour` | 0 | 0 | — | ❌ 0 champ |
| `visite-virtuelle` | 0 | 0 | — | ❌ 0 champ |
| `visite-guidee` | 0 | 0 | — | ❌ 0 champ |
| `videos-cascadeur` | 0 | 0 | — | ❌ 0 champ |
| `partenaires` | 4 | 0 | `src\components\sections\partenaires\PartenairesHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |
| `contact-cuc` | 4 | 0 | `src\components\sections\contact\ContactHeroSection.tsx`, `src\lib\preview\cuc-field.ts` | ✅ |

## 2. Croisement avec l’éditeur d’accueil

✅ Les 27 champs ciblés par l’éditeur d’accueil sont annotés côté vitrine.

## 3. Natures de champs (`data-cuc-kind`)

Natures autorisées : `text`, `textarea`, `image`, `link`, `list-item`.

✅ Aucune nature inconnue.

## 4. Attributs dynamiques (non auditables par littéral)

Aucun : tous les champs sont déclarés en littéral.

## 5. Synthèse

- Pages auditées : 15
- Pages sans aucun champ : 7
- Routes absentes : 0
- Natures inconnues : 0
- Champs de liste (`itemPath`) : 9

❌ Régression de couverture : les pages sans champ ne sont pas éditables en place.

