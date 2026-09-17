-- ==============================================================================
-- CUC — Extension Schéma : CMS Professionnel & Gestion Détaillée des Pages
-- ==============================================================================
-- Isolation garantie : tables préfixées par `site_` (aucune interférence CUC Sign)
-- ==============================================================================

-- 1. TABLE : site_pages (Gestion détaillée des 15 pages du site vitrine)
CREATE TABLE IF NOT EXISTS public.site_pages (
    slug TEXT PRIMARY KEY, -- ex: '/', 'formation-de-cascadeur', etc.
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    hero JSONB DEFAULT '{
        "badge": "CUC 2026",
        "title": "",
        "subtitle": "",
        "cta_primary_text": "En savoir plus",
        "cta_primary_link": "/formation-de-cascadeur",
        "cta_secondary_text": "Découvrir le campus",
        "cta_secondary_link": "/visite-guidee",
        "bg_image": ""
    }'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb, -- blocs éditables (chiffres clés, arguments, textes riches, FAQ)
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLE : site_partners (Partenaires cinéma, marques, institutionnels)
CREATE TABLE IF NOT EXISTS public.site_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'cinema', -- 'cinema', 'institutionnel', 'materiel', 'media'
    logo_url TEXT NOT NULL,
    website_url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE : site_events (Prestations & offres CUC Events)
CREATE TABLE IF NOT EXISTS public.site_events (
    id TEXT PRIMARY KEY, -- 'agence', 'team-building', 'spectacles', 'airbag'
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    price_indicator TEXT,
    cta_text TEXT DEFAULT 'Demander un devis',
    cta_link TEXT DEFAULT '/contact-cuc',
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read access for site_pages" ON public.site_pages;
    CREATE POLICY "Public read access for site_pages" ON public.site_pages FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_partners" ON public.site_partners;
    CREATE POLICY "Public read access for site_partners" ON public.site_partners FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_events" ON public.site_events;
    CREATE POLICY "Public read access for site_events" ON public.site_events FOR SELECT USING (true);

    -- Écriture sécurisée administrateur
    DROP POLICY IF EXISTS "Admin write access for site_pages" ON public.site_pages;
    CREATE POLICY "Admin write access for site_pages" ON public.site_pages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

    DROP POLICY IF EXISTS "Admin write access for site_partners" ON public.site_partners;
    CREATE POLICY "Admin write access for site_partners" ON public.site_partners FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

    DROP POLICY IF EXISTS "Admin write access for site_events" ON public.site_events;
    CREATE POLICY "Admin write access for site_events" ON public.site_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
END $$;

-- 5. REPLICA IDENTITY FULL & ACTIVATION SUPABASE REALTIME
ALTER TABLE IF EXISTS site_pages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS site_partners REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS site_events REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_pages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_pages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_partners'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_partners;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_events;
    END IF;
END $$;
