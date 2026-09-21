# Revue — Édition anglaise des pages (Cockpit)

Généré le 2026-09-21T23:21:51.503Z par `scripts/verify_page_translation_invariants.mjs`.

## Synthèse

- Pages contrôlées : **15** (dont **15** avec un overlay EN)
- Couverture anglaise globale : **89 %** (216/244 feuilles)
- Violations d'invariants : **0**
- Tableaux désalignés du français : **0**
- Chemins inconnus (absents du contenu français) : **0**

Invariants vérifiés (ceux de `src/lib/i18n/localized-merge.ts`) :

1. aucune valeur vide publiée — une valeur vidée revient au français ;
2. aucune racine verrouillée traduite (`layout_sections`, `og_image`, identité, états) et
   aucune clé technique dans un objet ;
3. tableaux écrits en bloc : même longueur, mêmes ancres `id`, clés techniques
   identiques au français et items complets ;
4. aucune clé inventée hors du contenu français.

## Couverture par page

| Page | Overlay | Publié | Feuilles FR | Traduites | Couverture |
|---|---|---|---|---|---|
| `/` | oui | oui | 51 | 36 | 71 % |
| `animations-airbag-parkour` | oui | oui | 8 | 8 | 100 % |
| `contact-cuc` | oui | oui | 15 | 15 | 100 % |
| `cuc-events-agence` | oui | oui | 8 | 8 | 100 % |
| `cuc-team-cascadeur` | oui | oui | 8 | 8 | 100 % |
| `equipe-cascadeurs-pro` | oui | oui | 8 | 8 | 100 % |
| `formation-de-cascadeur` | oui | oui | 38 | 29 | 76 % |
| `partenaires` | oui | oui | 8 | 8 | 100 % |
| `spectacles-cascadeurs-yamakasi` | oui | oui | 8 | 8 | 100 % |
| `stages-cascades-parkour-2` | oui | oui | 31 | 31 | 100 % |
| `stunt-workshop-cuc` | oui | oui | 8 | 6 | 75 % |
| `team-building-cascades` | oui | oui | 29 | 27 | 93 % |
| `videos-cascadeur` | oui | oui | 8 | 8 | 100 % |
| `visite-guidee` | oui | oui | 8 | 8 | 100 % |
| `visite-virtuelle` | oui | oui | 8 | 8 | 100 % |

## Violations

Aucune : aucun payload ne contient de valeur vide, de racine verrouillée, de clé technique traduite ni d’item de tableau incomplet.

## Tableaux désalignés

Aucun : chaque tableau anglais a la même longueur et les mêmes ancres que le français.

## Chemins inconnus

Aucun : chaque clé anglaise existe dans le contenu français.
