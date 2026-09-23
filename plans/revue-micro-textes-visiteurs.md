# Revue — Micro-textes visibles par les visiteurs

Généré le 2026-09-23T05:56:50.109Z par `scripts/audit_visible_microcopy.mjs`.

Analyse statique des composants de vitrine : chaque texte visible est classé.
Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.

| Catégorie | Occurrences |
| --- | ---: |
| ANNOTÉ — éditable en place | 306 |
| DONNÉES — éditable par un écran existant | 102 |
| TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n) | 15 |
| CODÉ EN DUR — dette (aucune prise en charge par le Cockpit) | 0 |
| HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées) | 16 |
| **Total** | **439** |

## 1. ANNOTÉ — éditable en place

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.69 — `{t('breadcrumbCurrent')}`
- l.76 — `{heroBadge}`
- l.84 — `{content.hero?.meta || t('heroMeta')}`
- l.108 — `{heroSubtitle}`
- l.115 — `{ctaPrimaryText}`
- l.123 — `{ctaSecondaryText}`
- l.184 — `{chrome('eventsAnimationsBadge')}`

### `src\app\(site)\[locale]\contact-cuc\page.tsx`

- l.59 — `{t('sectionTitleAccent')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.31 — `{chrome('otherCoordinatorsTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.62 — `{chrome('trainingPathTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`

- l.52 — `{t('breadcrumbCurrent')}`
- l.85 — `{heroSubtitle}`

### `src\app\(site)\[locale]\error.tsx`

- l.43 — `{chrome('campusNameTitle')}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.67 — `{t('breadcrumbCurrent')}`
- l.74 — `{heroBadge}`
- l.82 — `{content.hero?.meta || t('heroMeta')}`
- l.106 — `{heroSubtitle}`
- l.113 — `{ctaPrimaryText}`
- l.121 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\sections\WorkshopApplyBox.tsx`

- l.28 — `{cta.title}`
- l.34 — `{cta.body}`

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

- l.26 — `{program.tag}`
- l.34 — `{program.title}`
- l.41 — `{program.intro}`
- l.56 — `{item.title}`
- l.59 — `{item.desc}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.84 — `{t('breadcrumbCurrent')}`
- l.91 — `{heroBadge}`
- l.99 — `{content.hero?.meta || t('heroMeta')}`
- l.125 — `{heroSubtitle}`
- l.132 — `{ctaPrimaryText}`
- l.140 — `{ctaSecondaryText}`
- l.164 — `{content.sections_data?.overview?.badge || t('overviewBadge')}`
- l.171 — `{content.sections_data?.overview?.title || t('overviewTitle')}`
- l.177 — `{content.sections_data?.overview?.description || t('overviewDescription')}`
- l.212 — `{t('workshopFallbackLabel')}`
- l.223 — `{workshop.category}`
- l.234 — `{workshop.title}`
- l.242 — `{workshop.desc}`
- l.249 — `{t('workshopModular')}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx`

- l.39 — `{hero.badge}`
- l.47 — `{hero.meta}`
- l.71 — `{hero.subtitle}`

### `src\app\(site)\[locale]\visite-guidee\page.tsx`

- l.98 — `{t('tour3dTitleAccent')}`
- l.128 — `{t('tour360TitleAccent')}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.115 — `{content.hero?.badge || t('pageTag')}`
- l.122 — `{content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}`
- l.130 — `{content.hero?.title || t('pageTitle')}{' '}`
- l.140 — `{content.hero?.subtitle || t('pageSubtitle')}`

### `src\components\layout\MobileStickyCTA.tsx`

- l.93 — `{callLabel}`
- l.106 — `{ctaLabel}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.112 — `{t('region')}`
- l.144 — `{t('idfAddress')}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.72 — `{t('qualiopiBadge')}`

### `src\components\layout\footer-sections\FooterDirectContacts.tsx`

- l.59 — `{t('directLines')}`
- l.70 — `{phone}`
- l.81 — `{email}`
- l.103 — `{t('networksTitle')}`

### `src\components\layout\navbar\NavActionsBar.tsx`

- l.87 — `{phone}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.147 — `{chrome('brandName')}`
- l.153 — `{chrome('brandTagline')}`

### `src\components\sections\HallOfFame.tsx`

- l.61 — `{t('hallOfFame.tag')}`
- l.70 — `{t('hallOfFame.subtitle')}`

### `src\components\sections\application-modal\ApplicationFields.tsx`

- l.26 — `{t('labels.fullName')}`
- l.41 — `{t('labels.age')}`
- l.61 — `{t('labels.email')}`
- l.76 — `{t('labels.phone')}`

### `src\components\sections\application-modal\ApplicationFormBody.tsx`

- l.67 — `{t('titleAccent')}`
- l.100 — `{t('labels.afdasStatus')}`
- l.120 — `{t('labels.sport')}`
- l.135 — `{t('labels.session')}`
- l.152 — `{t('safetyTitle')}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.121 — `{accessInfo?.train_info || accessInfo?.train}`
- l.129 — `{accessInfo?.car_info || accessInfo?.car}`
- l.137 — `{accessInfo.parking_info}`
- l.160 — `{t('mainCampusRegion')}`
- l.191 — `{t('idfAddress')}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.42 — `{t('breadcrumbCurrent')}`
- l.65 — `{t('titleAccent')}`
- l.75 — `{heroData?.subtitle || t('subtitle')}`

### `src\components\sections\events\EventsGuaranteesSection.tsx`

- l.44 — `{guarantees[0].title}`
- l.50 — `{guarantees[0].description}`
- l.72 — `{guarantees[1].title}`
- l.78 — `{guarantees[1].description}`
- l.88 — `{guarantees[2].title}`
- l.94 — `{guarantees[2].description}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.56 — `{t('breadcrumbCurrent')}`
- l.65 — `{hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}`
- l.87 — `{subtitle}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.95 — `{chrome('campusNameTitle')}`

### `src\components\sections\events\pillars\StaticPillarCard.tsx`

- l.35 — `{item.tag}`
- l.41 — `{item.title}`
- l.49 — `{item.paragraph1}`
- l.55 — `{item.paragraph2}`
- l.62 — `{item.cta}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.65 — `{chrome?.badge || t('disciplines.badge')}`
- l.72 — `{chrome?.title || t('disciplines.title')}`
- l.142 — `{t('disciplines.cinemaContextLabel')}`
- l.151 — `{t('disciplines.equipmentLabel')}`

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
- l.165 — `{t('stats.satisfactionLabel')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.56 — `{chrome?.sessions_title || tp('sessionsTitle')}`
- l.74 — `{tp('registrationNote')}`
- l.87 — `{chrome?.admission_title || tp('admissionTitle')}`
- l.123 — `{chrome?.funding_title || tp('fundingTitle')}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.39 — `{t('celebrityModal.title')}`
- l.79 — `{t('celebrityModal.doublesLabel')}`
- l.93 — `{t('celebrityModal.scenesLabel')}`
- l.106 — `{t('celebrityModal.filmsLabel')}`
- l.132 — `{t('celebrityModal.imdbCta')}`
- l.149 — `{t('celebrityModal.close')}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.82 — `{t('hallOfFame.actorsBadge')}`
- l.88 — `{t('hallOfFame.actorsTitle')}`
- l.93 — `{t('hallOfFame.actorsIntro')}`
- l.159 — `{t('hallOfFame.filmsLabel')}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.137 — `{t('filmModal.doublesLabel')}`
- l.158 — `{t('filmModal.teamLabel')}`
- l.268 — `{t('filmModal.trailer')}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.108 — `{founderLabel}`
- l.115 — `{founderQuote}`
- l.122 — `{founderName}`
- l.128 — `{founderRole}`
- l.141 — `{badgeYear}`
- l.159 — `{tag}`
- l.165 — `{subtag}`
- l.173 — `{title}`
- l.180 — `{description}`
- l.196 — `{pillar.title}`
- l.202 — `{pillar.tag}`
- l.209 — `{pillar.desc}`

### `src\components\sections\home\HomePartnersSection.tsx`

- l.125 — `{badge}`
- l.131 — `{title}`
- l.138 — `{subtitle}`
- l.184 — `{partner.name}`
- l.190 — `{partner.role || roles[partner.roleKey] || ''}`

### `src\components\sections\home\HomeQualiopiSection.tsx`

- l.83 — `{badge}`
- l.90 — `{title}`
- l.96 — `{subtitle}`

### `src\components\sections\home\HomeSocialSection.tsx`

- l.125 — `{badge}`
- l.131 — `{handle}`
- l.138 — `{title}`
- l.144 — `{subtitle}`
- l.215 — `{post.tag}`
- l.223 — `{post.title}`
- l.229 — `{post.desc}`
- l.235 — `{seeInstagram}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.58 — `{badge}`
- l.64 — `{tag}`
- l.72 — `{title}`
- l.79 — `{subtitle}`
- l.95 — `{installationsCta}`
- l.132 — `{hudTitle}`
- l.138 — `{hudHint}`

### `src\components\sections\home\tournages\TournagesHeader.tsx`

- l.40 — `{teamTag}`
- l.48 — `{title}`
- l.55 — `{subtitle}`

### `src\components\sections\home\tournages\TournagesPillarsCard.tsx`

- l.56 — `{pillar1Title}`
- l.63 — `{pillar1Desc}`
- l.71 — `{pillar2Title}`
- l.78 — `{pillar2Desc}`
- l.86 — `{pillar3Title}`
- l.93 — `{pillar3Desc}`
- l.101 — `{ctaProduction}`
- l.108 — `{ctaCatalog}`

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
- l.111 — `{stage.buttonLabel}`
- l.125 — `{stage.pdfLink.label}`

### `src\components\sections\stages\grid\stage-render.tsx`

- l.85 — `{badge.text}`
- l.94 — `{badge.text}`
- l.103 — `{badge.text}`

### `src\components\sections\team\TeamBannersSection.tsx`

- l.57 — `{title}`
- l.63 — `{intro}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.49 — `{t('hero.breadcrumbHome')}`
- l.54 — `{t('hero.breadcrumbCurrent')}`
- l.81 — `{subtitle}`

### `src\components\sections\team\TeamProductionGalleries.tsx`

- l.79 — `{studioBadge}`
- l.85 — `{studioTitle}`
- l.125 — `{doublesBadge}`
- l.131 — `{doublesTitle}`
- l.156 — `{expandLabel}`
- l.174 — `{equipmentBadge}`
- l.180 — `{equipmentTitle}`

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

### `src\components\sections\visite\VisiteFacilitiesDetail.tsx`

- l.150 — `{tag}`
- l.156 — `{title}`
- l.162 — `{subtitle}`
- l.196 — `{facility.name}`
- l.202 — `{facility.size}`
- l.241 — `{selectedFacility.name}`
- l.247 — `{selectedFacility.description}`
- l.256 — `{specsLabel}`
- l.268 — `{feature}`
- l.280 — `{complianceLabel}`
- l.285 — `{selectedFacility.specifications}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.51 — `{t('hero.breadcrumbCurrent')}`
- l.71 — `{t('hero.titleAccent')}`
- l.81 — `{hero?.subtitle || t('hero.subtitle')}`
- l.92 — `{hero?.cta_primary_text || t('hero.ctaFacilities')}`
- l.103 — `{hero?.cta_secondary_text || t('hero.ctaTour360')}`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.114 — `{chrome('brandName')}`
- l.177 — `{t('copied')}`
- l.210 — `{fullAddress}`

### `src\components\ui\VirtualTourViewer.tsx`

- l.76 — `{chrome('locationLabel')}`

### `src\components\ui\parallax-hero\HeroFocalContent.tsx`

- l.56 — `{heroData?.since || tHero('since')}`
- l.77 — `{chrome('heroTitleTail')}`
- l.95 — `{heroData?.subtitle || activeCopy?.sub || ''}`
- l.117 — `{stat.val}`
- l.123 — `{stat.label}`
- l.144 — `{heroData?.cta_primary_text || tHero('ctaFormation')}`
- l.160 — `{heroData?.cta_secondary_text || tHero('ctaVisit')}`
- l.176 — `{heroData?.cta_tertiary_text || tHero('ctaStuntTeam')}`

### `src\components\ui\parallax-hero\HeroHudOverlay.tsx`

- l.38 — `{location}`
- l.42 — `{privateDomain}`

## 2. DONNÉES — éditable par un écran existant

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx`

- l.123 — `{film.title}`
- l.135 — `{film.year}`
- l.180 — `{film.title}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.68 — `{other.role}`
- l.71 — `{other.name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachPortrait.tsx`

- l.30 — `{member.role}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.49 — `{member.name}`
- l.83 — `{spec}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachCard.tsx`

- l.52 — `{member.role}`
- l.84 — `{member.name}`
- l.88 — `{member.title}`
- l.94 — `{member.bio}`
- l.109 — `{spec}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachFilmThumbs.tsx`

- l.51 — `{f.title}`

### `src\app\(site)\[locale]\layout.tsx`

- l.143 — `{children}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\DmVideoModal.tsx`

- l.25 — `{video.title}`

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

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosPlayer.tsx`

- l.58 — `{labels.videoFallback}`
- l.71 — `{labels.videoFallback}`
- l.89 — `{labels.broadcastBadge}`

### `src\components\layout\AnnouncementBanner.tsx`

- l.93 — `{badgeText}`
- l.98 — `{titleText}`

### `src\components\layout\Navbar.tsx`

- l.143 — `{item.label}`
- l.165 — `{cta.label}`

### `src\components\layout\RootShell.tsx`

- l.111 — `{children}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.38 — `{brand.name}`
- l.41 — `{brand.tagline}`
- l.47 — `{brand.description}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.61 — `{link.label}`
- l.65 — `{link.label}`

### `src\components\layout\footer-sections\FooterNavMatrix.tsx`

- l.31 — `{column.title}`
- l.52 — `{link.label}`

### `src\components\layout\navbar\NavDropdowns.tsx`

- l.98 — `{child.label}`
- l.102 — `{child.description}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.97 — `{item.label}`
- l.168 — `{cta.label}`

### `src\components\sections\application-modal\ApplicationFormBody.tsx`

- l.87 — `{tab.label}`
- l.161 — `{submitError}`

### `src\components\sections\contact\ContactForm.tsx`

- l.241 — `{errorMessage}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.34 — `{evt.badge}`
- l.38 — `{evt.title}`
- l.42 — `{evt.subtitle}`
- l.49 — `{evt.description}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.112 — `{resolvedBadge}`
- l.119 — `{resolvedTitle}`

### `src\components\sections\films\FilmPosterCard.tsx`

- l.71 — `{film.title}`
- l.77 — `{film.year}`
- l.82 — `{film.title}`
- l.96 — `{inner}`
- l.104 — `{inner}`
- l.111 — `{inner}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.97 — `{d.number}`
- l.100 — `{d.name}`
- l.130 — `{activeDiscipline.name}`
- l.135 — `{activeDiscipline.fullDesc}`
- l.160 — `{item}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.70 — `{celebrity.name}`
- l.83 — `{celebrity.stuntDoubles}`
- l.97 — `{celebrity.stuntSpecialty}`
- l.115 — `{p}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.136 — `{actor.name}`
- l.150 — `{actor.stuntSpecialty}`
- l.169 — `{prod}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.100 — `{movie.title}`
- l.128 — `{movie.description}`
- l.146 — `{actor}`
- l.186 — `{member.name}`
- l.221 — `{roleLabelText}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.222 — `{ctaPrimaryText}`
- l.227 — `{ctaSecondaryText}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.89 — `{ctaText}`

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

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.126 — `{stat.value}`

### `src\components\ui\LightboxModal.tsx`

- l.84 — `{currentImage.title}`
- l.150 — `{currentImage.title}`

### `src\components\ui\campus-map\CampusRadarView.tsx`

- l.119 — `{poi.name}`
- l.131 — `{selectedPoi.badge}`
- l.134 — `{selectedPoi.category}`
- l.137 — `{selectedPoi.name}`
- l.141 — `{selectedPoi.coordinates}`
- l.146 — `{selectedPoi.description}`

### `src\components\ui\campus-map\CampusTravelPlanner.tsx`

- l.105 — `{selectedRouteData.train.time}`
- l.109 — `{selectedRouteData.train.details}`
- l.126 — `{selectedRouteData.car.distance}`
- l.129 — `{selectedRouteData.car.time}`
- l.134 — `{selectedRouteData.car.details}`

### `src\components\ui\parallax\StudioParallaxCard.tsx`

- l.57 — `{children}`

### `src\components\ui\parallax\StudioParallaxLayer.tsx`

- l.48 — `{children}`

### `src\components\ui\parallax\StudioParallaxScene.tsx`

- l.59 — `{children}`

## 3. TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n)

### `src\app\(site)\[locale]\error.tsx`

- l.71 — `{t('errorReference', { digest: error.digest })}`

### `src\components\sections\application-modal\ApplicationFormBody.tsx`

- l.110 — `{afdasLabels[index] ?? value}`

### `src\components\sections\contact\ContactForm.tsx`

- l.194 — `{t(’options.${programId}’)}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.74 — `{evt.cta_text || t('learnMore')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.67 — `{statuses[session.status] ?? ''}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.109 — `{filmValue('year', movie.year ?? '')}`
- l.118 — `{movie.year}{movie.director ? ’ • ${t('filmModal.directedBy', { name: movie.director })}’ : ''}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.48 — `{localizer(partner).description}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.44 — `{localizer(partner).role}`
- l.47 — `{localizer(partner).category}`
- l.56 — `{localizer(partner).description}`

### `src\components\sections\stages\grid\StageGridCard.tsx`

- l.78 — `{renderIcon(detail.icon)}`

### `src\components\sections\team\teamGalleries.data.ts`

- l.14 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }`
- l.25 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }`
- l.36 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }`

## 4. CODÉ EN DUR — dette (aucune prise en charge par le Cockpit)

Aucune occurrence.

## 5. HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées)

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachPortrait.tsx`

- l.79 — `Allociné`
- l.92 — `Instagram`
- l.104 — `Portfolio`

### `src\components\sections\application-modal\ApplicationSuccessView.tsx`

- l.44 — `contact@campus-universcascades.com`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.89 — `contact@campus-universcascades.com`
- l.178 — `Google Maps`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.143 — `720H`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.188 — `IMDb`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.243 — `IMDb`
- l.255 — `AlloCiné`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.122 — `contact@campus-universcascades.com`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.119 — `LAT 50.0909° N • LON 3.5374° E`

### `src\components\ui\campus-map\CampusAppLaunchers.tsx`

- l.30 — `Google Maps`
- l.44 — `Apple Maps`
- l.58 — `Waze`
- l.72 — `SNCF Connect`

