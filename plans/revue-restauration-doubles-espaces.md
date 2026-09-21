# Revue — Restauration après incident « doubles espaces »

Généré le 2026-09-21T20:17:17.638Z par `scripts/fix_double_space_damage.mjs`.

## Cause

Le motif `\S {2,}\S` inclut le caractère avant et après la suite d'espaces : utilisé avec `.replace(motif, ' ')`, il **supprime ces deux caractères** au lieu de réduire la suite d'espaces. `Gloria  needs` est ainsi devenu `Glori eeds`.

## Emplacements

| Fiche | Fragment abîmé | Fragment attendu | Occurrences | Statut |
|---|---|---|---|---|
| `furies` | `the death of her family he furtively` | `the death of her family. She furtively` | 1 | prêt |
| `gloria` | `Glori eeds an orgasm` | `Gloria needs an orgasm` | 1 | prêt |
| `le-jardinier` | `better known as the Matignon List ondemned` | `better known as the Matignon List. Condemned` | 1 | prêt |
| `les-blagues-de-toto` | `Toto is immediately blamed o prove` | `Toto is immediately blamed. To prove` | 1 | prêt |
| `les-blagues-de-toto` | `Toto will help Igor being cool he unlikely` | `Toto will help Igor being cool. The unlikely` | 1 | prêt |
| `les-envoutes` | `Coline, who resists but falls in love.. ased on` | `Coline, who resists but falls in love... Based on` | 1 | prêt |
| `un-triomphe` | `where he bring ogether an unlikely` | `where he brings together an unlikely` | 1 | prêt |
| `zorro` | `born in one of the town's hotels his story` | `born in one of the town's hotels. This story` | 1 | prêt |
| `zorro` | `the line between reality and myth becomes blurred his film` | `the line between reality and myth becomes blurred. This film` | 1 | prêt |

## Périmètre

- Emplacements prêts : **9/9**
- Fiches concernées : **7** (furies, gloria, le-jardinier, les-blagues-de-toto, les-envoutes, un-triomphe, zorro)
