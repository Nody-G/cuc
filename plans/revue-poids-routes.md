# Revue — Poids JS par route (budget)

Généré le 2026-10-18T19:59:00.491Z par `scripts/audit_route_weight.mjs`.

Mesure : somme **gzip** des chunks JS réellement téléchargés au premier écran (HTML
prérendu public `fr/*`, `en/*`) — les scripts `nomodule` (chunk legacy `polyfills-*.js`)
sont **exclus** car aucun navigateur moderne ne les télécharge, et listés à part ci-dessous.
Cibles aspirantes : `scripts/route-weight-budget.json` (paliers A/B + plafond absolu) —
la dette restante est affichée mais **non bloquante** tant que le ratchet tient.
Garde-fou bloquant (ratchet monotone) : `scripts/route-weight-ratchet.json` — échec si
**> +5 %** au-dessus du ratchet ; avertissement : **> +2 %**. Régénérer (après revue) :
`npm run audit:route-weight:baseline`.

## Verdict

**OK (ratchet)** — 72 routes mesurées : aucune régression > +5 % vs ratchet.

- régressions ratchet (> +5 %) : 0
- cibles aspirantes dépassées (dette suivie, non bloquant) : 44
- proches d’une cible (< 10 %) : 0
- dérives ratchet (> +2 %) : 0
- améliorations (< −2 % ratchet) : 0
- nouvelles routes (hors ratchet) : 0
- routes absentes du build : 0
- routes sans palier déclaré (cible absolue seule) : 44
- scripts `nomodule` exclus du poids (transparence) : 1 chunk(s), 38.7 Ko

## Budget par route (cibles aspirantes + ratchet bloquant)

| Route | Palier | Poids | Cible | Cible aspirante | Statut |
| --- | :---: | ---: | ---: | ---: | :---: |
| `/en/cuc-team-cascadeur` | B | 403 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/cuc-team-cascadeur` | B | 403 Ko | 300 Ko | 360 Ko | hors cible |
| `/en/equipe-cascadeurs-pro` | B | 395.7 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro` | B | 395.7 Ko | 300 Ko | 360 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/alan-cueff` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/alex-vu` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/amedeo-cazzella` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/anthony-pho` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/bastien-trouve` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/franck-blanc` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/frederic-dessains` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/jerome-gaspard` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/jonathan-bernard` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/kefi-abrikh` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/lucas-dollfus` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/malik-diouf` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/maurice-chan` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/michel-bouis` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/nicolas-retabi` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/niels-dalery` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/pierre-toubas` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/sarah-belala` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/teddy-ponceau` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/vincent-bouillon` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/alan-cueff` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/alex-vu` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/amedeo-cazzella` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/anthony-pho` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/bastien-trouve` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/franck-blanc` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/frederic-dessains` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/jerome-gaspard` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/jonathan-bernard` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/kefi-abrikh` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/lucas-dollfus` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/malik-diouf` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/maurice-chan` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/michel-bouis` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/nicolas-retabi` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/niels-dalery` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/pierre-toubas` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/sarah-belala` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/teddy-ponceau` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/vincent-bouillon` | — | 388.9 Ko | — | 380 Ko | hors cible |
| `/en` | A | 263.8 Ko | 250 Ko | 300 Ko | cible dépassée |
| `/fr` | A | 263.8 Ko | 250 Ko | 300 Ko | cible dépassée |
| `/en/visite-guidee` | — | 254.8 Ko | — | 380 Ko | OK |
| `/fr/visite-guidee` | — | 254.8 Ko | — | 380 Ko | OK |
| `/en/formation-de-cascadeur` | A | 253.4 Ko | 250 Ko | 300 Ko | cible dépassée |
| `/fr/formation-de-cascadeur` | A | 253.4 Ko | 250 Ko | 300 Ko | cible dépassée |
| `/en/videos-cascadeur` | B | 247.6 Ko | 300 Ko | 360 Ko | OK |
| `/fr/videos-cascadeur` | B | 247.6 Ko | 300 Ko | 360 Ko | OK |
| `/en/contact-cuc` | A | 243.2 Ko | 250 Ko | 300 Ko | OK |
| `/fr/contact-cuc` | A | 243.2 Ko | 250 Ko | 300 Ko | OK |
| `/en/stages-cascades-parkour-2` | A | 241.9 Ko | 250 Ko | 300 Ko | OK |
| `/fr/stages-cascades-parkour-2` | A | 241.9 Ko | 250 Ko | 300 Ko | OK |
| `/en/partenaires` | A | 237.7 Ko | 250 Ko | 300 Ko | OK |
| `/fr/partenaires` | A | 237.7 Ko | 250 Ko | 300 Ko | OK |
| `/en/stunt-workshop-cuc` | A | 237.5 Ko | 250 Ko | 300 Ko | OK |
| `/fr/stunt-workshop-cuc` | A | 237.5 Ko | 250 Ko | 300 Ko | OK |
| `/en/cuc-events-agence` | A | 237.1 Ko | 250 Ko | 300 Ko | OK |
| `/fr/cuc-events-agence` | A | 237.1 Ko | 250 Ko | 300 Ko | OK |
| `/en/spectacles-cascadeurs-yamakasi` | A | 229.3 Ko | 250 Ko | 300 Ko | OK |
| `/fr/spectacles-cascadeurs-yamakasi` | A | 229.3 Ko | 250 Ko | 300 Ko | OK |
| `/en/animations-airbag-parkour` | A | 225.7 Ko | 250 Ko | 300 Ko | OK |
| `/en/team-building-cascades` | A | 225.7 Ko | 250 Ko | 300 Ko | OK |
| `/en/visite-virtuelle` | B | 225.7 Ko | 300 Ko | 360 Ko | OK |
| `/fr/animations-airbag-parkour` | A | 225.7 Ko | 250 Ko | 300 Ko | OK |
| `/fr/team-building-cascades` | A | 225.7 Ko | 250 Ko | 300 Ko | OK |
| `/fr/visite-virtuelle` | B | 225.7 Ko | 300 Ko | 360 Ko | OK |
| `/en/preview` | — | 0 Ko | — | 380 Ko | OK |
| `/fr/preview` | — | 0 Ko | — | 380 Ko | OK |

## Routes les plus lourdes (top 10)

| Route | Poids | Ratchet | Δ |
| --- | ---: | ---: | ---: |
| `/en/cuc-team-cascadeur` | 403 Ko | 403 Ko | +0.0 % |
| `/fr/cuc-team-cascadeur` | 403 Ko | 403 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro` | 395.7 Ko | 395.7 Ko | +0.0 % |
| `/fr/equipe-cascadeurs-pro` | 395.7 Ko | 395.7 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/alan-cueff` | 388.9 Ko | 388.9 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/alex-vu` | 388.9 Ko | 388.9 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/amedeo-cazzella` | 388.9 Ko | 388.9 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/anthony-pho` | 388.9 Ko | 388.9 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/bastien-trouve` | 388.9 Ko | 388.9 Ko | +0.0 % |
| `/en/equipe-cascadeurs-pro/franck-blanc` | 388.9 Ko | 388.9 Ko | +0.0 % |

## Cibles aspirantes dépassées (dette suivie — non bloquant sous ratchet)

- `/en/cuc-team-cascadeur` — 403 Ko / cible 360 Ko (palier B)
- `/fr/cuc-team-cascadeur` — 403 Ko / cible 360 Ko (palier B)
- `/en/equipe-cascadeurs-pro` — 395.7 Ko / cible 360 Ko (palier B)
- `/fr/equipe-cascadeurs-pro` — 395.7 Ko / cible 360 Ko (palier B)
- `/en/equipe-cascadeurs-pro/alan-cueff` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/alex-vu` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/amedeo-cazzella` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/anthony-pho` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/bastien-trouve` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/franck-blanc` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/frederic-dessains` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/jerome-gaspard` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/jonathan-bernard` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/kefi-abrikh` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/lucas-dollfus` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/malik-diouf` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/maurice-chan` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/michel-bouis` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/nicolas-retabi` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/niels-dalery` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/pierre-toubas` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/sarah-belala` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/teddy-ponceau` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/vincent-bouillon` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/alan-cueff` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/alex-vu` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/anthony-pho` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/bastien-trouve` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/franck-blanc` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/frederic-dessains` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/jerome-gaspard` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/jonathan-bernard` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/kefi-abrikh` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/lucas-dollfus` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/malik-diouf` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/maurice-chan` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/michel-bouis` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/nicolas-retabi` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/niels-dalery` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/pierre-toubas` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/sarah-belala` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/teddy-ponceau` — 388.9 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/vincent-bouillon` — 388.9 Ko / cible 380 Ko (plafond absolu)

## Au-dessus de la cible de palier (sous la cible aspirante)

- `/en` — 263.8 Ko (cible 250 Ko)
- `/fr` — 263.8 Ko (cible 250 Ko)
- `/en/formation-de-cascadeur` — 253.4 Ko (cible 250 Ko)
- `/fr/formation-de-cascadeur` — 253.4 Ko (cible 250 Ko)

## Routes publiques sans palier déclaré (cible absolue seule)

- `/en/equipe-cascadeurs-pro/alan-cueff`
- `/en/equipe-cascadeurs-pro/alex-vu`
- `/en/equipe-cascadeurs-pro/amedeo-cazzella`
- `/en/equipe-cascadeurs-pro/anthony-pho`
- `/en/equipe-cascadeurs-pro/bastien-trouve`
- `/en/equipe-cascadeurs-pro/franck-blanc`
- `/en/equipe-cascadeurs-pro/frederic-dessains`
- `/en/equipe-cascadeurs-pro/jerome-gaspard`
- `/en/equipe-cascadeurs-pro/jonathan-bernard`
- `/en/equipe-cascadeurs-pro/kefi-abrikh`
- `/en/equipe-cascadeurs-pro/lucas-dollfus`
- `/en/equipe-cascadeurs-pro/malik-diouf`
- `/en/equipe-cascadeurs-pro/maurice-chan`
- `/en/equipe-cascadeurs-pro/michel-bouis`
- `/en/equipe-cascadeurs-pro/nicolas-retabi`
- `/en/equipe-cascadeurs-pro/niels-dalery`
- `/en/equipe-cascadeurs-pro/pierre-toubas`
- `/en/equipe-cascadeurs-pro/sarah-belala`
- `/en/equipe-cascadeurs-pro/teddy-ponceau`
- `/en/equipe-cascadeurs-pro/vincent-bouillon`
- `/fr/equipe-cascadeurs-pro/alan-cueff`
- `/fr/equipe-cascadeurs-pro/alex-vu`
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella`
- `/fr/equipe-cascadeurs-pro/anthony-pho`
- `/fr/equipe-cascadeurs-pro/bastien-trouve`
- `/fr/equipe-cascadeurs-pro/franck-blanc`
- `/fr/equipe-cascadeurs-pro/frederic-dessains`
- `/fr/equipe-cascadeurs-pro/jerome-gaspard`
- `/fr/equipe-cascadeurs-pro/jonathan-bernard`
- `/fr/equipe-cascadeurs-pro/kefi-abrikh`
- `/fr/equipe-cascadeurs-pro/lucas-dollfus`
- `/fr/equipe-cascadeurs-pro/malik-diouf`
- `/fr/equipe-cascadeurs-pro/maurice-chan`
- `/fr/equipe-cascadeurs-pro/michel-bouis`
- `/fr/equipe-cascadeurs-pro/nicolas-retabi`
- `/fr/equipe-cascadeurs-pro/niels-dalery`
- `/fr/equipe-cascadeurs-pro/pierre-toubas`
- `/fr/equipe-cascadeurs-pro/sarah-belala`
- `/fr/equipe-cascadeurs-pro/teddy-ponceau`
- `/fr/equipe-cascadeurs-pro/vincent-bouillon`
- `/en/visite-guidee`
- `/fr/visite-guidee`
- `/en/preview`
- `/fr/preview`

## Scripts `nomodule` exclus du poids (legacy — jamais téléchargés par un navigateur moderne)

Total exclu : **38.7 Ko** gzip sur 1 chunk(s).

- `static/chunks/polyfills-42372ed130431b0a.js` — 38.7 Ko

