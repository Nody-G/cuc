# RÈGLE PERMANENTE : DURABILITÉ — CE QUI GARDE LE SITE SAIN

**Ce qui n'est pas mesuré dérive.**

> Source canonique du sujet — ne pas recopier ce contenu dans `AGENTS.md`.

1. **Feuille de route vivante** : `plans/roadmap-site-2026.md` classe les évolutions par
   impact × effort (publication 404, RLS `site_pages`, accessibilité automatisée, budgets JS,
   JSON-LD, couverture EN). Un sujet ne se discute pas sans ce document.
2. **La CI est la définition de « terminé »** : `.github/workflows/ci.yml` enchaîne
   lint, typecheck, tests, **gate Mode Studio** (champs, budget, micro-textes), **audit strict**
   (routes, ancres, plafond SRP 300 lignes) et build. Un
   commit qui casse l'un de ces contrôles n'est pas livrable — la dette restante est publiée
   dans `plans/`, jamais silencieuse.
3. **Le piège RLS à ne pas rouvrir** : passer la policy publique de `site_pages`
   (`FOR SELECT USING (true)`) à `is_published = true` **avant** l'arrivée du vrai 404 ferait
   afficher les brouillons avec le **contenu certifié** — « absent » et « dépublié » deviendraient
   indistinguables pour le code actuel. Ordre imposé : 404 d'abord, policy ensuite.
4. **Une seule source de vérité par sujet** : métadonnées → `buildRouteMetadata()`
   (`src/lib/i18n/route-metadata.ts`), fusion bilingue → `src/lib/i18n/localized-merge.ts`,
   libellés → `src/lib/i18n/microcopy.ts`, champs éditables → `src/lib/preview/cuc-field.ts`.
   Toute duplication locale est un bug futur.
5. **Gouvernance documentaire** : `AGENTS.md` porte la loi (SRP, plafond 300 lignes par
   module ; `AGENTS.md` lui-même < 150 lignes) et
   l'index ; le détail de chaque sujet vit dans **un seul** fichier de `.agents/rules/`. Une
   règle se met à jour dans son fichier canonique — jamais en double. Un guide opérationnel
   lourd devient un skill `.agents/skills/`.
