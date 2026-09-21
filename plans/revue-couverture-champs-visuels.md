# Revue — Couverture des champs éditables (Mode Studio)

Généré le 2026-09-21T23:50:49.927Z par `scripts/audit_cuc_fields.mjs`.

## 1. Couverture par page

| Page | Champs annotés | Fichiers porteurs | Statut |
| --- | ---: | --- | --- |
| `/` | 27 | `src\components\sections\home\HomeAboutSection.tsx`, `src\components\sections\home\HomeTournagesSection.tsx`, `src\components\sections\home\HomeVirtualTourSection.tsx`, `src\components\sections\home\HomeQualiopiSection.tsx`, `src\components\sections\home\HomePartnersSection.tsx`, `src\components\sections\home\HomeSocialSection.tsx` | ✅ |
| `formation-de-cascadeur` | 0 | — | ❌ 0 champ |
| `stages-cascades-parkour-2` | 0 | — | ❌ 0 champ |
| `stunt-workshop-cuc` | 0 | — | ❌ 0 champ |
| `equipe-cascadeurs-pro` | 0 | — | ❌ 0 champ |
| `cuc-team-cascadeur` | 0 | — | ❌ 0 champ |
| `cuc-events-agence` | 0 | — | ❌ 0 champ |
| `team-building-cascades` | 0 | — | ❌ 0 champ |
| `spectacles-cascadeurs-yamakasi` | 0 | — | ❌ 0 champ |
| `animations-airbag-parkour` | 0 | — | ❌ 0 champ |
| `visite-virtuelle` | 0 | — | ❌ 0 champ |
| `visite-guidee` | 0 | — | ❌ 0 champ |
| `videos-cascadeur` | 0 | — | ❌ 0 champ |
| `partenaires` | 0 | — | ❌ 0 champ |
| `contact-cuc` | 0 | — | ❌ 0 champ |

## 2. Croisement avec l’éditeur d’accueil

✅ Les 27 champs ciblés par l’éditeur d’accueil sont annotés côté vitrine.

## 3. Natures de champs (`data-cuc-kind`)

Natures autorisées : `text`, `textarea`, `image`, `link`, `list-item`.

✅ Aucune nature inconnue.

## 4. Attributs dynamiques (non auditables par littéral)

Aucun : tous les champs sont déclarés en littéral.

## 5. Synthèse

- Pages auditées : 15
- Pages sans aucun champ : 14
- Routes absentes : 0
- Natures inconnues : 0

❌ Régression de couverture : les pages sans champ ne sont pas éditables en place.

