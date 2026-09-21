# Revue — Ordre de l'équipe (`site_team.order_index`)

## Symptôme

Sur la vitrine, **Michel Bouis s'affichait en première position** au lieu de Lucas Dollfus,
et Lucas Dollfus n'était pas garanti premier.

## Cause racine

`getTeam()` trie `site_team` par `order_index ASC`
([`site-service.ts`](src/lib/data/site-service.ts:132)). Or **deux enregistrements
partageaient `order_index = 0`** :

| id | order_index (avant) |
| --- | --- |
| `michel-bouis` | **0** |
| `lucas-dollfus` | **0** |

En cas d'égalité, l'ordre renvoyé par PostgreSQL/PostgREST n'est pas garanti →
Michel Bouis passait premier. Aucun seed d'ordre n'existait pour l'équipe
(`apply_team_migration.mjs` ne fait que du DDL sur les colonnes de crédits).

## Correctif

Script idempotent [`fix_team_order.mjs`](scripts/fix_team_order.mjs:1) qui applique un
ordre canonique **déterministe (1..N)**, aligné sur l'ordre de [`CUC_TEAM`](src/data/team.ts:3).

```bash
node scripts/fix_team_order.mjs --dry   # aperçu
node scripts/fix_team_order.mjs         # applique
```

## Résultat (vérifié en base, `order_index ASC`)

| Position | id | order_index |
| --- | --- | --- |
| 1 | `lucas-dollfus` | 1 |
| 2 | `jerome-gaspard` | 2 |
| 3 | `vincent-bouillon` | 3 |
| 4 | `malik-diouf` | 4 |
| 5 | `franck-blanc` | 5 |
| 6 | `kefi-abrikh` | 6 |
| 7 | `maurice-chan` | 7 |
| 8 | `michel-bouis` | 8 |
| 9 | `amedeo-cazzella` | 9 |
| 10 | `niels-dalery` | 10 |
| 11 | `bastien-trouve` | 11 |
| 12 | `alan-cueff` | 12 |

**Contrôles** : Lucas Dollfus = position **1** ✅ ; Michel Bouis = position **8** (≥ 6) ✅.
Le script échoue (code 2) si l'un de ces invariants n'est pas respecté.

## Garde-fou

- Aucun `order_index` dupliqué ne subsiste (valeurs 1..12).
- Le script est rejouable (idempotent) et peut servir de vérification d'intégrité.
- `src/data/team.ts` reste le référentiel d'ordre de secours (Lucas 1er, Michel 8e) — déjà conforme.
