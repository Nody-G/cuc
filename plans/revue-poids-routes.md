# Revue — Poids JS par route (budget)

Généré le 2026-09-24T10:32:37.553Z par `scripts/audit_route_weight.mjs`.

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
| `/en` | 436.4 Ko | 435.4 Ko | +0.2 % |
| `/fr` | 436.4 Ko | 435.4 Ko | +0.2 % |
| `/en/cuc-team-cascadeur` | 424.5 Ko | 423.5 Ko | +0.2 % |
| `/fr/cuc-team-cascadeur` | 424.5 Ko | 423.5 Ko | +0.2 % |
| `/en/formation-de-cascadeur` | 423.5 Ko | 422.6 Ko | +0.2 % |
| `/fr/formation-de-cascadeur` | 423.5 Ko | 422.6 Ko | +0.2 % |
| `/en/visite-guidee` | 422.1 Ko | 421.1 Ko | +0.2 % |
| `/fr/visite-guidee` | 422.1 Ko | 421.1 Ko | +0.2 % |
| `/en/videos-cascadeur` | 422 Ko | 409.3 Ko | +3.1 % |
| `/fr/videos-cascadeur` | 422 Ko | 409.3 Ko | +3.1 % |

## Avertissements (> +2 %)

- `/en/videos-cascadeur` — 422 Ko (baseline 409.3 Ko, +3.1 %)
- `/fr/videos-cascadeur` — 422 Ko (baseline 409.3 Ko, +3.1 %)

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

