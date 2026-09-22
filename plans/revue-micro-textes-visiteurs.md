# Revue — Micro-textes visibles par les visiteurs

Généré le 2026-09-22T19:51:03.982Z par `scripts/audit_visible_microcopy.mjs`.

Analyse statique des composants de vitrine : chaque texte visible est classé.
Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.

| Catégorie | Occurrences |
| --- | ---: |
| ANNOTÉ — éditable en place | 229 |
| DONNÉES — éditable par un écran existant | 108 |
| TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n) | 211 |
| CODÉ EN DUR — dette (aucune prise en charge par le Cockpit) | 0 |
| HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées) | 18 |
| **Total** | **566** |

## 1. ANNOTÉ — éditable en place

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.73 — `{heroBadge}`
- l.81 — `{content.hero?.meta || t('heroMeta')}`
- l.105 — `{heroSubtitle}`
- l.112 — `{ctaPrimaryText}`
- l.120 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`

- l.82 — `{heroSubtitle}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.73 — `{heroBadge}`
- l.81 — `{content.hero?.meta || t('heroMeta')}`
- l.105 — `{heroSubtitle}`
- l.112 — `{ctaPrimaryText}`
- l.120 — `{ctaSecondaryText}`

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

- l.126 — `{heroBadge}`
- l.134 — `{content.hero?.meta || t('heroMeta')}`
- l.160 — `{heroSubtitle}`
- l.167 — `{ctaPrimaryText}`
- l.175 — `{ctaSecondaryText}`
- l.199 — `{content.sections_data?.overview?.badge || t('overviewBadge')}`
- l.206 — `{content.sections_data?.overview?.title || t('overviewTitle')}`
- l.212 — `{content.sections_data?.overview?.description || t('overviewDescription')}`
- l.256 — `{workshop.category}`
- l.267 — `{workshop.title}`
- l.275 — `{workshop.desc}`

### `src\app\(site)\[locale]\videos-cascadeur\sections\VideosHero.tsx`

- l.39 — `{hero.badge}`
- l.47 — `{hero.meta}`
- l.71 — `{hero.subtitle}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.109 — `{content.hero?.badge || t('pageTag')}`
- l.116 — `{content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}`
- l.124 — `{content.hero?.title || t('pageTitle')}{' '}`
- l.134 — `{content.hero?.subtitle || t('pageSubtitle')}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.120 — `{accessInfo?.train_info || accessInfo?.train}`
- l.128 — `{accessInfo?.car_info || accessInfo?.car}`
- l.136 — `{accessInfo.parking_info}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.70 — `{heroData?.subtitle || t('subtitle')}`

### `src\components\sections\events\EventsGuaranteesSection.tsx`

- l.44 — `{guarantees[0].title}`
- l.50 — `{guarantees[0].description}`
- l.72 — `{guarantees[1].title}`
- l.78 — `{guarantees[1].description}`
- l.88 — `{guarantees[2].title}`
- l.94 — `{guarantees[2].description}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.62 — `{hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}`
- l.84 — `{subtitle}`

### `src\components\sections\events\pillars\StaticPillarCard.tsx`

- l.35 — `{item.tag}`
- l.41 — `{item.title}`
- l.49 — `{item.paragraph1}`
- l.55 — `{item.paragraph2}`
- l.62 — `{item.cta}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.64 — `{chrome?.badge || t('disciplines.badge')}`
- l.71 — `{chrome?.title || t('disciplines.title')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.70 — `{title}`
- l.76 — `{subtitle}`
- l.92 — `{decouverte?.step_badge || tf('step1Badge')}`
- l.98 — `{decouverte?.duration_badge || tf('step1Hours')}`
- l.106 — `{decouverte?.title || tf('step1Title')}`
- l.112 — `{decouverte?.description || tf('step1Desc')}`
- l.121 — `{decouverte?.duration_text || tf('step1Duration')}`
- l.136 — `{decouverte?.boarding_text || tf('step1Boarding')}`
- l.163 — `{decouverte?.cta_text || tf('step1Cta')}`
- l.181 — `{pro?.step_badge || tf('step2Badge')}`
- l.187 — `{pro?.duration_badge || tf('step2Hours')}`
- l.195 — `{pro?.title || tf('step2Title')}`
- l.201 — `{pro?.description || tf('step2Desc')}`
- l.210 — `{pro?.schedule_text || tf('step2Rhythm')}`
- l.219 — `{pro?.boarding_text || tf('step2Accreditation')}`
- l.228 — `{pro?.certification_text || tf('step2Certification')}`
- l.255 — `{pro?.cta_text || t('ctaApplyPro')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.65 — `{heroData?.badge || t('hero.badge')}`
- l.73 — `{heroData?.meta || 'AFDAS 100% • FRANCE TRAVAIL'}`
- l.94 — `{heroData?.subtitle || t('hero.subtitle')}`
- l.105 — `{heroData?.cta_primary_text || t('ctaApplyPro')}`
- l.114 — `{heroData?.cta_secondary_text || t('hero.ctaDiscovery')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.55 — `{chrome?.sessions_title || tp('sessionsTitle')}`
- l.84 — `{chrome?.admission_title || tp('admissionTitle')}`
- l.120 — `{chrome?.funding_title || tp('fundingTitle')}`

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

- l.54 — `{hero?.meta || t('heroMeta')}`
- l.78 — `{subtitle}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.62 — `{officialSite}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.70 — `{websiteLabel}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.51 — `{heroData?.meta || t('hero.meta')}`
- l.70 — `{heroData?.subtitle || t('hero.subtitle')}`

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

- l.76 — `{subtitle}`

### `src\components\sections\team\TeamProductionGalleries.tsx`

- l.79 — `{studioBadge}`
- l.85 — `{studioTitle}`
- l.125 — `{doublesBadge}`
- l.131 — `{doublesTitle}`
- l.156 — `{expandLabel}`
- l.174 — `{equipmentBadge}`
- l.180 — `{equipmentTitle}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.44 — `{block?.badge || t('services.badge')}`
- l.50 — `{block?.title || t('services.title')}`
- l.56 — `{block?.intro || t('services.intro')}`
- l.66 — `{item.label}`
- l.69 — `{item.body}`
- l.83 — `{block?.contact_title || t('services.contactTitle')}`
- l.89 — `{block?.contact_intro || t('services.contactIntro')}`
- l.112 — `{block?.cta || t('services.cta')}`

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

- l.76 — `{hero?.subtitle || t('hero.subtitle')}`
- l.87 — `{hero?.cta_primary_text || t('hero.ctaFacilities')}`
- l.98 — `{hero?.cta_secondary_text || t('hero.ctaTour360')}`

### `src\components\ui\parallax-hero\HeroFocalContent.tsx`

- l.55 — `{heroData?.since || tHero('since')}`
- l.91 — `{heroData?.subtitle || activeCopy?.sub || ''}`
- l.113 — `{stat.val}`
- l.119 — `{stat.label}`
- l.140 — `{heroData?.cta_primary_text || tHero('ctaFormation')}`
- l.156 — `{heroData?.cta_secondary_text || tHero('ctaVisit')}`
- l.172 — `{heroData?.cta_tertiary_text || tHero('ctaStuntTeam')}`

### `src\components\ui\parallax-hero\HeroHudOverlay.tsx`

- l.38 — `{location}`
- l.42 — `{privateDomain}`

## 2. DONNÉES — éditable par un écran existant

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx`

- l.122 — `{film.title}`
- l.134 — `{film.year}`
- l.179 — `{film.title}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.65 — `{other.role}`
- l.68 — `{other.name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachPortrait.tsx`

- l.30 — `{member.role}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.26 — `{member.role}`
- l.34 — `{member.name}`
- l.38 — `{member.title}`
- l.50 — `{member.bio}`
- l.66 — `{spec}`

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

- l.67 — `{announcement.badge}`

### `src\components\layout\Navbar.tsx`

- l.143 — `{item.label}`
- l.165 — `{cta.label}`

### `src\components\layout\RootShell.tsx`

- l.104 — `{children}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.37 — `{brand.name}`
- l.40 — `{brand.tagline}`
- l.46 — `{brand.description}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.60 — `{link.label}`
- l.64 — `{link.label}`

### `src\components\layout\footer-sections\FooterDirectContacts.tsx`

- l.66 — `{settings.email_general || 'contact@campus-universcascades.com'}`

### `src\components\layout\footer-sections\FooterNavMatrix.tsx`

- l.31 — `{column.title}`
- l.52 — `{link.label}`

### `src\components\layout\navbar\NavActionsBar.tsx`

- l.85 — `{settings.hero_primary_cta_text || 'Contact & Projets'}`

### `src\components\layout\navbar\NavDropdowns.tsx`

- l.98 — `{child.label}`
- l.102 — `{child.description}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.96 — `{item.label}`
- l.161 — `{cta.label}`

### `src\components\sections\application-modal\ApplicationFormBody.tsx`

- l.84 — `{tab.label}`
- l.147 — `{submitError}`

### `src\components\sections\contact\ContactForm.tsx`

- l.240 — `{errorMessage}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.33 — `{evt.badge}`
- l.37 — `{evt.title}`
- l.41 — `{evt.subtitle}`
- l.48 — `{evt.description}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.111 — `{resolvedBadge}`
- l.118 — `{resolvedTitle}`

### `src\components\sections\films\FilmPosterCard.tsx`

- l.71 — `{film.title}`
- l.77 — `{film.year}`
- l.82 — `{film.title}`
- l.96 — `{inner}`
- l.104 — `{inner}`
- l.111 — `{inner}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.96 — `{d.number}`
- l.99 — `{d.name}`
- l.129 — `{activeDiscipline.name}`
- l.134 — `{activeDiscipline.fullDesc}`
- l.155 — `{item}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.67 — `{celebrity.name}`
- l.78 — `{celebrity.stuntDoubles}`
- l.90 — `{celebrity.stuntSpecialty}`
- l.106 — `{p}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.129 — `{actor.name}`
- l.143 — `{actor.stuntSpecialty}`
- l.160 — `{prod}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.90 — `{movie.title}`
- l.96 — `{movie.year}`
- l.108 — `{movie.title}`
- l.115 — `{movie.description}`
- l.131 — `{actor}`
- l.169 — `{member.name}`
- l.204 — `{roleLabelText}`

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

- l.121 — `{stat.value}`

### `src\components\ui\LightboxModal.tsx`

- l.83 — `{currentImage.title}`
- l.149 — `{currentImage.title}`

### `src\components\ui\campus-map\CampusRadarView.tsx`

- l.119 — `{poi.name}`
- l.131 — `{selectedPoi.badge}`
- l.134 — `{selectedPoi.category}`
- l.137 — `{selectedPoi.name}`
- l.141 — `{selectedPoi.coordinates}`
- l.146 — `{selectedPoi.description}`

### `src\components\ui\campus-map\CampusTravelPlanner.tsx`

- l.104 — `{selectedRouteData.train.time}`
- l.108 — `{selectedRouteData.train.details}`
- l.125 — `{selectedRouteData.car.distance}`
- l.128 — `{selectedRouteData.car.time}`
- l.133 — `{selectedRouteData.car.details}`

### `src\components\ui\parallax\StudioParallaxCard.tsx`

- l.57 — `{children}`

### `src\components\ui\parallax\StudioParallaxLayer.tsx`

- l.48 — `{children}`

### `src\components\ui\parallax\StudioParallaxScene.tsx`

- l.59 — `{children}`

## 3. TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n)

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.60 — `{t('breadcrumbHome')}`
- l.64 — `{t('breadcrumbEvents')}`
- l.170 — `{chrome('eventsAnimationsBadge')}`
- l.173 — `{t('panelSub')}`
- l.179 — `{t('panelTitle')}`
- l.183 — `{t('panelParagraph1')}`
- l.187 — `{t('panelParagraph2')}`
- l.192 — `{t('includedTitle')}`

### `src\app\(site)\[locale]\contact-cuc\page.tsx`

- l.53 — `{t('sectionBadge')}`
- l.56 — `{t('sectionTitle')}{' '}`
- l.60 — `{t('sectionIntro')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.69 — `{chrome('breadcrumbHome')}`
- l.73 — `{tt('breadcrumb')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachFilmography.tsx`

- l.69 — `{tt('filmographyHint')}`
- l.140 — `{tt('featuredBadge')}`
- l.158 — `{tt('roleOnProduction')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachNotFound.tsx`

- l.22 — `{tt('coachNotFound')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachOtherMembers.tsx`

- l.26 — `{tt('campusFacultyTag')}`
- l.29 — `{chrome('otherCoordinatorsTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachProfile.tsx`

- l.29 — `{tt('facultyTag')}`
- l.89 — `{tt('ctaContact')}`
- l.95 — `{tt('ctaTrain')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\CoachCreditsList.tsx`

- l.20 — `{t('creditsLabel')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeCallout.tsx`

- l.15 — `{t('ctaBlockTitle')}`
- l.18 — `{t('ctaBlockBody')}`
- l.22 — `{t('ctaBlockButton')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\sections\EquipeHeroSection.tsx`

- l.47 — `{t('breadcrumbHome')}`
- l.58 — `{t('performerTag')}`

### `src\app\(site)\[locale]\error.tsx`

- l.41 — `{chrome('campusNameTitle')}`
- l.44 — `{t('errorTitle')}`
- l.47 — `{t('errorText')}`
- l.56 — `{t('retry')}`
- l.62 — `{t('backHome')}`
- l.68 — `{t('errorReference', { digest: error.digest })}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.60 — `{t('breadcrumbHome')}`
- l.64 — `{t('breadcrumbEvents')}`
- l.147 — `{t('panelTag')}`
- l.150 — `{t('panelSub')}`
- l.156 — `{t('panelTitle')}`
- l.160 — `{t('panelParagraph')}`
- l.165 — `{t('specsTitle')}`
- l.210 — `{t('arenaBadge')}`
- l.216 — `{t('arenaTitle')}`
- l.222 — `{chrome('broadcastNote')}`
- l.228 — `{t('arenaCta')}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.113 — `{chrome('breadcrumbHome')}`
- l.117 — `{chrome('siteEvents')}`
- l.246 — `{t('workshopFallbackLabel')}`
- l.293 — `{t('customBadge')}`
- l.296 — `{t('customTitle')}`
- l.299 — `{t('customDescription')}`
- l.303 — `{t('customCta')}`

### `src\app\(site)\[locale]\visite-guidee\page.tsx`

- l.31 — `{t('loading3d')}`
- l.88 — `{t('tour3dBadge')}`
- l.91 — `{t('domainClosed')}`
- l.98 — `{t('tour3dParagraph')}`
- l.119 — `{t('tour360Badge')}`
- l.125 — `{t('tour360Paragraph')}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.35 — `{t('loading3d')}`
- l.89 — `{t('breadcrumbHome')}`
- l.93 — `{t('breadcrumbCampus')}`
- l.171 — `{t('ctaRendezVous')}`
- l.198 — `{t('factsTitle1')}`
- l.202 — `{t('factsBody1')}`
- l.210 — `{t('factsTitle2')}`
- l.214 — `{t('factsBody2')}`
- l.222 — `{t('factsTitle3')}`
- l.226 — `{t('factsBody3')}`

### `src\components\layout\SkipLink.tsx`

- l.20 — `{t('skipToContent')}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.69 — `{t('certified')}`
- l.72 — `{t('funding')}`
- l.97 — `{t('sitesTitle')}`
- l.104 — `{t('mainCampus')}`
- l.108 — `{t('mainCampusAddress')}`
- l.111 — `{t('region')}`
- l.137 — `{t('idfHub')}`
- l.140 — `{t('idfStudio')}`
- l.143 — `{t('idfAddress')}`
- l.161 — `{t('productionAgency')}`
- l.164 — `{t('productionDesc')}`

### `src\components\layout\footer-sections\FooterDirectContacts.tsx`

- l.46 — `{t('directLines')}`
- l.85 — `{t('networksTitle')}`
- l.89 — `{t('networksText')}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.143 — `{chrome('brandName')}`
- l.146 — `{chrome('brandTagline')}`

### `src\components\sections\HallOfFame.tsx`

- l.57 — `{t('hallOfFame.badge')}`
- l.62 — `{t('hallOfFame.title')}`
- l.66 — `{t('hallOfFame.subtitle')}`

### `src\components\sections\application-modal\ApplicationFields.tsx`

- l.24 — `{t('labels.fullName')}`
- l.37 — `{t('labels.age')}`
- l.55 — `{t('labels.email')}`
- l.68 — `{t('labels.phone')}`

### `src\components\sections\application-modal\ApplicationFormBody.tsx`

- l.64 — `{t('titleLead')}`
- l.68 — `{t('intro')}`
- l.96 — `{t('labels.afdasStatus')}`
- l.105 — `{afdasLabels[index] ?? value}`
- l.114 — `{t('labels.sport')}`
- l.127 — `{t('labels.session')}`
- l.157 — `{t('cancel')}`
- l.165 — `{isSubmitting ? t('submitting') : t('submit')}`

### `src\components\sections\application-modal\ApplicationSuccessView.tsx`

- l.23 — `{t('successTitle')}`
- l.48 — `{t('closeCase')}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.49 — `{t('standardTitle')}`
- l.67 — `{t('directPhone')}`
- l.82 — `{t('email')}`
- l.97 — `{t('hours')}`
- l.106 — `{t('hoursValue')}`
- l.108 — `{t('hoursSaturday')}`
- l.148 — `{t('sitesTitle')}`
- l.153 — `{t('mainCampus')}`
- l.156 — `{t('mainCampusAddress')}`
- l.159 — `{t('mainCampusRegion')}`
- l.184 — `{t('idfHub')}`
- l.187 — `{t('idfStudio')}`
- l.190 — `{t('idfAddress')}`
- l.197 — `{t('production')}`
- l.200 — `{t('productionDesc')}`
- l.214 — `{t('entitiesTitle')}`
- l.226 — `{chrome('siteCampus')}`
- l.239 — `{chrome('siteEvents')}`
- l.252 — `{chrome('siteStuntTeam')}`

### `src\components\sections\contact\ContactForm.tsx`

- l.85 — `{t('title')}`
- l.88 — `{t('intro')}`
- l.97 — `{t('successTitle')}`
- l.100 — `{t('successText')}`
- l.106 — `{t('sendAnother')}`
- l.117 — `{t('labelName')}`
- l.138 — `{t('labelPhone')}`
- l.160 — `{t('labelEmail')}`
- l.181 — `{t('labelProgram')}`
- l.193 — `{t(’options.${programId}’)}`
- l.204 — `{t('labelExperience')}`
- l.223 — `{t('labelMessage')}`
- l.253 — `{isSubmitting ? t('submitting') : t('submit')}`
- l.258 — `{t('consent')}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.37 — `{t('breadcrumbHome')}`
- l.48 — `{t('locationLabel')}`
- l.60 — `{t('titleLine')}{' '}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.51 — `{chrome('breadcrumbHome')}`

### `src\components\sections\events\EventsPartnersBanners.tsx`

- l.20 — `{t('partnersTitle')}`
- l.65 — `{t('cinemaTitle')}`

### `src\components\sections\events\pillars\DbEventPillarCard.tsx`

- l.73 — `{evt.cta_text || t('learnMore')}`
- l.93 — `{chrome('campusNameTitle')}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.114 — `{tTeam('showcaseTag')}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.140 — `{t('disciplines.cinemaContextLabel')}`
- l.147 — `{t('disciplines.equipmentLabel')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.143 — `{tf('step1ProgramTitle')}`
- l.235 — `{tf('step2ProgramTitle')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.45 — `{t('hero.breadcrumbHome')}`
- l.49 — `{t('hero.breadcrumbCurrent')}`
- l.145 — `{t('stats.practiceLabel')}`
- l.154 — `{t('stats.graduatesLabel')}`
- l.163 — `{t('stats.satisfactionLabel')}`
- l.169 — `{t('stats.since')}`
- l.172 — `{t('stats.referenceLabel')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.66 — `{statuses[session.status] ?? ''}`
- l.72 — `{tp('registrationNote')}`
- l.149 — `{t('cta.title')}`
- l.152 — `{t('cta.text')}`
- l.160 — `{t('ctaApplyPro')}`
- l.164 — `{t('cta.contact')}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.37 — `{t('celebrityModal.title')}`
- l.75 — `{t('celebrityModal.doublesLabel')}`
- l.87 — `{t('celebrityModal.scenesLabel')}`
- l.98 — `{t('celebrityModal.filmsLabel')}`
- l.137 — `{t('celebrityModal.close')}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.80 — `{t('hallOfFame.actorsBadge')}`
- l.84 — `{t('hallOfFame.actorsTitle')}`
- l.87 — `{t('hallOfFame.actorsIntro')}`
- l.151 — `{t('hallOfFame.filmsLabel')}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.61 — `{t('filmModal.title')}`
- l.105 — `{movie.year}{movie.director ? ’ • ${t('filmModal.directedBy', { name: movie.director })}’ : ''}`
- l.123 — `{t('filmModal.doublesLabel')}`
- l.142 — `{t('filmModal.teamLabel')}`
- l.265 — `{t('filmModal.close')}`

### `src\components\sections\partenaires\PartenairesCtaSection.tsx`

- l.18 — `{t('ctaBadge')}`
- l.21 — `{t('ctaTitle')}`
- l.24 — `{t('ctaBody')}`
- l.28 — `{t('ctaButton')}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.43 — `{t('breadcrumbHome')}`

### `src\components\sections\partenaires\grid\AdditionalPartnerCard.tsx`

- l.48 — `{localizer(partner).description}`

### `src\components\sections\partenaires\grid\StaticPartnerCard.tsx`

- l.44 — `{localizer(partner).role}`
- l.47 — `{localizer(partner).category}`
- l.56 — `{localizer(partner).description}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.40 — `{t('hero.breadcrumbHome')}`

### `src\components\sections\stages\grid\StageGridCard.tsx`

- l.78 — `{renderIcon(detail.icon)}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.47 — `{t('hero.breadcrumbHome')}`
- l.109 — `{t('hero.emblemLabel')}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.95 — `{t('services.coordinatorValue')}`

### `src\components\sections\team\teamGalleries.data.ts`

- l.14 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }`
- l.25 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }`
- l.36 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.46 — `{t('hero.breadcrumbHome')}`
- l.66 — `{t('hero.titleLead')}{' '}`
- l.104 — `{t('hero.ctaPlan3D')}`

### `src\components\sections\visite\VisitePhotoGallery.tsx`

- l.26 — `{t('galleryBadge')}`
- l.29 — `{t('galleryTitle')}`
- l.32 — `{t('gallerySubtitle')}`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.84 — `{chrome('brandName')}`
- l.144 — `{t('copied')}`

### `src\components\ui\LightboxModal.tsx`

- l.152 — `{t('navHint')}`

### `src\components\ui\TacticalButton.tsx`

- l.46 — `{...props}`

### `src\components\ui\VirtualTourViewer.tsx`

- l.69 — `{t('viewerTitle')}`
- l.72 — `{chrome('locationLabel')}`
- l.135 — `{t('navHelpBody2')}`
- l.142 — `{t('hideLabel')}`

### `src\components\ui\campus-map\CampusTravelPlanner.tsx`

- l.68 — `{t('travelTitle')}`
- l.72 — `{t('travelBadge')}`
- l.140 — `{t('accessInfoTitle')}`
- l.165 — `{isCopied ? t('addressCopied') : t('copyAddress')}`

### `src\components\ui\parallax-hero\HeroFocalContent.tsx`

- l.73 — `{chrome('heroTitleTail')}`

## 4. CODÉ EN DUR — dette (aucune prise en charge par le Cockpit)

Aucune occurrence.

## 5. HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées)

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\coach-detail\CoachPortrait.tsx`

- l.79 — `Allociné`
- l.92 — `Instagram`
- l.104 — `Portfolio`

### `src\components\sections\application-modal\ApplicationSuccessView.tsx`

- l.43 — `contact@campus-universcascades.com`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.88 — `contact@campus-universcascades.com`
- l.177 — `Google Maps`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.142 — `720H`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.179 — `IMDb`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.226 — `IMDb`
- l.238 — `AlloCiné`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.104 — `contact@campus-universcascades.com`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.89 — `LAT 50.0909° N • LON 3.5374° E`
- l.174 — `70 Rue Faidherbe, 59360 Le Cateau-Cambrésis`
- l.184 — `70 Rue Faidherbe • 59360 Le Cateau-Cambrésis`

### `src\components\ui\campus-map\CampusAppLaunchers.tsx`

- l.30 — `Google Maps`
- l.44 — `Apple Maps`
- l.58 — `Waze`
- l.72 — `SNCF Connect`

