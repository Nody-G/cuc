# Revue — Surface de traduction (périmètre « complet visible »)

Généré le 2026-10-01T16:36:43.727Z par [`audit_translation_surface.mjs`](scripts/audit_translation_surface.mjs:1).

## Synthèse

- Copie d’interface en dur : **24 chaînes** dans **11 fichiers**
- Valeurs françaises en base (périmètre public) : **587**
- Catalogue UI actuel : **1011 clés** (EN : 1011)

## A. Interface — fichiers les plus chargés

| Fichier | Chaînes |
|---|---|
| `src\components\ui\InstagramFollowerBadge.tsx` | 8 |
| `src\components\i18n\UnpublishedPageGate.test.tsx` | 5 |
| `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx` | 2 |
| `src\components\i18n\UnpublishedPageGate.tsx` | 2 |
| `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx` | 1 |
| `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopProgram.tsx` | 1 |
| `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSection.tsx` | 1 |
| `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSortBar.tsx` | 1 |
| `src\components\preview\preview-edit-layer\TextEditOverlay.tsx` | 1 |
| `src\components\sections\events\spectacles\SpectacleTypeCard.tsx` | 1 |
| `src\components\ui\TacticalButton.test.tsx` | 1 |

## B. Entités de données

| Entité | Table | Lignes | Valeurs FR | Détail champs |
|---|---|---|---|---|
| Pages vitrine | `site_pages` | 15 | 30 | title : 3, meta_title : 5, meta_description : 11, hero : 10, sections_data : 1 |
| Navigation | `site_navigation` | 1 | 0 | — |
| Pied de page | `site_footer` | 1 | 0 | — |
| Coachs | `site_team` | 20 | 71 | role : 18, title : 17, bio : 18, specialties : 18 |
| Programmes | `site_programs` | 6 | 14 | title : 2, description : 6, duration : 6 |
| Disciplines | `site_disciplines` | 10 | 13 | name : 3, equipment : 10 |
| Événements | `site_events` | 3 | 17 | title : 1, subtitle : 2, badge : 2, description : 3, price_indicator : 3, cta_text : 3, features : 3 |
| Lieux du campus | `site_campus_pois` | 5 | 11 | name : 3, category : 3, description : 5 |
| Films | `site_films` | 570 | 416 | description : 416 |
| Partenaires | `site_partners` | 21 | 13 | description : 13 |
| Réseaux sociaux | `site_social_links` | 5 | 2 | display_hint : 2 |
| Sessions de formation | `site_sessions` | 17 | 0 | — |

## C. Catalogues de messages

- `messages/fr.json` : 1011 clés
- `messages/en.json` : 1011 clés
- Clés présentes en FR mais absentes en EN : 0
