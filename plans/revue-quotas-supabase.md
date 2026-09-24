# Revue — Quotas Supabase (mesure et plafonds)

Généré le 2026-09-24T15:14:53.484Z par `scripts/audit_quotas.mjs`.

- Base `postgres` : **17.41 Mo** (budget 200.00 Mo)
- Stockage objet : **90.95 Mo** sur 185 objet(s) (budget 150.00 Mo)
- Plus grosse table : `site_films` — 0.64 Mo (budget 50.00 Mo)

## Stockage par bucket

| Bucket | Objets | Empreinte |
| --- | ---: | ---: |
| `cuc-vitrine-assets` | 178 | 90.54 Mo |
| `reports` | 6 | 0.40 Mo |
| `avatars` | 1 | 0.01 Mo |

## Tables les plus volumineuses

| Table | Empreinte |
| --- | ---: |
| `site_films` | 0.64 Mo |
| `site_translations` | 0.40 Mo |
| `site_team` | 0.26 Mo |
| `site_settings` | 0.24 Mo |
| `site_pages` | 0.22 Mo |
| `site_programs` | 0.10 Mo |
| `slots` | 0.10 Mo |
| `site_campus_pois` | 0.08 Mo |

## Tables qui grossissent seules

| Table | Lignes | Budget | Rétention |
| --- | ---: | ---: | --- |
| `site_page_revisions` | 0 | 20000 | `npm run cms:purge:revisions` |
| `site_vitals` | 0 | 20000 | `npm run cms:purge:vitals` |
| `site_audit_logs` | 0 | 20000 | à cadrer (journal d’audit) |
| `site_inquiries` | 0 | 20000 | à cadrer (demandes de contact) |

## Ce que cette mesure ne voit pas

- Les **plafonds du plan** (stockage, egress, connexions Realtime) : ils vivent dans le tableau de bord Supabase, pas dans la base.
- L’**egress** et le **nombre de connexions simultanées** : mesurés indirectement (poids des routes, `audit:budget`), jamais ici.

✅ Aucun budget franchi.

