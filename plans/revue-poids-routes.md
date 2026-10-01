# Revue — Poids JS par route (budget)

Généré le 2026-10-01T15:08:55.907Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque
route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier
chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,
avertissement **> +2 %**. Régénérer la baseline (après revue) :
`npm run audit:route-weight:baseline`.

## Verdict

**OK** — 72 routes mesurées, aucune au-dessus de +5 %.

- avertissements (> +2 %) : 68
- améliorations (< −2 %) : 2
- nouvelles routes (hors baseline) : 2
- routes absentes du build : 0

## Routes les plus lourdes (top 10)

| Route | Poids | Baseline | Δ |
| --- | ---: | ---: | ---: |
| `/en/contact-cuc` | 570 Ko | 546.3 Ko | +4.3 % |
| `/fr/contact-cuc` | 570 Ko | 546.3 Ko | +4.3 % |
| `/en/visite-guidee` | 569.9 Ko | 551.9 Ko | +3.3 % |
| `/fr/visite-guidee` | 569.9 Ko | 551.9 Ko | +3.3 % |
| `/en/cuc-team-cascadeur` | 569.2 Ko | 556.7 Ko | +2.2 % |
| `/fr/cuc-team-cascadeur` | 569.2 Ko | 556.7 Ko | +2.2 % |
| `/en/formation-de-cascadeur` | 568.1 Ko | 546.1 Ko | +4.0 % |
| `/fr/formation-de-cascadeur` | 568.1 Ko | 546.1 Ko | +4.0 % |
| `/en/partenaires` | 564 Ko | 541 Ko | +4.3 % |
| `/fr/partenaires` | 564 Ko | 541 Ko | +4.3 % |

## Avertissements (> +2 %)

- `/en/contact-cuc` — 570 Ko (baseline 546.3 Ko, +4.3 %)
- `/fr/contact-cuc` — 570 Ko (baseline 546.3 Ko, +4.3 %)
- `/en/partenaires` — 564 Ko (baseline 541 Ko, +4.3 %)
- `/fr/partenaires` — 564 Ko (baseline 541 Ko, +4.3 %)
- `/en/formation-de-cascadeur` — 568.1 Ko (baseline 546.1 Ko, +4.0 %)
- `/fr/formation-de-cascadeur` — 568.1 Ko (baseline 546.1 Ko, +4.0 %)
- `/en/stunt-workshop-cuc` — 560.7 Ko (baseline 540 Ko, +3.8 %)
- `/fr/stunt-workshop-cuc` — 560.7 Ko (baseline 540 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro` — 564 Ko (baseline 543.4 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro` — 564 Ko (baseline 543.4 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/alan-cueff` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/alex-vu` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/amedeo-cazzella` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/anthony-pho` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/bastien-trouve` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/franck-blanc` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/frederic-dessains` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/jerome-gaspard` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/jonathan-bernard` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/kefi-abrikh` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/lucas-dollfus` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/malik-diouf` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/maurice-chan` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/michel-bouis` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/nicolas-retabi` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/niels-dalery` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/pierre-toubas` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/sarah-belala` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/teddy-ponceau` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/equipe-cascadeurs-pro/vincent-bouillon` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/alan-cueff` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/alex-vu` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/anthony-pho` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/bastien-trouve` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/franck-blanc` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/frederic-dessains` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/jerome-gaspard` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/jonathan-bernard` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/kefi-abrikh` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/lucas-dollfus` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/malik-diouf` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/maurice-chan` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/michel-bouis` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/nicolas-retabi` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/niels-dalery` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/pierre-toubas` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/sarah-belala` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/teddy-ponceau` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/fr/equipe-cascadeurs-pro/vincent-bouillon` — 560.6 Ko (baseline 540.2 Ko, +3.8 %)
- `/en/videos-cascadeur` — 562.6 Ko (baseline 542.6 Ko, +3.7 %)
- `/fr/videos-cascadeur` — 562.6 Ko (baseline 542.6 Ko, +3.7 %)
- `/en/visite-guidee` — 569.9 Ko (baseline 551.9 Ko, +3.3 %)
- `/fr/visite-guidee` — 569.9 Ko (baseline 551.9 Ko, +3.3 %)
- `/en/visite-virtuelle` — 557.6 Ko (baseline 540.9 Ko, +3.1 %)
- `/fr/visite-virtuelle` — 557.6 Ko (baseline 540.9 Ko, +3.1 %)
- `/en/stages-cascades-parkour-2` — 556.6 Ko (baseline 540 Ko, +3.1 %)
- `/fr/stages-cascades-parkour-2` — 556.6 Ko (baseline 540 Ko, +3.1 %)
- `/en/cuc-events-agence` — 556.4 Ko (baseline 541 Ko, +2.9 %)
- `/fr/cuc-events-agence` — 556.4 Ko (baseline 541 Ko, +2.9 %)
- `/en/spectacles-cascadeurs-yamakasi` — 552.9 Ko (baseline 537.7 Ko, +2.8 %)
- `/fr/spectacles-cascadeurs-yamakasi` — 552.9 Ko (baseline 537.7 Ko, +2.8 %)
- `/en/animations-airbag-parkour` — 552.9 Ko (baseline 537.8 Ko, +2.8 %)
- `/fr/animations-airbag-parkour` — 552.9 Ko (baseline 537.8 Ko, +2.8 %)
- `/en/team-building-cascades` — 552.9 Ko (baseline 537.8 Ko, +2.8 %)
- `/fr/team-building-cascades` — 552.9 Ko (baseline 537.8 Ko, +2.8 %)
- `/en/cuc-team-cascadeur` — 569.2 Ko (baseline 556.7 Ko, +2.2 %)
- `/fr/cuc-team-cascadeur` — 569.2 Ko (baseline 556.7 Ko, +2.2 %)

## Nouvelles routes (hors baseline — régénérer la baseline après revue)

- `/en/preview`
- `/fr/preview`

