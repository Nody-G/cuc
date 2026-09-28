# Revue — Poids JS par route (budget)

Généré le 2026-09-28T15:36:50.782Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque
route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier
chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,
avertissement **> +2 %**. Régénérer la baseline (après revue) :
`npm run audit:route-weight:baseline`.

## Verdict

**OK** — 72 routes mesurées, aucune au-dessus de +5 %.

- avertissements (> +2 %) : 0
- améliorations (< −2 %) : 0
- nouvelles routes (hors baseline) : 2
- routes absentes du build : 0

## Routes les plus lourdes (top 10)

| Route | Poids | Baseline | Δ |
| --- | ---: | ---: | ---: |
| `/en` | 564.8 Ko | 564.8 Ko | +0.0 % |
| `/fr` | 564.8 Ko | 564.8 Ko | +0.0 % |
| `/en/cuc-team-cascadeur` | 556.7 Ko | 556.7 Ko | +0.0 % |
| `/fr/cuc-team-cascadeur` | 556.7 Ko | 556.7 Ko | +0.0 % |
| `/en/visite-guidee` | 551.9 Ko | 551.9 Ko | +0.0 % |
| `/fr/visite-guidee` | 551.9 Ko | 551.9 Ko | +0.0 % |
| `/en/contact-cuc` | 546.3 Ko | 546.3 Ko | +0.0 % |
| `/fr/contact-cuc` | 546.3 Ko | 546.3 Ko | +0.0 % |
| `/en/formation-de-cascadeur` | 546.1 Ko | 546.1 Ko | +0.0 % |
| `/fr/formation-de-cascadeur` | 546.1 Ko | 546.1 Ko | +0.0 % |

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

