-- ==============================================================================
-- CUC — Schéma : Historique de versions des pages (site_page_revisions)
-- ==============================================================================
-- Isolation garantie : table préfixée `site_` (aucune interférence CUC Sign).
-- Chaque enregistrement est un instantané (snapshot) immuable d'une page
-- (`site_pages`) au moment d'une publication. Permet :
--   - l'historique complet des modifications,
--   - la comparaison (diff) entre deux versions,
--   - la restauration d'une version antérieure,
--   - le workflow brouillon → prévisualisation → publication.
-- ==============================================================================

-- 1. TABLE : site_page_revisions
CREATE TABLE IF NOT EXISTS public.site_page_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL, -- référence logique vers site_pages.slug
    revision_number INTEGER NOT NULL, -- numéro incrémental par page (1, 2, 3…)
    -- Instantané complet du contenu de la page au moment de la révision.
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Statut de la révision : 'draft' (brouillon), 'published' (publiée), 'archived'.
    status TEXT NOT NULL DEFAULT 'draft',
    -- Libellé lisible de la révision (ex: "Correction du hero", "Ajout FAQ").
    label TEXT,
    -- Auteur de la modification (profil CUC Sign, ON DELETE SET NULL pour
    -- préserver l'intégrité absolue de CUC Sign).
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    -- Métadonnées libres (source, commentaire, hash de contenu…).
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. INDEX (recherche rapide par page, tri chronologique, statut)
CREATE INDEX IF NOT EXISTS idx_site_page_revisions_slug
    ON public.site_page_revisions (page_slug, revision_number DESC);

CREATE INDEX IF NOT EXISTS idx_site_page_revisions_status
    ON public.site_page_revisions (status);

CREATE INDEX IF NOT EXISTS idx_site_page_revisions_created
    ON public.site_page_revisions (created_at DESC);

-- 3. CONTRAINTE D'UNICITÉ (une seule révision par numéro et par page)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'site_page_revisions_slug_number_key'
    ) THEN
        ALTER TABLE public.site_page_revisions
            ADD CONSTRAINT site_page_revisions_slug_number_key
            UNIQUE (page_slug, revision_number);
    END IF;
END $$;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.site_page_revisions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Lecture publique (l'historique n'est pas sensible, mais reste réservé
    -- en pratique au Cockpit authentifié).
    DROP POLICY IF EXISTS "Public read access for site_page_revisions" ON public.site_page_revisions;
    CREATE POLICY "Public read access for site_page_revisions" ON public.site_page_revisions
        FOR SELECT USING (true);

    -- Écriture réservée aux administrateurs (cohérent avec site_pages).
    DROP POLICY IF EXISTS "Admin write access for site_page_revisions" ON public.site_page_revisions;
    CREATE POLICY "Admin write access for site_page_revisions" ON public.site_page_revisions
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );
END $$;

-- 5. REPLICA IDENTITY FULL & ACTIVATION SUPABASE REALTIME
ALTER TABLE IF EXISTS site_page_revisions REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'site_page_revisions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE site_page_revisions;
    END IF;
END $$;

-- 6. FONCTION : numéro de révision suivant pour une page
CREATE OR REPLACE FUNCTION public.next_page_revision_number(p_slug TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(MAX(revision_number), 0) + 1
    FROM public.site_page_revisions
    WHERE page_slug = p_slug;
$$;

-- 7. FONCTION : création automatique d'une révision à chaque mise à jour
--    de site_pages (snapshot de l'état PRÉ-copie pour permettre le retour).
CREATE OR REPLACE FUNCTION public.snapshot_site_page_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_next INTEGER;
    v_author_name TEXT;
BEGIN
    -- Numéro de révision suivant pour cette page.
    SELECT COALESCE(MAX(revision_number), 0) + 1
      INTO v_next
      FROM public.site_page_revisions
     WHERE page_slug = OLD.slug;

    -- Nom de l'auteur si disponible.
    SELECT COALESCE(full_name, email)
      INTO v_author_name
      FROM public.profiles
     WHERE id = auth.uid();

    INSERT INTO public.site_page_revisions (
        page_slug,
        revision_number,
        snapshot,
        status,
        label,
        author_id,
        author_name
    ) VALUES (
        OLD.slug,
        v_next,
        jsonb_build_object(
            'title', OLD.title,
            'meta_title', OLD.meta_title,
            'meta_description', OLD.meta_description,
            'og_image', OLD.og_image,
            'hero', OLD.hero,
            'sections', OLD.sections,
            'is_published', OLD.is_published
        ),
        'archived',
        'Instantané automatique avant modification',
        auth.uid(),
        v_author_name
    );

    RETURN NEW;
END;
$$;

-- 8. TRIGGER : déclenché AVANT chaque UPDATE de site_pages
DROP TRIGGER IF EXISTS trg_snapshot_site_page_revision ON public.site_pages;
CREATE TRIGGER trg_snapshot_site_page_revision
    BEFORE UPDATE ON public.site_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.snapshot_site_page_revision();

-- ==============================================================================
-- FIN — Historique de versions des pages
-- ==============================================================================
