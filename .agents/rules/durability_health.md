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
3. **Le piège RLS — séquence tenue, ne pas la rouvrir** : restreindre la policy publique de
   `site_pages` à `is_published = true` sans les deux lectures service role ferait afficher un
   brouillon avec le **contenu certifié**. Désormais livrés : porte 404 RLS-proof
   (`getPublicPageContent` + `getPagePublicationState`) et aperçu sur client admin
   (`getPreviewPageContent`). La migration est outillée et dry-run par défaut
   (`npm run db:migrate:site-pages-rls[:write]`) ; son application reste conditionnée à une
   vérification anonyme possible — le 2026-09-23, l'API Data du projet répondait
   **402 : `exceed_storage_size_quota`** (« upgrade their plan or remove spend caps ») à
   toutes les clés, service role compris. Action propriétaire : plan/spend caps Supabase puis
   purge du stockage (`npm run media:audit`, cf. `plans/revue-mediatheque-storage.md` et
   `plans/revue-rls-site-pages.md`). La vitrine publique, elle, sert ses replis certifiés :
   c'est le garde-fou prévu, pas un incident silencieux.
4. **Une seule source de vérité par sujet** : métadonnées → `buildRouteMetadata()`
   (`src/lib/i18n/route-metadata.ts`), fusion bilingue → `src/lib/i18n/localized-merge.ts`,
   libellés → `src/lib/i18n/microcopy.ts`, champs éditables → `src/lib/preview/cuc-field.ts`.
   Toute duplication locale est un bug futur.
5. **Gouvernance documentaire** : `AGENTS.md` porte la loi (SRP, plafond 300 lignes par
   module ; `AGENTS.md` lui-même < 150 lignes) et
   l'index ; le détail de chaque sujet vit dans **un seul** fichier de `.agents/rules/`. Une
   règle se met à jour dans son fichier canonique — jamais en double. Un guide opérationnel
   lourd devient un skill `.agents/skills/`.
