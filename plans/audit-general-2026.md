# Audit général de l'application CUC

**Généré le :** 2026-09-24T13:54:00.001Z

> État des lieux factuel. Aucune correction appliquée.

## Synthèse

| Contrôle | Valeur |
|---|---|
| Routes détectées | 35 |
| Fichiers source scannés | 766 |
| Liens internes cassés | 0 |
| Ancres orphelines | 0 |
| Doublons de liens | 0 |
| Composants orphelins | 0 |
| URLs legacy WordPress (vivantes) | 0 |
| URLs legacy (registres/scripts obsolètes) | 4389 |
| Occurrences doctrine (actionnables) | 0 |
| Occurrences doctrine (métadonnées de scripts) | 106 |
| Conflits de handles sociaux | 0 |
| Redirections invalides/chaînées | 0 |
| Écarts de largeur (max-w-7xl/6xl) | 0 |
| Canaux Realtime sans nettoyage | 0 |
| Composants live sans Realtime | 6 |
| Couverture Realtime (composants live) | 74 % |
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

Aucune anomalie détectée.

## Occurrences doctrine (actionnables)

Aucune anomalie détectée.

## Conflits de handles sociaux

Aucune anomalie détectée.

## Redirections invalides ou chaînées

Aucune anomalie détectée.

## Écarts de largeur

Aucune anomalie détectée.

## Canaux Realtime sans nettoyage

Aucune anomalie détectée.

## Composants live sans Realtime

- `src/components/3d/campus-plan/useFacilityHistory.ts` — getters : getCampusPlacements3D
- `src/components/i18n/PageDataProvider.tsx` — getters : getLocalizedPageContent
- `src/components/i18n/SiteDataProvider.tsx` — getters : getPublicPageContent
- `src/components/i18n/UnpublishedPageGate.tsx` — getters : getPublicPageContent
- `src/lib/hooks/usePageDynamicContent.ts` — getters : getPreviewDraft
- `src/lib/hooks/usePageSectionData.ts` — getters : getPreviewDraft

## Clés i18n manquantes en anglais

Aucune anomalie détectée.

## Routes sans metadata

- `/[locale]/preview/[slug]`

## Routes détectées

- `/[locale]`
- `/[locale]/animations-airbag-parkour`
- `/[locale]/contact-cuc`
- `/[locale]/cuc-events-agence`
- `/[locale]/cuc-team-cascadeur`
- `/[locale]/equipe-cascadeurs-pro`
- `/[locale]/equipe-cascadeurs-pro/[slug]`
- `/[locale]/formation-de-cascadeur`
- `/[locale]/partenaires`
- `/[locale]/preview`
- `/[locale]/preview/[slug]`
- `/[locale]/spectacles-cascadeurs-yamakasi`
- `/[locale]/stages-cascades-parkour-2`
- `/[locale]/stunt-workshop-cuc`
- `/[locale]/team-building-cascades`
- `/[locale]/videos-cascadeur`
- `/[locale]/visite-guidee`
- `/[locale]/visite-virtuelle`
- `/admin`
- `/admin/announcements`
- `/admin/campus-3d`
- `/admin/events`
- `/admin/films`
- `/admin/inquiries`
- `/admin/instagram`
- `/admin/login`
- `/admin/media`
- `/admin/pages`
- `/admin/partners`
- `/admin/sessions`
- `/admin/settings`
- `/admin/team`
- `/admin/traffic`
- `/admin/translations`
- `/admin/visites`
