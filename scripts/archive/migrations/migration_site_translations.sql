-- ==============================================================================
-- CUC — Table additive : site_translations (couche de traduction i18n)
-- ==============================================================================
-- Doctrine : préfixe `site_`, isolation totale vis-à-vis de CUC Sign, RLS
-- (lecture publique, écriture admin), Realtime activé.
--
-- Principe : overlay documentaire par (entity, entity_id, locale). La lecture
-- fusionne la base FR avec `payload` quand locale != 'fr'. Aucune traduction
-- absente ne casse l'affichage (repli FR automatique).
--
-- Exemples d'entités : 'page' (slug), 'settings' (clé), 'team' (id),
-- 'films' (id), 'programs' (id), 'events' (id), 'navigation' (id),
-- 'footer' (id), 'disciplines' (id), 'campus_pois' (id).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT site_translations_unique UNIQUE (entity, entity_id, locale)
);

CREATE INDEX IF NOT EXISTS site_translations_lookup_idx
    ON public.site_translations (entity, locale, is_published);

-- RLS : lecture publique, écriture admin
ALTER TABLE public.site_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for site_translations" ON public.site_translations;
CREATE POLICY "Public read access for site_translations"
    ON public.site_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for site_translations" ON public.site_translations;
CREATE POLICY "Admin write access for site_translations"
    ON public.site_translations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Realtime (synchronisation Cockpit ↔ Vitrine)
ALTER TABLE IF EXISTS public.site_translations REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_translations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_translations;
    END IF;
END $$;

-- Trigger `updated_at`
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_translations_set_updated_at ON public.site_translations;
CREATE TRIGGER site_translations_set_updated_at
    BEFORE UPDATE ON public.site_translations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
