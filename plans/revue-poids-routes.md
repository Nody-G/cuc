# Revue — Poids JS par route (budget)

Généré le 2026-09-23T15:50:18.365Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque
route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier
chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,
avertissement **> +2 %**. Régénérer la baseline (après revue) :
`npm run audit:route-weight:baseline`.

## Verdict

**OK** — 56 routes mesurées, aucune au-dessus de +5 %.

- avertissements (> +2 %) : 0
- améliorations (< −2 %) : 0
- nouvelles routes (hors baseline) : 2
- routes absentes du build : 0

## Routes les plus lourdes (top 10)

| Route | Poids | Baseline | Δ |
| --- | ---: | ---: | ---: |
| `/en` | 435.8 Ko | 435.4 Ko | +0.1 % |
| `/fr` | 435.8 Ko | 435.4 Ko | +0.1 % |
| `/en/cuc-team-cascadeur` | 423.9 Ko | 423.5 Ko | +0.1 % |
| `/fr/cuc-team-cascadeur` | 423.9 Ko | 423.5 Ko | +0.1 % |
| `/en/formation-de-cascadeur` | 423 Ko | 422.6 Ko | +0.1 % |
| `/fr/formation-de-cascadeur` | 423 Ko | 422.6 Ko | +0.1 % |
| `/en/visite-guidee` | 421.5 Ko | 421.1 Ko | +0.1 % |
| `/fr/visite-guidee` | 421.5 Ko | 421.1 Ko | +0.1 % |
| `/en/contact-cuc` | 420.1 Ko | 419.7 Ko | +0.1 % |
| `/fr/contact-cuc` | 420.1 Ko | 419.7 Ko | +0.1 % |

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

