# Revue — Badges & sous-titres de hero (base, FR + EN)

**Mode :** APPLIQUÉ (--write)
**Généré le :** 2026-09-21T22:33:30.548Z

## Règle appliquée

Un badge = une information ; la méta porte le détail que le badge ne porte pas ; le sous-titre ne répète ni le badge ni la méta. Le français et l’anglais sont traités **ensemble** (les overlays EN étaient restés sur les anciennes formulations).

## Incident d’échappement octal & réparation

La première normalisation SQL (`E'\1 •'`) a consommé le caractère précédant « • » sur quatre badges (échappement octal au lieu d’une rétro-référence) — réparés par littéraux :

- `/` → « PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA »
- `animations-airbag-parkour` → « AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL »
- `cuc-events-agence` → « AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN »
- `cuc-team-cascadeur` → « COORDINATION DE CASCADES • CINÉMA »

## Avant → Après — badges FR (`site_pages`)

| Page | Badge avant | Badge après |
| --- | --- | --- |
| `/` | PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA | PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA |
| `animations-airbag-parkour` | AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL | AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL |
| `contact-cuc` | ADMISSIONS & PROJETS | ADMISSIONS & PROJETS |
| `cuc-events-agence` | AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN | AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN |
| `cuc-team-cascadeur` | COORDINATION DE CASCADES • CINÉMA | COORDINATION DE CASCADES • CINÉMA |
| `equipe-cascadeurs-pro` | COACHS & PROFESSIONNELS DU CINÉMA | COACHS & PROFESSIONNELS DU CINÉMA |
| `formation-de-cascadeur` | 2 ANS • 720H À 800H | 2 ANS • 720H À 800H |
| `partenaires` | ILS NOUS ACCOMPAGNENT | ILS NOUS ACCOMPAGNENT |
| `spectacles-cascadeurs-yamakasi` | LE CINÉMA S’INVITE SUR SCÈNE | LE CINÉMA S’INVITE SUR SCÈNE |
| `stages-cascades-parkour-2` | TOUS NIVEAUX • DÈS 16 ANS | TOUS NIVEAUX • DÈS 16 ANS |
| `stunt-workshop-cuc` | STAGE INTERNATIONAL | STAGE INTERNATIONAL |
| `team-building-cascades` | SÉMINAIRES & ENTREPRISES | SÉMINAIRES & ENTREPRISES |
| `videos-cascadeur` | REPORTAGES TÉLÉVISION | REPORTAGES TÉLÉVISION |
| `visite-guidee` | INFRASTRUCTURES DE FORMATION | INFRASTRUCTURES DE FORMATION |
| `visite-virtuelle` | IMMERSION 360° & PLAN 3D | IMMERSION 360° & PLAN 3D |

## Sous-titres FR ajustés

- `formation-de-cascadeur` → « Un cursus pour maîtriser l'ensemble des disciplines de la cascade physique et cinématographique. »
- `videos-cascadeur` → « Découvrez les coulisses de l'entraînement des cascadeurs du CUC et les showreels du Campus Univers Cascades. »

## Overlays ANGLAIS alignés (`site_translations`)

| Page | Badge EN avant | Badge EN après |
| --- | --- | --- |
| `contact-cuc` | CONTACT & ADMISSIONS | ADMISSIONS & PROJECTS |
| `formation-de-cascadeur` | PROFESSIONAL TRAINING • 2 YEARS | 2 YEARS • 720-800 HOURS |
| `partenaires` | SUPPORTING US • BRANDS & INSTITUTIONS | SUPPORTING US |
| `spectacles-cascadeurs-yamakasi` | CINEMA ON STAGE • TURNKEY SHOWS | CINEMA ON STAGE |
| `stages-cascades-parkour-2` | INTENSIVE WORKSHOPS, ALL LEVELS • FROM 16 | ALL LEVELS • FROM 16 |
| `stunt-workshop-cuc` | INTERNATIONAL WORKSHOP • ENGLISH & FRENCH | INTERNATIONAL WORKSHOP |
| `team-building-cascades` | SEMINARS & COMPANIES • TEAM COHESION | SEMINARS & COMPANIES |
| `videos-cascadeur` | TV REPORTS • TF1 8PM NEWS • FRANCE 2 | TV REPORTS |

### Exécution

- badge stunt-workshop-cuc → « STAGE INTERNATIONAL » : 1 ligne(s)
- badge videos-cascadeur → « REPORTAGES TÉLÉVISION » : 1 ligne(s)
- badge spectacles-cascadeurs-yamakasi → « LE CINÉMA S’INVITE SUR SCÈNE » : 1 ligne(s)
- badge team-building-cascades → « SÉMINAIRES & ENTREPRISES » : 1 ligne(s)
- badge partenaires → « ILS NOUS ACCOMPAGNENT » : 1 ligne(s)
- badge formation-de-cascadeur → « 2 ANS • 720H À 800H » : 1 ligne(s)
- badge contact-cuc → « ADMISSIONS & PROJETS » : 1 ligne(s)
- badge stages-cascades-parkour-2 → « TOUS NIVEAUX • DÈS 16 ANS » : 1 ligne(s)
- réparation / → « PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA » : 1 ligne(s)
- réparation animations-airbag-parkour → « AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL » : 1 ligne(s)
- réparation cuc-events-agence → « AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN » : 1 ligne(s)
- réparation cuc-team-cascadeur → « COORDINATION DE CASCADES • CINÉMA » : 1 ligne(s)
- sous-titre FR formation-de-cascadeur : 1 ligne(s)
- sous-titre FR videos-cascadeur : 1 ligne(s)
- badge EN contact-cuc → « ADMISSIONS & PROJECTS » : 1 ligne(s)
- badge EN videos-cascadeur → « TV REPORTS » : 1 ligne(s)
- sous-titre EN videos-cascadeur : 1 ligne(s)
- badge EN stunt-workshop-cuc → « INTERNATIONAL WORKSHOP » : 1 ligne(s)
- badge EN stages-cascades-parkour-2 → « ALL LEVELS • FROM 16 » : 1 ligne(s)
- badge EN formation-de-cascadeur → « 2 YEARS • 720-800 HOURS » : 1 ligne(s)
- sous-titre EN formation-de-cascadeur : 1 ligne(s)
- badge EN spectacles-cascadeurs-yamakasi → « CINEMA ON STAGE » : 1 ligne(s)
- badge EN team-building-cascades → « SEMINARS & COMPANIES » : 1 ligne(s)
- badge EN partenaires → « SUPPORTING US » : 1 ligne(s)

### Vérification

- ✔ Aucun caractère de contrôle résiduel dans les badges.

Le code (fallbacks `site-service`) est aligné par
[`apply_hero_badge_cleanup.mjs`](scripts/apply_hero_badge_cleanup.mjs:1).
