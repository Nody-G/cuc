# RÈGLE PERMANENTE : MICRO-TEXTES — TOUT LIBELLÉ D'INTERFACE EST ÉDITABLE

**Une seule surcharge, fusionnée dans le catalogue ; aucun site d'appel réécrit.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Le mécanisme

- Source unique : `src/lib/i18n/microcopy.ts` — aplatissement, fusion,
  nettoyage et table éditable. **Ne jamais réimplémenter** une fusion de catalogue localement.
- Stockage : `site_settings`, clé `microcopy_overrides` →
  `{ fr: { 'home.about.title': '…' }, en: { … } }`.
- Application : `src/i18n/request.ts` fusionne la surcharge dans le catalogue de
  la locale ; **tous** les `t()` (composants serveur ET clients) en bénéficient, sans
  redéploiement et sans toucher la vitrine.
- Édition : onglet « Micro-textes du site » du Cockpit
  (`src/app/(admin)/admin/components/MicrocopyView.tsx`) — recherche,
  groupes par namespace, FR/EN côte à côte, retour au catalogue par clé.

## 2. Invariants non négociables

1. **Aucune valeur vide publiée** : vider un champ **retire** la surcharge, le catalogue
   redevient la source — jamais de libellé blanc.
2. **Aucune structure inventée** : seules des clés de forme valide sont écrites, une valeur
   reste une chaîne (les tableaux sont hors périmètre : une liste passe par une section).
3. La surcharge **corrige** une clé existante, elle ne fabrique pas de nouvelle traduction.
4. Publication : `saveMicrocopyOverrides` revalide les 15 pages, FR **et** EN, et journalise
   l'action (`settings.microcopy`).

## 3. Vérification obligatoire après toute modification

- `npm run audit:microcopy` — les libellés `t('…')` sont éditables par la surcharge ; la
  catégorie **« codés en dur » doit rester à zéro** (les routes d'image Open Graph, les
  adresses, marques et coordonnées sont hors périmètre, les expressions JSX calculées aussi :
  un faux positif ferait mentir le rapport autant qu'un oubli).
  Rapport : `plans/revue-micro-textes-visiteurs.md`.
- Chrome transverse (`commonChrome`) : fil d'Ariane, nom du campus, accroche, ville, enseignes
  des trois entités — une seule clé par libellé, jamais un littéral dans un composant.
- `npx vitest run src/lib/i18n/microcopy.test.ts` — fusion, nettoyage, invariant du vide,
  alignement FR ↔ EN par clé (jamais par index).
- `npm run studio:gate:full` — verdict unique : champs, budget, micro-textes, TypeScript, tests.
