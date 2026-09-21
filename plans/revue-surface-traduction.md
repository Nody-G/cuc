# Revue — Surface de traduction (périmètre « complet visible »)

Généré le 2026-09-21T19:00:57.192Z par [`audit_translation_surface.mjs`](scripts/audit_translation_surface.mjs:1).

## Synthèse

- Copie d’interface en dur : **1 chaînes** dans **1 fichiers**
- Valeurs françaises en base (périmètre public) : **529**
- Catalogue UI actuel : **957 clés** (EN : 957)

## A. Interface — fichiers les plus chargés

| Fichier | Chaînes |
|---|---|
| `src\components\ui\TacticalButton.test.tsx` | 1 |

## B. Entités de données

| Entité | Table | Lignes | Valeurs FR | Détail champs |
|---|---|---|---|---|
| Pages vitrine | `site_pages` | 15 | 29 | title : 3, meta_title : 5, meta_description : 11, hero : 9, sections_data : 1 |
| Navigation | `site_navigation` | 1 | 0 | — |
| Pied de page | `site_footer` | 1 | 0 | — |
| Coachs | `site_team` | 12 | 36 | role : 5, title : 9, bio : 10, specialties : 12 |
| Programmes | `site_programs` | 6 | 14 | title : 2, description : 6, duration : 6 |
| Disciplines | `site_disciplines` | 10 | 3 | name : 3 |
| Événements | `site_events` | 3 | 4 | title : 1, description : 3 |
| Lieux du campus | `site_campus_pois` | 5 | 11 | name : 3, description : 5, category : 3 |
| Films | `site_films` | 570 | 417 | description : 417 |
| Partenaires | `site_partners` | 21 | 13 | description : 13 |
| Réseaux sociaux | `site_social_links` | 5 | 2 | display_hint : 2 |
| Sessions de formation | `site_sessions` | 18 | 0 | — |

## C. Catalogues de messages

- `messages/fr.json` : 957 clés
- `messages/en.json` : 957 clés
- Clés présentes en FR mais absentes en EN : 0
