# Audit des partenaires — écart code ↔ base

- DEFAULT_PARTNERS (code) : **14**
- site_partners (base) : **21**
- Manquants en base : **0**
- Orphelins en base : **7**
- Logos injoignables : **0**

## Manquants en base

_Aucun._

## Orphelins en base

- `europacorp` — EuropaCorp (cinema)
- `gaumont` — Gaumont (cinema)
- `pathe` — Pathé (cinema)
- `studiocanal` — StudioCanal (cinema)
- `afdas` — AFDAS (institutionnel)
- `france-travail` — France Travail (institutionnel)
- `hauts-de-france` — Région Hauts-de-France (institutionnel)

## Logos injoignables

> Seuls les logos **en base** sont bloquants (doctrine : `logo_url` doit
> pointer vers Supabase Storage). Les replis locaux du code sont servis
> par Next.js depuis `public/` et ne sont pas des anomalies.

_Aucun._
