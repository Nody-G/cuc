# Revue — RLS `site_pages` (lecture publique = publié seulement)

**Mode :** DRY-RUN (aucune écriture)
**Généré le :** 2026-09-23T06:01:47.494Z

## Motif

La policy publique `FOR SELECT USING (true)` laissait tout client anonyme lire un brouillon complet. La séquence de sûreté est respectée : la porte 404 (y compris sous RLS, via l’état service role) et l’aperçu sur client admin sont livrés AVANT cette migration.

## Nature des opérations

- **`site-pages-public-select-published`** — Remplace la policy publique `FOR SELECT USING (true)` par `USING (is_published = true)` (anon + authenticated) — un brouillon n’est plus lisible hors service role.

## Avant / Après

### AVANT

- Pages publiées : **15** · brouillons : **0**
- Lecture ANONYME (clé publique) : non sondée (HTTP 402 Payment Required)

| Policy | Commande | Rôles | USING |
| --- | --- | --- | --- |
| Admin write access for site_pages | ALL | {public} | `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'directeur'::text, 'secretaire'::text])))))` |
| Public read access for site_pages | SELECT | {public} | `true` |

### APRÈS

- Pages publiées : **15** · brouillons : **0**
- Lecture ANONYME (clé publique) : non sondée (HTTP 402 Payment Required)

| Policy | Commande | Rôles | USING |
| --- | --- | --- | --- |
| Admin write access for site_pages | ALL | {public} | `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'directeur'::text, 'secretaire'::text])))))` |
| Public read access for site_pages | SELECT | {public} | `true` |

## Vérification

> **Sonde anonyme indisponible** : HTTP 402 Payment Required. La vérification « brouillon = 0 ligne » devra être refaite dès que l’API Data répond à nouveau (`node scripts/apply_site_pages_rls_migration.mjs`, ou `--write` si la policy n’est pas encore appliquée).

- Brouillons visibles en lecture anonyme : **non sondé** (attendu : 0).
- Pages publiées toujours visibles en lecture anonyme : **non sondé** (attendu : 15).
- En cas d’écart : `node scripts/audit_supabase_state.mjs` puis relire les policies ci-dessus.
