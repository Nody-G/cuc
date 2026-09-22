# Revue — Micro-textes visibles par les visiteurs

Généré le 2026-09-22T00:30:47.118Z par `scripts/audit_visible_microcopy.mjs`.

Analyse statique des composants de vitrine : chaque texte visible est classé.
Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.

| Catégorie | Occurrences |
| --- | ---: |
| ANNOTÉ — éditable en place | 58 |
| DONNÉES — éditable par un écran existant | 176 |
| TRADUCTION — à brancher sur une clé de page | 594 |
| CODÉ EN DUR — dette (ne suit ni la langue ni le Cockpit) | 100 |
| **Total** | **928** |

## 1. ANNOTÉ — éditable en place

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.71 — `{heroBadge}`
- l.110 — `{ctaPrimaryText}`
- l.118 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.141 — `{...cucField('hero.title')}`
- l.157 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.71 — `{heroBadge}`
- l.110 — `{ctaPrimaryText}`
- l.118 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.73 — `{heroBadge}`
- l.118 — `{ctaPrimaryText}`
- l.124 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.104 — `{heroBadge}`
- l.145 — `{ctaPrimaryText}`
- l.153 — `{ctaSecondaryText}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.128 — `{heroBadge}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.106 — `{...cucField('hero.badge')}`
- l.113 — `{...cucField('hero.meta')}`
- l.121 — `{...cucField('hero.title')}`
- l.131 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.53 — `{...cucField('hero.title')}`
- l.67 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.60 — `{hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}`
- l.65 — `{...cucField('hero.title')}`
- l.79 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.67 — `{...cucField('sections_data.formules.title')}`
- l.73 — `{...cucField('sections_data.formules.subtitle', 'textarea')}`
- l.89 — `{...cucField(itemPath('formules', decouverteIndex, 'step_badge'))}`
- l.95 — `{...cucField(itemPath('formules', decouverteIndex, 'duration_badge'))}`
- l.103 — `{...cucField(itemPath('formules', decouverteIndex, 'title'))}`
- l.109 — `{...cucField(itemPath('formules', decouverteIndex, 'description'), 'textarea')}`
- l.121 — `{decouverte?.duration_text || tf('step1Duration')}`
- l.136 — `{decouverte?.boarding_text || tf('step1Boarding')}`
- l.163 — `{decouverte?.cta_text || tf('step1Cta')}`
- l.178 — `{...cucField(itemPath('formules', proIndex, 'step_badge'))}`
- l.184 — `{...cucField(itemPath('formules', proIndex, 'duration_badge'))}`
- l.192 — `{...cucField(itemPath('formules', proIndex, 'title'))}`
- l.198 — `{...cucField(itemPath('formules', proIndex, 'description'), 'textarea')}`
- l.210 — `{pro?.schedule_text || tf('step2Rhythm')}`
- l.219 — `{pro?.boarding_text || tf('step2Accreditation')}`
- l.228 — `{pro?.certification_text || tf('step2Certification')}`
- l.255 — `{pro?.cta_text || t('ctaApplyPro')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.65 — `{heroData?.badge || t('hero.badge')}`
- l.105 — `{heroData?.cta_primary_text || t('ctaApplyPro')}`
- l.114 — `{heroData?.cta_secondary_text || t('hero.ctaDiscovery')}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.59 — `{...cucField('hero.title')}`
- l.75 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.56 — `{...cucField('hero.title')}`
- l.67 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.58 — `{...cucField('hero.title')}`
- l.73 — `{...cucField('hero.subtitle', 'textarea')}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.59 — `{...cucField('hero.title')}`
- l.73 — `{...cucField('hero.subtitle', 'textarea')}`
- l.87 — `{hero?.cta_primary_text || t('hero.ctaFacilities')}`
- l.98 — `{hero?.cta_secondary_text || t('hero.ctaTour360')}`

### `src\components\ui\ParallaxHero.tsx`

- l.266 — `{...cucField('hero.title')}`
- l.289 — `{...cucField('hero.subtitle', 'textarea')}`
- l.335 — `{heroData?.cta_primary_text || tHero('ctaFormation')}`
- l.347 — `{heroData?.cta_secondary_text || tHero('ctaVisit')}`

## 2. DONNÉES — éditable par un écran existant

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.103 — `{heroSubtitle}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.303 — `{member.role}`
- l.321 — `{member.name.charAt(0)}`
- l.390 — `{member.role}`
- l.398 — `{member.name}`
- l.402 — `{member.title}`
- l.414 — `{member.bio}`
- l.430 — `{spec}`
- l.444 — `{member.doubledActors.join(' • ')}`
- l.532 — `{film.title}`
- l.544 — `{film.year}`
- l.589 — `{film.title}`
- l.654 — `{other.role}`
- l.657 — `{other.name}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.160 — `{heroSubtitle}`
- l.197 — `{member.role}`
- l.214 — `{member.name.charAt(0)}`
- l.229 — `{member.name}`
- l.233 — `{member.title}`
- l.239 — `{member.bio}`
- l.254 — `{spec}`
- l.339 — `{f.title}`

### `src\app\(site)\[locale]\layout.tsx`

- l.144 — `{children}`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.103 — `{heroSubtitle}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.107 — `{heroSubtitle}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.138 — `{heroSubtitle}`
- l.215 — `{workshop.category}`
- l.221 — `{workshop.title}`
- l.224 — `{workshop.desc}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.160 — `{heroSubtitle}`
- l.291 — `{v.title}`
- l.312 — `{selectedDmVideo.title}`
- l.359 — `{item.channel}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.116 — `{content.hero?.meta || 'LE CATEAU-CAMBRÉSIS'}`

### `src\components\layout\AnnouncementBanner.tsx`

- l.84 — `{announcement.badge}`

### `src\components\layout\Navbar.tsx`

- l.153 — `{item.label}`
- l.175 — `{cta.label}`

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

- l.56 — `{settings.phone || '(+33) 06 72 84 94 92'}`
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

- l.94 — `{item.label}`
- l.159 — `{cta.label}`

### `src\components\sections\ApplicationModal.tsx`

- l.196 — `{tab.label}`
- l.317 — `{submitError}`

### `src\components\sections\contact\ContactForm.tsx`

- l.240 — `{errorMessage}`

### `src\components\sections\events\EventsGuaranteesSection.tsx`

- l.29 — `{guarantees[0].title}`
- l.45 — `{guarantees[1].title}`
- l.53 — `{guarantees[2].title}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.82 — `{subtitle}`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.76 — `{evt.badge}`
- l.80 — `{evt.title}`
- l.84 — `{evt.subtitle}`
- l.91 — `{evt.description}`
- l.152 — `{pillars[0].tag}`
- l.155 — `{pillars[0].title}`
- l.160 — `{pillars[0].paragraph1}`
- l.163 — `{pillars[0].paragraph2}`
- l.169 — `{pillars[0].cta}`
- l.216 — `{pillars[1].paragraph2}`
- l.222 — `{pillars[1].cta}`
- l.236 — `{pillars[2].tag}`
- l.239 — `{pillars[2].title}`
- l.244 — `{pillars[2].paragraph1}`
- l.247 — `{pillars[2].paragraph2}`
- l.253 — `{pillars[2].cta}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.119 — `{resolvedBadge}`
- l.126 — `{resolvedTitle}`

### `src\components\sections\films\FilmPosterCard.tsx`

- l.71 — `{film.title}`
- l.77 — `{film.year}`
- l.82 — `{film.title}`
- l.96 — `{inner}`
- l.104 — `{inner}`
- l.111 — `{inner}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.86 — `{d.number}`
- l.89 — `{d.name}`
- l.119 — `{activeDiscipline.name}`
- l.124 — `{activeDiscipline.fullDesc}`
- l.145 — `{item}`

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
- l.163 — `{member.name.charAt(0)}`
- l.169 — `{member.name}`
- l.204 — `{roleLabelText}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.99 — `{founderQuote}`
- l.106 — `{founderName}`
- l.112 — `{founderRole}`
- l.125 — `{badgeYear}`
- l.143 — `{tag}`
- l.149 — `{subtag}`
- l.157 — `{title}`
- l.164 — `{description}`
- l.177 — `{pillar.title}`
- l.180 — `{pillar.tag}`
- l.184 — `{pillar.desc}`
- l.197 — `{ctaPrimaryText}`
- l.202 — `{ctaSecondaryText}`

### `src\components\sections\home\HomePartnersSection.tsx`

- l.109 — `{badge}`
- l.115 — `{title}`
- l.122 — `{subtitle}`
- l.161 — `{partner.name}`

### `src\components\sections\home\HomeQualiopiSection.tsx`

- l.75 — `{badge}`
- l.82 — `{title}`
- l.88 — `{subtitle}`

### `src\components\sections\home\HomeSocialSection.tsx`

- l.99 — `{badge}`
- l.109 — `{title}`
- l.115 — `{subtitle}`

### `src\components\sections\home\HomeTournagesSection.tsx`

- l.160 — `{badge}`
- l.171 — `{title}`
- l.178 — `{subtitle}`
- l.185 — `{ctaText}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.51 — `{badge}`
- l.62 — `{title}`
- l.69 — `{subtitle}`
- l.79 — `{ctaText}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.139 — `{partner.name}`
- l.213 — `{partner.name}`
- l.246 — `{catGroup.icon}`
- l.290 — `{partner.name}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.78 — `{subtitle}`

### `src\components\sections\stages\StagesGridSection.tsx`

- l.72 — `{badge.text}`
- l.78 — `{badge.text}`
- l.84 — `{badge.text}`
- l.192 — `{stage.subBadge}`
- l.197 — `{stage.highlightText}`
- l.203 — `{stage.title}`
- l.206 — `{stage.description}`
- l.224 — `{stage.buttonLabel}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.76 — `{subtitle}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.37 — `{item.label}`
- l.39 — `{item.body}`

### `src\components\sections\visite\VisiteFacilitiesDetail.tsx`

- l.139 — `{facility.name}`
- l.142 — `{facility.size}`
- l.174 — `{selectedFacility.name}`
- l.177 — `{selectedFacility.description}`
- l.202 — `{selectedFacility.specifications}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.121 — `{stat.value}`

### `src\components\ui\LightboxModal.tsx`

- l.83 — `{currentImage.title}`
- l.149 — `{currentImage.title}`

### `src\components\ui\ParallaxHero.tsx`

- l.315 — `{stat.val}`
- l.318 — `{stat.label}`

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

## 3. TRADUCTION — à brancher sur une clé de page

### `src\app\(site)\[locale]\HomeView.tsx`

- l.81 — `{/* Studio Animation Continuous Global Depth Atmosphere */}`

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.41 — `{/* Hero Header */}`
- l.58 — `{t('breadcrumbHome')}`
- l.62 — `{t('breadcrumbEvents')}`
- l.79 — `{content.hero?.meta || t('heroMeta')}`
- l.127 — `{/* Chiffres Clés Airbag */}`
- l.151 — `{/* Contenu Détaillé */}`
- l.171 — `{t('panelSub')}`
- l.177 — `{t('panelTitle')}`
- l.181 — `{t('panelParagraph1')}`
- l.185 — `{t('panelParagraph2')}`
- l.190 — `{t('includedTitle')}`

### `src\app\(site)\[locale]\contact-cuc\page.tsx`

- l.26 — `{/* 1. Page Header Hero */}`
- l.29 — `{/* 2. Contact Form & Coordinates Hub */}`
- l.33 — `{/* Formulaire de Contact */}`
- l.36 — `{/* Coordonnées, Standard & Deux Sites */}`
- l.42 — `{/* 3. Interactive Campus Map & Navigation Hub */}`
- l.53 — `{t('sectionBadge')}`
- l.56 — `{t('sectionTitle')}{' '}`
- l.60 — `{t('sectionIntro')}`

### `src\app\(site)\[locale]\cuc-team-cascadeur\page.tsx`

- l.62 — `{/* Lightbox Modal for HD Viewing */}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.200 — `{tt('coachNotFound')}`
- l.274 — `{/* Fil d'Ariane */}`
- l.281 — `{tt('breadcrumb')}`
- l.287 — `{/* Profil Principal — Hero Showcase */}`
- l.289 — `{/* Colonne Gauche : Grande Photo Portrait Immersive */}`
- l.292 — `{/* Stage Portrait plein format */}`
- l.294 — `{/* Ambient Lighting Glow */}`
- l.297 — `{/* Tactical Grid */}`
- l.300 — `{/* Badge Rôle - Top Left */}`
- l.307 — `{/* Photo Haute Définition Pleine Taille */}`
- l.325 — `{/* Dégradé de transition basse */}`
- l.329 — `{/* Liens Officiels & Profils en pied de photo */}`
- l.385 — `{/* Colonne Droite : Informations Détaillées, Trajectoire & Compétences */}`
- l.393 — `{tt('facultyTag')}`
- l.406 — `{/* Biographie Détaillée */}`
- l.418 — `{/* Domaines d'Expertise Tactique */}`
- l.436 — `{/* Doublures Acteurs Clés (si existant) */}`
- l.449 — `{/* Call to Action Direct */}`
- l.453 — `{tt('ctaContact')}`
- l.459 — `{tt('ctaTrain')}`
- l.466 — `{/* Section Filmographie & Tournages Associés (Affiches & Rôles Spécifiques) */}`
- l.479 — `{tt('filmographyHint')}`
- l.518 — `{/* Affiche du film */}`
- l.547 — `{/* Mise en avant (définie dans le cockpit) */}`
- l.550 — `{tt('featuredBadge')}`
- l.554 — `{/* Hover action icon */}`
- l.563 — `{/* Informations & Rôle spécifique */}`
- l.565 — `{/* RÔLE DU COACH SUR CE FILM */}`
- l.568 — `{tt('roleOnProduction')}`
- l.610 — `{/* Découvrir les autres formateurs du Campus */}`
- l.615 — `{tt('campusFacultyTag')}`
- l.670 — `{/* Bouton Retour */}`
- l.683 — `{/* Modale d'informations de film quand on clique sur une affiche */}`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.108 — `{/* Hero Header */}`
- l.125 — `{t('breadcrumbHome')}`
- l.136 — `{t('performerTag')}`
- l.148 — `{heroTitle.substring(heroTitle.lastIndexOf(' ') + 1)}`
- l.165 — `{/* Team Roster Grid with Grand High-Impact Portraits */}`
- l.182 — `{/* Portrait Showcase Stage */}`
- l.188 — `{/* Ambient Glow on hover */}`
- l.191 — `{/* Tactical cinematic grid overlay */}`
- l.194 — `{/* Role Badge - Top Left */}`
- l.201 — `{/* High-Resolution Full-Stature Portrait */}`
- l.218 — `{/* Subtle bottom shadow gradient to blend with card content */}`
- l.222 — `{/* Card Content Section */}`
- l.225 — `{/* Name & Title */}`
- l.237 — `{/* Bio */}`
- l.242 — `{/* Specialties */}`
- l.260 — `{/* Références & Tournages Qualifiés */}`
- l.265 — `{t('creditsLabel')}`
- l.268 — `{member.notableCredits.length} {t('creditsUnit')}`
- l.299 — `{t('othersLabel', { count: member.notableCredits.length - 4 })}`
- l.306 — `{/* Projets & Tournages Cinéma */}`
- l.349 — `{/* Action Button & Links Footer */}`
- l.391 — `{/* FILMOGRAPHIE & TOURNAGES DE L'ÉQUIPE — composant partagé avec la page TOURNAGE */}`
- l.394 — `{/* Bottom Callout */}`
- l.398 — `{t('ctaBlockTitle')}`
- l.401 — `{t('ctaBlockBody')}`
- l.405 — `{t('ctaBlockButton')}`
- l.415 — `{/* Modal Dossier de Production du Film (interactions des cartes coachs) */}`

### `src\app\(site)\[locale]\error.tsx`

- l.42 — `{t('errorTitle')}`
- l.45 — `{t('errorText')}`
- l.54 — `{t('retry')}`
- l.60 — `{t('backHome')}`
- l.66 — `{t('errorReference', { digest: error.digest })}`

### `src\app\(site)\[locale]\formation-de-cascadeur\page.tsx`

- l.30 — `{/* Données structurées schema.org — Course */}`
- l.47 — `{/* 1. Page Header Hero & Key Indicators */}`
- l.50 — `{/* 2. Les 2 Formules du Cursus Professionnel */}`
- l.56 — `{/* 3. Les 10 Disciplines de la Cascade Physique */}`
- l.59 — `{/* 4. Modalités Pédagogiques, Calendrier & Prise en Charge */}`

### `src\app\(site)\[locale]\opengraph-image.tsx`

- l.35 — `{/* Bandeau supérieur */}`
- l.56 — `{isEn ? "LE CATEAU-CAMBRÉSIS • FRANCE" : "LE CATEAU-CAMBRÉSIS • 59"}`
- l.61 — `{/* Titre principal */}`
- l.72 — `{isEn ? "THE WORLD'S LARGEST" : "LA PLUS GRANDE ÉCOLE"}`
- l.83 — `{isEn ? "STUNT PERFORMER SCHOOL" : "DE CASCADEURS AU MONDE"}`
- l.87 — `{/* Bandeau inférieur — chiffres clés */}`
- l.108 — `{ ...size }`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.41 — `{/* Hero Header */}`
- l.58 — `{t('breadcrumbHome')}`
- l.62 — `{t('breadcrumbEvents')}`
- l.79 — `{content.hero?.meta || t('heroMeta')}`
- l.127 — `{/* Détails de l'offre Spectacles */}`
- l.130 — `{/* Show Formats */}`
- l.145 — `{t('panelTag')}`
- l.148 — `{t('panelSub')}`
- l.154 — `{t('panelTitle')}`
- l.158 — `{t('panelParagraph')}`
- l.163 — `{t('specsTitle')}`
- l.189 — `{/* Référence Prestige : Accor Arena */}`
- l.208 — `{t('arenaBadge')}`
- l.214 — `{t('arenaTitle')}`
- l.226 — `{t('arenaCta')}`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.47 — `{/* International Workshop Hero */}`
- l.81 — `{content.hero?.meta || t('heroMeta')}`
- l.94 — `{heroTitle.substring(heroTitle.lastIndexOf(' ') + 1)}`
- l.132 — `{/* Global Key Highlights */}`
- l.156 — `{/* Workshop Content & Curriculum */}`
- l.232 — `{/* Right Side Visual Cards — Real Workshop Photos */}`
- l.280 — `{/* Accommodation & Location Info */}`
- l.328 — `{/* Bottom Inscription Box */}`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.74 — `{/* Hero Header */}`
- l.112 — `{content.hero?.meta || t('heroMeta')}`
- l.125 — `{heroTitle.substring(heroTitle.lastIndexOf(' ') + 1)}`
- l.162 — `{/* Intro */}`
- l.174 — `{content.sections_data?.overview?.badge || t('overviewBadge')}`
- l.178 — `{content.sections_data?.overview?.title || t('overviewTitle')}`
- l.181 — `{content.sections_data?.overview?.description || t('overviewDescription')}`
- l.186 — `{/* Ateliers Dynamiques & Adaptatifs */}`
- l.210 — `{t('workshopFallbackLabel')}`
- l.238 — `{/* Formule personnalisée CTA */}`
- l.242 — `{t('customBadge')}`
- l.245 — `{t('customTitle')}`
- l.248 — `{t('customDescription')}`
- l.252 — `{t('customCta')}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.81 — `{/* JSON-LD : un VideoObject par programme TV (rich results Google Vidéo) */}`
- l.102 — `{/* Hero Header */}`
- l.119 — `{t('breadcrumbHome')}`
- l.136 — `{content.hero?.meta || t('heroMeta')}`
- l.165 — `{/* Video Player Box */}`
- l.168 — `{/* Video Selector Tabs */}`
- l.193 — `{/* Main Video Screen with HUD Frame */}`
- l.209 — `{t('videoFallback')}`
- l.227 — `{t('videoFallback')}`
- l.232 — `{/* Video Information */}`
- l.245 — `{t('broadcastBadge')}`
- l.253 — `{/* Real CUC Videos & Documentaries Grid */}`
- l.258 — `{t('docusBadge')}`
- l.261 — `{t('docusTitle')}`
- l.264 — `{t('docusHint')}`
- l.300 — `{/* Video Player Modal */}`
- l.335 — `{/* Médias & Réseaux Sociaux */}`
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
- l.161 — `{/* Lightbox Modal */}`

### `src\app\(site)\[locale]\visite-virtuelle\page.tsx`

- l.35 — `{t('loading3d')}`
- l.86 — `{/* Breadcrumb */}`
- l.89 — `{t('breadcrumbHome')}`
- l.93 — `{t('breadcrumbCampus')}`
- l.101 — `{/* Page Header */}`
- l.109 — `{content.hero?.badge || t('pageTag')}`
- l.124 — `{content.hero?.title || t('pageTitle')}{' '}`
- l.134 — `{content.hero?.subtitle || t('pageSubtitle')}`
- l.171 — `{t('ctaRendezVous')}`
- l.177 — `{/* Interactive Viewer: either 360 Player or 3D Campus Plan */}`
- l.188 — `{/* Key Facts and Practical Info */}`
- l.195 — `{t('factsTitle1')}`
- l.199 — `{t('factsBody1')}`
- l.207 — `{t('factsTitle2')}`
- l.211 — `{t('factsBody2')}`
- l.219 — `{t('factsTitle3')}`
- l.223 — `{t('factsBody3')}`

### `src\components\layout\Footer.tsx`

- l.17 — `{/* Top Hazard Accent Line */}`
- l.20 — `{/* Main Footer Container */}`
- l.23 — `{/* Brand, Mission & Adresses */}`
- l.26 — `{/* Lignes Directes & Réseaux */}`
- l.30 — `{/* Quick Nav Matrix */}`
- l.33 — `{/* Cinematic Credits Footer Bar & Floating Top Button */}`

### `src\components\layout\MobileStickyCTA.tsx`

- l.70 — `{/* Quick Call Button */}`

### `src\components\layout\Navbar.tsx`

- l.80 — `{/* Main Bar */}`
- l.88 — `{/* Logo CUC */}`
- l.113 — `{/* Desktop Navigation Links — séquence unique ordonnée par ’order’ */}`
- l.159 — `{/* Right Action CTA & Quick Tools */}`
- l.162 — `{/* Mobile Menu Toggle Button */}`
- l.195 — `{/* Mobile Drawer */}`

### `src\components\layout\RootShell.tsx`

- l.102 — `{/* Lien d'évitement — libellé localisé (client, catalogue ’common’) */}`
- l.106 — `{/* Pont d'aperçu live du Cockpit — inerte hors iframe. */}`
- l.108 — `{/* Édition en place (Mode Studio) — inerte hors iframe. */}`
- l.110 — `{/* Speculation Rules API — préchargement/prérendu instantané. */}`
- l.113 — `{/* Données structurées schema.org */}`

### `src\components\layout\SkipLink.tsx`

- l.20 — `{t('skipToContent')}`

### `src\components\layout\footer-sections\FooterBrandAndSites.tsx`

- l.23 — `{/* Brand & Mission */}`
- l.69 — `{t('certified')}`
- l.72 — `{t('funding')}`
- l.94 — `{/* Adresses & Implantations */}`
- l.97 — `{t('sitesTitle')}`
- l.104 — `{t('mainCampus')}`
- l.108 — `{t('mainCampusAddress')}`
- l.111 — `{t('region')}`
- l.137 — `{t('idfHub')}`
- l.140 — `{t('idfStudio')}`
- l.143 — `{t('idfAddress')}`
- l.161 — `{t('productionAgency')}`
- l.164 — `{t('productionDesc')}`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.43 — `{/* Cinematic Credits Footer Bar */}`
- l.82 — `{/* Floating Back To Top Button */}`

### `src\components\layout\footer-sections\FooterDirectContacts.tsx`

- l.43 — `{/* Contacts Directs */}`
- l.46 — `{t('directLines')}`
- l.82 — `{/* Socials & Networks — pilotés par site_social_links */}`
- l.85 — `{t('networksTitle')}`
- l.89 — `{t('networksText')}`

### `src\components\layout\navbar\NavActionsBar.tsx`

- l.43 — `{/* Quick Official Social Icons — pilotés par site_social_links */}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.128 — `{/* Mobile Brand Header */}`

### `src\components\sections\ApplicationModal.tsx`

- l.142 — `{/* Tactical Crosshair Corners */}`
- l.144 — `{/* Top Warning Bar */}`
- l.147 — `{/* Close button */}`
- l.158 — `{/* Header */}`
- l.176 — `{t('titleLead')}`
- l.180 — `{t('intro')}`
- l.184 — `{/* Profile Selection Tabs */}`
- l.201 — `{/* Form */}`
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

- l.38 — `{/* Subtle Anamorphic Glow */}`
- l.42 — `{/* Header Principal */}`
- l.57 — `{t('hallOfFame.badge')}`
- l.62 — `{t('hallOfFame.title')}`
- l.66 — `{t('hallOfFame.subtitle')}`
- l.70 — `{/* SECTION VEDETTE : LES ACTEURS ET COMÉDIENS DOUBLÉS */}`
- l.73 — `{/* SECTION FILMS : LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC */}`
- l.77 — `{/* Modale Acteurs doublés */}`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.31 — `{/* Standard téléphonique */}`
- l.36 — `{t('standardTitle')}`
- l.54 — `{t('directPhone')}`
- l.69 — `{t('email')}`
- l.84 — `{t('hours')}`
- l.89 — `{t('hoursValue')}`
- l.91 — `{t('hoursSaturday')}`
- l.116 — `{/* Implantations */}`
- l.119 — `{t('sitesTitle')}`
- l.124 — `{t('mainCampus')}`
- l.127 — `{t('mainCampusAddress')}`
- l.130 — `{t('mainCampusRegion')}`
- l.155 — `{t('idfHub')}`
- l.158 — `{t('idfStudio')}`
- l.161 — `{t('idfAddress')}`
- l.168 — `{t('production')}`
- l.171 — `{t('productionDesc')}`
- l.176 — `{/* Qualiopi Guarantee */}`
- l.182 — `{/* Official Entities Logos */}`
- l.185 — `{t('entitiesTitle')}`

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
- l.204 — `{t('labelExperience')}`
- l.223 — `{t('labelMessage')}`
- l.253 — `{isSubmitting ? t('submitting') : t('submit')}`
- l.258 — `{t('consent')}`

### `src\components\sections\contact\ContactHeroSection.tsx`

- l.37 — `{t('breadcrumbHome')}`
- l.48 — `{t('locationLabel')}`
- l.60 — `{t('titleLine')}{' '}`
- l.70 — `{heroData?.subtitle || t('subtitle')}`

### `src\components\sections\events\EventsPartnersBanners.tsx`

- l.12 — `{/* ILS NOUS ONT FAIT CONFIANCE (BANDES LOGOS) */}`
- l.20 — `{t('partnersTitle')}`
- l.24 — `{/* Authentic Brand Logo Strips directly from the live site */}`
- l.57 — `{/* BANDES AFFICHES DE FILMS */}`
- l.65 — `{t('cinemaTitle')}`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.116 — `{evt.cta_text || t('learnMore')}`
- l.146 — `{/* 1. SPECTACLES (Fallback) */}`
- l.187 — `{/* 2. ANIMATIONS */}`
- l.230 — `{/* 3. TEAM BUILDING */}`

### `src\components\sections\films\CucFilmsShowcase.tsx`

- l.122 — `{tTeam('showcaseTag')}`

### `src\components\sections\formation\FormationDisciplinesExplorer.tsx`

- l.58 — `{t('disciplines.badge')}`
- l.61 — `{t('disciplines.title')}`
- l.66 — `{/* Interactive Discipline Explorer */}`
- l.68 — `{/* Navigation List on Left */}`
- l.103 — `{/* Discipline Detail Card on Right with Real Image */}`
- l.106 — `{/* Real Image of Discipline */}`
- l.130 — `{t('disciplines.cinemaContextLabel')}`
- l.137 — `{t('disciplines.equipmentLabel')}`

### `src\components\sections\formation\FormationFormulesSection.tsx`

- l.81 — `{/* Carte 1 : Formule Découverte & Sélection */}`
- l.92 — `{decouverte?.step_badge || tf('step1Badge')}`
- l.98 — `{decouverte?.duration_badge || tf('step1Hours')}`
- l.106 — `{decouverte?.title || tf('step1Title')}`
- l.112 — `{decouverte?.description || tf('step1Desc')}`
- l.143 — `{tf('step1ProgramTitle')}`
- l.169 — `{/* Carte 2 : Cursus Pro Longue Durée */}`
- l.181 — `{pro?.step_badge || tf('step2Badge')}`
- l.187 — `{pro?.duration_badge || tf('step2Hours')}`
- l.195 — `{pro?.title || tf('step2Title')}`
- l.201 — `{pro?.description || tf('step2Desc')}`
- l.235 — `{tf('step2ProgramTitle')}`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.27 — `{/* Page Header Hero */}`
- l.42 — `{/* Breadcrumb */}`
- l.45 — `{t('hero.breadcrumbHome')}`
- l.49 — `{t('hero.breadcrumbCurrent')}`
- l.73 — `{heroData?.meta || 'AFDAS 100% • FRANCE TRAVAIL'}`
- l.94 — `{heroData?.subtitle || t('hero.subtitle')}`
- l.136 — `{/* Chiffres clés & indicateurs */}`
- l.145 — `{t('stats.practiceLabel')}`
- l.154 — `{t('stats.graduatesLabel')}`
- l.163 — `{t('stats.satisfactionLabel')}`
- l.169 — `{t('stats.since')}`
- l.172 — `{t('stats.referenceLabel')}`

### `src\components\sections\formation\FormationPedagogyModalities.tsx`

- l.38 — `{/* Calendrier Prochaines Sessions */}`
- l.43 — `{tp('sessionsTitle')}`
- l.54 — `{statuses[session.status] ?? ''}`
- l.60 — `{tp('registrationNote')}`
- l.64 — `{/* Conditions d'accès */}`
- l.69 — `{tp('admissionTitle')}`
- l.96 — `{/* Financement & Prise en Charge */}`
- l.102 — `{tp('fundingTitle')}`
- l.127 — `{/* Bottom CTA */}`
- l.131 — `{t('cta.title')}`
- l.134 — `{t('cta.text')}`
- l.142 — `{t('ctaApplyPro')}`
- l.146 — `{t('cta.contact')}`

### `src\components\sections\hall-of-fame\CelebrityDetailsModal.tsx`

- l.32 — `{/* Header */}`
- l.37 — `{t('celebrityModal.title')}`
- l.49 — `{/* Content */}`
- l.52 — `{/* Photo */}`
- l.63 — `{/* Info */}`
- l.71 — `{/* Doublure cascades - Uniquement si une doublure dédiée est renseignée */}`
- l.75 — `{t('celebrityModal.doublesLabel')}`
- l.83 — `{/* Scènes d'action */}`
- l.87 — `{t('celebrityModal.scenesLabel')}`
- l.95 — `{/* Films */}`
- l.98 — `{t('celebrityModal.filmsLabel')}`
- l.112 — `{/* IMDb Button */}`
- l.131 — `{/* Footer */}`
- l.137 — `{t('celebrityModal.close')}`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.74 — `{/* Section Header */}`
- l.80 — `{t('hallOfFame.actorsBadge')}`
- l.84 — `{t('hallOfFame.actorsTitle')}`
- l.87 — `{t('hallOfFame.actorsIntro')}`
- l.93 — `{/* Celebrities Grid with Real Portraits & Clean Cards */}`
- l.101 — `{/* Photo Portrait Container */}`
- l.112 — `{/* IMDb Direct Link */}`
- l.125 — `{/* Body Content */}`
- l.132 — `{/* Stunt Double Reference - Uniquement si une doublure dédiée est renseignée */}`
- l.140 — `{/* Stunt Specialty */}`
- l.148 — `{/* Key Productions Badges */}`
- l.151 — `{t('hallOfFame.filmsLabel')}`
- l.165 — `{/* Action Bar */}`
- l.186 — `{/* Bottom Border Accent */}`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.56 — `{/* Header */}`
- l.61 — `{t('filmModal.title')}`
- l.73 — `{/* Content */}`
- l.76 — `{/* Poster */}`
- l.101 — `{/* Details */}`
- l.105 — `{movie.year}{movie.director ? ’ • ${t('filmModal.directedBy', { name: movie.director })}’ : ''}`
- l.112 — `{/* Description factuelle de la fiche film */}`
- l.119 — `{/* Doublures */}`
- l.123 — `{t('filmModal.doublesLabel')}`
- l.138 — `{/* Équipe CUC */}`
- l.142 — `{t('filmModal.teamLabel')}`
- l.216 — `{/* Liens externes */}`
- l.259 — `{/* Footer */}`
- l.265 — `{t('filmModal.close')}`

### `src\components\sections\home\HomeAboutSection.tsx`

- l.64 — `{/* Background Soft Glow Layer */}`
- l.69 — `{/* Visual Side: 2.5D Multi-Plane Portrait Composition */}`
- l.71 — `{/* Layer A: Background Shadow Frame & Photo (Deep plane) */}`
- l.85 — `{/* Layer B: Founder Quote Card (Floating mid-plane) */}`
- l.92 — `{t('founderLabel')}`
- l.119 — `{/* Layer C: Year Tag Badge (Floating foreground plane) */}`
- l.130 — `{/* Editorial Content Side */}`
- l.168 — `{/* 4 Pillars Grid with Staggered Parallax Wave */}`
- l.193 — `{/* CTAs */}`

### `src\components\sections\home\HomePartnersSection.tsx`

- l.96 — `{/* Background Soft Glow */}`
- l.135 — `{/* Staggered Wave Parallax Grid */}`
- l.164 — `{roles[partner.roleKey] ?? ''}`

### `src\components\sections\home\HomeQualiopiSection.tsx`

- l.46 — `{/* Ambient Certification Glow */}`
- l.56 — `{/* Floating Accreditation Badge */}`
- l.104 — `{t('cta')}`

### `src\components\sections\home\HomeSocialSection.tsx`

- l.72 — `{/* Ambient Depth Halo */}`
- l.102 — `{t('handle')}`
- l.126 — `{t('join')}`
- l.131 — `{/* Rangée de logos seuls — l'envie de cliquer vient de l'icône, pas du texte */}`
- l.156 — `{/* Instagram 3D Spatialized Triptyque */}`
- l.177 — `{postCopy[idx]?.tag ?? ''}`
- l.182 — `{postCopy[idx]?.title ?? ''}`
- l.185 — `{postCopy[idx]?.desc ?? ''}`

### `src\components\sections\home\HomeTournagesSection.tsx`

- l.144 — `{/* Cinematic Golden Ambience Beam */}`
- l.151 — `{/* Top Header */}`
- l.163 — `{t('teamTag')}`
- l.191 — `{/* Studio Card with 3 Pillars & Production Poster Showcase */}`
- l.195 — `{/* Left Column: 3 Pillars */}`
- l.203 — `{t('pillar1Desc')}`
- l.213 — `{t('pillar2Desc')}`
- l.223 — `{t('pillar3Desc')}`
- l.230 — `{t('ctaProduction')}`
- l.235 — `{t('ctaCatalog')}`
- l.279 — `{/* Fiche détaillée — même modale que le showcase des films. */}`

### `src\components\sections\home\HomeVirtualTourSection.tsx`

- l.34 — `{/* Background Volumetric Beam */}`
- l.44 — `{/* Text Side */}`
- l.54 — `{t('tag')}`
- l.84 — `{t('installationsCta')}`
- l.90 — `{/* 3D Portal Window Side */}`
- l.93 — `{/* Sliding Internal 360 Photo (Layer Depth) */}`
- l.104 — `{/* Floating Compass Center HUD */}`
- l.112 — `{t('hudTitle')}`
- l.115 — `{t('hudHint')}`

### `src\components\sections\partenaires\PartenairesCtaSection.tsx`

- l.18 — `{t('ctaBadge')}`
- l.21 — `{t('ctaTitle')}`
- l.24 — `{t('ctaBody')}`
- l.28 — `{t('ctaButton')}`

### `src\components\sections\partenaires\PartenairesGridSection.tsx`

- l.98 — `{/* Section Partenaires Cinéma additionnels configurés dans le Cockpit */}`
- l.104 — `{t('cinemaHeading')}`
- l.134 — `{t('productionBadge')}`
- l.144 — `{localized(partner).description}`
- l.168 — `{/* Section Partenaires Additionnels (Équipements, Institutions, Médias) */}`
- l.174 — `{t('specializedHeading')}`
- l.218 — `{localized(partner).description}`
- l.242 — `{/* Groupes de partenaires statiques certifiés */}`
- l.262 — `{/* Logo Box */}`
- l.282 — `{localized(partner).role}`
- l.285 — `{localized(partner).category}`
- l.294 — `{localized(partner).description}`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.43 — `{t('breadcrumbHome')}`
- l.54 — `{t('heroMeta')}`
- l.66 — `{title.substring(title.lastIndexOf(' ') + 1)}`

### `src\components\sections\stages\StagesGridSection.tsx`

- l.189 — `{renderBadge(stage.badge)}`
- l.212 — `{renderIcon(detail.icon)}`
- l.240 — `{/* Right Photo Preview */}`

### `src\components\sections\stages\StagesHeroSection.tsx`

- l.23 — `{/* Hero Header */}`
- l.40 — `{t('hero.breadcrumbHome')}`
- l.51 — `{t('hero.meta')}`
- l.70 — `{heroData?.subtitle || t('hero.subtitle')}`
- l.75 — `{/* Header Visual Banner from original site */}`

### `src\components\sections\team\TeamBannersSection.tsx`

- l.29 — `{t('teamBannersBadge')}`
- l.32 — `{t('teamBannersTitle')}`
- l.40 — `{/* Real CUC Banners */}`

### `src\components\sections\team\TeamHeroSection.tsx`

- l.47 — `{t('hero.breadcrumbHome')}`
- l.63 — `{title.split('&')[0]}`
- l.95 — `{/* Cinematic Textured CUC Emblem Showcase */}`
- l.109 — `{t('hero.emblemLabel')}`

### `src\components\sections\team\TeamProductionGalleries.tsx`

- l.21 — `{/* 1. CUC PROD — LE STUDIO ET LA SALLE (Grille 3x2) */}`
- l.26 — `{t('galleries.studioBadge')}`
- l.29 — `{t('galleries.studioTitle')}`
- l.59 — `{/* 2. CUC PROD — LES CASCADEURS */}`
- l.64 — `{t('galleries.doublesBadge')}`
- l.67 — `{t('galleries.doublesTitle')}`
- l.98 — `{/* 3. CUC PROD — LES ÉQUIPEMENTS (Grille aérée et organisée) */}`
- l.103 — `{t('galleries.equipmentBadge')}`
- l.106 — `{t('galleries.equipmentTitle')}`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.24 — `{t('services.badge')}`
- l.27 — `{t('services.title')}`
- l.30 — `{t('services.intro')}`
- l.45 — `{/* Callout contact production */}`
- l.49 — `{t('services.contactTitle')}`
- l.52 — `{t('services.contactIntro')}`
- l.58 — `{t('services.coordinatorValue')}`
- l.74 — `{t('services.cta')}`

### `src\components\sections\team\teamGalleries.data.ts`

- l.14 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/006.jpg', title: 'Studio CUC', category: 'Le Studio et la Salle' }`
- l.25 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-203-e1671702096970.jpg', title: 'Cascadeurs CUC', category: 'Les Cascadeurs' }`
- l.36 — `{ src: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/MG_5464-1.jpg', title: 'Équipements CUC', category: 'Les Équipements' }`

### `src\components\sections\visite\VisiteAccessTransport.tsx`

- l.19 — `{t('accessBadge')}`
- l.22 — `{t('accessTitle')}`
- l.25 — `{t('accessIntro')}`
- l.33 — `{t('accessCarLabel')}`
- l.35 — `{t('accessCarBody')}`
- l.43 — `{t('accessTrainLabel')}`
- l.45 — `{t('accessTrainBody')}`
- l.53 — `{t('accessPlaneLabel')}`
- l.55 — `{t('accessPlaneBody')}`
- l.61 — `{/* Adresse & Contact Box */}`
- l.65 — `{t('coordinatesTitle')}`
- l.71 — `{t('addressLabel')}`
- l.75 — `{t('accessAddress')}`
- l.98 — `{t('standardLabel')}`
- l.100 — `{t('phoneLabel')}{' '}`
- l.108 — `{t('emailLabel')}{' '}`
- l.119 — `{t('idfLabel')}`
- l.121 — `{t('idfValue')}`
- l.129 — `{t('accessCta')}`

### `src\components\sections\visite\VisiteFacilitiesDetail.tsx`

- l.102 — `{t('facilitiesTag')}`
- l.105 — `{t('facilitiesTitle')}`
- l.108 — `{t('facilitiesSubtitle')}`
- l.112 — `{/* Selector Grid / Detail */}`
- l.114 — `{/* Left Selector List */}`
- l.135 — `{String(index + 1).padStart(2, '0')}`
- l.155 — `{/* Right Detail Display */}`
- l.183 — `{t('facilitiesSpecsLabel')}`
- l.200 — `{t('facilitiesComplianceLabel')}`

### `src\components\sections\visite\VisiteHeroSection.tsx`

- l.29 — `{/* Hero Header */}`
- l.46 — `{t('hero.breadcrumbHome')}`
- l.66 — `{t('hero.titleLead')}{' '}`
- l.76 — `{hero?.subtitle || t('hero.subtitle')}`
- l.104 — `{t('hero.ctaPlan3D')}`
- l.111 — `{/* Chiffres Clés du Site */}`

### `src\components\sections\visite\VisitePhotoGallery.tsx`

- l.26 — `{t('galleryBadge')}`
- l.29 — `{t('galleryTitle')}`
- l.32 — `{t('gallerySubtitle')}`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.76 — `{/* Top Info Bar */}`
- l.91 — `{/* Domain info */}`
- l.99 — `{/* Main Grid: Map / Radar Viewer + Multi-App Launchers */}`
- l.101 — `{/* Left Column: Interactive Map / Radar View (8 cols) */}`
- l.104 — `{/* View Selector & Mode Switch */}`
- l.131 — `{/* Copy GPS button */}`
- l.142 — `{t('copied')}`
- l.154 — `{/* View Content Area */}`
- l.165 — `{/* Tactical Target Overlay */}`
- l.179 — `{/* Adresse badge */}`
- l.196 — `{/* Quick Interconnectivity Buttons */}`
- l.200 — `{/* Right Column: Travel Times & Step-by-Step Directions (4 cols) */}`

### `src\components\ui\LightboxModal.tsx`

- l.72 — `{/* Top Header Bar */}`
- l.88 — `{'• ' + currentImage.category}`
- l.105 — `{/* Main Image Viewport */}`
- l.110 — `{/* Left Arrow */}`
- l.120 — `{/* The Image */}`
- l.132 — `{/* Right Arrow */}`
- l.143 — `{/* Bottom Caption Bar */}`
- l.152 — `{t('navHint')}`

### `src\components\ui\ParallaxHero.tsx`

- l.45 — `{ caption: string; sub: string; badge: string; tag: string }`
- l.150 — `{/* 1. Deep 3D Background Layer: Photography + Ken-Burns + Organic Inertial Tilt */}`
- l.208 — `{/* Ken-Burns slow breathing scale */}`
- l.228 — `{/* Cinematic Vignettes */}`
- l.234 — `{/* 2. Tech / Mech & Organic 3D Depth Layer (absorbs wheel & finger saccades) */}`
- l.242 — `{/* 3. Subtle Location & Campus Header Overlay */}`
- l.245 — `{/* 4. Central Text Content: Rock-Solid Focal Plane (NO text displacement!) */}`
- l.251 — `{/* Refined Pill Badge */}`
- l.264 — `{/* Clean Editorial Title */}`
- l.284 — `{/* Dynamic Subtitle with smooth crossfade */}`
- l.296 — `{heroData?.subtitle || activeCopy?.sub || ''}`
- l.301 — `{/* Key Metrics Cards */}`
- l.325 — `{/* Action CTAs */}`
- l.358 — `{tHero('ctaStuntTeam')}`
- l.365 — `{/* 5. Modern Segmented Slide Navigation & Smooth Scroll Cue */}`

### `src\components\ui\TacticalButton.tsx`

- l.46 — `{...props}`

### `src\components\ui\VirtualTourViewer.tsx`

- l.59 — `{/* HUD Top Control Bar */}`
- l.67 — `{t('viewerTitle')}`
- l.74 — `{/* Actions */}`
- l.125 — `{/* Navigation Helper Banner */}`
- l.133 — `{t('navHelpBody2')}`
- l.140 — `{t('hideLabel')}`
- l.145 — `{/* The 360 Virtual Tour iFrame Container */}`

### `src\components\ui\campus-map\CampusAppLaunchers.tsx`

- l.21 — `{/* Google Maps */}`
- l.35 — `{/* Apple Maps */}`
- l.49 — `{/* Waze */}`
- l.63 — `{/* SNCF Connect */}`

### `src\components\ui\campus-map\CampusRadarView.tsx`

- l.25 — `{/* Real Aerial Orthophoto HD Zoom 19 (IGN/ESRI) */}`
- l.35 — `{/* Dark vignetting gradient */}`
- l.40 — `{/* Grid Lines Background */}`
- l.50 — `{/* Radar Concentric Rings */}`
- l.56 — `{/* Radar Crosshairs */}`
- l.61 — `{/* Top HUD Telemetry & Mode Switch */}`
- l.82 — `{/* Radar Hotspot Markers */}`
- l.112 — `{/* Marker Tooltip */}`
- l.126 — `{/* Selected POI Details Panel */}`

### `src\components\ui\campus-map\CampusTravelPlanner.tsx`

- l.68 — `{t('travelTitle')}`
- l.72 — `{t('travelBadge')}`
- l.76 — `{/* City Tabs */}`
- l.94 — `{/* Selected Route Info Box */}`
- l.96 — `{/* Train Card */}`
- l.116 — `{/* Car Card */}`
- l.137 — `{/* Practical Guidance */}`
- l.140 — `{t('accessInfoTitle')}`
- l.156 — `{/* Bottom Call to Action */}`
- l.165 — `{isCopied ? t('addressCopied') : t('copyAddress')}`

### `src\components\ui\parallax-hero\HeroHudOverlay.tsx`

- l.16 — `{/* Discreet Location Indicator */}`
- l.24 — `{/* Google Maps Quick Access Pill */}`

### `src\components\ui\parallax-hero\HeroTechDepth.tsx`

- l.75 — `{/* 1. Volumetric Organic Halo: Soft interactive warm beam */}`
- l.83 — `{/* 2. Midground Tech/Mech Precision Geometry (Perspective Grid + Optics) */}`
- l.92 — `{/* Subtle Cyber/Cinematic Reticle Circle in center */}`
- l.94 — `{/* Pulsing Concentric Range Ring */}`
- l.99 — `{/* Perspective Horizon Lines (fine mech grid) */}`
- l.118 — `{/* Precision Sensor Corner Brackets (Cinematic viewfinder markers) */}`
- l.128 — `{/* 3. Foreground Floating Stereoscopic Optical Motes (Multi-depth embers) */}`

### `src\components\ui\parallax\StudioGlobalAtmosphere.tsx`

- l.40 — `{/* 1. Subtle Global Vertical Telemetry Guide Lines (Studio Film Margins) */}`
- l.47 — `{/* 2. Soft Ambient Lighting Beacons that shift with scroll depth */}`
- l.61 — `{/* 3. Floating Micro-Particles rising with scroll inertia */}`

## 4. CODÉ EN DUR — dette (ne suit ni la langue ni le Cockpit)

### `src\app\(site)\[locale]\animations-airbag-parkour\page.tsx`

- l.90 — `{heroTitle.split('&')[0]} &amp;{' '}`
- l.168 — `CUC EVENTS ANIMATIONS`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\[slug]\CoachDetailClient.tsx`

- l.118 — `role`
- l.277 — `ACCUEIL`
- l.352 — `Allociné`
- l.365 — `Instagram`
- l.377 — `Portfolio`
- l.410 — `Trajectoire & Philosophie`
- l.618 — `Autres Coordinateurs & Instructeurs`

### `src\app\(site)\[locale]\equipe-cascadeurs-pro\page.tsx`

- l.146 — `{heroTitle.substring(0, heroTitle.lastIndexOf(' '))}{' '}`

### `src\app\(site)\[locale]\error.tsx`

- l.39 — `Campus Univers Cascades`

### `src\app\(site)\[locale]\opengraph-image.tsx`

- l.54 — `CAMPUS UNIVERS CASCADES`
- l.98 — `11 000 M²`
- l.100 — `CUC TOWER 21 M`

### `src\app\(site)\[locale]\spectacles-cascadeurs-yamakasi\page.tsx`

- l.90 — `{heroTitle.split('&')[0]} &amp;{' '}`
- l.220 — `retransmis sur écrans géants.`

### `src\app\(site)\[locale]\stunt-workshop-cuc\page.tsx`

- l.64 — `HOME / ACCUEIL`
- l.92 — `{heroTitle.substring(0, heroTitle.lastIndexOf(' '))}{' '}`
- l.163 — `PROGRAMME INTENSIF`
- l.169 — `INTERNATIONAL STUNT PERFORMER TRAINING`
- l.175 — `Taught in both English and French by high-profile action coordinators with credits on`
- l.176 — `John Wick 4`
- l.176 — `Fast & Furious`
- l.176 — `, and`
- l.176 — `James Bond`
- l.184 — `FIGHT CHOREOGRAPHY & HONG KONG ACTION DESIGN`
- l.186 — `Camera angles, punch-selling techniques, multi-opponent combat drills, and weapons flow.`
- l.194 — `WIREWORK & 3D RIGGING`
- l.196 — `Harness flights, deadman drops, air-ramps, and superhero wall-running stunts.`
- l.204 — `HIGH FALLS UP TO 21 METERS`
- l.206 — `Defenestrations, backwards drops, and high-impact landing on giant calibrated airbags.`
- l.214 — `FULL BODY BURN (HUMAN TORCH)`
- l.216 — `Pyro safety protocols, protective Nomex suits, fire retardant gels, and emergency procedures.`
- l.224 — `SHOWREEL ACTION PRODUCTION`
- l.226 — `Professional cinematic camera crew shoots your dynamic action scene at the end of the camp.`
- l.290 — `Le Cateau-Cambrésis (59360)`
- l.292 — `and 1 hour from Lille or Brussels (Belgium).`
- l.295 — `Airport shuttles and train station pickups available upon booking.`
- l.305 — `Stay on-site in student housing facilities (90 beds total). All three meals`
- l.307 — `specifically calibrated for high athletic performance.`
- l.310 — `Single or shared rooms with high-speed Wi-Fi and laundry facilities.`
- l.320 — `Graduates receive the official CUC Workshop Certificate detailing all hours and disciplines completed during the session.`
- l.323 — `Includes raw 4K footage of your choreographed action scenes.`
- l.340 — `READY TO ELEVATE YOUR ACTION CAREER?`
- l.343 — `Spaces are limited to ensure maximum individual camera time and safety coaching.`
- l.344 — `Apply today to secure your spot for the upcoming international session.`
- l.352 — `Apply for International Workshop`
- l.356 — `Contact Admissions`

### `src\app\(site)\[locale]\team-building-cascades\page.tsx`

- l.91 — `ACCUEIL`
- l.95 — `CUC EVENTS`
- l.123 — `{heroTitle.substring(0, heroTitle.lastIndexOf(' '))}{' '}`

### `src\app\(site)\[locale]\videos-cascadeur\page.tsx`

- l.147 — `{heroTitle.split('&')[0]} &amp;{' '}`
- l.328 — `allowFullScreen`

### `src\components\layout\MobileStickyCTA.tsx`

- l.81 — `’ imbriqué dans un ’`
- l.82 — `éléments interactifs, ce qui brouille le clic et la navigation au`

### `src\components\layout\Navbar.tsx`

- l.65 — `navigation.items`
- l.105 — `CAMPUS UNIVERS CASCADES`
- l.108 — `Stunt Academy & Team • Est. 2008`

### `src\components\layout\footer-sections\FooterCreditsBar.tsx`

- l.46 — `{legal.copyright.replace('{year}', String(year ?? 2026))}`

### `src\components\layout\navbar\NavMobileDrawer.tsx`

- l.141 — `CAMPUS UNIVERS CASCADES`
- l.144 — `Stunt Academy & Team`
- l.163 — `Le Cateau-Cambrésis (59)`

### `src\components\sections\ApplicationModal.tsx`

- l.366 — `contact@campus-universcascades.com`

### `src\components\sections\contact\ContactCoordinatesSidebar.tsx`

- l.75 — `contact@campus-universcascades.com`
- l.148 — `Google Maps`
- l.197 — `CAMPUS CUC`
- l.210 — `CUC EVENTS`
- l.223 — `CUC STUNT TEAM`

### `src\components\sections\contact\ContactForm.tsx`

- l.193 — `{t(’options.${programId}’)}`

### `src\components\sections\events\EventsHeroSection.tsx`

- l.49 — `ACCUEIL`
- l.70 — `{title.split(':')[0]} :{' '}`

### `src\components\sections\events\EventsPartnersBanners.tsx`

- l.77 — `priority`

### `src\components\sections\events\EventsPillarsSection.tsx`

- l.136 — `Campus Univers Cascades`
- l.203 — `SENSATIONS FORTES GRAND PUBLIC`

### `src\components\sections\formation\FormationHeroSection.tsx`

- l.142 — `720H`

### `src\components\sections\hall-of-fame\CelebrityDoublesGallery.tsx`

- l.179 — `IMDb`

### `src\components\sections\hall-of-fame\FilmDetailsModal.tsx`

- l.177 — `c.toLowerCase().includes(movie.title.toLowerCase())`
- l.226 — `IMDb`
- l.238 — `AlloCiné`

### `src\components\sections\partenaires\PartenairesHeroSection.tsx`

- l.64 — `{title.substring(0, title.lastIndexOf(' '))}{' '}`

### `src\components\sections\team\TeamBannersSection.tsx`

- l.35 — `Retrouvez les affiches des productions françaises et internationales`
- l.36 — `sur lesquelles nos équipes sont intervenues. Cliquez sur une affiche pour la voir en haute résolution.`
- l.59 — `AFFICHE HD`

### `src\components\sections\team\TeamProductionServices.tsx`

- l.67 — `contact@campus-universcascades.com`

### `src\components\sections\visite\VisiteAccessTransport.tsx`

- l.73 — `CAMPUS UNIVERS CASCADES`
- l.91 — `Google Maps`
- l.113 — `contact@campus-universcascades.com`
- l.123 — `92230 Gennevilliers`

### `src\components\ui\InteractiveCampusMap.tsx`

- l.82 — `CAMPUS UNIVERS CASCADES`
- l.87 — `LAT 50.0909° N • LON 3.5374° E`
- l.172 — `70 Rue Faidherbe, 59360 Le Cateau-Cambrésis`
- l.182 — `70 Rue Faidherbe • 59360 Le Cateau-Cambrésis`

### `src\components\ui\LightboxModal.tsx`

- l.79 — `{currentIndex + 1} / {images.length}`
- l.128 — `priority`

### `src\components\ui\ParallaxHero.tsx`

- l.278 — `Cascades`

### `src\components\ui\VirtualTourViewer.tsx`

- l.70 — `LE CATEAU-CAMBRÉSIS`

### `src\components\ui\campus-map\CampusAppLaunchers.tsx`

- l.30 — `Google Maps`
- l.44 — `Apple Maps`
- l.58 — `Waze`
- l.72 — `SNCF Connect`

