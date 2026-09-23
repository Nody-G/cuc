# Revue — Poids JS par route (budget)

Généré le 2026-09-23T06:17:50.842Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque
route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier
chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,
avertissement **> +2 %**. Régénérer la baseline (après revue) :
`npm run audit:route-weight:baseline`.

## Baseline régénérée (56 routes)

- `/en` — **435.4 Ko**
- `/fr` — **435.4 Ko**
- `/en/cuc-team-cascadeur` — **423.5 Ko**
- `/fr/cuc-team-cascadeur` — **423.5 Ko**
- `/en/formation-de-cascadeur` — **422.6 Ko**
- `/fr/formation-de-cascadeur` — **422.6 Ko**
- `/en/visite-guidee` — **421.1 Ko**
- `/fr/visite-guidee` — **421.1 Ko**
- `/en/contact-cuc` — **419.7 Ko**
- `/fr/contact-cuc` — **419.7 Ko**
- `/en/equipe-cascadeurs-pro` — **418.2 Ko**
- `/fr/equipe-cascadeurs-pro` — **418.2 Ko**
- `/en/stages-cascades-parkour-2` — **416.5 Ko**
- `/fr/stages-cascades-parkour-2` — **416.5 Ko**
- `/en/stunt-workshop-cuc` — **416.3 Ko**
- `/fr/stunt-workshop-cuc` — **416.3 Ko**
- `/en/partenaires` — **410.6 Ko**
- `/fr/partenaires` — **410.6 Ko**
- `/en/visite-virtuelle` — **410.5 Ko**
- `/fr/visite-virtuelle` — **410.5 Ko**
- `/en/cuc-events-agence` — **410.3 Ko**
- `/fr/cuc-events-agence` — **410.3 Ko**
- `/en/videos-cascadeur` — **409.3 Ko**
- `/fr/videos-cascadeur` — **409.3 Ko**
- `/en/equipe-cascadeurs-pro/alan-cueff` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/amedeo-cazzella` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/bastien-trouve` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/franck-blanc` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/jerome-gaspard` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/kefi-abrikh` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/lucas-dollfus` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/malik-diouf` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/maurice-chan` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/michel-bouis` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/niels-dalery` — **407.9 Ko**
- `/en/equipe-cascadeurs-pro/vincent-bouillon` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/alan-cueff` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/bastien-trouve` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/franck-blanc` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/jerome-gaspard` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/kefi-abrikh` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/lucas-dollfus` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/malik-diouf` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/maurice-chan` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/michel-bouis` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/niels-dalery` — **407.9 Ko**
- `/fr/equipe-cascadeurs-pro/vincent-bouillon` — **407.9 Ko**
- `/en/animations-airbag-parkour` — **407.2 Ko**
- `/fr/animations-airbag-parkour` — **407.2 Ko**
- `/en/spectacles-cascadeurs-yamakasi` — **407.1 Ko**
- `/fr/spectacles-cascadeurs-yamakasi` — **407.1 Ko**
- `/en/team-building-cascades` — **407.1 Ko**
- `/fr/team-building-cascades` — **407.1 Ko**
- `/en/preview` — **0 Ko**
- `/fr/preview` — **0 Ko**
