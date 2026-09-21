# Revue — Crédits curés de Michel Bouis (réparation)

Généré le 2026-09-21T23:32:41.796Z par `scripts/fix_michel_bouis_curated_credits.mjs`.

## Défaut corrigé

L'artefact `scripts/coach_credits_curated_imdb.json` portait encore l'identité erronée **michael-troude** (IMDb nm0873735, 101 crédits — une autre personne) et **aucune** entrée michel-bouis. `coaches:apply` ne trouvait donc plus ce coach : la fiche publique affichait 44 crédits au lieu de la filmographie réelle.

## Identité retenue

- Nom : **Michel Bouis**
- IMDb : `nm0099365`
- Crédits IMDb : 277 au total, dont **244** en cascades
- Répartition par type : TV Movie 30 · TV Mini Series 20 · Movie 121 · TV Series 70 · Short 2 · Video 1

## Entrée produite

- 244 crédit(s), rôle canonique « Cascadeur »
- Aucun crédit inventé : chaque ligne provient du relevé IMDb (titre, année, type).

| Année | Titre | Type IMDb |
|---|---|---|
| 2026 | Impacts | tvMovie |
| 2026 | Deep | tvMiniSeries |
| 2026 | Le Fantôme de l'Opéra | movie |
| 2026 | La maison de nos rêves | movie |
| 2026 | Vigilante | movie |
| 2026 | Apparences | tvMiniSeries |
| 2026 | Ceux qui comptent | movie |
| 2026 | Papa Malgre Lui | tvMovie |
| 2026 | LOL 2.0 | movie |
| 2026 | Les Lionnes | tvSeries |
| 2025 | Mitterrand confidentiel | tvMiniSeries |
| 2025 | Les 3 Brestoises | tvMovie |
| 2025 | Les aventurières | tvMiniSeries |
| 2025 | Désenchantées | tvMiniSeries |
| 2025 | Gérald le conquérant | movie |
| 2025 | Regarde | movie |
| 2025 | Influencers | movie |
| 2025 | La Danse des renards | movie |
| 2025 | Que ma volonté soit faite | movie |
| 2025 | Anaon | tvSeries |
| 2025 | Zion | movie |
| 2024 | Mademoiselle Holmes | tvMiniSeries |
| 2024 | Commandant Saint-Barth | tvSeries |
| 2024 | Les Boules de Noël | movie |
| 2024 | Ollie | movie |
| 2024 | Blood River | tvMiniSeries |
| 2024 | The Last Front | movie |
| 2024 | Elyas | movie |
| 2024 | La nuit se traîne | movie |
| 2024 | L'Amour ouf | movie |
| 2024 | Ici et là-bas | movie |
| 2023 | En place | tvSeries |
| 2023 | Chasse gardée | movie |
| 2023 | Vjeran Tomic: L'homme-araignée de Paris | movie |
| 2023 | D'argent et de sang | tvMiniSeries |
| 2023 | Captives | movie |
| 2023 | Par-delà les montagnes | movie |
| 2023 | Madame de Sévigné | movie |
| 2023 | Iris et les hommes | movie |
| 2023 | Cash | movie |
| … | 204 autre(s) crédit(s) | — |

## Entrée erronée archivée (traçabilité)

```json
{
  "id": "michael-troude",
  "name": "Michaël Troude",
  "creditsCount": 101,
  "firstFormatted": "Elyas (2024) — Cascadeur"
}
```

> Cette identité (Michaël Troude) n'est **pas** celle du coach du campus : elle ne doit jamais être réintroduite.

## Suite du pipeline

```
npm run coaches:apply:preview   # vérifier l'aperçu avant écriture
npm run coaches:apply           # écrit src/data/team.ts
npm run coaches:sync            # synchronise Supabase (site_team, site_films)
node scripts/coach_credits_count_check.mjs   # contrôle des compteurs
```
