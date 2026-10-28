# Revue — Micro-textes visibles par les visiteurs

Généré le 2026-10-28T16:21:08.447Z par `scripts/audit_visible_microcopy.mjs`.

Analyse statique des composants de vitrine : chaque texte visible est classé.
Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.

| Catégorie | Occurrences |
| --- | ---: |
| ANNOTÉ — éditable en place | 317 |
| DONNÉES — éditable par un écran existant | 113 |
| TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n) | 15 |
| CODÉ EN DUR — dette (aucune prise en charge par le Cockpit) | 0 |
| HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées) | 5 |
| **Total** | **450** |

## 1. ANNOTÉ — éditable en place

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.74 — `{t('breadcrumbCurrent')}`
- l.81 — `{heroBadge}`
- l.89 — `{content.hero?.meta || t('heroMeta')}`
- l.113 — `{heroSubtitle}`
- l.120 — `{ctaPrimaryText}`
- l.128 — `{ctaSecondaryText}`
- l.189 — `{chrome('eventsAnimationsBadge')}`

### `src\app\(site)\[locale]\contact-cuc\page.tsx`

- l.59 — `{t('sectionTitleAccent')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx`

- l.139 — `{tt('filmographyHeading', { name: member.name })}`
- l.213 — `{tt('filmographyEmptyFilter')}`
- l.262 — `{tt('showAllFilms', { count: remainingCount })}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.31 — `{chrome('otherCoordinatorsTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.66 — `{chrome('trainingPathTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`

- l.52 — `{t('breadcrumbCurrent')}`
- l.85 — `{heroSubtitle}`

### `src\app\(site)\[locale]\error.tsx`

- l.43 — `{chrome('campusNameTitle')}`

### `src\app\(site)\[locale]\not-found.tsx`

- l.71 — `{t('notFoundBadge')}`
- l.85 — `{t('notFoundTitle')}`
- l.92 — `{t('notFoundSubtitle')}`
- l.99 — `{t('notFoundDescription')}`
- l.126 — `{t('suggestedPages')}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.76 — `{t('breadcrumbCurrent')}`
- l.83 — `{heroBadge}`
- l.91 — `{content.hero?.meta || t('heroMeta')}`
- l.115 — `{heroSubtitle}`
- l.122 — `{ctaPrimaryText}`
- l.130 — `{ctaSecondaryText}`
- l.147 — `{t('catalogBadge')}`
- l.153 — `{t('catalogTitle')}`
- l.159 — `{t('catalogSubtitle')}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopApplyBox.tsx`

- l.29 — `{cta.title}`
- l.35 — `{cta.body}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHero.tsx`

- l.36 — `{breadcrumbs.home}`
- l.43 — `{breadcrumbs.current}`
- l.50 — `{hero.badge}`
- l.58 — `{hero.meta}`
- l.84 — `{hero.subtitle}`
- l.95 — `{hero.ctaPrimaryText}`
- l.101 — `{hero.ctaSecondaryText}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopHighlights.tsx`

- l.19 — `{highlight.value}`
- l.25 — `{highlight.label}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopInfoCards.tsx`

- l.24 — `{location.title}`
- l.31 — `{location.body}`
- l.37 — `{location.note}`
- l.48 — `{housing.title}`
- l.55 — `{housing.body}`
- l.61 — `{housing.note}`
- l.72 — `{certificate.title}`
- l.79 — `{certificate.body}`
- l.85 — `{certificate.note}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopProgram.tsx`

- l.27 — `{program.tag}`
- l.35 — `{program.title}`
- l.42 — `{program.intro}`
- l.57 — `{item.title}`
- l.60 — `{item.desc}`
- l.85 — `{program.posterBadge}`
- l.93 — `{program.posterTitle}`
- l.99 — `{program.posterSubtitle}`
- l.119 — `{program.towerCaption}`
- l.136 — `{program.tacticalCaption}`
- l.155 — `{program.crowdCaption}`

### `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingCustomCta.tsx`

- l.26 — `{t('customDescription')}`

### `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingHero.tsx`

- l.43 — `{chrome('breadcrumbHome')}`
- l.52 — `{t('breadcrumbCurrent')}`
- l.59 — `{copy.badge}`
- l.67 — `{meta}`
- l.91 — `{copy.subtitle}`
- l.102 — `{copy.ctaPrimaryText}`
- l.110 — `{copy.ctaSecondaryText}`

### `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingOverview.tsx`

- l.28 — `{overview.badge}`
- l.35 — `{overview.title}`
- l.41 — `{overview.description}`

### `src\app\(site)\[locale]\team-building-cascades\sections\TeamBuildingWorkshops.tsx`

- l.68 — `{t('workshopFallbackLabel')}`
- l.77 — `{workshop.category}`
- l.86 — `{workshop.title}`
- l.92 — `{workshop.desc}`
- l.99 — `{t('workshopModular')}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx`

- l.39 — `{hero.badge}`
- l.47 — `{hero.meta}`
- l.71 — `{hero.subtitle}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSection.tsx`

- l.60 — `{labels.title}`
- l.66 — `{labels.intro}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSortBar.tsx`

- l.71 — `{t('catalogLabel')}`

### `src\app\(site)\[locale]\visite-guidee\page.tsx`

- l.66 — `{t('tour360TitleAccent')}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.50 — `{t('breadcrumb360')}`
- l.62 — `{content.hero?.badge || t('pageTag')}`
- l.69 — `{content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}`
- l.87 — `{content.hero?.subtitle || t('pageSubtitle')}`

### `src\components\layout\MobileStickyCTA.tsx`

- l.92 — `{callLabel}`
- l.105 — `{ctaLabel}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.122 — `{t('region')}`
- l.154 — `{t('idfAddress')}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.71 — `{t('qualiopiBadge')}`

### `src\components\layout\footer-sections\FooterDirectContacts.tsx`

- l.62 — `{t('directLines')}`
- l.73 — `{phone}`
- l.84 — `{email}`
- l.107 — `{t('networksTitle')}`

### `src\components\layout\navbar\NavActionsBar.tsx`

- l.57 — `{phone}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.171 — `{chrome('brandName')}`
- l.177 — `{chrome('brandTagline')}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.82 — `{accessInfo?.phone || '01 30 32 38 03'}`
- l.99 — `{accessInfo?.email || 'contact@campus-universcascades.com'}`
- l.129 — `{accessInfo?.train_info || accessInfo?.train || 'Gare du Cateau (TER Hauts-de-France) à 5 min en taxi / navette.'}`
- l.135 — `{accessInfo?.car_info || accessInfo?.car || 'Autoroute A2 / A26 sortie Cambrai puis D643 direction Le Cateau.'}`
- l.142 — `{accessInfo?.parking_info || 'Parking intérieur sécurisé réservé aux stagiaires et productions.'}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.42 — `{t('breadcrumbCurrent')}`
- l.65 — `{t('titleAccent')}`
- l.75 — `{heroData?.subtitle || t('subtitle')}`

### `src\components\sections\contact\ContactProgramChips.tsx`

- l.57 — `{t('multipleChoiceHint')}`

### `src\components\sections\events\EventsGuaranteesSection.tsx`

- l.44 — `{guarantees[0].title}`
- l.50 — `{guarantees[0].description}`
- l.72 — `{guarantees[1].title}`
- l.78 — `{guarantees[1].description}`
- l.88 — `{guarantees[2].title}`
- l.94 — `{guarantees[2].description}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.61 — `{t('breadcrumbCurrent')}`
- l.70 — `{hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}`
- l.92 — `{subtitle}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.95 — `{chrome('campusNameTitle')}`

### `src\components\sections\events\pillars\StaticPillarCard.tsx`

- l.35 — `{item.tag}`
- l.41 — `{item.title}`
- l.49 — `{item.paragraph1}`
- l.55 — `{item.paragraph2}`
- l.62 — `{item.cta}`

### `src\components\sections\events\spectacles\SpectacleTypeCard.tsx`

- l.53 — `{t('specsLogisticsTitle')}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.65 — `{chrome?.badge || t('disciplines.badge')}`
- l.72 — `{chrome?.title || t('disciplines.title')}`
- l.152 — `{t('disciplines.cinemaContextLabel')}`
- l.161 — `{t('disciplines.equipmentLabel')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.71 — `{title}`
- l.77 — `{subtitle}`
- l.93 — `{decouverte?.step_badge || tf('step1Badge')}`
- l.99 — `{decouverte?.duration_badge || tf('step1Hours')}`
- l.107 — `{decouverte?.title || tf('step1Title')}`
- l.113 — `{decouverte?.description || tf('step1Desc')}`
- l.122 — `{decouverte?.duration_text || tf('step1Duration')}`
- l.137 — `{decouverte?.boarding_text || tf('step1Boarding')}`
- l.145 — `{tf('step1ProgramTitle')}`
- l.166 — `{decouverte?.cta_text || tf('step1Cta')}`
- l.184 — `{pro?.step_badge || tf('step2Badge')}`
- l.190 — `{pro?.duration_badge || tf('step2Hours')}`
- l.198 — `{pro?.title || tf('step2Title')}`
- l.204 — `{pro?.description || tf('step2Desc')}`
- l.213 — `{pro?.schedule_text || tf('step2Rhythm')}`
- l.222 — `{pro?.boarding_text || tf('step2Accreditation')}`
- l.231 — `{pro?.certification_text || tf('step2Certification')}`
- l.239 — `{tf('step2ProgramTitle')}`
- l.260 — `{pro?.cta_text || t('ctaApplyPro')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.50 — `{t('hero.breadcrumbCurrent')}`
- l.66 — `{heroData?.badge || t('hero.badge')}`
- l.74 — `{heroData?.meta || 'AFDAS 100% • FRANCE TRAVAIL'}`
- l.95 — `{heroData?.subtitle || t('hero.subtitle')}`
- l.106 — `{heroData?.cta_primary_text || t('ctaApplyPro')}`
- l.115 — `{heroData?.cta_secondary_text || t('hero.ctaDiscovery')}`
- l.150 — `{t('stats.satisfactionLabel')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.88 — `{chrome?.sessions_title || tp('sessionsTitle')}`
- l.106 — `{tp('registrationNote')}`
- l.119 — `{chrome?.admission_title || tp('admissionTitle')}`
- l.154 — `{chrome?.funding_title || tp('fundingTitle')}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.119 — `{t('celebrityModal.title')}`
- l.197 — `{t('celebrityModal.close')}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.89 — `{t('hallOfFame.actorsBadge')}`
- l.94 — `{t('hallOfFame.actorsTitle')}`
- l.99 — `{t('hallOfFame.actorsIntro')}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.56 — `{t('filmModal.title')}`
- l.97 — `{t('filmModal.close')}`

### `src\components\sections\hall-of-fame\celebrity-details\CelebrityStuntDoubles.tsx`

- l.47 — `{t('celebrityModal.doublesLabel')}`
- l.103 — `{t('celebrityModal.filmsLabel')}`

### `src\components\sections\hall-of-fame\film-details\FilmDoublesList.tsx`

- l.22 — `{t('filmModal.doublesLabel')}`

### `src\components\sections\hall-of-fame\film-details\FilmTeamList.tsx`

- l.32 — `{t('filmModal.teamLabel')}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.111 — `{tag}`
- l.117 — `{subtag}`
- l.125 — `{title}`
- l.132 — `{description}`
- l.148 — `{pillar.title}`
- l.154 — `{pillar.tag}`
- l.161 — `{pillar.desc}`

### `src\components\sections\home\HomePartnersSection.tsx`

- l.125 — `{badge}`
- l.131 — `{title}`
- l.138 — `{subtitle}`
- l.184 — `{partner.name}`
- l.190 — `{partner.role || roles[partner.roleKey] || ''}`

### `src\components\sections\home\HomeQualiopiFunding.tsx`

- l.59 — `{data.afdas_badge}`
- l.64 — `{data.afdas_text}`
- l.77 — `{data.france_travail_badge}`
- l.85 — `{data.france_travail_text}`
- l.95 — `{data.opco_badge}`
- l.100 — `{data.opco_text}`

### `src\components\sections\home\HomeQualiopiSection.tsx`

- l.85 — `{badge}`
- l.92 — `{title}`
- l.98 — `{subtitle}`

### `src\components\sections\home\HomeSocialCards.tsx`

- l.93 — `{post.tag}`
- l.101 — `{post.title}`
- l.107 — `{post.desc}`

### `src\components\sections\home\HomeSocialSection.tsx`

- l.141 — `{badge}`
- l.147 — `{handle}`
- l.154 — `{title}`
- l.160 — `{subtitle}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.59 — `{badge}`
- l.65 — `{tag}`
- l.73 — `{title}`
- l.80 — `{subtitle}`
- l.96 — `{installationsCta}`
- l.141 — `{hudTitle}`
- l.147 — `{hudHint}`

### `src\components\sections\home\tournages\TournagesHeader.tsx`

- l.40 — `{teamTag}`
- l.48 — `{title}`
- l.55 — `{subtitle}`

### `src\components\sections\home\tournages\TournagesPillarsCard.tsx`

- l.67 — `{pillar1Title}`
- l.74 — `{pillar1Desc}`
- l.87 — `{pillar2Title}`
- l.94 — `{pillar2Desc}`
- l.107 — `{pillar3Title}`
- l.114 — `{pillar3Desc}`
- l.149 — `{ctaCatalog}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.55 — `{cinemaHeading}`
- l.73 — `{productionBadge}`
- l.91 — `{specializedHeading}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.48 — `{t('breadcrumbCurrent')}`
- l.57 — `{hero?.meta || t('heroMeta')}`
- l.81 — `{subtitle}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.62 — `{officialSite}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.70 — `{websiteLabel}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.45 — `{t('hero.breadcrumbCurrent')}`
- l.54 — `{heroData?.meta || t('hero.meta')}`
- l.73 — `{heroData?.subtitle || t('hero.subtitle')}`

### `src\components\sections\stages\grid\StageGridCard.tsx`

- l.49 — `{stage.subBadge}`
- l.57 — `{stage.highlightText}`
- l.66 — `{stage.title}`
- l.72 — `{stage.description}`
- l.89 — `{detail.text}`
- l.95 — `{detail.text}`
- l.151 — `{stage.buttonLabel}`
- l.165 — `{stage.pdfLink.label}`

### `src\components\sections\stages\grid\stage-render.tsx`

- l.85 — `{badge.text}`
- l.94 — `{badge.text}`
- l.103 — `{badge.text}`

### `src\components\sections\team\TeamBannersSection.tsx`

- l.57 — `{title}`
- l.63 — `{intro}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.57 — `{t('hero.breadcrumbHome')}`
- l.62 — `{t('hero.breadcrumbCurrent')}`
- l.89 — `{subtitle}`

### `src\components\sections\team\TeamProductionGalleries.tsx`

- l.82 — `{doublesBadge}`
- l.88 — `{doublesTitle}`
- l.116 — `{expandLabel}`
- l.157 — `{equipmentBadge}`
- l.163 — `{equipmentTitle}`
- l.203 — `{studioBadge}`
- l.209 — `{studioTitle}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.45 — `{block?.badge || t('services.badge')}`
- l.51 — `{block?.title || t('services.title')}`
- l.57 — `{block?.intro || t('services.intro')}`
- l.67 — `{item.label}`
- l.70 — `{item.body}`
- l.84 — `{block?.contact_title || t('services.contactTitle')}`
- l.90 — `{block?.contact_intro || t('services.contactIntro')}`
- l.99 — `{t('services.coordinatorLabel')}`
- l.102 — `{t('services.coordinatorValue')}`
- l.110 — `{t('services.phoneLabel')}`
- l.119 — `{t('services.emailLabel')}`
- l.130 — `{block?.cta || t('services.cta')}`

### `src\components\sections\visite\VisiteAccessTransport.tsx`

- l.85 — `{accessBadge}`
- l.92 — `{accessTitle}`
- l.98 — `{accessIntro}`
- l.109 — `{accessCarLabel}`
- l.112 — `{accessCarBody}`
- l.124 — `{accessTrainLabel}`
- l.127 — `{accessTrainBody}`
- l.139 — `{accessPlaneLabel}`
- l.142 — `{accessPlaneBody}`
- l.156 — `{coordinatesTitle}`
- l.165 — `{addressLabel}`
- l.168 — `{campusName}`
- l.172 — `{campusAddress}`
- l.181 — `{mapRadarLabel}`
- l.192 — `{mapExternalLabel}`
- l.203 — `{standardLabel}`
- l.206 — `{phoneLabel}`
- l.213 — `{phoneDisplay}`
- l.218 — `{emailLabel}`
- l.225 — `{emailAddress}`
- l.235 — `{idfLabel}`
- l.238 — `{idfValue}`
- l.242 — `{idfZip}`
- l.250 — `{accessCta}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.54 — `{t('hero.breadcrumbCurrent')}`
- l.74 — `{t('hero.titleAccent')}`
- l.84 — `{hero?.subtitle || t('hero.subtitle')}`
- l.95 — `{hero?.cta_primary_text || t('hero.ctaFacilities')}`
- l.106 — `{hero?.cta_secondary_text || t('hero.ctaTour360')}`

### `src\components\sections\visite\facilities\FacilitiesHeader.tsx`

- l.18 — `{tag}`
- l.24 — `{title}`
- l.30 — `{subtitle}`

### `src\components\sections\visite\facilities\FacilitiesSelector.tsx`

- l.48 — `{facility.name}`
- l.54 — `{facility.size}`

### `src\components\sections\visite\facilities\FacilityDetailPanel.tsx`

- l.56 — `{facility.name}`
- l.62 — `{facility.description}`
- l.71 — `{specsLabel}`
- l.80 — `{feature}`
- l.92 — `{complianceLabel}`
- l.97 — `{facility.specifications}`

### `src\components\ui\InstagramFollowerBadge.tsx`

- l.61 — `{t('instaFollowersUnit')}`
- l.86 — `{t('instaOfficialTitle')}`
- l.107 — `{t('instaFollowersUnit')}`
- l.116 — `{t('instaCertifiedCommunity')}`
- l.152 — `{t('instaFollowersUnit')}`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.67 — `{chrome('brandName')}`
- l.104 — `{t('copied')}`

### `src\components\ui\VirtualTourViewer.tsx`

- l.76 — `{chrome('locationLabel')}`

### `src\components\ui\parallax-hero\HeroFocalContent.tsx`

- l.47 — `{heroData?.since || tHero('since')}`
- l.65 — `{chrome('heroTitleTail')}`
- l.78 — `{heroData?.subtitle || activeCopy?.sub || ''}`
- l.94 — `{stat.val}`
- l.100 — `{stat.label}`
- l.116 — `{heroData?.cta_primary_text || tHero('ctaFormation')}`
- l.132 — `{heroData?.cta_secondary_text || tHero('ctaVisit')}`
- l.148 — `{heroData?.cta_tertiary_text || tHero('ctaStuntTeam')}`

## 2. DONNÉES — éditable par un écran existant

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx`

- l.200 — `{opt.count}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.68 — `{other.role}`
- l.71 — `{other.name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachPortrait.tsx`

- l.30 — `{member.role}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.53 — `{member.name}`
- l.87 — `{spec}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachCard.tsx`

- l.51 — `{member.role}`
- l.83 — `{member.name}`
- l.87 — `{member.title}`
- l.93 — `{member.bio}`
- l.108 — `{spec}`
- l.144 — `{film.title}`
- l.150 — `{film.title}`
- l.155 — `{film.year}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachDoubledActors.tsx`

- l.48 — `{name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachFilmThumbs.tsx`

- l.51 — `{f.title}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\celebrity-sheet\CelebritySheetProvider.tsx`

- l.75 — `{children}`

### `src\app\(site)\[locale]\layout.tsx`

- l.141 — `{children}`

### `src\app\(site)\[locale]\not-found.tsx`

- l.142 — `{t(item.labelKey)}`

### `src\app\(site)\[locale]\preview\layout.tsx`

- l.53 — `{children}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\DmVideoModal.tsx`

- l.46 — `{video.title}`
- l.104 — `{externalLabel}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosDocusGrid.tsx`

- l.23 — `{labels.docusBadge}`
- l.26 — `{labels.docusTitle}`
- l.29 — `{labels.docusHint}`
- l.56 — `{v.title}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx`

- l.30 — `{labels.breadcrumbHome}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosMediaSection.tsx`

- l.19 — `{labels.mediaTag}`
- l.22 — `{labels.mediaTitle}`
- l.25 — `{labels.mediaIntro}`
- l.38 — `{item.channel}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsModal.tsx`

- l.63 — `{reel.title}`
- l.93 — `{reel.description}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosReelsSection.tsx`

- l.102 — `{reel.date}`
- l.116 — `{reel.title}`
- l.120 — `{reel.description}`

### `src\components\layout\AnnouncementBanner.tsx`

- l.110 — `{badgeText}`
- l.115 — `{titleText}`

### `src\components\layout\Navbar.tsx`

- l.151 — `{item.label}`
- l.173 — `{cta.label}`

### `src\components\layout\RootShell.tsx`

- l.111 — `{children}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.46 — `{brand.name}`
- l.49 — `{brand.tagline}`
- l.55 — `{brand.description}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.60 — `{link.label}`
- l.64 — `{link.label}`

### `src\components\layout\footer-sections\FooterNavMatrix.tsx`

- l.31 — `{column.title}`
- l.52 — `{link.label}`

### `src\components\layout\navbar\NavDropdowns.tsx`

- l.94 — `{item.label}`
- l.162 — `{child.label}`
- l.166 — `{child.description}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.74 — `{item.label}`
- l.127 — `{item.label}`
- l.192 — `{cta.label}`

### `src\components\sections\contact\ContactForm.tsx`

- l.219 — `{errorMessage}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.34 — `{evt.badge}`
- l.38 — `{evt.title}`
- l.42 — `{evt.subtitle}`
- l.49 — `{evt.description}`

### `src\components\sections\events\spectacles\SpectacleTypeCard.tsx`

- l.36 — `{item.subtitle}`
- l.41 — `{item.title}`
- l.45 — `{item.description}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.131 — `{resolvedBadge}`
- l.134 — `{resolvedTitle}`

### `src\components\sections\films\FilmCard.tsx`

- l.113 — `{film.title}`
- l.121 — `{film.year}`
- l.140 — `{roleIcon}`
- l.147 — `{film.title}`
- l.170 — `{inner}`
- l.178 — `{inner}`
- l.185 — `{inner}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.97 — `{d.number}`
- l.100 — `{d.name}`
- l.140 — `{activeDiscipline.name}`
- l.145 — `{activeDiscipline.fullDesc}`
- l.170 — `{item}`

### `src\components\sections\hall-of-fame\CelebrityCard.tsx`

- l.76 — `{actor.name}`
- l.103 — `{member.name}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.152 — `{celebrity.name}`
- l.159 — `{celebrity.bio}`

### `src\components\sections\hall-of-fame\celebrity-details\CelebrityStuntDoubles.tsx`

- l.78 — `{member.name}`

### `src\components\sections\hall-of-fame\film-details\FilmDoublesList.tsx`

- l.31 — `{actor}`

### `src\components\sections\hall-of-fame\film-details\FilmPoster.tsx`

- l.23 — `{movie.title}`

### `src\components\sections\hall-of-fame\film-details\FilmTeamList.tsx`

- l.60 — `{member.name}`
- l.97 — `{roleLabelText}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.174 — `{ctaPrimaryText}`
- l.179 — `{ctaSecondaryText}`

### `src\components\sections\home\HomeSocialCards.tsx`

- l.42 — `{reel.title}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.90 — `{ctaText}`

### `src\components\sections\home\tournages\TournagesHeader.tsx`

- l.34 — `{badge}`
- l.62 — `{ctaText}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.123 — `{catGroup.icon}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.39 — `{badge}`
- l.43 — `{partner.name}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.52 — `{partner.name}`

### `src\components\sections\stages\grid\StageGridCard.tsx`

- l.133 — `{statusText}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.124 — `{stat.value}`

### `src\components\ui\InstagramFollowerBadge.tsx`

- l.38 — `{followersFormatted}`
- l.55 — `{followersFormatted}`
- l.101 — `{exactFollowersFormatted}`
- l.146 — `{exactFollowersFormatted}`

### `src\components\ui\LightboxModal.tsx`

- l.84 — `{currentImage.title}`
- l.150 — `{currentImage.title}`

### `src\components\ui\campus-map\CampusAppLaunchers.tsx`

- l.126 — `{app.desc}`

### `src\components\ui\campus-map\CampusTravelPlanner.tsx`

- l.105 — `{selectedRouteData.train.time}`
- l.109 — `{selectedRouteData.train.details}`
- l.126 — `{selectedRouteData.car.distance}`
- l.129 — `{selectedRouteData.car.time}`
- l.134 — `{selectedRouteData.car.details}`

### `src\components\ui\logos\LogoLink.tsx`

- l.62 — `{children}`

### `src\components\ui\parallax\StudioParallaxCard.tsx`

- l.58 — `{children}`

### `src\components\ui\parallax\StudioParallaxLayer.tsx`

- l.50 — `{children}`

### `src\components\ui\parallax\StudioParallaxScene.tsx`

- l.76 — `{children}`

## 3. TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n)

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachFilmThumbs.tsx`

- l.56 — `{t('directorShort', { name: f.director })}`

### `src\app\(site)\[locale]\error.tsx`

- l.71 — `{t('errorReference', { digest: error.digest })}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.79 — `{t('suffix360')}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.74 — `{evt.cta_text || t('learnMore')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.99 — `{statuses[session.status] ?? ''}`

### `src\components\sections\hall-of-fame\celebrity-details\CelebrityStuntDoubles.tsx`

- l.91 — `{stuntDoublesRaw || doubledBy.name}`

### `src\components\sections\hall-of-fame\film-details\FilmIdentityBlock.tsx`

- l.17 — `{t('filmModal.directedBy', { name: movie.director })}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.48 — `{localizer(partner).description}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.44 — `{localizer(partner).role}`
- l.47 — `{localizer(partner).category}`
- l.56 — `{localizer(partner).description}`

### `src\components\sections\stages\grid\StageGridCard.tsx`

- l.78 — `{renderIcon(detail.icon)}`

### `src\components\sections\team\teamGalleries.data.ts`

- l.14 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/studio-cuc-prod-salle-cascades-idf.webp', title: 'Studio CUC', category: 'Le Studio et la Salle' }`
- l.40 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/cascadeur-torche-1.webp', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }`
- l.51 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/equipement-cuc-5-0-462.webp', title: 'Équipements CUC', category: 'Les Équipements' }`

## 4. CODÉ EN DUR — dette (aucune prise en charge par le Cockpit)

Aucune occurrence.

## 5. HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées)

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.192 — `Google Maps`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.128 — `720H`

### `src\components\sections\hall-of-fame\celebrity-details\CelebrityStuntDoubles.tsx`

- l.125 — `CUC`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.122 — `contact@campus-universcascades.com`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.72 — `LAT 50.0909° N • LON 3.5374° E`

