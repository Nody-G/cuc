-- ==============================================================================
-- CUC — Application ciblée : site_campus_pois + site_audit_logs
-- ==============================================================================
-- Contexte : la sonde `scripts/probe_system_health.mjs` a prouvé que ces deux
-- tables sont ABSENTES de l'instance Supabase, alors que le fichier
-- `migration_sync_cuc_cockpit.sql` les déclare. Conséquence : les écritures de
-- `CampusZonesView` échouaient silencieusement (try/catch) et le Moniteur
-- Système ne pouvait pas lire la dernière écriture.
--
-- Ce script est IDEMPOTENT : il peut être rejoué sans risque.
-- Il ajoute également les colonnes `image_url` et `order_index` sur
-- `site_campus_pois`, requises par `upsertCampusPOI` (actions.ts).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE : site_campus_pois (Zones et infrastructures du campus)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_campus_pois (
    id TEXT PRIMARY KEY,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'indoor',
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
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Rattrapage : si la table existait déjà sans ces colonnes, on les ajoute.
ALTER TABLE public.site_campus_pois ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.site_campus_pois ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_site_campus_pois_location ON public.site_campus_pois(location_id);
CREATE INDEX IF NOT EXISTS idx_site_campus_pois_active ON public.site_campus_pois(is_active);
CREATE INDEX IF NOT EXISTS idx_site_campus_pois_order ON public.site_campus_pois(order_index);

-- ------------------------------------------------------------------------------
-- 2. TABLE : site_audit_logs (Traçabilité des opérations du Cockpit)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_audit_logs_created ON public.site_audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_campus_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_audit_logs ENABLE ROW LEVEL SECURITY;

-- --- site_campus_pois : lecture publique (vitrine), écriture admin ---
DROP POLICY IF EXISTS "Public read access for site_campus_pois" ON public.site_campus_pois;
CREATE POLICY "Public read access for site_campus_pois" ON public.site_campus_pois
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for site_campus_pois" ON public.site_campus_pois;
CREATE POLICY "Admin write access for site_campus_pois" ON public.site_campus_pois
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'directeur', 'secretaire', 'coach')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'directeur', 'secretaire', 'coach')
        )
    );

-- --- site_audit_logs : insertion par tout utilisateur authentifié, lecture admin ---
DROP POLICY IF EXISTS "Authenticated insert for site_audit_logs" ON public.site_audit_logs;
CREATE POLICY "Authenticated insert for site_audit_logs" ON public.site_audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read access for site_audit_logs" ON public.site_audit_logs;
CREATE POLICY "Admin read access for site_audit_logs" ON public.site_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'directeur', 'secretaire', 'coach')
        )
    );

-- ------------------------------------------------------------------------------
-- 4. REALTIME (diffusion des changements vers le Cockpit)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'site_campus_pois'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_campus_pois;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'site_audit_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_audit_logs;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 5. VÉRIFICATION
-- ------------------------------------------------------------------------------
SELECT
    'site_campus_pois' AS table_name,
    COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'site_campus_pois'
UNION ALL
SELECT
    'site_audit_logs' AS table_name,
    COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'site_audit_logs';
