# Revue — Poids JS par route (budget)

Généré le 2026-09-29T14:50:15.549Z par `scripts/audit_route_weight.mjs`.

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
| `/en` | 563.5 Ko | 564.8 Ko | -0.2 % |
| `/fr` | 563.5 Ko | 564.8 Ko | -0.2 % |
| `/en/cuc-team-cascadeur` | 555.8 Ko | 556.7 Ko | -0.2 % |
| `/fr/cuc-team-cascadeur` | 555.8 Ko | 556.7 Ko | -0.2 % |
| `/en/visite-guidee` | 551 Ko | 551.9 Ko | -0.2 % |
| `/fr/visite-guidee` | 551 Ko | 551.9 Ko | -0.2 % |
| `/en/equipe-cascadeurs-pro` | 546.7 Ko | 543.4 Ko | +0.6 % |
| `/fr/equipe-cascadeurs-pro` | 546.7 Ko | 543.4 Ko | +0.6 % |
| `/en/contact-cuc` | 545.3 Ko | 546.3 Ko | -0.2 % |
| `/fr/contact-cuc` | 545.3 Ko | 546.3 Ko | -0.2 % |

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

