# Revue — Migration corrective Supabase (Realtime, révisions, campus)

**Mode :** APPLIQUÉ (--write)
**Généré le :** 2026-09-21T21:45:45.981Z

## Motifs (constats d’audit)

1. `site_settings` absente de la publication `supabase_realtime` → tous les abonnements Realtime à cette table (Cockpit + 7 surfaces publiques) étaient inertes.
2. `site_page_revisions` inexistante → l’historique de versions des pages du Cockpit était silencieusement inopérant.
3. « Résidence Stagiaires & Réfectoire » reliée au lieu CUC Sign « Amphithéatre » : liaison non prouvée, déliée (doctrine « un lien FAUX est pire qu’aucun lien »).

## Nature des opérations

- **`publication-site-settings`** — Ajoute `site_settings` à la publication Realtime (les abonnements à cette table ne se déclenchaient pas).
- **`table-site-page-revisions`** — Crée `site_page_revisions` (historique de versions des pages du Cockpit — table absente).
- **`index-site-page-revisions`** — Index de lecture par page (liste triée par numéro de révision).
- **`rls-site-page-revisions`** — Active RLS sur la nouvelle table.
- **`policy-site-page-revisions`** — Politique d’écriture STAFF (admin / directeur / secretaire) — même modèle que `site_pages`. Aucune lecture publique : l’historique éditorial reste interne.
- **`publication-site-page-revisions`** — Publie `site_page_revisions` pour le Realtime.
- **`unlink-residence-location`** — Délie la « Résidence Stagiaires & Réfectoire » du lieu « Amphithéatre » (liaison non prouvée — doctrine « un lien FAUX est pire qu’aucun lien »).

## Avant / Après

### AVANT

- Tables publiées (ciblées) : — aucune
- Table `site_page_revisions` : ABSENTE
- Résidence (`mfr-residence`) : location_id = `85190227-31ee-4ee8-945a-5dbd22ad38f0`

### APRÈS

- Tables publiées (ciblées) : `site_page_revisions`, `site_settings`
- Table `site_page_revisions` : existante
- Résidence (`mfr-residence`) : location_id = NULL

### Exécution

- `publication-site-settings` : ✔
- `table-site-page-revisions` : ✔
- `index-site-page-revisions` : ✔
- `rls-site-page-revisions` : ✔
- `policy-site-page-revisions` : ✔
- `publication-site-page-revisions` : ✔
- `unlink-residence-location` : ✔

## Vérification

- `node scripts/audit_supabase_state.mjs` — publication complète, table présente, liaison corrigée.
