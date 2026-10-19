# Revue — Poids HTML par route (WS-F / F0)

Généré le 2026-10-18T19:51:31.609Z par `scripts/audit_html_weight.mjs`.

Mesure : **octets HTML réellement servis** sur les pages prérendues `fr`/`en`
(fichiers `.next/server/app/**`) ; la colonne « vol RSC » isole la part du payload
`self.__next_f.push(...)` (catalogue i18n + overlays + données sérialisées).

Mode **non bloquant** : les plafonds de `plans/route-html-budget.json` sont une
cible d’ingénierie, pas un verrou de CI (utiliser `--strict` pour rendre opposable).

| Route | HTML | vol RSC | Δ baseline | cible | plafond | statut |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| `/en/equipe-cascadeurs-pro` | 478.4 Ko | 52.6 Ko | -49.7 Ko | 300 Ko | 400 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro` | 474.8 Ko | 47.3 Ko | -39.4 Ko | 300 Ko | 400 Ko | hors cible |
| `/en/cuc-team-cascadeur` | 388.2 Ko | 52.6 Ko | -80.2 Ko | 300 Ko | 400 Ko | proche |
| `/fr/cuc-team-cascadeur` | 384.7 Ko | 47.4 Ko | -69.7 Ko | 300 Ko | 400 Ko | proche |
| `/en/equipe-cascadeurs-pro/amedeo-cazzella` | 266.7 Ko | 54.1 Ko | -444.2 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/vincent-bouillon` | 266.6 Ko | 54.1 Ko | -322.9 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/kefi-abrikh` | 266.5 Ko | 54.1 Ko | -308.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/anthony-pho` | 266.3 Ko | 54 Ko | -284.9 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/pierre-toubas` | 266.2 Ko | 54.1 Ko | -107.5 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/jerome-gaspard` | 266.2 Ko | 54 Ko | -842.4 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/michel-bouis` | 266.1 Ko | 54 Ko | -367.1 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/frederic-dessains` | 266 Ko | 54.1 Ko | -231.1 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/malik-diouf` | 265.9 Ko | 53.9 Ko | -293.4 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/teddy-ponceau` | 265.2 Ko | 54.1 Ko | -143.5 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/nicolas-retabi` | 264.8 Ko | 54.1 Ko | -53.8 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/jonathan-bernard` | 264.5 Ko | 54.1 Ko | -71.8 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/alex-vu` | 264.4 Ko | 54 Ko | -139.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/bastien-trouve` | 263.8 Ko | 54 Ko | -106.7 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/franck-blanc` | 263.7 Ko | 54.1 Ko | -247.1 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/maurice-chan` | 263.5 Ko | 54.1 Ko | -223.7 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/sarah-belala` | 263.4 Ko | 54.1 Ko | -120.9 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/amedeo-cazzella` | 263 Ko | 48.8 Ko | -434.3 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/vincent-bouillon` | 262.8 Ko | 48.8 Ko | -312.8 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/kefi-abrikh` | 262.6 Ko | 48.8 Ko | -298.2 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/jerome-gaspard` | 262.4 Ko | 48.8 Ko | -832.8 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/michel-bouis` | 262.4 Ko | 48.8 Ko | -357.2 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/anthony-pho` | 262.3 Ko | 48.7 Ko | -274.8 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/pierre-toubas` | 262.3 Ko | 48.8 Ko | -97.1 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/malik-diouf` | 262.1 Ko | 48.7 Ko | -283.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/frederic-dessains` | 262.1 Ko | 48.8 Ko | -220.9 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/teddy-ponceau` | 261.3 Ko | 48.8 Ko | -133.2 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/nicolas-retabi` | 261 Ko | 48.8 Ko | -43.4 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/lucas-dollfus` | 260.9 Ko | 54 Ko | -88.9 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/jonathan-bernard` | 260.6 Ko | 48.8 Ko | -61.4 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/alex-vu` | 260.5 Ko | 48.7 Ko | -129 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/bastien-trouve` | 260.3 Ko | 48.8 Ko | -96.3 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/maurice-chan` | 259.8 Ko | 48.8 Ko | -213.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/franck-blanc` | 259.7 Ko | 48.8 Ko | -236.9 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/sarah-belala` | 259.6 Ko | 48.8 Ko | -110.6 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/lucas-dollfus` | 257.1 Ko | 48.8 Ko | -78.5 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/alan-cueff` | 244.9 Ko | 54 Ko | -49.6 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/alan-cueff` | 241 Ko | 48.8 Ko | -39.2 Ko | — | 500 Ko | OK |
| `/en/visite-guidee` | 240.8 Ko | 57.7 Ko | -36.2 Ko | — | 500 Ko | OK |
| `/en` | 232.6 Ko | 62 Ko | -41.8 Ko | 250 Ko | 350 Ko | OK |
| `/fr/visite-guidee` | 231.9 Ko | 47.3 Ko | -31 Ko | — | 500 Ko | OK |
| `/fr` | 229.5 Ko | 57.2 Ko | -30.8 Ko | 250 Ko | 350 Ko | OK |
| `/en/videos-cascadeur` | 182.7 Ko | 52.6 Ko | -50.9 Ko | 300 Ko | 400 Ko | OK |
| `/fr/videos-cascadeur` | 178.6 Ko | 47.2 Ko | -40.8 Ko | 300 Ko | 400 Ko | OK |
| `/en/formation-de-cascadeur` | 173.5 Ko | 61.3 Ko | -43 Ko | 250 Ko | 350 Ko | OK |
| `/en/partenaires` | 170.4 Ko | 50.3 Ko | -51.6 Ko | 250 Ko | 350 Ko | OK |
| `/fr/partenaires` | 166.3 Ko | 44.8 Ko | -41.6 Ko | 250 Ko | 350 Ko | OK |
| `/fr/formation-de-cascadeur` | 162.7 Ko | 48.7 Ko | -40.1 Ko | 250 Ko | 350 Ko | OK |
| `/en/equipe-cascadeurs-pro/niels-dalery` | 161.2 Ko | 54 Ko | -49.6 Ko | — | 500 Ko | OK |
| `/en/contact-cuc` | 158.8 Ko | 53.7 Ko | -49.1 Ko | 250 Ko | 350 Ko | OK |
| `/fr/equipe-cascadeurs-pro/niels-dalery` | 157.3 Ko | 48.8 Ko | -39.2 Ko | — | 500 Ko | OK |
| `/en/spectacles-cascadeurs-yamakasi` | 155.7 Ko | 49.2 Ko | -52.7 Ko | 250 Ko | 350 Ko | OK |
| `/en/stages-cascades-parkour-2` | 155.1 Ko | 52 Ko | -51.7 Ko | 250 Ko | 350 Ko | OK |
| `/fr/contact-cuc` | 154.8 Ko | 48.2 Ko | -38.8 Ko | 250 Ko | 350 Ko | OK |
| `/fr/spectacles-cascadeurs-yamakasi` | 151.6 Ko | 43.8 Ko | -42.6 Ko | 250 Ko | 350 Ko | OK |
| `/fr/stages-cascades-parkour-2` | 151.3 Ko | 46.7 Ko | -41.5 Ko | 250 Ko | 350 Ko | OK |
| `/en/team-building-cascades` | 150 Ko | 50.1 Ko | -54.5 Ko | 250 Ko | 350 Ko | OK |
| `/en/stunt-workshop-cuc` | 147.9 Ko | 47.4 Ko | -54.8 Ko | 250 Ko | 350 Ko | OK |
| `/fr/team-building-cascades` | 146 Ko | 44.6 Ko | -44.6 Ko | 250 Ko | 350 Ko | OK |
| `/en/cuc-events-agence` | 145.9 Ko | 50.3 Ko | -52 Ko | 250 Ko | 350 Ko | OK |
| `/fr/stunt-workshop-cuc` | 142.9 Ko | 41.5 Ko | -44.9 Ko | 250 Ko | 350 Ko | OK |
| `/fr/cuc-events-agence` | 142 Ko | 44.9 Ko | -41.7 Ko | 250 Ko | 350 Ko | OK |
| `/en/animations-airbag-parkour` | 131.7 Ko | 48.7 Ko | -53.9 Ko | 250 Ko | 350 Ko | OK |
| `/en/visite-virtuelle` | 128.8 Ko | 48.9 Ko | -53.1 Ko | 300 Ko | 400 Ko | OK |
| `/fr/animations-airbag-parkour` | 127.4 Ko | 43.1 Ko | -44 Ko | 250 Ko | 350 Ko | OK |
| `/fr/visite-virtuelle` | 124.7 Ko | 43.4 Ko | -43 Ko | 300 Ko | 400 Ko | OK |
| `/en/preview` | 0 Ko | 0 Ko | +0 Ko | — | 500 Ko | OK |
| `/fr/preview` | 0 Ko | 0 Ko | +0 Ko | — | 500 Ko | OK |

Total pages mesurées : **72**.
Total HTML : **16286.3 Ko** (-10199.3 Ko vs baseline).

### Routes au-dessus de leur plafond (cible d’ingénierie)

- `/en/equipe-cascadeurs-pro` — 478.4 Ko (> 400 Ko, palier B)
- `/fr/equipe-cascadeurs-pro` — 474.8 Ko (> 400 Ko, palier B)
