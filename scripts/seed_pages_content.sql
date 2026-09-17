-- ==============================================================================
-- CUC — Données Initiales (Seed) : Contenu Détaillé des 15 Pages, Partenaires et Prestations
-- ==============================================================================

-- 1. SEED DES 15 PAGES DU SITE
INSERT INTO public.site_pages (slug, title, meta_title, meta_description, og_image, hero, sections, is_published)
VALUES
(
    '/',
    'Accueil',
    'Campus Univers Cascades | 1ère École de Cascadeurs Professionnels d''Europe',
    'Centre d''entraînement de cascadeurs professionnels fondé en 2008 par Lucas Dollfus. 11 000 m² d''infrastructures dédiées au cinéma d''action, parkour, combat et cascades.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/1-lucas.png',
    '{
        "badge": "PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA",
        "title": "CAMPUS UNIVERS CASCADES",
        "subtitle": "Le plus grand centre européen d''entraînement et de formation professionnelle de cascadeurs pour le cinéma d''action international.",
        "cta_primary_text": "Découvrir la formation pro",
        "cta_primary_link": "/formation-de-cascadeur",
        "cta_secondary_text": "Visite guidée du campus",
        "cta_secondary_link": "/visite-guidee",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[
        {"id": "stat_years", "title": "Années d''expérience", "value": "18 Ans", "description": "Fondé en 2008 par Lucas Dollfus"},
        {"id": "stat_graduates", "title": "Cascadeurs formés", "value": "1200+", "description": "Diplômés en activité dans le monde entier"},
        {"id": "stat_productions", "title": "Productions cinéma", "value": "150+", "description": "Films, séries et blockbusters internationaux"},
        {"id": "stat_surface", "title": "Superficie totale", "value": "11 000 m²", "description": "Infrastructures indoor et outdoor uniques en Europe"}
    ]'::jsonb,
    true
),
(
    'formation-de-cascadeur',
    'Formation Professionnelle',
    'Formation de Cascadeur Pro en 2 Ans | Campus Univers Cascades',
    'Formation professionnelle longue durée de 2 ans. 720h à 800h d''entraînement intensif aux combats, chutes, câblerie, feu et torche humaine.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    '{
        "badge": "CURSUS ÉLITE DIPLÔMANT • 2 ANS",
        "title": "FORMATION PROFESSIONNELLE DE CASCADEUR",
        "subtitle": "Un cursus d''excellence de 720h à 800h sur 2 ans pour maîtriser l''ensemble des disciplines de la cascade physique et cinématographique.",
        "cta_primary_text": "Candidater à la sélection",
        "cta_primary_link": "/stages-cascades-parkour-2",
        "cta_secondary_text": "Télécharger la brochure",
        "cta_secondary_link": "/contact-cuc",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg"
    }'::jsonb,
    '[
        {"id": "duration", "title": "Durée du cursus", "value": "2 Ans", "description": "Cursus structuré de 9 à 10 modules intensifs"},
        {"id": "hours", "title": "Volume pratique", "value": "720h à 800h", "description": "Entraînement en conditions réelles de tournage"},
        {"id": "eligibility", "title": "Sélection d''entrée", "value": "Stage 12 Jours", "description": "Validation obligatoire du stage découverte préalable"}
    ]'::jsonb,
    true
),
(
    'stages-cascades-parkour-2',
    'Stages & Initiations',
    'Stages de Cascade & Parkour | Campus Univers Cascades',
    'Découvrez nos stages de cascade physique, parkour et cascades cinéma ouverts dès 16 ans. Initiations débutants et perfectionnements intensifs.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "STAGES INTENSIFS TOUS NIVEAUX • DÈS 16 ANS",
        "title": "STAGES DE CASCADE & PARKOUR",
        "subtitle": "Du stage découverte immersion 12 jours aux week-ends intensifs, vivez l''entraînement des cascadeurs du cinéma dans des conditions de sécurité absolue.",
        "cta_primary_text": "Voir les prochaines dates",
        "cta_primary_link": "#dates",
        "cta_secondary_text": "Modalités d''inscription",
        "cta_secondary_link": "/contact-cuc",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'stunt-workshop-cuc',
    'Stunt Workshops',
    'Workshops Cascades & Masterclasses Spécialisées | CUC',
    'Workshops techniques avancés pour professionnels : torche humaine, chutes de hauteur, câblerie 3D, maniement d''armes et combats chorégraphiés.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "MASTERCLASSES & ATELIERS TECHNIQUES AVANCÉS",
        "title": "STUNT WORKSHOPS CUC",
        "subtitle": "Sessions de perfectionnement intensif sur des modules techniques ciblés : rigging câbles, torche humaine, parkour d''impact et escrime scénique.",
        "cta_primary_text": "S''inscrire à un atelier",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Consulter les prérequis",
        "cta_secondary_link": "/formation-de-cascadeur",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'equipe-cascadeurs-pro',
    'Équipe & Instructeurs',
    'Instructeurs & Coordinateurs de Cascades | Campus Univers Cascades',
    'Découvrez les formateurs et coordinateurs du CUC : Lucas Dollfus, Jérôme Gaspard et les plus grands professionnels de l''action design.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    '{
        "badge": "L''ÉQUIPE PÉDAGOGIQUE & PROFESSIONNELLE",
        "title": "COORDINATEURS & FORMATEURS CUC",
        "subtitle": "Des professionnels en activité sur les plus grands tournages internationaux pour encadrer chaque étape de votre progression.",
        "cta_primary_text": "Rejoindre la promotion",
        "cta_primary_link": "/formation-de-cascadeur",
        "cta_secondary_text": "Découvrir la filmographie",
        "cta_secondary_link": "/cuc-team-cascadeur",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'cuc-team-cascadeur',
    'CUC Team & Action Design',
    'CUC Stunt Team | Action Design & Cascades Cinéma',
    'L''équipe professionnelle de cascadeurs du CUC au service des réalisateurs et productions internationales.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "ACTION DESIGN & SUPERVISION TOURNAGES",
        "title": "CUC STUNT TEAM",
        "subtitle": "Conception, chorégraphie et exécution de séquences d''action spectaculaires pour le cinéma, les séries et les spectacles vivants.",
        "cta_primary_text": "Engager l''équipe",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Voir nos crédits cinéma",
        "cta_secondary_link": "/#filmographie",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'cuc-events-agence',
    'CUC Events',
    'CUC Events | Agence Événementielle & Spectacles de Cascade',
    'Prestations sensationnelles pour entreprises et collectivités : team building cascade, shows en direct, animations airbag et cascadeurs.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "L''AGENCE ÉVÉNEMENTIELLE DU CUC",
        "title": "CUC EVENTS & PRESTATIONS",
        "subtitle": "Faites vivre à vos équipes et à votre public l''adrénaline du cinéma d''action à travers des événements et shows exclusifs.",
        "cta_primary_text": "Demander un devis événement",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Nos formules entreprises",
        "cta_secondary_link": "/team-building-cascades",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'team-building-cascades',
    'Team Building',
    'Team Building Cascade & Sensations | CUC Events',
    'Offrez à vos collaborateurs un séminaire inoubliable : combats chorégraphiés, chutes sur airbag et dépassement de soi sécurisé.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "SÉMINAIRES & COHÉSION D''ÉQUIPE",
        "title": "TEAM BUILDING CASCADE D''ENTREPRISE",
        "subtitle": "Dépassement de soi, cohésion et adrénaline : glissez-vous dans la peau des cascadeurs professionnels pour une journée mémorable.",
        "cta_primary_text": "Organiser un séminaire",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Voir la brochure",
        "cta_secondary_link": "/cuc-events-agence",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'spectacles-cascadeurs-yamakasi',
    'Spectacles & Shows',
    'Spectacles de Cascadeurs & Yamakasi | CUC Live',
    'Shows live spectaculaires pour parcs d''attractions, festivals et galas : cascades de combat, voltige et parkour acrobatique.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "PERFORMANCES LIVE SPECTACULAIRES",
        "title": "SPECTACLES DE CASCADEURS & YAMAKASI",
        "subtitle": "Des chorégraphies physiques à couper le souffle, adaptées à vos scènes indoor ou outdoor, avec les meilleurs talents de la discipline.",
        "cta_primary_text": "Réserver un spectacle",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Nos réalisations",
        "cta_secondary_link": "/videos-cascadeur",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'animations-airbag-parkour',
    'Animations Airbag',
    'Location Airbag Cascade & Animations Mobiles | CUC',
    'Airbag géant professionnel pour sauts de hauteur et animations grand public sécurisées. Déploiement partout en France.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "INSTALLATION MOBILE SÉCURISÉE",
        "title": "ANIMATIONS AIRBAG GÉANT & PARKOUR",
        "subtitle": "La structure de réception professionnelle utilisée sur les tournages pour faire vivre des sensations uniques à votre public.",
        "cta_primary_text": "Louer l''airbag",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Fiche technique",
        "cta_secondary_link": "/contact-cuc",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'visite-guidee',
    'Visite Guidée',
    'Visite Guidée du Campus CUC | 11 000 m² Dédiés à la Cascade',
    'Venez découvrir les infrastructures du Campus Univers Cascades au Cateau-Cambrésis : dojos, fosse de réception, studio câbles.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "11 000 M² D''INFRASTRUCTURES AU CATEAU-CAMBRÉSIS",
        "title": "VISITE GUIDÉE DU CAMPUS CUC",
        "subtitle": "Explorez l''envers du décor du plus grand complexe d''entraînement de cascadeurs au monde, accessible sur rendez-vous.",
        "cta_primary_text": "Planifier une visite",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Visite virtuelle 3D",
        "cta_secondary_link": "/visite-virtuelle",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'visite-virtuelle',
    'Visite Virtuelle 3D',
    'Visite Virtuelle 3D Interactive du Campus | CUC 3D',
    'Explorez le Campus Univers Cascades en 3D interactive : dojos, fosse, studio câbles et parcours extérieur.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "EXPLORATION 3D EN TEMPS RÉEL",
        "title": "VISITE VIRTUELLE INTERACTIVE 3D",
        "subtitle": "Naviguez librement dans notre complexe d''entraînement et découvrez les espaces techniques réservés aux étudiants et professionnels.",
        "cta_primary_text": "Lancer l''exploration 3D",
        "cta_primary_link": "#3d-scene",
        "cta_secondary_text": "Venir sur place",
        "cta_secondary_link": "/visite-guidee",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'videos-cascadeur',
    'Vidéothèque',
    'Vidéos & Démonstrations de Cascade | CUC TV',
    'Retrouvez les vidéos officielles du Campus Univers Cascades : entraînements, chorégraphies d''action, tournages et démonstrations.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "ACTION REELS & CLIPS OFFICIELS",
        "title": "VIDÉOTHÈQUE & DÉMONSTRATIONS CASCADE",
        "subtitle": "Les moments forts des promotions, les démonstrations techniques des formateurs et les coulisses des cascades cinéma.",
        "cta_primary_text": "Rejoindre la chaîne YouTube",
        "cta_primary_link": "https://www.youtube.com/@campusuniverscascades",
        "cta_secondary_text": "Postuler aux stages",
        "cta_secondary_link": "/stages-cascades-parkour-2",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'partenaires',
    'Partenaires',
    'Nos Partenaires Cinéma & Institutionnels | Campus Univers Cascades',
    'Découvrez les partenaires du CUC : productions de cinéma, marques d''équipement de protection et partenaires institutionnels officiels.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "RÉSEAU DE CONFIANCE DE L''INDUSTRIE",
        "title": "NOS PARTENAIRES DE L''ACTION",
        "subtitle": "Productions audiovisuelles, institutions de financement de la formation et équipementiers mondiaux unis aux côtés du CUC.",
        "cta_primary_text": "Devenir partenaire",
        "cta_primary_link": "/contact-cuc",
        "cta_secondary_text": "Contacter la direction",
        "cta_secondary_link": "/contact-cuc",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
),
(
    'contact-cuc',
    'Contact & Accès',
    'Contactez le Campus Univers Cascades | Le Cateau-Cambrésis',
    'Toutes les coordonnées pour contacter l''équipe du CUC : inscriptions, partenariats, tournages et plan d''accès au campus.',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    '{
        "badge": "LE CATEAU-CAMBRÉSIS (59) • FRANCE",
        "title": "CONTACTEZ LE CAMPUS CUC",
        "subtitle": "Une question sur les admissions, les financements AFDAS / France Travail ou un devis événementiel ? Notre équipe vous répond sous 48h.",
        "cta_primary_text": "Envoyer un message",
        "cta_primary_link": "#formulaire",
        "cta_secondary_text": "Plan d''accès",
        "cta_secondary_link": "#acces",
        "bg_image": "https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg"
    }'::jsonb,
    '[]'::jsonb,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    og_image = EXCLUDED.og_image,
    hero = EXCLUDED.hero,
    updated_at = timezone('utc'::text, now());

-- 2. SEED DES PARTENAIRES
INSERT INTO public.site_partners (id, name, category, logo_url, website_url, order_index, is_published)
VALUES
('europacorp', 'EuropaCorp', 'cinema', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-europacorp.png', 'https://www.europacorp.com', 1, true),
('gaumont', 'Gaumont', 'cinema', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-gaumont.png', 'https://www.gaumont.fr', 2, true),
('pathe', 'Pathé', 'cinema', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-pathe.png', 'https://www.pathe.fr', 3, true),
('studiocanal', 'StudioCanal', 'cinema', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-studiocanal.png', 'https://www.studiocanal.com', 4, true),
('qualiopi', 'Certification Qualiopi', 'institutionnel', 'https://www.campus-universcascades.com/wp-content/uploads/2021/04/qualiopi.png', 'https://travail-emploi.gouv.fr', 5, true),
('afdas', 'AFDAS', 'institutionnel', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-afdas.png', 'https://www.afdas.com', 6, true),
('france-travail', 'France Travail', 'institutionnel', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-pole-emploi.png', 'https://www.francetravail.fr', 7, true),
('hauts-de-france', 'Région Hauts-de-France', 'institutionnel', 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/logo-region.png', 'https://www.hautsdefrance.fr', 8, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    logo_url = EXCLUDED.logo_url,
    website_url = EXCLUDED.website_url,
    updated_at = timezone('utc'::text, now());

-- 3. SEED DES PRESTATIONS CUC EVENTS
INSERT INTO public.site_events (id, title, subtitle, badge, description, features, price_indicator, cta_text, image_url, order_index, is_published)
VALUES
(
    'team-building',
    'Team Building Cascade & Action',
    'Cohésion d''équipe et dépassement de soi en immersion totale',
    'ENTREPRISES & SÉMINAIRES',
    'Fédérez vos équipes autour d''ateliers de cascade physique accessibles à tous : initiation aux chutes de cinéma, combats chorégraphiés et sauts sur airbag sous haute sécurité.',
    ARRAY['Encadrement par des cascadeurs professionnels', 'Accessible à tous les niveaux physiques', 'Dojos et structures privatisés', 'Reportage vidéo souvenir inclus'],
    'À partir de 120€ / participant',
    'Demander un devis team building',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    1,
    true
),
(
    'spectacles',
    'Spectacles & Shows Live',
    'Chorégraphies de cascadeurs et Yamakasi pour vos événements',
    'SPECTACLE VIVANT & FESTIVALS',
    'Des représentations sur-mesure combinant voltige, parkour, cascades de combat et effets pyrotechniques pour parcs à thème, festivals et lancements de produits.',
    ARRAY['Mise en scène et scénarisation sur-mesure', 'Équipe de 2 à 15 performeurs', 'Matériel et sécurité autonome', 'Intérieur ou plein air'],
    'Sur devis selon cahier des charges',
    'Réserver un show live',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg',
    2,
    true
),
(
    'airbag',
    'Location Airbag Géant & Animations',
    'L''attraction sensationnelle nomade pour tous vos événements',
    'ANIMATION NOMADE SÉCURISÉE',
    'Déploiement de notre airbag de cascade professionnel avec plateforme de saut jusqu''à 10 mètres. Sensations fortes garanties pour vos publics en toute sécurité.',
    ARRAY['Homologué et certifié sécurité cinéma', 'Opérateurs qualifiés CUC inclus', 'Montage et démontage rapide', 'Capacité jusqu''à 120 sauts / heure'],
    'Forfaits journée et week-end',
    'Louer l''airbag géant',
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg',
    3,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    badge = EXCLUDED.badge,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    price_indicator = EXCLUDED.price_indicator,
    updated_at = timezone('utc'::text, now());

-- 4. SEED DES PARAMÈTRES GLOBAUX DU SITE
INSERT INTO public.site_settings (key, value, description)
VALUES
(
    'general',
    '{
        "school_name": "Campus Univers Cascades",
        "tagline": "Le Plus Grand Centre de Formation de Cascadeurs au Monde",
        "phone": "+33 (0)3 27 00 00 00",
        "email_general": "contact@campus-universcascades.com",
        "email_admissions": "formations@campus-universcascades.com",
        "email_events": "events@campus-universcascades.com",
        "address": "Le Cateau-Cambrésis (59360), Hauts-de-France, France",
        "campus_surface": "11 000 m²",
        "instagram": "https://www.instagram.com/campusuniverscascades/",
        "youtube": "https://www.youtube.com/@campusuniverscascades",
        "linkedin": "https://www.linkedin.com/company/campus-univers-cascades/",
        "facebook": "https://www.facebook.com/campusuniverscascades/",
        "tiktok": "https://www.tiktok.com/@campusuniverscascades",
        "footer_copyright": "© 2008 - 2026 Campus Univers Cascades. Tous droits réservés."
    }'::jsonb,
    'Coordonnées officielles, emails et liens réseaux sociaux répercutés sur tout le site'
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = timezone('utc'::text, now());
