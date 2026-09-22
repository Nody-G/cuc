# RÈGLE PERMANENTE : ÉDITION BILINGUE DU COCKPIT (FR → EN)

**Une seule fusion, un seul diff, jamais de vide publié.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

## 1. Source unique de vérité

`src/lib/i18n/localized-merge.ts` porte à la fois la
**fusion** FR + overlay et la **production** de l'overlay à écrire. Le serveur
(`src/lib/i18n/server.ts`), le client
(`src/lib/hooks/usePageDynamicContent.ts`) et l'éditeur bilingue du Cockpit
(`src/lib/hooks/useEntityTranslation.ts`) l'importent.
**Ne JAMAIS réimplémenter une fusion locale** : un `hero` fusionné par simple
spread laissait une valeur anglaise vide effacer le français.

## 2. Invariants non négociables

1. **Aucune valeur vide persistée** : vider un champ anglais le ramène au
   français, il n'est jamais publié vide.
2. **Un tableau s'écrit en bloc** : complet ou pas du tout (même longueur que le
   français exigée). Ses clés techniques — ancres `id`, images, liens, ordres —
   sont **reprises du français**, jamais traduites.
3. **Aucune structure inventée** : `layout_sections` (libellés d'administration),
   `og_image`, `slug`, identité et états ne figurent jamais dans un payload.
4. **Divergence de structure = aucune écriture** : si la liste française a changé,
   le tableau anglais n'est pas écrit (rien plutôt qu'un tableau faux) et le
   Cockpit signale le désalignement.

## 3. Édition en place dans le Cockpit

La bascule `FR | EN` de `src/app/(admin)/admin/components/PagesEditorView.tsx`
édite la traduction dans le **même formulaire** : les sous-éditeurs ignorent la
langue, ils reçoivent le contenu localisé (`hydrateLocalized`) et un setter.
L'aperçu live charge la locale active (`/en/<slug>`), l'onglet « Mise en page »
est verrouillé en EN, et les médias ne se modifient qu'en français.

## 4. Vérification obligatoire après toute modification

- `npx vitest run src/lib/i18n/localized-merge.test.ts` — invariants de fusion, de
  diff, de couverture et d'exclusion de `layout_sections`.
- `node scripts/verify_page_translation_invariants.mjs` — contrôle en base des
  15 pages : aucune valeur vide, aucune racine verrouillée, tableaux alignés et
  items complets. Produit `plans/revue-edition-en-pages.md`, sort en code 2 en cas
  de régression.
- `node scripts/audit_i18n_completeness.mjs` — couverture FR → EN feuille par
  feuille (référence historique du taux de couverture).
