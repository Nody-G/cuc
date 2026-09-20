# Revue d'appariement — crédits IMDb ↔ catalogue `site_films`

> Fichier de revue produit **avant** toute écriture en base (doctrine AGENTS.md).
> Diagnostic source : [`plans/audit-films-equipe.md`](plans/audit-films-equipe.md).
> Normaliseur unique : [`creditTitleKey()`](src/lib/credit-title.ts:23).

## 1. Périmètre

| Mesure | Valeur |
| -------- | -------- |
| Films au catalogue (`site_films`) | 570 |
| Membres d'équipe (`site_team`) | 12 |
| Films sans `cuc_team_involved` | 5 |
| Références orphelines | 0 |
| Coachs à 0 % d'appariement | 0 |

L'intégrité référentielle est **saine** : aucune référence orpheline. Le problème
signalé (« les gens présents sur certains films sont manquants ») se limite donc
à des **liaisons non renseignées**, pas à des liaisons cassées.

## 2. Films sans membre rattaché — décision d'appariement

Les 5 films ci-dessous ont `cuc_team_involved = []`. Pour chacun, la décision
repose sur la présence (ou l'absence) d'un crédit correspondant dans
`site_team.notable_credits`, apparié via `creditTitleKey()`.

### 2.1 `braqueurs` — Braqueurs (2021) → **À RENSEIGNER (certitude élevée)**

Cinq coachs déclarent ce film dans leurs crédits, sous la forme
`"Braqueurs: La série (2021) — Cascadeur"` :

| coach | id | crédit déclaré |
| ------- | ---- | ---------------- |
| Franck Blanc | `franck-blanc` | Braqueurs: La série (2021) — Cascadeur |
| Jérôme Gaspard | `jerome-gaspard` | Braqueurs: La série (2021) — Cascadeur |
| Lucas Dollfus | `lucas-dollfus` | Braqueurs: La série (2021) — Cascadeur |
| Malik Diouf | `malik-diouf` | Braqueurs: La série (2021) — Cascadeur |
| Bastien Trouvé | `bastien-trouve` | Braqueurs: La série (2021) — Cascadeur |

**Vérification de titre** : `creditTitleKey("Braqueurs: La série (2021)")` → `braqueurs la serie`.
Le catalogue contient `braqueurs` — Braqueurs (2021), dont la clé est `braqueurs`.

⚠️ **Écart de normalisation à trancher** : le crédit IMDb désigne la **série**
(« Braqueurs: La série »), tandis que la fiche catalogue s'intitule « Braqueurs ».
Deux hypothèses :

1. **La fiche `braqueurs` couvre la série** (titre abrégé côté catalogue) → les
   5 coachs doivent être rattachés à `braqueurs`.
2. **La fiche `braqueurs` désigne le film de 2015** (Julien Leclercq) et la série
   est un objet distinct → il faut **créer une fiche** `braqueurs-la-serie` et y
   rattacher les 5 coachs, sans toucher à `braqueurs`.

**Décision retenue** : hypothèse 1, car la fiche catalogue porte l'année **2021**
(année de la série, le film datant de 2015) et le réalisateur renseigné est
Julien Leclercq (réalisateur de la série). Le rattachement des 5 coachs à
`braqueurs` est donc **factuellement fondé**.

**Action** : renseigner `cuc_team_involved = ["franck-blanc","jerome-gaspard","lucas-dollfus","malik-diouf","bastien-trouve"]`
et `metadata.cuc_team_roles` avec le rôle `Cascadeur` pour chacun.

### 2.2 `wednesday-mercredi`, `dune`, `uncharted`, `black-widow` → **NE PAS RENSEIGNER**

Aucun crédit de `site_team.notable_credits` ne référence ces quatre titres
(recherche par `creditTitleKey()` sur les 12 coachs : 0 correspondance).

| film | id | crédits coach correspondants |
| ------ | ---- | ------------------------------ |
| Wednesday (Mercredi) | `wednesday-mercredi` | aucun |
| Dune | `dune` | aucun |
| Uncharted | `uncharted` | aucun |
| Black Widow | `black-widow` | aucun |

**Décision** : ne rien écrire. Conformément à la doctrine « Zéro Invention », on
ne rattache pas un membre d'équipe sans crédit vérifiable. Ces fiches restent
sans `cuc_team_involved` tant qu'un crédit IMDb ne vient pas l'étayer.

> Note : ces 4 films sont des productions étrangères à gros budget. Leur présence
> au catalogue relève de la mise en avant commerciale (blockbusters doublés /
> cascades), pas nécessairement d'une intervention de l'équipe CUC. L'absence de
> rattachement est donc **cohérente**, pas un défaut de données.

## 3. Crédits hors catalogue — candidats à création de fiche

Ces crédits existent dans `site_team.notable_credits` mais **aucun titre du
catalogue** ne leur correspond (vérifié par sonde sur les 570 titres).

### 3.1 Michel Bouis — 27 crédits hors catalogue (taux 39 %)

Cause racine du faible taux : la filmographie de Michel Bouis est **ancienne et
partiellement absente du catalogue**. Ses crédits vont de 1992 à 2024, alors que
le catalogue est majoritairement composé de productions récentes.

| # | titre | année |
| --- | ------- | ------- |
| 1 | La nuit se traîne | 2024 |
| 2 | En roue libre | 2022 |
| 3 | Au nom de la terre | 2019 |
| 4 | At Eternity's Gate | 2018 |
| 5 | En guerre | 2018 |
| 6 | Mea Culpa | 2014 |
| 7 | Le dernier diamant | 2014 |
| 8 | Angélique | 2013 |
| 9 | À bout portant | 2010 |
| 10 | Hors-la-loi | 2010 |
| 11 | L'autre monde | 2010 |
| 12 | Le transporteur 3 | 2008 |
| 13 | L'Instinct de mort | 2008 |
| 14 | Go Fast: Au coeur du trafic | 2008 |
| 15 | Skate or Die | 2008 |
| 16 | Les Rivières pourpres 2 : Les Anges de l'apocalypse | 2004 |
| 17 | Taxi 3 | 2003 |
| 18 | Fanfan la Tulipe | 2003 |
| 19 | Astérix & Obélix : Mission Cléopâtre | 2002 |
| 20 | D'Artagnan | 2001 |
| 21 | Jeanne d'Arc | 1999 |
| 22 | La Neuvième Porte | 1999 |
| 23 | L'homme au masque de fer | 1998 |
| 24 | Dobermann | 1997 |
| 25 | La reine Margot | 1994 |
| 26 | La Fille de d'Artagnan | 1994 |
| 27 | Highlander | 1992 |

**Décision** : **ne pas créer ces fiches automatiquement.** Créer 27 fiches films
sur la seule base d'un crédit de doublure/cascade serait une inflation de
catalogue non demandée et non vérifiée (année, réalisateur, visuel, catégorie
manquants). Ces crédits restent visibles sur la fiche coach via la liste unique
« Tous les crédits » du Cockpit (doctrine §5), où l'étoile reste disponible.

**Action** : aucune écriture. Le taux de 39 % est **attendu et acceptable** pour
un coach à filmographie ancienne ; il ne signale pas une régression de
normalisation (le normaliseur fonctionne : 17 crédits appariés).

### 3.2 Autres coachs — 1 crédit hors catalogue chacun

| coach | crédit | année |
| ------- | -------- | ------- |
| Franck Blanc | La Nuit se traîne | 2024 |
| Lucas Dollfus | Good Vibes Only | 2026 |
| Vincent Bouillon | Hunger Games : La Ballade du serpent | 2023 |
| Alan Cueff | The Sentinels | 2024 |

**Décision** : aucune écriture. Même raisonnement que §3.1.

> `La nuit se traîne` (2024) est déclaré **à la fois** par Franck Blanc et Michel
> Bouis. Si une création de fiche était un jour décidée, elle devrait rattacher
> les deux coachs. Ce n'est pas retenu ici.

## 4. Synthèse des écritures autorisées

| cible | champ | valeur | fondement |
|-------|-------|--------|-----------|
| `site_films` / `braqueurs` | `cuc_team_involved` | 5 ids coachs | 5 crédits IMDb concordants |
| `site_films` / `braqueurs` | `metadata.cuc_team_roles` | `Cascadeur` × 5 | rôle déclaré dans le crédit |

**Aucune autre écriture.** Les 4 films sans crédit et les 30 crédits hors
catalogue restent en l'état (doctrine « Zéro Invention »).

## 5. Validation attendue après écriture

```bash
node scripts/audit_films_team_links.mjs      # doit passer de 5 à 4 films sans membre
node scripts/verify_featured_matching.mjs    # taux d'appariement non nul (déjà OK)
```

Critère de succès : `Films sans membre rattaché` = **4** (au lieu de 5) et
`Références orphelines` = **0**.
