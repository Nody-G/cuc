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
3. **RLS `site_pages` — appliquée le 2026-09-23, séquence à ne pas rouvrir** : la policy
   publique (`FOR SELECT USING (true)`) est remplacée par `USING (is_published = true)` —
   jamais l'appliquer sans les deux lectures service role (porte 404 `getPublicPageContent` +
   `getPagePublicationState`, aperçu `getPreviewPageContent`). Vérification reproductible
   **sans dépendre de l'API** : sonde Postgres qui endosse le rôle `anon` avec une ligne
   brouillon témoin dans une transaction annulée (`npm run db:migrate:site-pages-rls[:write]`).
   **Incident quota (2026-09-23)** : dépassement du quota de stockage de l'organisation →
   API Data coupée (402) pendant quelques heures, résolu par mise à jour du plan Supabase ;
   surveiller les quotas en amont. Le stockage média de ce projet pèse **218 Mo** — premier
   gisement : 3 vidéos de reportages (~127 Mo), à compresser ou migrer (`npm run media:audit`).
4. **Une seule source de vérité par sujet** : métadonnées → `buildRouteMetadata()`
   (`src/lib/i18n/route-metadata.ts`), fusion bilingue → `src/lib/i18n/localized-merge.ts`,
   libellés → `src/lib/i18n/microcopy.ts`, champs éditables → `src/lib/preview/cuc-field.ts`.
   Toute duplication locale est un bug futur.
5. **Gouvernance documentaire** : `AGENTS.md` porte la loi (SRP, plafond 300 lignes par
   module ; `AGENTS.md` lui-même < 150 lignes) et
   l'index ; le détail de chaque sujet vit dans **un seul** fichier de `.agents/rules/`. Une
   règle se met à jour dans son fichier canonique — jamais en double. Un guide opérationnel
   lourd devient un skill `.agents/skills/`.
