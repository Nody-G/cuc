# Revue — Quotas Supabase (mesure et plafonds)

Généré le 2026-10-18T19:56:06.798Z par `scripts/audit_quotas.mjs`.

- Base `postgrest-https` : **0.00 Mo** (budget 200.00 Mo)
- Stockage objet : **108.77 Mo** sur 349 objet(s) (budget 150.00 Mo)
- Plus grosse table : `—` — 0.00 Mo (budget 50.00 Mo)

## Stockage par bucket

| Bucket | Objets | Empreinte |
| --- | ---: | ---: |
| `cuc-vitrine-assets` | 342 | 108.36 Mo |
| `reports` | 6 | 0.40 Mo |
| `avatars` | 1 | 0.01 Mo |
| `compliance-docs` | 0 | 0.00 Mo |

## Tables les plus volumineuses

| Table | Empreinte |
| --- | ---: |

## Tables qui grossissent seules

| Table | Lignes | Budget | Rétention |
| --- | ---: | ---: | --- |
| `site_page_revisions` | 7 | 20000 | `npm run cms:purge:revisions` |
| `site_vitals` | 28 | 20000 | `npm run cms:purge:vitals` |
| `site_audit_logs` | 33 | 20000 | `npm run cms:purge:logs` (rétention à cadrer séparément) |
| `site_activity_logs` | 1 | 20000 | `npm run cms:purge:logs` (90/180/365 j selon la gravité) |
| `site_inquiries` | 1 | 20000 | à cadrer (demandes de contact) |

## Ce que cette mesure ne voit pas

- Les **plafonds du plan** (stockage, egress, connexions Realtime) : ils vivent dans le tableau de bord Supabase, pas dans la base.
- L’**egress** et le **nombre de connexions simultanées** : mesurés indirectement (poids des routes, `audit:budget`), jamais ici.

✅ Aucun budget franchi.

