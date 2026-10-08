# Revue — Poids JS par route (budget)

Généré le 2026-10-07T00:48:33.928Z par `scripts/audit_route_weight.mjs`.

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
- cibles aspirantes dépassées (dette suivie, non bloquant) : 70
- proches d’une cible (< 10 %) : 0
- dérives ratchet (> +2 %) : 4
- améliorations (< −2 % ratchet) : 0
- nouvelles routes (hors ratchet) : 0
- routes absentes du build : 0
- routes sans palier déclaré (cible absolue seule) : 44
- scripts `nomodule` exclus du poids (transparence) : 1 chunk(s), 38.7 Ko

## Budget par route (cibles aspirantes + ratchet bloquant)

| Route | Palier | Poids | Cible | Cible aspirante | Statut |
| --- | :---: | ---: | ---: | ---: | :---: |
| `/en/cuc-team-cascadeur` | B | 467.7 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/cuc-team-cascadeur` | B | 467.7 Ko | 300 Ko | 360 Ko | hors cible |
| `/en/equipe-cascadeurs-pro` | B | 464.5 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro` | B | 464.5 Ko | 300 Ko | 360 Ko | hors cible |
| `/en` | A | 461.1 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr` | A | 461.1 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/visite-guidee` | — | 460.6 Ko | — | 380 Ko | hors cible |
| `/fr/visite-guidee` | — | 460.6 Ko | — | 380 Ko | hors cible |
| `/en/contact-cuc` | A | 459.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/contact-cuc` | A | 459.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/alan-cueff` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/alex-vu` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/amedeo-cazzella` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/anthony-pho` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/bastien-trouve` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/franck-blanc` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/frederic-dessains` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/jerome-gaspard` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/jonathan-bernard` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/kefi-abrikh` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/lucas-dollfus` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/malik-diouf` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/maurice-chan` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/michel-bouis` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/nicolas-retabi` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/niels-dalery` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/pierre-toubas` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/sarah-belala` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/teddy-ponceau` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/equipe-cascadeurs-pro/vincent-bouillon` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/alan-cueff` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/alex-vu` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/amedeo-cazzella` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/anthony-pho` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/bastien-trouve` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/franck-blanc` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/frederic-dessains` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/jerome-gaspard` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/jonathan-bernard` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/kefi-abrikh` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/lucas-dollfus` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/malik-diouf` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/maurice-chan` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/michel-bouis` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/nicolas-retabi` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/niels-dalery` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/pierre-toubas` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/sarah-belala` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/teddy-ponceau` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/fr/equipe-cascadeurs-pro/vincent-bouillon` | — | 458.4 Ko | — | 380 Ko | hors cible |
| `/en/formation-de-cascadeur` | A | 457.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/formation-de-cascadeur` | A | 457.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/videos-cascadeur` | B | 456 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/videos-cascadeur` | B | 456 Ko | 300 Ko | 360 Ko | hors cible |
| `/en/partenaires` | A | 453.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/partenaires` | A | 453.7 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/stunt-workshop-cuc` | A | 453.4 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/stunt-workshop-cuc` | A | 453.4 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/cuc-events-agence` | A | 452.5 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/cuc-events-agence` | A | 452.5 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/stages-cascades-parkour-2` | A | 446.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/stages-cascades-parkour-2` | A | 446.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/spectacles-cascadeurs-yamakasi` | A | 445.8 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/spectacles-cascadeurs-yamakasi` | A | 445.8 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/animations-airbag-parkour` | A | 442.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/team-building-cascades` | A | 442.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/en/visite-virtuelle` | B | 442.2 Ko | 300 Ko | 360 Ko | hors cible |
| `/fr/animations-airbag-parkour` | A | 442.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/team-building-cascades` | A | 442.2 Ko | 250 Ko | 300 Ko | hors cible |
| `/fr/visite-virtuelle` | B | 442.2 Ko | 300 Ko | 360 Ko | hors cible |
| `/en/preview` | — | 0 Ko | — | 380 Ko | OK |
| `/fr/preview` | — | 0 Ko | — | 380 Ko | OK |

## Routes les plus lourdes (top 10)

| Route | Poids | Ratchet | Δ |
| --- | ---: | ---: | ---: |
| `/en/cuc-team-cascadeur` | 467.7 Ko | 459.6 Ko | +1.8 % |
| `/fr/cuc-team-cascadeur` | 467.7 Ko | 459.6 Ko | +1.8 % |
| `/en/equipe-cascadeurs-pro` | 464.5 Ko | 456.3 Ko | +1.8 % |
| `/fr/equipe-cascadeurs-pro` | 464.5 Ko | 456.3 Ko | +1.8 % |
| `/en` | 461.1 Ko | 455.4 Ko | +1.2 % |
| `/fr` | 461.1 Ko | 455.4 Ko | +1.2 % |
| `/en/visite-guidee` | 460.6 Ko | 454.2 Ko | +1.4 % |
| `/fr/visite-guidee` | 460.6 Ko | 454.2 Ko | +1.4 % |
| `/en/contact-cuc` | 459.7 Ko | 451.5 Ko | +1.8 % |
| `/fr/contact-cuc` | 459.7 Ko | 451.5 Ko | +1.8 % |

## Cibles aspirantes dépassées (dette suivie — non bloquant sous ratchet)

- `/en` — 461.1 Ko / cible 300 Ko (palier A)
- `/fr` — 461.1 Ko / cible 300 Ko (palier A)
- `/en/contact-cuc` — 459.7 Ko / cible 300 Ko (palier A)
- `/fr/contact-cuc` — 459.7 Ko / cible 300 Ko (palier A)
- `/en/formation-de-cascadeur` — 457.7 Ko / cible 300 Ko (palier A)
- `/fr/formation-de-cascadeur` — 457.7 Ko / cible 300 Ko (palier A)
- `/en/partenaires` — 453.7 Ko / cible 300 Ko (palier A)
- `/fr/partenaires` — 453.7 Ko / cible 300 Ko (palier A)
- `/en/stunt-workshop-cuc` — 453.4 Ko / cible 300 Ko (palier A)
- `/fr/stunt-workshop-cuc` — 453.4 Ko / cible 300 Ko (palier A)
- `/en/cuc-events-agence` — 452.5 Ko / cible 300 Ko (palier A)
- `/fr/cuc-events-agence` — 452.5 Ko / cible 300 Ko (palier A)
- `/en/stages-cascades-parkour-2` — 446.2 Ko / cible 300 Ko (palier A)
- `/fr/stages-cascades-parkour-2` — 446.2 Ko / cible 300 Ko (palier A)
- `/en/spectacles-cascadeurs-yamakasi` — 445.8 Ko / cible 300 Ko (palier A)
- `/fr/spectacles-cascadeurs-yamakasi` — 445.8 Ko / cible 300 Ko (palier A)
- `/en/animations-airbag-parkour` — 442.2 Ko / cible 300 Ko (palier A)
- `/en/team-building-cascades` — 442.2 Ko / cible 300 Ko (palier A)
- `/fr/animations-airbag-parkour` — 442.2 Ko / cible 300 Ko (palier A)
- `/fr/team-building-cascades` — 442.2 Ko / cible 300 Ko (palier A)
- `/en/cuc-team-cascadeur` — 467.7 Ko / cible 360 Ko (palier B)
- `/fr/cuc-team-cascadeur` — 467.7 Ko / cible 360 Ko (palier B)
- `/en/equipe-cascadeurs-pro` — 464.5 Ko / cible 360 Ko (palier B)
- `/fr/equipe-cascadeurs-pro` — 464.5 Ko / cible 360 Ko (palier B)
- `/en/videos-cascadeur` — 456 Ko / cible 360 Ko (palier B)
- `/fr/videos-cascadeur` — 456 Ko / cible 360 Ko (palier B)
- `/en/visite-virtuelle` — 442.2 Ko / cible 360 Ko (palier B)
- `/fr/visite-virtuelle` — 442.2 Ko / cible 360 Ko (palier B)
- `/en/visite-guidee` — 460.6 Ko / cible 380 Ko (plafond absolu)
- `/fr/visite-guidee` — 460.6 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/alan-cueff` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/alex-vu` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/amedeo-cazzella` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/anthony-pho` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/bastien-trouve` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/franck-blanc` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/frederic-dessains` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/jerome-gaspard` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/jonathan-bernard` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/kefi-abrikh` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/lucas-dollfus` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/malik-diouf` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/maurice-chan` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/michel-bouis` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/nicolas-retabi` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/niels-dalery` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/pierre-toubas` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/sarah-belala` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/teddy-ponceau` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/en/equipe-cascadeurs-pro/vincent-bouillon` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/alan-cueff` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/alex-vu` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/amedeo-cazzella` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/anthony-pho` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/bastien-trouve` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/franck-blanc` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/frederic-dessains` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/jerome-gaspard` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/jonathan-bernard` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/kefi-abrikh` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/lucas-dollfus` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/malik-diouf` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/maurice-chan` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/michel-bouis` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/nicolas-retabi` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/niels-dalery` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/pierre-toubas` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/sarah-belala` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/teddy-ponceau` — 458.4 Ko / cible 380 Ko (plafond absolu)
- `/fr/equipe-cascadeurs-pro/vincent-bouillon` — 458.4 Ko / cible 380 Ko (plafond absolu)

## Routes publiques sans palier déclaré (cible absolue seule)

- `/en/visite-guidee`
- `/fr/visite-guidee`
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
- `/en/preview`
- `/fr/preview`

## Avertissements ratchet (> +2 %)

- `/en/spectacles-cascadeurs-yamakasi` — 445.8 Ko (ratchet 434.2 Ko, +2.7 %)
- `/fr/spectacles-cascadeurs-yamakasi` — 445.8 Ko (ratchet 434.2 Ko, +2.7 %)
- `/en/videos-cascadeur` — 456 Ko (ratchet 444.4 Ko, +2.6 %)
- `/fr/videos-cascadeur` — 456 Ko (ratchet 444.4 Ko, +2.6 %)

## Scripts `nomodule` exclus du poids (legacy — jamais téléchargés par un navigateur moderne)

Total exclu : **38.7 Ko** gzip sur 1 chunk(s).

- `static/chunks/polyfills-42372ed130431b0a.js` — 38.7 Ko

