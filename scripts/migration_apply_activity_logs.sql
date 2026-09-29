-- ==============================================================================
-- CUC — Migration : public.site_activity_logs (journal d'activité technique)
-- ==============================================================================
-- Objet : créer la table du journal **technique** du Cockpit — incidents,
-- dégradations, jobs et synchronisations — distincte de `site_audit_logs` qui
-- reste le journal **métier** (modifications de contenu, rôles, candidatures).
-- Découpage et justification : `plans/plan-journal-activite-cockpit.md` § 2.
--
-- Innocuité (doctrine `durability_health.md` § 9) : cette migration se limite à
--   CREATE TABLE IF NOT EXISTS · ALTER TABLE … ADD COLUMN IF NOT EXISTS ·
--   CREATE INDEX IF NOT EXISTS · ALTER TABLE … ENABLE ROW LEVEL SECURITY ·
--   DROP POLICY IF EXISTS puis CREATE POLICY (garde d'idempotence, motif déjà
--   employé par `migration_apply_campus_pois_audit_logs.sql`) · COMMENT.
-- Aucun DROP de table ou de colonne, aucun ALTER COLUMN … TYPE, aucun DELETE,
-- aucun UPDATE de masse. Aucune donnée existante n'est réécrite ; l'ajout de la
-- contrainte de niveau est en outre subordonné à l'absence de ligne non conforme.
--
-- Application :
--   npm run db:migrate:activity-logs         (essai à blanc, aucune écriture)
--   npm run db:migrate:activity-logs:write   (écriture réelle, comptes vérifiés)
--
-- Les blocs sont délimités par une ligne marqueur (deux tirets, puis `@statement`) :
-- l'applier découpe sur cette ligne **entière** et jamais sur `;`, car un bloc
-- `DO $$ … $$` en contient. Le mot-clé n'est donc pas écrit tel quel dans ce
-- préambule : une mention en prose suffirait à créer un bloc parasite.
-- ==============================================================================

-- @statement
CREATE TABLE IF NOT EXISTS public.site_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    level TEXT NOT NULL DEFAULT 'info',
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    target TEXT,
    context JSONB,
    request_id TEXT,
    duration_ms INTEGER,
    origin TEXT,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    repeat_count INTEGER NOT NULL DEFAULT 1
);

-- Compléments pour une table créée par une version antérieure du plan.
-- @statement
ALTER TABLE public.site_activity_logs ADD COLUMN IF NOT EXISTS origin TEXT;

-- @statement
ALTER TABLE public.site_activity_logs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- @statement
ALTER TABLE public.site_activity_logs ADD COLUMN IF NOT EXISTS request_id TEXT;

-- @statement
ALTER TABLE public.site_activity_logs ADD COLUMN IF NOT EXISTS repeat_count INTEGER NOT NULL DEFAULT 1;

-- Contrainte de gravité : posée seulement si elle manque **et** si aucune ligne
-- existante ne la viole — une contrainte ajoutée à des données non conformes est
-- une migration destructive au sens du § 9 et exigerait l'accord du client.
-- @statement
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'site_activity_logs_level_check'
    ) AND NOT EXISTS (
        SELECT 1 FROM public.site_activity_logs
         WHERE level NOT IN ('info', 'warning', 'error', 'critical')
    ) THEN
        ALTER TABLE public.site_activity_logs
            ADD CONSTRAINT site_activity_logs_level_check
            CHECK (level IN ('info', 'warning', 'error', 'critical'));
    END IF;
END $$;

-- Lecture chronologique (vue du hub), puis lecture filtrée par niveau et source.
-- @statement
CREATE INDEX IF NOT EXISTS idx_site_activity_logs_occurred
    ON public.site_activity_logs(occurred_at DESC);

-- @statement
CREATE INDEX IF NOT EXISTS idx_site_activity_logs_level_occurred
    ON public.site_activity_logs(level, occurred_at DESC);

-- @statement
CREATE INDEX IF NOT EXISTS idx_site_activity_logs_source_occurred
    ON public.site_activity_logs(source, occurred_at DESC);

-- @statement
CREATE INDEX IF NOT EXISTS idx_site_activity_logs_category
    ON public.site_activity_logs(category);

-- @statement
ALTER TABLE public.site_activity_logs ENABLE ROW LEVEL SECURITY;

-- Écriture : tout utilisateur authentifié (les Server Actions journalisent sous
-- l'identité de l'auteur, `actor_id`/`actor_name` sont posés par le code).
-- @statement
DROP POLICY IF EXISTS "Authenticated insert for site_activity_logs" ON public.site_activity_logs;

-- @statement
CREATE POLICY "Authenticated insert for site_activity_logs" ON public.site_activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Lecture : Direction et administrateurs uniquement — un journal technique
-- nomme des tables, des routes et parfois des adresses.
-- @statement
DROP POLICY IF EXISTS "Direction read access for site_activity_logs" ON public.site_activity_logs;

-- @statement
CREATE POLICY "Direction read access for site_activity_logs" ON public.site_activity_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
             WHERE p.id = auth.uid()
               AND p.role IN ('admin', 'directeur')
        )
    );

-- Aucune policy UPDATE ni DELETE : le journal est en ajout seul. La purge de
-- rétention passe par la clé de service (`npm run cms:purge:logs`), jamais par
-- une session utilisateur — un journal effaçable depuis le Cockpit ne serait
-- plus une trace.
-- @statement
COMMENT ON TABLE public.site_activity_logs IS
    'Journal technique du Cockpit : incidents, dégradations, jobs et synchronisations. Écrit par src/lib/logging/write.ts, lu par le hub Journal du Cockpit. Rétention : npm run cms:purge:logs.';

-- @statement
COMMENT ON COLUMN public.site_activity_logs.category IS
    'Identifiant stable et filtrable de l''événement (ex. page.save, db.rls_denied). Jamais une phrase : la phrase vit dans message.';

-- @statement
COMMENT ON COLUMN public.site_activity_logs.context IS
    'Données structurées expurgées (src/lib/logging/redact.ts) : aucun jeton, aucune clé, adresses e-mail masquées.';

-- @statement
COMMENT ON COLUMN public.site_activity_logs.repeat_count IS
    'Nombre d''occurrences regroupées par l''anti-inondation (src/lib/logging/throttle.ts) depuis la dernière écriture.';
