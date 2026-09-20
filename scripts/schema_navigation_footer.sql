-- ==============================================================================
-- CUC — Extension Schéma : Navigation, Footer & Réseaux Sociaux Éditables
-- ==============================================================================
-- IMPORTANT : Ce script est STRICTEMENT ADDITIF.
-- Toutes les tables sont préfixées par `site_` pour garantir une isolation
-- totale avec les tables CUC Sign existantes (formations, students, profiles...).
--
-- Objectif : rendre éditables depuis le Cockpit les zones encore codées en dur
-- de la vitrine (Navbar, dropdowns, drawer mobile, Footer, réseaux sociaux).
--
-- Doctrine respectée :
--   - Préfixe `site_` obligatoire.
--   - RLS : lecture publique, écriture réservée aux admins/directeurs.
--   - Realtime activé pour synchronisation instantanée Cockpit ↔ Vitrine.
--   - FK vers CUC Sign en ON DELETE SET NULL (intégrité préservée).
-- ==============================================================================

-- ==============================================================================
-- 1. TABLE : site_navigation
-- Structure complète du menu principal (desktop + mobile + méga-menus).
-- Le champ `structure` (JSONB) contient l'arbre de navigation :
--   {
--     "items": [
--       { "id": "home", "label": "Accueil", "href": "/", "type": "link",
--         "order": 1, "is_visible": true, "is_external": false,
--         "children": [] },
--       { "id": "formations", "label": "Formation & Stages", "type": "dropdown",
--         "order": 2, "is_visible": true,
--         "children": [
--           { "id": "formation-pro", "label": "FORMATION DE CASCADEUR",
--             "description": "Formule découverte & Cursus pro 2 ans",
--             "href": "/formation-de-cascadeur", "order": 1, "is_visible": true }
--         ] }
--     ],
--     "cta": { "label": "Contact & Projets", "href": "/contact-cuc" }
--   }
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_navigation (
    id TEXT PRIMARY KEY DEFAULT 'main', -- 'main', 'footer', 'mobile' (extensible)
    label TEXT NOT NULL DEFAULT 'Navigation principale',
    structure JSONB NOT NULL DEFAULT '{"items": [], "cta": {}}'::jsonb,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. TABLE : site_footer
-- Structure complète du pied de page : colonnes de liens, mentions, copyright.
-- Le champ `structure` (JSONB) contient :
--   {
--     "columns": [
--       { "id": "formations", "title": "Formations", "order": 1,
--         "is_visible": true,
--         "links": [
--           { "id": "l1", "label": "Formation Pro 2 ans",
--             "href": "/formation-de-cascadeur", "order": 1,
--             "is_visible": true, "is_external": false }
--         ] }
--     ],
--     "brand": { "name": "CAMPUS UNIVERS CASCADES",
--                "tagline": "Fondé en 2008 • Plus grande école au monde",
--                "description": "..." },
--     "legal": { "copyright": "...", "links": [] }
--   }
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_footer (
    id TEXT PRIMARY KEY DEFAULT 'main',
    label TEXT NOT NULL DEFAULT 'Pied de page principal',
    structure JSONB NOT NULL DEFAULT '{"columns": [], "brand": {}, "legal": {}}'::jsonb,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABLE : site_social_links
-- Réseaux sociaux officiels (Navbar, Footer, Drawer mobile).
-- Source unique de vérité pour éviter les incohérences de handles
-- (cas réel : TikTok/YouTube divergents entre Navbar et Footer).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_social_links (
    id TEXT PRIMARY KEY, -- 'instagram', 'youtube', 'tiktok', 'facebook', 'whatsapp', 'linkedin'
    platform TEXT NOT NULL, -- identifiant technique de la plateforme
    label TEXT NOT NULL, -- libellé affiché : 'Instagram', 'YouTube'...
    handle TEXT, -- '@campus.univers.cascades'
    url TEXT NOT NULL, -- URL complète du profil officiel
    display_hint TEXT, -- texte secondaire affiché à droite (ex: 'Chaîne Stunt Team')
    brand_color TEXT, -- couleur d'accent hover (ex: '#E1306C')
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    show_in_navbar BOOLEAN DEFAULT true,
    show_in_footer BOOLEAN DEFAULT true,
    show_in_drawer BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. INDEX POUR PERFORMANCES MAXIMALES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_site_navigation_published ON public.site_navigation(is_published);
CREATE INDEX IF NOT EXISTS idx_site_footer_published ON public.site_footer(is_published);
CREATE INDEX IF NOT EXISTS idx_site_social_links_active ON public.site_social_links(is_active, order_index);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Lecture publique (SSR / visiteur), écriture réservée aux admins/directeurs.
-- ==============================================================================
ALTER TABLE public.site_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_social_links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Lecture publique
    DROP POLICY IF EXISTS "Public read access for site_navigation" ON public.site_navigation;
    CREATE POLICY "Public read access for site_navigation" ON public.site_navigation FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_footer" ON public.site_footer;
    CREATE POLICY "Public read access for site_footer" ON public.site_footer FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_social_links" ON public.site_social_links;
    CREATE POLICY "Public read access for site_social_links" ON public.site_social_links FOR SELECT USING (true);

    -- Écriture admin/directeur
    DROP POLICY IF EXISTS "Admin write access for site_navigation" ON public.site_navigation;
    CREATE POLICY "Admin write access for site_navigation" ON public.site_navigation FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    );

    DROP POLICY IF EXISTS "Admin write access for site_footer" ON public.site_footer;
    CREATE POLICY "Admin write access for site_footer" ON public.site_footer FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    );

    DROP POLICY IF EXISTS "Admin write access for site_social_links" ON public.site_social_links;
    CREATE POLICY "Admin write access for site_social_links" ON public.site_social_links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'directeur')
        )
    );
END $$;

-- ==============================================================================
-- 6. REPLICA IDENTITY FULL & ACTIVATION SUPABASE REALTIME
-- ==============================================================================
ALTER TABLE IF EXISTS site_navigation REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS site_footer REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS site_social_links REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_navigation'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_navigation;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_footer'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_footer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_social_links'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_social_links;
    END IF;
END $$;

-- ==============================================================================
-- 7. TRIGGER : mise à jour automatique de `updated_at`
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_site_nav_footer()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_site_navigation_updated_at ON public.site_navigation;
    CREATE TRIGGER trg_site_navigation_updated_at
        BEFORE UPDATE ON public.site_navigation
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_site_nav_footer();

    DROP TRIGGER IF EXISTS trg_site_footer_updated_at ON public.site_footer;
    CREATE TRIGGER trg_site_footer_updated_at
        BEFORE UPDATE ON public.site_footer
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_site_nav_footer();

    DROP TRIGGER IF EXISTS trg_site_social_links_updated_at ON public.site_social_links;
    CREATE TRIGGER trg_site_social_links_updated_at
        BEFORE UPDATE ON public.site_social_links
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_site_nav_footer();
END $$;
