# Revue — RLS `site_pages` (lecture publique = publié seulement)

**Mode :** DRY-RUN (aucune écriture)
**Généré le :** 2026-09-23T07:18:23.640Z

## Motif

La policy publique `FOR SELECT USING (true)` laissait tout client anonyme lire un brouillon complet. La séquence de sûreté est respectée : la porte 404 (y compris sous RLS, via l’état service role) et l’aperçu sur client admin sont livrés AVANT cette migration.

## Nature des opérations

- **`site-pages-public-select-published`** — Remplace la policy publique `FOR SELECT USING (true)` par `USING (is_published = true)` (anon + authenticated) — un brouillon n’est plus lisible hors service role.

## Avant / Après

### AVANT

- Pages publiées : **15** · brouillons réels : **0**
- **Sonde RLS (rôle `anon`, Postgres, transaction annulée)** : **15 publiée(s) visible(s), 0 brouillon(s) VISIBLE(S)** (avec une ligne brouillon témoin temporaire)
- Sonde REST (clé publique) : 15 publiée(s) visible(s), 0 brouillon(s) VISIBLE(S)

| Policy | Commande | Rôles | USING |
| --- | --- | --- | --- |
| Admin write access for site_pages | ALL | {public} | `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'directeur'::text, 'secretaire'::text])))))` |
| Public read access for site_pages | SELECT | {anon,authenticated} | `(is_published = true)` |

### APRÈS

- Pages publiées : **15** · brouillons réels : **0**
- **Sonde RLS (rôle `anon`, Postgres, transaction annulée)** : **15 publiée(s) visible(s), 0 brouillon(s) VISIBLE(S)** (avec une ligne brouillon témoin temporaire)
- Sonde REST (clé publique) : 15 publiée(s) visible(s), 0 brouillon(s) VISIBLE(S)

| Policy | Commande | Rôles | USING |
| --- | --- | --- | --- |
| Admin write access for site_pages | ALL | {public} | `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'directeur'::text, 'secretaire'::text])))))` |
| Public read access for site_pages | SELECT | {anon,authenticated} | `(is_published = true)` |

## Vérification

- **Sonde RLS (Postgres, rôle `anon`)** : 0 brouillon(s) visible(s) avec ligne témoin (attendu : 0) ; 15 publiée(s) visibles (attendu : 15).
- En cas d’écart : `node scripts/audit_supabase_state.mjs` puis relire les policies ci-dessus.
