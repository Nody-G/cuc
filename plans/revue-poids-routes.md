# Revue — Poids JS par route (budget)

Généré le 2026-09-24T15:14:54.387Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque
route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier
chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,
avertissement **> +2 %**. Régénérer la baseline (après revue) :
`npm run audit:route-weight:baseline`.

## Verdict

**OK** — 56 routes mesurées, aucune au-dessus de +5 %.

- avertissements (> +2 %) : 2
- améliorations (< −2 %) : 0
- nouvelles routes (hors baseline) : 2
- routes absentes du build : 0

## Routes les plus lourdes (top 10)

| Route | Poids | Baseline | Δ |
| --- | ---: | ---: | ---: |
| `/en` | 442.2 Ko | 435.4 Ko | +1.6 % |
| `/fr` | 442.2 Ko | 435.4 Ko | +1.6 % |
| `/en/cuc-team-cascadeur` | 431.5 Ko | 423.5 Ko | +1.9 % |
| `/fr/cuc-team-cascadeur` | 431.5 Ko | 423.5 Ko | +1.9 % |
| `/en/formation-de-cascadeur` | 428.3 Ko | 422.6 Ko | +1.4 % |
| `/fr/formation-de-cascadeur` | 428.3 Ko | 422.6 Ko | +1.4 % |
| `/en/visite-guidee` | 426.9 Ko | 421.1 Ko | +1.4 % |
| `/fr/visite-guidee` | 426.9 Ko | 421.1 Ko | +1.4 % |
| `/en/videos-cascadeur` | 426.5 Ko | 409.3 Ko | +4.2 % |
| `/fr/videos-cascadeur` | 426.5 Ko | 409.3 Ko | +4.2 % |

## Avertissements (> +2 %)

- `/en/videos-cascadeur` — 426.5 Ko (baseline 409.3 Ko, +4.2 %)
- `/fr/videos-cascadeur` — 426.5 Ko (baseline 409.3 Ko, +4.2 %)

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

