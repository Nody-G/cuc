-- ==============================================================================
-- CUC — Historique de candidature sur le profil CUC Sign
-- ==============================================================================
-- Règle projet : dès qu'une personne **participe** à un stage ou à une
-- formation, elle doit avoir un profil CUC Sign, et son passé de candidat
-- (candidature recalée, session Découverte suivie sans suite) doit rester
-- disponible pour l'avenir.
--
-- Cette migration est **strictement additive** : une colonne JSONB nullable sur
-- `public.profiles`. Aucune donnée existante n'est touchée, aucune contrainte
-- n'est posée, aucun index n'est créé — la table appartient à CUC Sign et doit
-- rester inchangée dans sa structure métier.
--
-- Idempotente : réexécutable sans erreur (`IF NOT EXISTS`).
--
-- Application :
--   npm run db:migrate:applicant-history          (simulation, aucune écriture)
--   npm run db:migrate:applicant-history:write    (applique)
--
-- Forme de la valeur (écrite par `syncApplicantHistoryToProfile`) :
--   {
--     "email": "prenom.nom@example.org",
--     "applications": 2,
--     "firstAt": "2026-01-10T09:00:00.000Z",
--     "lastAt": "2026-06-01T09:00:00.000Z",
--     "decisions": [
--       { "at": "...", "dossierId": "inq_...", "pipeline": "formation",
--         "stage": "refuse", "label": "Non retenu", "negative": true }
--     ],
--     "discoveryVerdict": "defavorable",
--     "longProgramAdmitted": false,
--     "discoveryNotRetained": true
--   }
-- ==============================================================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS applicant_history JSONB;

COMMENT ON COLUMN public.profiles.applicant_history IS
    'Historique de candidature vitrine (candidatures, décisions, verdict Découverte). Écrit par le Cockpit CUC, lecture seule pour CUC Sign.';
