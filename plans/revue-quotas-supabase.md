# Revue — Quotas Supabase (mesure et plafonds)

Généré le 2026-09-29T17:56:16.458Z par `scripts/audit_quotas.mjs`.

- Base `postgres` : **18.94 Mo** (budget 200.00 Mo)
- Stockage objet : **31.68 Mo** sur 189 objet(s) (budget 150.00 Mo)
- Plus grosse table : `site_settings` — 0.93 Mo (budget 50.00 Mo)

## Stockage par bucket

| Bucket | Objets | Empreinte |
| --- | ---: | ---: |
| `cuc-vitrine-assets` | 182 | 31.27 Mo |
| `reports` | 6 | 0.40 Mo |
| `avatars` | 1 | 0.01 Mo |

## Tables les plus volumineuses

| Table | Empreinte |
| --- | ---: |
| `site_settings` | 0.93 Mo |
| `site_films` | 0.88 Mo |
| `site_team` | 0.41 Mo |
| `site_translations` | 0.40 Mo |
| `site_pages` | 0.23 Mo |
| `site_page_revisions` | 0.11 Mo |
| `slots` | 0.10 Mo |
| `site_programs` | 0.10 Mo |

## Tables qui grossissent seules

| Table | Lignes | Budget | Rétention |
| --- | ---: | ---: | --- |
| `site_page_revisions` | 4 | 20000 | `npm run cms:purge:revisions` |
| `site_vitals` | 0 | 20000 | `npm run cms:purge:vitals` |
| `site_audit_logs` | 14 | 20000 | `npm run cms:purge:logs` (rétention à cadrer séparément) |
| `site_activity_logs` | 1 | 20000 | `npm run cms:purge:logs` (90/180/365 j selon la gravité) |
| `site_inquiries` | 1 | 20000 | à cadrer (demandes de contact) |

## Ce que cette mesure ne voit pas

- Les **plafonds du plan** (stockage, egress, connexions Realtime) : ils vivent dans le tableau de bord Supabase, pas dans la base.
- L’**egress** et le **nombre de connexions simultanées** : mesurés indirectement (poids des routes, `audit:budget`), jamais ici.

✅ Aucun budget franchi.

