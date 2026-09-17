-- ==============================================================================
-- CUC — Campus Univers Cascades : Schéma SQL du Site Vitrine & Back-Office
-- ==============================================================================
-- IMPORTANT : Ce script est STRICTEMENT ADDITIF.
-- Toutes les tables sont préfixées par `site_` pour garantir une isolation
-- totale avec les tables CUC Sign existantes (formations, students, signatures, etc.).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE : site_programs (Formations, stages, workshops)
CREATE TABLE IF NOT EXISTS public.site_programs (
    id TEXT PRIMARY KEY, -- ex: 'pro-longue-duree', 'stage-decouverte', 'stage-weekend'
    category TEXT NOT NULL DEFAULT 'pro', -- 'pro', 'discovery', 'weekend', 'afdas', 'summer'
    title TEXT NOT NULL,
    badge TEXT,
    highlight BOOLEAN DEFAULT false,
    tagline TEXT,
    duration TEXT,
    hours TEXT,
    location TEXT DEFAULT 'Campus CUC — Le Cateau-Cambrésis (59)',
    price TEXT,
    price_note TEXT,
    age_requirement TEXT,
    eligibility TEXT[] DEFAULT '{}',
    description TEXT,
    objectives TEXT[] DEFAULT '{}',
    key_modules TEXT[] DEFAULT '{}',
    certification TEXT,
    cta_text TEXT DEFAULT 'Postuler au Cursus',
    cta_link TEXT,
    brochure_url TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE : site_sessions (Dates de sessions, statuts, places disponibles)
CREATE TABLE IF NOT EXISTS public.site_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id TEXT NOT NULL REFERENCES public.site_programs(id) ON DELETE CASCADE,
    -- Passerelle optionnelle vers CUC Sign (lien avec table formations)
    cuc_sign_formation_id UUID REFERENCES public.formations(id) ON DELETE SET NULL,
    title TEXT,
    start_date DATE,
    end_date DATE,
    date_display TEXT NOT NULL, -- ex: '16 au 28 août 2026'
    status TEXT NOT NULL DEFAULT 'ouvert', -- 'ouvert', 'complet', 'dernières places', 'bientôt', 'annulé'
    max_seats INTEGER,
    booked_seats INTEGER DEFAULT 0,
    price_override TEXT,
    location_override TEXT,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLE : site_team (Instructeurs, intervenants, coachs)
CREATE TABLE IF NOT EXISTS public.site_team (
    id TEXT PRIMARY KEY, -- slug: 'lucas-dollfus', 'jerome-gaspard', etc.
    -- Passerelle optionnelle vers le profil CUC Sign du formateur
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    bio TEXT,
    doubled_actors TEXT[] DEFAULT '{}',
    notable_credits TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    instagram TEXT,
    imdb TEXT,
    external_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLE : site_films (Filmographie, affiches, cascadeurs crédités)
CREATE TABLE IF NOT EXISTS public.site_films (
    id TEXT PRIMARY KEY, -- slug: 'bagarre', 'coka-chicas'
    title TEXT NOT NULL,
    year TEXT, -- '2024', '2025', 'À venir'
    category TEXT DEFAULT 'Cinéma',
    director TEXT,
    stunt_roles TEXT,
    doubled_actors TEXT[] DEFAULT '{}',
    cuc_team_involved TEXT[] DEFAULT '{}',
    highlight BOOLEAN DEFAULT false,
    image TEXT, -- affiche / image
    tag TEXT,
    imdb_url TEXT,
    allocine_url TEXT,
    trailer_url TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLE : site_announcements (Bandeau d'alerte / flash info en haut de page)
CREATE TABLE IF NOT EXISTS public.site_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    badge TEXT DEFAULT 'INFO',
    link_url TEXT,
    link_text TEXT,
    style TEXT DEFAULT 'gold', -- 'gold', 'info', 'alert', 'dark'
    is_active BOOLEAN DEFAULT false,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLE : site_settings (Paramètres globaux du site, coordonnées, alertes)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. INDEX POUR PERFORMANCES MAXIMALES (0 ms de latence)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_site_programs_category ON public.site_programs(category);
CREATE INDEX IF NOT EXISTS idx_site_programs_published ON public.site_programs(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_site_sessions_program ON public.site_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_site_sessions_published ON public.site_sessions(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_site_team_published ON public.site_team(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_site_films_published ON public.site_films(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_site_announcements_active ON public.site_announcements(is_active);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- Lecture publique pour tout le monde (SSR / visiteur)
-- Écriture strictement réservée aux administrateurs CUC Sign
-- ==============================================================================

-- Activation RLS
ALTER TABLE public.site_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politiques de LECTURE PUBLIQUE
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read access for site_programs" ON public.site_programs;
    CREATE POLICY "Public read access for site_programs" ON public.site_programs FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_sessions" ON public.site_sessions;
    CREATE POLICY "Public read access for site_sessions" ON public.site_sessions FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_team" ON public.site_team;
    CREATE POLICY "Public read access for site_team" ON public.site_team FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_films" ON public.site_films;
    CREATE POLICY "Public read access for site_films" ON public.site_films FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_announcements" ON public.site_announcements;
    CREATE POLICY "Public read access for site_announcements" ON public.site_announcements FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read access for site_settings" ON public.site_settings;
    CREATE POLICY "Public read access for site_settings" ON public.site_settings FOR SELECT USING (true);
END $$;

-- Politiques d'ÉCRITURE ADMIN (rôle = 'admin' dans profiles)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin write access for site_programs" ON public.site_programs;
    CREATE POLICY "Admin write access for site_programs" ON public.site_programs
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );

    DROP POLICY IF EXISTS "Admin write access for site_sessions" ON public.site_sessions;
    CREATE POLICY "Admin write access for site_sessions" ON public.site_sessions
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );

    DROP POLICY IF EXISTS "Admin write access for site_team" ON public.site_team;
    CREATE POLICY "Admin write access for site_team" ON public.site_team
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );

    DROP POLICY IF EXISTS "Admin write access for site_films" ON public.site_films;
    CREATE POLICY "Admin write access for site_films" ON public.site_films
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );

    DROP POLICY IF EXISTS "Admin write access for site_announcements" ON public.site_announcements;
    CREATE POLICY "Admin write access for site_announcements" ON public.site_announcements
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );

    DROP POLICY IF EXISTS "Admin write access for site_settings" ON public.site_settings;
    CREATE POLICY "Admin write access for site_settings" ON public.site_settings
        FOR ALL TO authenticated
        USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        )
        WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
        );
END $$;
