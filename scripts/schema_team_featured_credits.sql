-- ============================================================================
-- CUC — Mise en avant des crédits de tournage par coach
-- ============================================================================
-- Ajoute au cockpit la possibilité de :
--   1. choisir les films affichés en tête de la fiche publique d'un coach
--      (`featured_credits`, tableau ordonné de chaînes « Titre (Année) — Rôle »)
--   2. régler le nombre de crédits visibles avant le bouton « voir plus »
--      (`credits_display_limit`, défaut 8)
--
-- Doctrine : aucune donnée inventée. `featured_credits` ne contient que des
-- chaînes déjà présentes dans `notable_credits`. Une sélection vide déclenche
-- le tri automatique par notoriété côté application.
-- ============================================================================

ALTER TABLE site_team
  ADD COLUMN IF NOT EXISTS featured_credits TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE site_team
  ADD COLUMN IF NOT EXISTS credits_display_limit INTEGER DEFAULT 8;

-- Contrainte de cohérence : la limite reste dans une plage raisonnable.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_team_credits_display_limit_check'
  ) THEN
    ALTER TABLE site_team
      ADD CONSTRAINT site_team_credits_display_limit_check
      CHECK (credits_display_limit IS NULL OR (credits_display_limit >= 1 AND credits_display_limit <= 50));
  END IF;
END $$;

COMMENT ON COLUMN site_team.featured_credits IS
  'Crédits mis en avant sur la fiche publique, dans l''ordre d''affichage. Chaînes identiques à notable_credits.';
COMMENT ON COLUMN site_team.credits_display_limit IS
  'Nombre de crédits affichés avant le bouton « Afficher tous les crédits ». Défaut : 8.';
