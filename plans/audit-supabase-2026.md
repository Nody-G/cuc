# Audit Supabase — état de la base vitrine CUC

**Généré le :** 2026-10-02T16:46:42.906Z  
**Lecture seule** — aucune écriture base.

## Publication Realtime

- Tables publiées : **24**
- ✔ Toutes les tables attendues sont publiées.

## Tables `site_*`

| Table | Lignes | RLS |
| --- | ---: | --- |
| `site_pages` | 15 | ✔ |
| `site_page_revisions` | 6 | ✔ |
| `site_team` | 20 | ✔ |
| `site_films` | 570 | ✔ |
| `site_partners` | 21 | ✔ |
| `site_events` | 3 | ✔ |
| `site_disciplines` | 10 | ✔ |
| `site_sessions` | 17 | ✔ |
| `site_programs` | 6 | ✔ |
| `site_inquiries` | 1 | ✔ |
| `site_audit_logs` | 32 | ✔ |
| `site_announcements` | 3 | ✔ |
| `site_settings` | 15 | ✔ |
| `site_navigation` | 1 | ✔ |
| `site_footer` | 1 | ✔ |
| `site_social_links` | 5 | ✔ |
| `site_translations` | 579 | ✔ |
| `site_campus_pois` | 5 | ✔ |
| `site_campus_facilities` | — (absente) | ✖ |
| `site_media` | — (absente) | ✖ |
| `site_videos` | — (absente) | ✖ |

## Interconnexion CUC Sign

| Entité | Liaison | Couverture |
| --- | --- | --- |
| Sessions | `cuc_sign_formation_id` → `formations` | 9/17 |
| Équipe | `profile_id` → `profiles` | 2/20 |
| Campus | `location_id` → `locations` | 4/5 |

## Clés étrangères site_*

- `site_activity_logs` → `profiles` (site_activity_logs_actor_id_fkey, ON DELETE SET NULL)
- `site_audit_logs` → `profiles` (site_audit_logs_user_id_fkey, ON DELETE SET NULL)
- `site_campus_pois` → `locations` (site_campus_pois_location_id_fkey, ON DELETE SET NULL)
- `site_page_revisions` → `profiles` (site_page_revisions_author_id_fkey, ON DELETE SET NULL)
- `site_sessions` → `formations` (site_sessions_cuc_sign_formation_id_fkey, ON DELETE SET NULL)
- `site_sessions` → `site_programs` (site_sessions_program_id_fkey, ON DELETE CASCADE)
- `site_team` → `profiles` (site_team_profile_id_fkey, ON DELETE SET NULL)

## Fichiers

- Données complètes : `scripts/audit_supabase_state_report.json`
