-- ==============================================================================
-- CUC — Campus Univers Cascades & CUC Sign : Migration d'Harmonisation Totale
-- ==============================================================================
-- But :
-- 1. Créer les tables Cockpit manquantes (site_inquiries, site_disciplines, site_campus_pois, site_audit_logs)
-- 2. Interconnecter la Vitrine CUC avec CUC Sign (formations, profiles, locations)
-- 3. Activer la réplication Realtime et les politiques de sécurité RLS
-- ==============================================================================

-- 1. TABLE : site_inquiries (Candidatures formations & Demandes de devis événements)
CREATE TABLE IF NOT EXISTS public.site_inquiries (
    id TEXT PRIMARY KEY, -- ex: 'inq_1726000000000_abcde'
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    program_id TEXT REFERENCES public.site_programs(id) ON DELETE SET NULL,
    program_title TEXT,
    age TEXT,
    sport_background TEXT,
    session_date TEXT,
    afdas_status TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'en_cours', 'admis', 'refuse', 'archive'
    admin_notes TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour les recherches administratives rapides
CREATE INDEX IF NOT EXISTS idx_site_inquiries_status ON public.site_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_site_inquiries_created ON public.site_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_inquiries_program ON public.site_inquiries(program_id);

-- 2. TABLE : site_disciplines (Catalogue officiel des 10 disciplines de cascade CUC)
CREATE TABLE IF NOT EXISTS public.site_disciplines (
    id TEXT PRIMARY KEY, -- slug: 'parkour-add', 'chute-hauteur', 'torche-humaine', etc.
    number TEXT NOT NULL, -- 'DISCIPLINE 01', etc.
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Mouvement & Déplacement',
    level TEXT NOT NULL DEFAULT 'Tous Niveaux',
    duration TEXT,
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    objectives TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    safety_rules TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    instructor_ids TEXT[] DEFAULT '{}', -- Références vers site_team(id)
    film_ids TEXT[] DEFAULT '{}',       -- Références vers site_films(id)
    program_ids TEXT[] DEFAULT '{}',    -- Références vers site_programs(id)
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_disciplines_active ON public.site_disciplines(is_active, order_index);

-- 3. TABLE : site_campus_pois (Zones et infrastructures tactiques du campus de 6 hectares)
CREATE TABLE IF NOT EXISTS public.site_campus_pois (
    id TEXT PRIMARY KEY, -- slug: 'cuc-tower', 'dojo-malik', 'salle-zoe-bell', etc.
    -- Passerelle directe vers la table `locations` de CUC Sign
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'indoor', -- 'indoor', 'outdoor', 'mixed'
    category TEXT DEFAULT 'technical',
    coords JSONB DEFAULT '{"x": 50, "y": 50}'::jsonb,
    level TEXT DEFAULT 'polyvalent',
    surface TEXT,
    capacity INTEGER,
    equipment TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    disciplines TEXT[] DEFAULT '{}',
    coaches TEXT[] DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_campus_pois_location ON public.site_campus_pois(location_id);
CREATE INDEX IF NOT EXISTS idx_site_campus_pois_active ON public.site_campus_pois(is_active);

-- 4. TABLE : site_audit_logs (Traçabilité des opérations du Cockpit)
CREATE TABLE IF NOT EXISTS public.site_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL, -- ex: 'update_session', 'update_page', 'update_role'
    target TEXT NOT NULL, -- ex: 'pro-longue-duree / 16 au 28 août 2026'
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_audit_logs_created ON public.site_audit_logs(created_at DESC);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.site_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_campus_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- --- site_inquiries ---
    -- Permettre à tout visiteur (formulaire vitrine) de soumettre une candidature
    DROP POLICY IF EXISTS "Public insert access for site_inquiries" ON public.site_inquiries;
    CREATE POLICY "Public insert access for site_inquiries" ON public.site_inquiries
        FOR INSERT WITH CHECK (true);

    -- Seuls les administrateurs et collaborateurs Cockpit peuvent lire et modifier les candidatures
    DROP POLICY IF EXISTS "Admin access for site_inquiries" ON public.site_inquiries;
    CREATE POLICY "Admin access for site_inquiries" ON public.site_inquiries
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'directeur', 'secretaire', 'coach')
            )
        );

    -- --- site_disciplines ---
    -- Lecture publique pour tout le site vitrine
    DROP POLICY IF EXISTS "Public read access for site_disciplines" ON public.site_disciplines;
    CREATE POLICY "Public read access for site_disciplines" ON public.site_disciplines
        FOR SELECT USING (true);

    -- Écriture réservée aux administrateurs
    DROP POLICY IF EXISTS "Admin write access for site_disciplines" ON public.site_disciplines;
    CREATE POLICY "Admin write access for site_disciplines" ON public.site_disciplines
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'directeur')
            )
        );

    -- --- site_campus_pois ---
    -- Lecture publique pour la carte 2D/3D du campus
    DROP POLICY IF EXISTS "Public read access for site_campus_pois" ON public.site_campus_pois;
    CREATE POLICY "Public read access for site_campus_pois" ON public.site_campus_pois
        FOR SELECT USING (true);

    -- Écriture réservée aux administrateurs
    DROP POLICY IF EXISTS "Admin write access for site_campus_pois" ON public.site_campus_pois;
    CREATE POLICY "Admin write access for site_campus_pois" ON public.site_campus_pois
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'directeur')
            )
        );

    -- --- site_audit_logs ---
    DROP POLICY IF EXISTS "Staff read access for site_audit_logs" ON public.site_audit_logs;
    CREATE POLICY "Staff read access for site_audit_logs" ON public.site_audit_logs
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'directeur', 'secretaire', 'coach')
            )
        );

    DROP POLICY IF EXISTS "Staff insert access for site_audit_logs" ON public.site_audit_logs;
    CREATE POLICY "Staff insert access for site_audit_logs" ON public.site_audit_logs
        FOR INSERT TO authenticated
        WITH CHECK (true);
END $$;

-- ==============================================================================
-- 6. ACTIVATION REPLICA IDENTITY FULL & SUPABASE REALTIME
-- ==============================================================================

ALTER TABLE IF EXISTS public.site_inquiries REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_disciplines REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_campus_pois REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_audit_logs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_programs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_sessions REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_team REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_films REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_pages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.site_settings REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_inquiries') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_inquiries;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_disciplines') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_disciplines;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_campus_pois') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_campus_pois;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_audit_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_audit_logs;
    END IF;
END $$;

-- ==============================================================================
-- 7. INTERCONNEXION BIDIRECTIONNELLE AUTOMATIQUE CUC ↔ CUC SIGN
-- ==============================================================================

-- A. Lier les sessions du site vitrine (site_sessions) aux formations réelles (formations) de CUC Sign
UPDATE public.site_sessions s
SET cuc_sign_formation_id = f.id
FROM public.formations f
WHERE (
    (s.date_display ILIKE '%16 au 28 août 2026%' AND f.name ILIKE '%16 au 28 août 2026%') OR
    (s.date_display ILIKE '%18 au 30 octobre 2026%' AND f.name ILIKE '%18 au 30 octobre 2026%') OR
    (s.date_display ILIKE '%18 au 30 avril 2027%' AND f.name ILIKE '%18 au 30 avril 2027%') OR
    (s.date_display ILIKE '%12%13 septembre 2026%' AND f.name ILIKE '%12%13 septembre 2026%') OR
    (s.date_display ILIKE '%21%22 novembre 2026%' AND f.name ILIKE '%21%22 novembre 2026%') OR
    (s.date_display ILIKE '%21 février%5 mars 2027%' AND f.name ILIKE '%21 février%5 mars 2027%') OR
    (s.date_display ILIKE '%29 juin%10 juillet 2026%' AND f.name ILIKE '%29 juin%10 juillet 2026%')
)
AND s.cuc_sign_formation_id IS NULL;

-- B. Lier les membres de l'équipe (site_team) aux profils utilisateurs (profiles) de CUC Sign
UPDATE public.site_team t
SET profile_id = p.id
FROM public.profiles p
WHERE (
    (t.id = 'lucas-dollfus' AND p.email = 'cuc@cuc.fr') OR
    (t.id = 'malik-diouf' AND p.email = 'cuc2@cuc.fr') OR
    (t.id = 'bastien-trouve' AND p.email = 'cuc10@cuc.fr') OR
    (t.id = 'pierre-gomes' AND p.email = 'cuc4@cuc.fr')
)
AND t.profile_id IS NULL;

-- C. Lier les infrastructures du campus (site_campus_pois) aux lieux (locations) de CUC Sign
UPDATE public.site_campus_pois poi
SET location_id = l.id
FROM public.locations l
WHERE (
    (poi.id IN ('dojo-malik', 'zone-dojo-malik') AND l.name = 'Dojo Malik') OR
    (poi.id IN ('salle-zoe-bell', 'zone-salle-zoe-bell') AND l.name = 'Salle Zoé Bell') OR
    (poi.id IN ('tour-jerome-gaspard', 'cuc-tower', 'zone-cuc-tower') AND l.name = 'Tour Jérome Gaspard') OR
    (poi.id IN ('dojo-maurice', 'zone-dojo-maurice') AND l.name = 'Dojo Maurice') OR
    (poi.id IN ('salle-escalade', 'zone-salle-escalade') AND l.name = 'Salle Escalade') OR
    (poi.id IN ('salle-tabata', 'zone-salle-tabata') AND l.name = 'Salle Tabata') OR
    (poi.id IN ('amphitheatre', 'zone-amphitheatre') AND l.name = 'Amphithéatre') OR
    (poi.id IN ('escaliers', 'zone-escaliers') AND l.name = 'Escaliers') OR
    (poi.id IN ('city-stade', 'zone-city-stade') AND l.name = 'City Stade')
)
AND poi.location_id IS NULL;
