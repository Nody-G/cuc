# Revue — Conteneur canonique `.page-shell` de la vitrine

**Mode :** APPLIQUÉ (--apply)
**Généré le :** 2026-09-21T21:40:00.032Z

> Décision : toutes les pages vitrine adoptent la largeur de la page
> équipe (1600 px). `.page-shell` remplace les conteneurs locaux
> `max-w-7xl` / `max-w-[1600px]`. Le Cockpit est hors périmètre.

- Fichiers modifiés : **40**
- Conteneurs convertis : **58**

| Fichier | Conteneurs convertis |
| --- | --- |
| `src/app/(site)/[locale]/stunt-workshop-cuc/page.tsx` | 4 |
| `src/app/(site)/[locale]/videos-cascadeur/page.tsx` | 4 |
| `src/app/(site)/[locale]/animations-airbag-parkour/page.tsx` | 3 |
| `src/components/sections/team/TeamProductionGalleries.tsx` | 3 |
| `src/app/(site)/[locale]/contact-cuc/page.tsx` | 2 |
| `src/app/(site)/[locale]/equipe-cascadeurs-pro/page.tsx` | 2 |
| `src/app/(site)/[locale]/spectacles-cascadeurs-yamakasi/page.tsx` | 2 |
| `src/app/(site)/[locale]/team-building-cascades/page.tsx` | 2 |
| `src/app/(site)/[locale]/visite-guidee/page.tsx` | 2 |
| `src/components/sections/events/EventsPartnersBanners.tsx` | 2 |
| `src/components/sections/formation/FormationHeroSection.tsx` | 2 |
| `src/components/sections/visite/VisiteHeroSection.tsx` | 2 |
| `src/app/(site)/[locale]/equipe-cascadeurs-pro/[slug]/CoachDetailClient.tsx` | 1 |
| `src/app/(site)/[locale]/visite-virtuelle/page.tsx` | 1 |
| `src/components/sections/contact/ContactHeroSection.tsx` | 1 |
| `src/components/sections/events/EventsGuaranteesSection.tsx` | 1 |
| `src/components/sections/events/EventsHeroSection.tsx` | 1 |
| `src/components/sections/events/EventsPillarsSection.tsx` | 1 |
| `src/components/sections/formation/FormationDisciplinesExplorer.tsx` | 1 |
| `src/components/sections/formation/FormationFormulesSection.tsx` | 1 |
| `src/components/sections/formation/FormationPedagogyModalities.tsx` | 1 |
| `src/components/sections/HallOfFame.tsx` | 1 |
| `src/components/sections/home/HomeAboutSection.tsx` | 1 |
| `src/components/sections/home/HomePartnersSection.tsx` | 1 |
| `src/components/sections/home/HomeQualiopiSection.tsx` | 1 |
| `src/components/sections/home/HomeSocialSection.tsx` | 1 |
| `src/components/sections/home/HomeTournagesSection.tsx` | 1 |
| `src/components/sections/home/HomeVirtualTourSection.tsx` | 1 |
| `src/components/sections/partenaires/PartenairesGridSection.tsx` | 1 |
| `src/components/sections/partenaires/PartenairesHeroSection.tsx` | 1 |
| `src/components/sections/stages/StagesGridSection.tsx` | 1 |
| `src/components/sections/stages/StagesHeroSection.tsx` | 1 |
| `src/components/sections/team/TeamBannersSection.tsx` | 1 |
| `src/components/sections/team/TeamHeroSection.tsx` | 1 |
| `src/components/sections/team/TeamProductionServices.tsx` | 1 |
| `src/components/sections/visite/VisiteAccessTransport.tsx` | 1 |
| `src/components/sections/visite/VisiteFacilitiesDetail.tsx` | 1 |
| `src/components/sections/visite/VisitePhotoGallery.tsx` | 1 |
| `src/components/layout/Footer.tsx` | 1 |
| `src/components/ui/parallax/StudioGlobalAtmosphere.tsx` | 1 |

Vérification : `node scripts/audit_full_app.mjs` (règle n°9 — 0 écart).
