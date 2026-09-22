# Revue — Micro-textes visibles par les visiteurs

Généré le 2026-09-22T01:13:32.136Z par `scripts/audit_visible_microcopy.mjs`.

Analyse statique des composants de vitrine : chaque texte visible est classé.
Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.

| Catégorie | Occurrences |
| --- | ---: |
| ANNOTÉ — éditable en place | 66 |
| DONNÉES — éditable par un écran existant | 232 |
| TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n) | 262 |
| CODÉ EN DUR — dette (aucune prise en charge par le Cockpit) | 0 |
| HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées) | 18 |
| **Total** | **578** |

## 1. ANNOTÉ — éditable en place

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.73 — `{heroBadge}`
- l.112 — `{ctaPrimaryText}`
- l.120 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.73 — `{heroBadge}`
- l.112 — `{ctaPrimaryText}`
- l.120 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.198 — `{heroBadge}`
- l.243 — `{ctaPrimaryText}`
- l.249 — `{ctaSecondaryText}`
- l.328 — `{item.desc}`
- l.495 — `{ctaSecondary}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.106 — `{heroBadge}`
- l.147 — `{ctaPrimaryText}`
- l.155 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.128 — `{heroBadge}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.62 — `{hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.195 — `{pillarItems[0].cta}`
- l.266 — `{pillarItems[1].cta}`
- l.311 — `{pillarItems[2].cta}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.64 — `{chrome?.badge || t('disciplines.badge')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.121 — `{decouverte?.duration_text || tf('step1Duration')}`
- l.136 — `{decouverte?.boarding_text || tf('step1Boarding')}`
- l.163 — `{decouverte?.cta_text || tf('step1Cta')}`
- l.210 — `{pro?.schedule_text || tf('step2Rhythm')}`
- l.219 — `{pro?.boarding_text || tf('step2Accreditation')}`
- l.228 — `{pro?.certification_text || tf('step2Certification')}`
- l.255 — `{pro?.cta_text || t('ctaApplyPro')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.65 — `{heroData?.badge || t('hero.badge')}`
- l.105 — `{heroData?.cta_primary_text || t('ctaApplyPro')}`
- l.114 — `{heroData?.cta_secondary_text || t('hero.ctaDiscovery')}`

### `src\components\sections\home\HomeSocialSection.tsx`

- l.235 — `{seeInstagram}`

### `src\components\sections\home\HomeTournagesSection.tsx`

- l.227 — `{pillar1Title}`
- l.242 — `{pillar2Title}`
- l.257 — `{pillar3Title}`
- l.272 — `{ctaProduction}`
- l.279 — `{ctaCatalog}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.95 — `{installationsCta}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.183 — `{officialSite}`
- l.262 — `{officialSite}`
- l.340 — `{websiteLabel}`

### `src\components\sections\team\TeamProductionGalleries.tsx`

- l.156 — `{expandLabel}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.69 — `{item.body}`
- l.112 — `{block?.cta || t('services.cta')}`

### `src\components\sections\visite\VisiteAccessTransport.tsx`

- l.85 — `{accessBadge}`
- l.112 — `{accessCarBody}`
- l.127 — `{accessTrainBody}`
- l.142 — `{accessPlaneBody}`
- l.168 — `{campusName}`
- l.172 — `{campusAddress}`
- l.181 — `{mapRadarLabel}`
- l.192 — `{mapExternalLabel}`
- l.206 — `{phoneLabel}`
- l.213 — `{phoneDisplay}`
- l.218 — `{emailLabel}`
- l.225 — `{emailAddress}`
- l.238 — `{idfValue}`
- l.242 — `{idfZip}`
- l.250 — `{accessCta}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.87 — `{hero?.cta_primary_text || t('hero.ctaFacilities')}`
- l.98 — `{hero?.cta_secondary_text || t('hero.ctaTour360')}`

### `src\components\ui\ParallaxHero.tsx`

- l.275 — `{heroData?.since || tHero('since')}`
- l.360 — `{heroData?.cta_primary_text || tHero('ctaFormation')}`
- l.376 — `{heroData?.cta_secondary_text || tHero('ctaVisit')}`
- l.392 — `{heroData?.cta_tertiary_text || tHero('ctaStuntTeam')}`

### `src\components\ui\parallax-hero\HeroHudOverlay.tsx`

- l.38 — `{location}`
- l.42 — `{privateDomain}`

## 2. DONNÉES — éditable par un écran existant

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.105 — `{heroSubtitle}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.305 — `{member.role}`
- l.392 — `{member.role}`
- l.400 — `{member.name}`
- l.404 — `{member.title}`
- l.416 — `{member.bio}`
- l.432 — `{spec}`
- l.534 — `{film.title}`
- l.546 — `{film.year}`
- l.591 — `{film.title}`
- l.656 — `{other.role}`
- l.659 — `{other.name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.151 — `{heroSubtitle}`
- l.188 — `{member.role}`
- l.220 — `{member.name}`
- l.224 — `{member.title}`
- l.230 — `{member.bio}`
- l.245 — `{spec}`
- l.330 — `{f.title}`

### `src\app\(site)\[locale]\layout.tsx`

- l.144 — `{children}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.105 — `{heroSubtitle}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.184 — `{breadcrumbHome}`
- l.191 — `{breadcrumbCurrent}`
- l.232 — `{heroSubtitle}`
- l.268 — `{highlight.value}`
- l.274 — `{highlight.label}`
- l.295 — `{programTag}`
- l.303 — `{programTitle}`
- l.310 — `{programIntro}`
- l.325 — `{item.title}`
- l.395 — `{locationTitle}`
- l.402 — `{locationBody}`
- l.408 — `{locationNote}`
- l.419 — `{housingTitle}`
- l.426 — `{housingBody}`
- l.432 — `{housingNote}`
- l.443 — `{certificateTitle}`
- l.450 — `{certificateBody}`
- l.456 — `{certificateNote}`
- l.476 — `{ctaTitle}`
- l.482 — `{ctaBody}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.140 — `{heroSubtitle}`
- l.217 — `{workshop.category}`
- l.223 — `{workshop.title}`
- l.226 — `{workshop.desc}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.160 — `{heroSubtitle}`
- l.291 — `{v.title}`
- l.312 — `{selectedDmVideo.title}`
- l.359 — `{item.channel}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.116 — `{content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}`

### `src\components\layout\AnnouncementBanner.tsx`

- l.82 — `{announcement.badge}`

### `src\components\layout\Navbar.tsx`

- l.155 — `{item.label}`
- l.177 — `{cta.label}`

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

### `src\components\sections\ApplicationModal.tsx`

- l.196 — `{tab.label}`
- l.317 — `{submitError}`

### `src\components\sections\contact\ContactForm.tsx`

- l.240 — `{errorMessage}`

### `src\components\sections\events\EventsGuaranteesSection.tsx`

- l.44 — `{guarantees[0].title}`
- l.50 — `{guarantees[0].description}`
- l.72 — `{guarantees[1].title}`
- l.78 — `{guarantees[1].description}`
- l.88 — `{guarantees[2].title}`
- l.94 — `{guarantees[2].description}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.84 — `{subtitle}`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.89 — `{evt.badge}`
- l.93 — `{evt.title}`
- l.97 — `{evt.subtitle}`
- l.104 — `{evt.description}`
- l.168 — `{pillarItems[0].tag}`
- l.174 — `{pillarItems[0].title}`
- l.182 — `{pillarItems[0].paragraph1}`
- l.188 — `{pillarItems[0].paragraph2}`
- l.239 — `{pillarItems[1].tag}`
- l.245 — `{pillarItems[1].title}`
- l.253 — `{pillarItems[1].paragraph1}`
- l.259 — `{pillarItems[1].paragraph2}`
- l.284 — `{pillarItems[2].tag}`
- l.290 — `{pillarItems[2].title}`
- l.298 — `{pillarItems[2].paragraph1}`
- l.304 — `{pillarItems[2].paragraph2}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.114 — `{resolvedBadge}`
- l.121 — `{resolvedTitle}`

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

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.70 — `{title}`
- l.76 — `{subtitle}`

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
- l.222 — `{ctaPrimaryText}`
- l.227 — `{ctaSecondaryText}`

### `src\components\sections\home\HomePartnersSection.tsx`

- l.125 — `{badge}`
- l.131 — `{title}`
- l.138 — `{subtitle}`
- l.184 — `{partner.name}`

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

### `src\components\sections\home\HomeTournagesSection.tsx`

- l.183 — `{badge}`
- l.189 — `{teamTag}`
- l.197 — `{title}`
- l.204 — `{subtitle}`
- l.211 — `{ctaText}`
- l.234 — `{pillar1Desc}`
- l.249 — `{pillar2Desc}`
- l.264 — `{pillar3Desc}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.58 — `{badge}`
- l.64 — `{tag}`
- l.72 — `{title}`
- l.79 — `{subtitle}`
- l.89 — `{ctaText}`
- l.132 — `{hudTitle}`
- l.138 — `{hudHint}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.126 — `{cinemaHeading}`
- l.159 — `{productionBadge}`
- l.164 — `{partner.name}`
- l.204 — `{specializedHeading}`
- l.243 — `{partner.name}`
- l.278 — `{catGroup.icon}`
- l.322 — `{partner.name}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.78 — `{subtitle}`

### `src\components\sections\stages\StagesGridSection.tsx`

- l.94 — `{badge.text}`
- l.103 — `{badge.text}`
- l.112 — `{badge.text}`
- l.245 — `{stage.subBadge}`
- l.253 — `{stage.highlightText}`
- l.262 — `{stage.title}`
- l.268 — `{stage.description}`
- l.278 — `{detail.text}`
- l.293 — `{stage.buttonLabel}`
- l.307 — `{stage.pdfLink.label}`

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
- l.174 — `{equipmentBadge}`
- l.180 — `{equipmentTitle}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.66 — `{item.label}`

### `src\components\sections\visite\VisiteAccessTransport.tsx`

- l.92 — `{accessTitle}`
- l.98 — `{accessIntro}`
- l.109 — `{accessCarLabel}`
- l.124 — `{accessTrainLabel}`
- l.139 — `{accessPlaneLabel}`
- l.156 — `{coordinatesTitle}`
- l.165 — `{addressLabel}`
- l.203 — `{standardLabel}`
- l.235 — `{idfLabel}`

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

- l.121 — `{stat.value}`

### `src\components\ui\LightboxModal.tsx`

- l.83 — `{currentImage.title}`
- l.149 — `{currentImage.title}`

### `src\components\ui\ParallaxHero.tsx`

- l.333 — `{stat.val}`
- l.339 — `{stat.label}`

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
- l.81 — `{content.hero?.meta || t('heroMeta')}`
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

- l.202 — `{tt('coachNotFound')}`
- l.279 — `{chrome('breadcrumbHome')}`
- l.283 — `{tt('breadcrumb')}`
- l.395 — `{tt('facultyTag')}`
- l.455 — `{tt('ctaContact')}`
- l.461 — `{tt('ctaTrain')}`
- l.481 — `{tt('filmographyHint')}`
- l.552 — `{tt('featuredBadge')}`
- l.570 — `{tt('roleOnProduction')}`
- l.617 — `{tt('campusFacultyTag')}`
- l.620 — `{chrome('otherCoordinatorsTitle')}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.116 — `{t('breadcrumbHome')}`
- l.127 — `{t('performerTag')}`
- l.256 — `{t('creditsLabel')}`
- l.389 — `{t('ctaBlockTitle')}`
- l.392 — `{t('ctaBlockBody')}`
- l.396 — `{t('ctaBlockButton')}`

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
- l.81 — `{content.hero?.meta || t('heroMeta')}`
- l.147 — `{t('panelTag')}`
- l.150 — `{t('panelSub')}`
- l.156 — `{t('panelTitle')}`
- l.160 — `{t('panelParagraph')}`
- l.165 — `{t('specsTitle')}`
- l.210 — `{t('arenaBadge')}`
- l.216 — `{t('arenaTitle')}`
- l.222 — `{chrome('broadcastNote')}`
- l.228 — `{t('arenaCta')}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.206 — `{content.hero?.meta || t('heroMeta')}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.93 — `{chrome('breadcrumbHome')}`
- l.97 — `{chrome('siteEvents')}`
- l.114 — `{content.hero?.meta || t('heroMeta')}`
- l.176 — `{content.sections_data?.overview?.badge || t('overviewBadge')}`
- l.180 — `{content.sections_data?.overview?.title || t('overviewTitle')}`
- l.183 — `{content.sections_data?.overview?.description || t('overviewDescription')}`
- l.212 — `{t('workshopFallbackLabel')}`
- l.244 — `{t('customBadge')}`
- l.247 — `{t('customTitle')}`
- l.250 — `{t('customDescription')}`
- l.254 — `{t('customCta')}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.119 — `{t('breadcrumbHome')}`
- l.136 — `{content.hero?.meta || t('heroMeta')}`
- l.209 — `{t('videoFallback')}`
- l.227 — `{t('videoFallback')}`
- l.245 — `{t('broadcastBadge')}`
- l.258 — `{t('docusBadge')}`
- l.261 — `{t('docusTitle')}`
- l.264 — `{t('docusHint')}`
- l.340 — `{t('mediaTag')}`
- l.343 — `{t('mediaTitle')}`
- l.346 — `{t('mediaIntro')}`

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
- l.109 — `{content.hero?.badge || t('pageTag')}`
- l.124 — `{content.hero?.title || t('pageTitle')}{' '}`
- l.134 — `{content.hero?.subtitle || t('pageSubtitle')}`
- l.171 — `{t('ctaRendezVous')}`
- l.195 — `{t('factsTitle1')}`
- l.199 — `{t('factsBody1')}`
- l.207 — `{t('factsTitle2')}`
- l.211 — `{t('factsBody2')}`
- l.219 — `{t('factsTitle3')}`
- l.223 — `{t('factsBody3')}`

### `src\components\layout\Navbar.tsx`

- l.107 — `{chrome('brandName')}`
- l.110 — `{chrome('brandTaglineEst')}`

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

### `src\components\sections\ApplicationModal.tsx`

- l.176 — `{t('titleLead')}`
- l.180 — `{t('intro')}`
- l.206 — `{t('labels.fullName')}`
- l.219 — `{t('labels.age')}`
- l.237 — `{t('labels.email')}`
- l.250 — `{t('labels.phone')}`
- l.266 — `{t('labels.afdasStatus')}`
- l.275 — `{afdasLabels[index] ?? value}`
- l.284 — `{t('labels.sport')}`
- l.297 — `{t('labels.session')}`
- l.327 — `{t('cancel')}`
- l.335 — `{isSubmitting ? t('submitting') : t('submit')}`
- l.346 — `{t('successTitle')}`
- l.371 — `{t('closeCase')}`

### `src\components\sections\HallOfFame.tsx`

- l.57 — `{t('hallOfFame.badge')}`
- l.62 — `{t('hallOfFame.title')}`
- l.66 — `{t('hallOfFame.subtitle')}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.38 — `{t('standardTitle')}`
- l.56 — `{t('directPhone')}`
- l.71 — `{t('email')}`
- l.86 — `{t('hours')}`
- l.91 — `{t('hoursValue')}`
- l.93 — `{t('hoursSaturday')}`
- l.121 — `{t('sitesTitle')}`
- l.126 — `{t('mainCampus')}`
- l.129 — `{t('mainCampusAddress')}`
- l.132 — `{t('mainCampusRegion')}`
- l.157 — `{t('idfHub')}`
- l.160 — `{t('idfStudio')}`
- l.163 — `{t('idfAddress')}`
- l.170 — `{t('production')}`
- l.173 — `{t('productionDesc')}`
- l.187 — `{t('entitiesTitle')}`
- l.199 — `{chrome('siteCampus')}`
- l.212 — `{chrome('siteEvents')}`
- l.225 — `{chrome('siteStuntTeam')}`

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
- l.70 — `{heroData?.subtitle || t('subtitle')}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.51 — `{chrome('breadcrumbHome')}`

### `src\components\sections\events\EventsPartnersBanners.tsx`

- l.20 — `{t('partnersTitle')}`
- l.65 — `{t('cinemaTitle')}`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.129 — `{evt.cta_text || t('learnMore')}`
- l.149 — `{chrome('campusNameTitle')}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.117 — `{tTeam('showcaseTag')}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.71 — `{chrome?.title || t('disciplines.title')}`
- l.140 — `{t('disciplines.cinemaContextLabel')}`
- l.147 — `{t('disciplines.equipmentLabel')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.92 — `{decouverte?.step_badge || tf('step1Badge')}`
- l.98 — `{decouverte?.duration_badge || tf('step1Hours')}`
- l.106 — `{decouverte?.title || tf('step1Title')}`
- l.112 — `{decouverte?.description || tf('step1Desc')}`
- l.143 — `{tf('step1ProgramTitle')}`
- l.181 — `{pro?.step_badge || tf('step2Badge')}`
- l.187 — `{pro?.duration_badge || tf('step2Hours')}`
- l.195 — `{pro?.title || tf('step2Title')}`
- l.201 — `{pro?.description || tf('step2Desc')}`
- l.235 — `{tf('step2ProgramTitle')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.45 — `{t('hero.breadcrumbHome')}`
- l.49 — `{t('hero.breadcrumbCurrent')}`
- l.73 — `{heroData?.meta || 'AFDAS 100% • FRANCE TRAVAIL'}`
- l.94 — `{heroData?.subtitle || t('hero.subtitle')}`
- l.145 — `{t('stats.practiceLabel')}`
- l.154 — `{t('stats.graduatesLabel')}`
- l.163 — `{t('stats.satisfactionLabel')}`
- l.169 — `{t('stats.since')}`
- l.172 — `{t('stats.referenceLabel')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.55 — `{chrome?.sessions_title || tp('sessionsTitle')}`
- l.66 — `{statuses[session.status] ?? ''}`
- l.72 — `{tp('registrationNote')}`
- l.84 — `{chrome?.admission_title || tp('admissionTitle')}`
- l.120 — `{chrome?.funding_title || tp('fundingTitle')}`
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

### `src\components\sections\home\HomePartnersSection.tsx`

- l.190 — `{partner.role || roles[partner.roleKey] || ''}`

### `src\components\sections\partenaires\PartenairesCtaSection.tsx`

- l.18 — `{t('ctaBadge')}`
- l.21 — `{t('ctaTitle')}`
- l.24 — `{t('ctaBody')}`
- l.28 — `{t('ctaButton')}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.169 — `{localized(partner).description}`
- l.248 — `{localized(partner).description}`
- l.314 — `{localized(partner).role}`
- l.317 — `{localized(partner).category}`
- l.326 — `{localized(partner).description}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.43 — `{t('breadcrumbHome')}`
- l.54 — `{t('heroMeta')}`

### `src\components\sections\stages\StagesGridSection.tsx`

- l.274 — `{renderIcon(detail.icon)}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.40 — `{t('hero.breadcrumbHome')}`
- l.51 — `{t('hero.meta')}`
- l.70 — `{heroData?.subtitle || t('hero.subtitle')}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.47 — `{t('hero.breadcrumbHome')}`
- l.109 — `{t('hero.emblemLabel')}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.44 — `{block?.badge || t('services.badge')}`
- l.50 — `{block?.title || t('services.title')}`
- l.56 — `{block?.intro || t('services.intro')}`
- l.83 — `{block?.contact_title || t('services.contactTitle')}`
- l.89 — `{block?.contact_intro || t('services.contactIntro')}`
- l.95 — `{t('services.coordinatorValue')}`

### `src\components\sections\team\teamGalleries.data.ts`

- l.14 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }`
- l.25 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }`
- l.36 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.46 — `{t('hero.breadcrumbHome')}`
- l.66 — `{t('hero.titleLead')}{' '}`
- l.76 — `{hero?.subtitle || t('hero.subtitle')}`
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

### `src\components\ui\ParallaxHero.tsx`

- l.49 — `{ caption: string; sub: string; badge: string; tag: string }`
- l.293 — `{chrome('heroTitleTail')}`
- l.311 — `{heroData?.subtitle || activeCopy?.sub || ''}`

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

## 4. CODÉ EN DUR — dette (aucune prise en charge par le Cockpit)

Aucune occurrence.

## 5. HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées)

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.354 — `Allociné`
- l.367 — `Instagram`
- l.379 — `Portfolio`

### `src\components\sections\ApplicationModal.tsx`

- l.366 — `contact@campus-universcascades.com`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.77 — `contact@campus-universcascades.com`
- l.150 — `Google Maps`

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

