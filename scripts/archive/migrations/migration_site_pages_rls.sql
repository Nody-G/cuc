-- ==============================================================================
-- CUC — `site_pages` : la lecture publique ne voit que le PUBLIÉ
-- ==============================================================================
-- Avant : policy « Public read access for site_pages » → FOR SELECT USING (true).
--         Un client anonyme pouvait lire un brouillon (JSON complet) si le slug
--         était connu — ferme le dernier accès direct aux brouillons.
-- Après : la ligne n'est lisible par `anon`/`authenticated` que si publiée.
--
-- Ne sont PAS touchés :
--   - la policy d'écriture admin (`FOR ALL`, profil admin) — inchangée ;
--   - le service role (bypass RLS), utilisé par :
--       · `getPagePublicationState()` (porte 404, brouillon masqué) ;
--       · `getPreviewPageContent()` (aperçu éditeur du brouillon) ;
--       · les Server Actions du Cockpit.
--
-- Prérequis applicatif (livré avec la migration) : porte 404 RLS-proof + aperçu
-- sur client admin — sans eux, un brouillon deviendrait « absent » et la
-- vitrine servirait la copie certifiée au lieu d'un 404.
--
-- Application : scripts/apply_site_pages_rls_migration.mjs (dry-run par défaut).

DROP POLICY IF EXISTS "Public read access for site_pages" ON public.site_pages;

CREATE POLICY "Public read access for site_pages" ON public.site_pages
    FOR SELECT TO anon, authenticated
    USING (is_published = true);
