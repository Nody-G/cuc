# Revue — Artefacts textuels des overlays EN (`site_translations`)

Généré le 2026-09-21T20:12:06.775Z par `scripts/fix_text_artifacts_translations.mjs`.

## Synthèse

- Overlays EN inspectés : **579**
- Overlays porteurs d'artefacts : **5**
- Artefacts à corriger : **6**

### `film/brice-3` — 1 artefact(s)

| Type | Séquence | Contexte |
|---|---|---|
| espace avant ponctuation (anglais) | `␣?` | …t will he remain the king of the "casse" ?… |

### `film/police-flash-80` — 1 artefact(s)

| Type | Séquence | Contexte |
|---|---|---|
| espace avant ponctuation (anglais) | `␣:` | …h is propelled to the head of a new unit : Police Flash 80. There, he'll have to team up w… |

### `film/walter` — 1 artefact(s)

| Type | Séquence | Contexte |
|---|---|---|
| espace avant ponctuation (anglais) | `␣.` | …rican warlord who will send them to hell .… |

### `film/la-maison-d-en-face` — 2 artefact(s)

| Type | Séquence | Contexte |
|---|---|---|
| espace avant ponctuation (anglais) | `␣;` | …e does not get the promotion he deserved ; second, his son Albert is hired by Madame Anna … |
| espace avant ponctuation (anglais) | `␣;` | …t is hired by Madame Anna as a decorator ; third, Hortense, his daughter has expressed the… |

### `film/le-chant-des-sirenes` — 1 artefact(s)

| Type | Séquence | Contexte |
|---|---|---|
| espace avant ponctuation (anglais) | `␣?` | …eams strong enough to build a love story ?… |

## Non traité (décision éditoriale)

L'espace **français** avant ` : `, ` ; `, ` ! ` et ` ? ` n'est jamais corrigé : il est **requis** en typographie française. Seuls les overlays `locale = en` reçoivent la correction, et l'ellipse (`word ...`) est préservée dans tous les cas.
