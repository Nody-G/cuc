# Revue — Poids HTML par route (WS-F / F0)

Généré le 2026-10-02T11:43:12.288Z par `scripts/audit_html_weight.mjs`.

Mesure : **octets HTML réellement servis** sur les pages prérendues `fr`/`en`
(fichiers `.next/server/app/**`) ; la colonne « vol RSC » isole la part du payload
`self.__next_f.push(...)` (catalogue i18n + overlays + données sérialisées).

Mode **non bloquant** : les plafonds de `plans/route-html-budget.json` sont une
cible d’ingénierie, pas un verrou de CI (utiliser `--strict` pour rendre opposable).

| Route | HTML | vol RSC | Δ baseline | cible | plafond | statut |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| `/en/equipe-cascadeurs-pro/jerome-gaspard` | 1052 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/jerome-gaspard` | 1049 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/amedeo-cazzella` | 654.4 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/amedeo-cazzella` | 651 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/michel-bouis` | 576.7 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/michel-bouis` | 573.3 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/vincent-bouillon` | 533 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/vincent-bouillon` | 529.3 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/kefi-abrikh` | 518.3 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/kefi-abrikh` | 514.5 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/malik-diouf` | 502.7 Ko | 47.5 Ko | -56.5 Ko | — | 500 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/malik-diouf` | 499.3 Ko | 42.2 Ko | -46.3 Ko | — | 500 Ko | proche |
| `/en/equipe-cascadeurs-pro/anthony-pho` | 494.6 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | proche |
| `/fr/equipe-cascadeurs-pro/anthony-pho` | 490.8 Ko | 42.2 Ko | -46.3 Ko | — | 500 Ko | proche |
| `/en/equipe-cascadeurs-pro` | 471.6 Ko | 46.2 Ko | -56.5 Ko | 300 Ko | 400 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro` | 468 Ko | 40.7 Ko | -46.2 Ko | 300 Ko | 400 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/franck-blanc` | 454.2 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | proche |
| `/fr/equipe-cascadeurs-pro/franck-blanc` | 450.4 Ko | 42.2 Ko | -46.3 Ko | — | 500 Ko | proche |
| `/en/equipe-cascadeurs-pro/frederic-dessains` | 440.5 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/frederic-dessains` | 436.7 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/maurice-chan` | 430.7 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/maurice-chan` | 427.1 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/cuc-team-cascadeur` | 411.9 Ko | 46.2 Ko | -56.5 Ko | 300 Ko | 400 Ko | hors cible |
| `/fr/cuc-team-cascadeur` | 408.2 Ko | 40.8 Ko | -46.2 Ko | 300 Ko | 400 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/teddy-ponceau` | 352.1 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/teddy-ponceau` | 348.3 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/alex-vu` | 347.2 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/alex-vu` | 343.2 Ko | 42.2 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/sarah-belala` | 327.8 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/sarah-belala` | 323.9 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/pierre-toubas` | 317.2 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/bastien-trouve` | 313.9 Ko | 47.5 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/pierre-toubas` | 313.1 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/bastien-trouve` | 310.3 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/lucas-dollfus` | 293.3 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/lucas-dollfus` | 289.4 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/jonathan-bernard` | 279.8 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/jonathan-bernard` | 275.8 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/nicolas-retabi` | 262.1 Ko | 47.7 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/nicolas-retabi` | 258.1 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/equipe-cascadeurs-pro/alan-cueff` | 237.9 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/fr/equipe-cascadeurs-pro/alan-cueff` | 233.9 Ko | 42.2 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/visite-guidee` | 225.7 Ko | 51.4 Ko | -51.3 Ko | — | 500 Ko | OK |
| `/en` | 224.1 Ko | 55.8 Ko | -50.3 Ko | 250 Ko | 350 Ko | OK |
| `/fr` | 220.8 Ko | 50.8 Ko | -39.5 Ko | 250 Ko | 350 Ko | OK |
| `/fr/visite-guidee` | 216.7 Ko | 40.9 Ko | -46.2 Ko | — | 500 Ko | OK |
| `/en/videos-cascadeur` | 175.6 Ko | 46.2 Ko | -58 Ko | 300 Ko | 400 Ko | OK |
| `/fr/videos-cascadeur` | 171.4 Ko | 40.7 Ko | -48 Ko | 300 Ko | 400 Ko | OK |
| `/en/formation-de-cascadeur` | 166.8 Ko | 55.1 Ko | -49.7 Ko | 250 Ko | 350 Ko | OK |
| `/en/partenaires` | 163.8 Ko | 44.1 Ko | -58.2 Ko | 250 Ko | 350 Ko | OK |
| `/fr/partenaires` | 159.5 Ko | 38.5 Ko | -48.3 Ko | 250 Ko | 350 Ko | OK |
| `/fr/formation-de-cascadeur` | 155.8 Ko | 42.3 Ko | -47 Ko | 250 Ko | 350 Ko | OK |
| `/en/equipe-cascadeurs-pro/niels-dalery` | 154.3 Ko | 47.6 Ko | -56.5 Ko | — | 500 Ko | OK |
| `/en/contact-cuc` | 152.1 Ko | 47.4 Ko | -55.8 Ko | 250 Ko | 350 Ko | OK |
| `/fr/equipe-cascadeurs-pro/niels-dalery` | 150.2 Ko | 42.3 Ko | -46.3 Ko | — | 500 Ko | OK |
| `/en/stages-cascades-parkour-2` | 148.6 Ko | 45.8 Ko | -58.3 Ko | 250 Ko | 350 Ko | OK |
| `/en/spectacles-cascadeurs-yamakasi` | 148.3 Ko | 42.6 Ko | -60.1 Ko | 250 Ko | 350 Ko | OK |
| `/fr/contact-cuc` | 148 Ko | 41.8 Ko | -45.7 Ko | 250 Ko | 350 Ko | OK |
| `/fr/stages-cascades-parkour-2` | 144.7 Ko | 40.4 Ko | -48.2 Ko | 250 Ko | 350 Ko | OK |
| `/fr/spectacles-cascadeurs-yamakasi` | 144.1 Ko | 37.1 Ko | -50.1 Ko | 250 Ko | 350 Ko | OK |
| `/en/team-building-cascades` | 143.4 Ko | 43.9 Ko | -61.1 Ko | 250 Ko | 350 Ko | OK |
| `/en/stunt-workshop-cuc` | 140.8 Ko | 40.9 Ko | -61.9 Ko | 250 Ko | 350 Ko | OK |
| `/fr/team-building-cascades` | 139.3 Ko | 38.3 Ko | -51.3 Ko | 250 Ko | 350 Ko | OK |
| `/en/cuc-events-agence` | 139.2 Ko | 44.1 Ko | -58.6 Ko | 250 Ko | 350 Ko | OK |
| `/fr/stunt-workshop-cuc` | 135.7 Ko | 34.9 Ko | -52.2 Ko | 250 Ko | 350 Ko | OK |
| `/fr/cuc-events-agence` | 135.2 Ko | 38.6 Ko | -48.4 Ko | 250 Ko | 350 Ko | OK |
| `/en/animations-airbag-parkour` | 125.5 Ko | 42.5 Ko | -60.2 Ko | 250 Ko | 350 Ko | OK |
| `/en/visite-virtuelle` | 122.3 Ko | 42.7 Ko | -59.6 Ko | 300 Ko | 400 Ko | OK |
| `/fr/animations-airbag-parkour` | 121.1 Ko | 36.9 Ko | -50.3 Ko | 250 Ko | 350 Ko | OK |
| `/fr/visite-virtuelle` | 118 Ko | 37.1 Ko | -49.7 Ko | 300 Ko | 400 Ko | OK |
| `/en/preview` | 0 Ko | 0 Ko | +0 Ko | — | 500 Ko | OK |
| `/fr/preview` | 0 Ko | 0 Ko | +0 Ko | — | 500 Ko | OK |

Total pages mesurées : **72**.
Total HTML : **22856.7 Ko** (-3629 Ko vs baseline).

### Routes au-dessus de leur plafond (cible d’ingénierie)

- `/en/equipe-cascadeurs-pro/jerome-gaspard` — 1052 Ko (> 500 Ko, plafond absolu)
- `/fr/equipe-cascadeurs-pro/jerome-gaspard` — 1049 Ko (> 500 Ko, plafond absolu)
- `/en/equipe-cascadeurs-pro/amedeo-cazzella` — 654.4 Ko (> 500 Ko, plafond absolu)
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella` — 651 Ko (> 500 Ko, plafond absolu)
- `/en/equipe-cascadeurs-pro/michel-bouis` — 576.7 Ko (> 500 Ko, plafond absolu)
- `/fr/equipe-cascadeurs-pro/michel-bouis` — 573.3 Ko (> 500 Ko, plafond absolu)
- `/en/equipe-cascadeurs-pro` — 471.6 Ko (> 400 Ko, palier B)
- `/fr/equipe-cascadeurs-pro` — 468 Ko (> 400 Ko, palier B)
- `/en/equipe-cascadeurs-pro/vincent-bouillon` — 533 Ko (> 500 Ko, plafond absolu)
- `/fr/equipe-cascadeurs-pro/vincent-bouillon` — 529.3 Ko (> 500 Ko, plafond absolu)
- `/en/equipe-cascadeurs-pro/kefi-abrikh` — 518.3 Ko (> 500 Ko, plafond absolu)
- `/fr/equipe-cascadeurs-pro/kefi-abrikh` — 514.5 Ko (> 500 Ko, plafond absolu)
- `/en/cuc-team-cascadeur` — 411.9 Ko (> 400 Ko, palier B)
- `/fr/cuc-team-cascadeur` — 408.2 Ko (> 400 Ko, palier B)
- `/en/equipe-cascadeurs-pro/malik-diouf` — 502.7 Ko (> 500 Ko, plafond absolu)
