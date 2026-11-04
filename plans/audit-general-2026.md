# Audit général de l'application CUC

**Généré le :** 2026-11-04T18:35:05.262Z

> État des lieux factuel. Aucune correction appliquée.

## Synthèse

| Contrôle | Valeur |
|---|---|
| Routes détectées | 53 |
| Fichiers source scannés | 1066 |
| Liens internes cassés | 0 |
| Ancres orphelines | 0 |
| Doublons de liens | 0 |
| Composants orphelins | 0 |
| URLs legacy WordPress (vivantes) | 2 |
| URLs legacy (registres/scripts obsolètes) | 4415 |
| Occurrences doctrine (actionnables) | 7 |
| Occurrences doctrine (métadonnées de scripts) | 108 |
| Conflits de handles sociaux | 0 |
| Redirections invalides/chaînées | 0 |
| Écarts de largeur (max-w-7xl/6xl) | 0 |
| Canaux Realtime sans nettoyage | 0 |
| Composants live sans Realtime | 4 |
| Couverture Realtime (composants live) | 0 % |
| Clés i18n fr → en manquantes | 0 |
| Clés i18n en surnuméraires | 0 |
| Routes publiques sans metadata | 1 |

## Liens internes cassés

Aucune anomalie détectée.

## Ancres orphelines

Aucune anomalie détectée.

## Doublons de liens

Aucune anomalie détectée.

## Composants orphelins

Aucune anomalie détectée.

## URLs legacy WordPress (vivantes)

- `https://www.campus-universcascades.com/wp-content/uploads/2021/07/TF1-JT-20h-CUC-reportage-1.mp4` — scripts/archive/experiments/audit_videos_live.mjs:72
- `https://www.campus-universcascades.com/wp-content/uploads/2021/07/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4` — scripts/archive/experiments/audit_videos_live.mjs:73

## Occurrences doctrine (actionnables)

- **badge: BOX-OFFICE** — src/data/celebrities.ts:217
- **superlatif: légendaire** — src/data/filmography.ts:21097
- **superlatif: légendaire** — src/data/filmography.ts:21097
- **superlatif: légendaire** — src/data/filmography.ts:24825
- **badge: WORLDWIDE** — src/data/filmography.ts:12787
- **badge: WORLDWIDE** — src/data/filmography.ts:17251
- **cliché: plongez au cœur** — src/data/videos.ts:95

## Conflits de handles sociaux

Aucune anomalie détectée.

## Redirections invalides ou chaînées

Aucune anomalie détectée.

## Écarts de largeur

Aucune anomalie détectée.

## Canaux Realtime sans nettoyage

Aucune anomalie détectée.

## Composants live sans Realtime

- `src/components/i18n/PageDataProvider.tsx` — getters : getLocalizedPageContent
- `src/components/i18n/SiteDataProvider.tsx` — getters : getPublicPageContent
- `src/components/i18n/UnpublishedPageGate.tsx` — getters : getPublicPageContent
- `src/lib/hooks/usePageSectionData.ts` — getters : getPreviewDraft

## Clés i18n manquantes en anglais

Aucune anomalie détectée.

## Routes sans metadata

- `/[locale]/preview/[slug]`

## Routes détectées

- `/[locale]`
- `/[locale]/animations-airbag-parkour`
- `/[locale]/confidentialite`
- `/[locale]/contact-cuc`
- `/[locale]/cuc-events-agence`
- `/[locale]/cuc-team-cascadeur`
- `/[locale]/equipe-cascadeurs-pro`
- `/[locale]/equipe-cascadeurs-pro/[slug]`
- `/[locale]/formation-de-cascadeur`
- `/[locale]/mentions-legales`
- `/[locale]/partenaires`
- `/[locale]/preview`
- `/[locale]/preview/[slug]`
- `/[locale]/reglement-interieur`
- `/[locale]/spectacles-cascadeurs-yamakasi`
- `/[locale]/stages-cascades-parkour-2`
- `/[locale]/stunt-workshop-cuc`
- `/[locale]/team-building-cascades`
- `/[locale]/videos-cascadeur`
- `/[locale]/visite-guidee`
- `/[locale]/visite-virtuelle`
- `/admin`
- `/admin/aide`
- `/admin/analytics`
- `/admin/announcements`
- `/admin/audience`
- `/admin/audit`
- `/admin/campus`
- `/admin/campus-3d`
- `/admin/chrome`
- `/admin/disciplines`
- `/admin/events`
- `/admin/films`
- `/admin/footer`
- `/admin/health`
- `/admin/inquiries`
- `/admin/instagram`
- `/admin/journal`
- `/admin/login`
- `/admin/media`
- `/admin/microtextes`
- `/admin/navigation`
- `/admin/pages`
- `/admin/partners`
- `/admin/reset-password`
- `/admin/sessions`
- `/admin/settings`
- `/admin/social`
- `/admin/team`
- `/admin/traffic`
- `/admin/translations`
- `/admin/users`
- `/admin/visites`
