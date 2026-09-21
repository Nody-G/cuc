-- ==============================================================================
-- CUC — Campus Univers Cascades : Données Initiales du Site Vitrine (SEED)
-- ==============================================================================
-- Exécutez ce script APRÈS scripts/schema_site_vitrine.sql dans l'éditeur SQL Supabase.
-- ==============================================================================

-- 1. INSERTION DES PROGRAMMES (site_programs)
INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'pro-longue-duree',
    'pro',
    'Formation Professionnelle Longue Durée',
    'CURSUS DIPLÔMANT CUC',
    true,
    'Devenez cascadeur professionnel polyvalent pour le cinéma d''action international.',
    '2 Ans (Cursus de 9 à 10 stages)',
    '720h à 800h de pratique intensive',
    'Campus CUC — Le Cateau-Cambrésis (59)',
    'Sur devis / Éligible financements',
    'Prise en charge AFDAS, France Travail et financements pro possibles',
    'Dès 18 ans (Condition physique requise)',
    ARRAY['Avoir validé avec succès le Stage Découverte de 12 jours', 'Avis favorable de la commission pédagogique CUC', 'Certificat médical d''aptitude physique poussée', 'Engagement sur la progression continue et la sécurité']::text[],
    'Le cursus de référence mondiale pour intégrer l''industrie du cinéma d''action. 9 à 10 stages immersifs de 12 jours échelonnés tous les deux mois sur deux ans. Évaluation quotidienne, polyvalence absolue, confrontation aux conditions réelles de plateau de tournage.',
    ARRAY['Maîtriser l''intégralité des 10 disciplines de la cascade physique', 'Paramétrer scientifiquement les risques et assurer la sécurité absolue sur plateau', 'Exécuter des chorégraphies martiales complexes avec synchronisation caméra', 'Réaliser des chutes de très grande hauteur (jusqu''à 21m sur la CUC Tower)', 'Intégrer les réseaux professionnels de coordinateurs cascades hollywoodiens et européens']::text[],
    ARRAY['Combats chorégraphiés & Action Design', 'Chutes de hauteur (CUC Tower 21m)', 'Torche humaine (cascades en feu intégrales)', 'Câblage 3D & Harnais super-héros', 'Forces spéciales & maniement d''armes à blanc', 'Parkour (Yamakasi)', 'Cascades mécaniques & chutes d''escaliers']::text[],
    'Certification QUALIOPI & Éligibilité AFDAS',
    'Postuler au Cursus Pro',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf',
    0,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'pro-longue-duree',
    '16 au 28 août 2026',
    'complet',
    0,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'pro-longue-duree',
    '18 au 30 octobre 2026',
    'complet',
    1,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'pro-longue-duree',
    '21 février au 05 mars 2027',
    'complet',
    2,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'pro-longue-duree',
    '18 au 30 avril 2027',
    'complet',
    3,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'pro-longue-duree',
    '27 juin au 09 juillet 2027',
    'dernières places',
    4,
    true
);

INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'stage-decouverte',
    'discovery',
    'Stage Découverte & Sélection',
    'TREMPLIN',
    false,
    '2 semaines intensives (80h) pour tester vos aptitudes et intégrer le cursus pro.',
    '12 Jours consécutifs',
    '80 heures de pratique',
    'Campus CUC — Le Cateau-Cambrésis (59)',
    'Tarif standard école',
    'Hébergement et restauration disponibles sur le campus (90 places)',
    'Dès 17 ans',
    ARRAY['Sportifs motivés (hommes & femmes)', 'Pratique préalable d''un sport (arts martiaux, gym, parkour, etc.) appréciée mais non obligatoire', 'Volonté de tester ses limites dans un cadre sécurisé']::text[],
    'Le point d''entrée incontournable. Il permet de découvrir le rythme et l''exigence du métier de cascadeur sans engagement préalable sur le cursus long. À l''issue de ces 12 jours, l''équipe pédagogique délivre son verdict d''admission pour la formation longue durée.',
    ARRAY['Découvrir l''atmosphère réelle d''un centre d''entraînement de cascadeurs', 'S''initier aux chutes de hauteur, combats cinéma, acrobaties et parkour', 'Évaluer son potentiel physique, sa résistance et sa discipline mentale', 'Obtenir la validation pour rejoindre le cursus professionnel']::text[],
    ARRAY['Initiation combat chorégraphié', 'Chutes de sa hauteur et projections', 'Sauts de hauteur progressifs (jusqu''à 6-9m)', 'Parcours d''obstacles et Parkour', 'Découverte des techniques de câblage']::text[],
    'Attestation de stage CUC & Bilan d''aptitude',
    'Réserver ma Session Découverte',
    NULL,
    1,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stage-decouverte',
    '16 au 28 août 2026',
    'complet',
    0,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stage-decouverte',
    '18 au 30 octobre 2026',
    'complet',
    1,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stage-decouverte',
    '21 février au 05 mars 2027',
    'complet',
    2,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stage-decouverte',
    '18 au 30 avril 2027',
    'dernières places',
    3,
    true
);

INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'weekend-immersion',
    'weekend',
    'Formule Week-end Immersion',
    'ACCESSIBLE À TOUS',
    false,
    'Vivez l''expérience cascadeur le temps d''un week-end en pension complète.',
    '2 Jours (Vendredi 17h au Dimanche 17h30)',
    '16 heures d''entraînement intensif',
    'Campus CUC — Le Cateau-Cambrésis (59)',
    '250,00 €',
    'Formule en pension complète (hébergement + tous les repas inclus)',
    'Accessible à partir de 16 ans',
    ARRAY['Accessible à tous niveaux, sportifs confirmés ou débutants passionnés', 'Amateurs de sensations fortes et fans de cinéma d''action', 'Autorisation parentale requise pour les mineurs']::text[],
    'Une immersion directe dans l''univers des cascades de cinéma. Dormez sur le campus, mangez avec les cascadeurs pro et apprenez les bases des chutes, des combats scéniques et du saut sur airbag géant dans une ambiance fraternelle et encadrée.',
    ARRAY['Repousser ses peurs en toute sécurité sur nos installations professionnelles', 'Apprendre les rudiments de la bagarre de cinéma crédible', 'Sauter d''une plateforme en hauteur sur notre Airbag géant', 'Découvrir le quotidien d''un cascadeur professionnel']::text[],
    ARRAY['Chutes de hauteur sur Airbag géant', 'Bagarre de cinéma et bruitages corporels', 'Acrobaties et franchissement d''obstacles', 'Chutes contrôlées sur praticables', 'Immersion nocturne sur le campus de 6 hectares']::text[],
    'Certificat de stage Immersion CUC',
    'Réserver mon Week-end (250€)',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/Plaquette-Week-end-Immersion-CUC.pdf',
    2,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'weekend-immersion',
    '12 et 13 septembre 2026',
    'ouvert',
    0,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'weekend-immersion',
    '21 et 22 novembre 2026',
    'ouvert',
    1,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'weekend-immersion',
    '20 et 21 mars 2027',
    'bientôt',
    2,
    true
);

INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'afdas-artistes-interpretes',
    'afdas',
    'Stage AFDAS — Artistes Interprètes',
    '100% PRIS EN CHARGE',
    true,
    'Formation cascades dédiée aux comédiens, danseurs, circassiens et intermittents.',
    '2 Semaines (10 jours ouvrés)',
    '70 heures conventionnées',
    'Pôle CUC Île-de-France — Gennevilliers (92)',
    '0 € (Prise en charge AFDAS 100%)',
    'Prise en charge intégrale au titre de la formation continue des artistes',
    'Dès 18 ans',
    ARRAY['Intermittents du spectacle, artistes interprètes (comédiens, danseurs, circassiens)', 'Justifier des conditions d''accès aux financements AFDAS', 'Artistes souhaitant enrichir leur jeu corporel et leur CV d''action']::text[],
    'Une formation conçue sur-mesure pour donner aux comédiens et performeurs une crédibilité totale dans les scènes d''action. Apprenez à recevoir des coups, chuter sans danger, manier des armes factices et dialoguer efficacement avec les coordinateurs de cascades.',
    ARRAY['Acquérir l''autonomie physique sur les scènes d''action simples à moyennes', 'Comprendre les axes caméra, la gestion du regard et le rythme cinématique', 'Maniement réaliste des armes de poing à blanc et des armes blanches', 'Valoriser son profil auprès des directeurs de casting et réalisateurs']::text[],
    ARRAY['Combat de comédie & scènes dramatiques d''action', 'Chutes et réactions d''impact face caméra', 'Maniement d''armes à feu et déplacements de combat', 'Chutes d''escalier théâtralisées', 'Tournage d''une bande démo action pour chaque artiste']::text[],
    'Conventionné AFDAS & Attestation QUALIOPI',
    'Demander ma Prise en Charge AFDAS',
    NULL,
    3,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'afdas-artistes-interpretes',
    '09 au 20 novembre 2026',
    'ouvert',
    0,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'afdas-artistes-interpretes',
    '18 au 29 janvier 2027',
    'ouvert',
    1,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'afdas-artistes-interpretes',
    '15 au 26 mars 2027',
    'bientôt',
    2,
    true
);

INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'stunt-summer-camp',
    'summer',
    'Stunt Summer Camp (Loisirs & Perfectionnement)',
    'STAGE D''ÉTÉ INTENSIF',
    false,
    '1 semaine estivale d''adrénaline pure : Parkour, Freerun, Airbag et Combats cinéma.',
    '1 Semaine (Du dimanche après-midi au vendredi soir)',
    '35 heures d''entraînement',
    'Campus CUC — Le Cateau-Cambrésis (59)',
    'Tarif camp d''été',
    'Formule internat avec hébergement et restauration sur place',
    'Accessible dès 15 ans',
    ARRAY['Jeunes et adultes passionnés d''acrobaties et d''arts du déplacement', 'Pratiquants de Parkour / Tricking / Gymnastique ou débutants motivés', 'Encadrement assuré par des cascadeurs professionnels chevronnés']::text[],
    'Le rendez-vous annuel de la communauté de l''action. Une semaine estivale vibrante combinant entraînements rigoureux, dépassement de soi et ambiance de festival. Progressez à pas de géant sur nos installations de pointe aux côtés des meilleurs instructeurs de France.',
    ARRAY['Perfectionner sa technique de Parkour et de Freerunning sur Parkour Park pro', 'Dompter la peur du vide grâce aux sauts répétés sur Airbag géant', 'Chorégraphier des combats de cinéma en binôme', 'Vivre une semaine de cohésion inoubliable sur 6 hectares d''infrastructures']::text[],
    ARRAY['Parkour & Freerun sous la supervision de traceurs d''élite', 'Chute de hauteur libre sur Airbag', 'Acrobaties sur praticables et fosse à cubes', 'Combats chorégraphiés et tournage d''un reel', 'Challenges de fin de stage']::text[],
    'Diplôme du Stunt Summer Camp CUC',
    'Pré-inscriptions Summer Camp',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/Plaquette-CUC-Summer-Camp-2k27.pdf',
    4,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stunt-summer-camp',
    '11 au 16 juillet 2027',
    'ouvert',
    0,
    true
);
INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'stunt-summer-camp',
    '08 au 13 août 2027',
    'ouvert',
    1,
    true
);

INSERT INTO public.site_programs (
    id, category, title, badge, highlight, tagline, duration, hours, location,
    price, price_note, age_requirement, eligibility, description, objectives,
    key_modules, certification, cta_text, brochure_url, order_index, is_published
) VALUES (
    'afdas-cascadeurs-pro',
    'afdas',
    'Stage AFDAS — Cascadeurs PRO (Provence Studios)',
    'PROS SEULEMENT',
    false,
    'Perfectionnement de pointe réservé aux cascadeurs en exercice à Provence Studios.',
    'Session spécifique de perfectionnement',
    'Module expert de haut niveau',
    'Provence Studios (Martigues, Bouches-du-Rhône)',
    'Prise en charge AFDAS',
    'Réservé exclusivement aux cascadeurs professionnels immatriculés',
    'Cascadeurs professionnels confirmés',
    ARRAY['Cascadeuses et cascadeurs professionnels en activité', 'Expérience confirmée sur tournages de longs-métrages ou séries', 'Justificatifs d''heures de tournage requises pour l''AFDAS']::text[],
    'Une formation d''élite organisée au sein de la plus vaste infrastructure de studios de cinéma du Sud de la France (Provence Studios). Conçue par des coordinateurs cascades majeurs pour affiner les gestes techniques extrêmes, les nouveaux dispositifs de câblage et la sécurité pyrotechnique de dernière génération.',
    ARRAY['Affiner les réactions biomécaniques sur impacts lourds et projections', 'Expérimenter les rigs de câblage complexes et déclencheurs pneumatiques', 'Maîtriser les protocoles de tournage de grosses productions internationales', 'Mise à niveau sur les normes de sécurité cinéma actuelles']::text[],
    ARRAY['Câblage complexe 3 axes et rachets pneumatiques', 'Torches intégrales et protocoles de sauvetage express', 'Cascades de véhicules avancées en plateau fermé', 'Coordination et prévisualisation d''action 3D']::text[],
    'Attestation de Perfectionnement Pro AFDAS',
    'Contacter pour les Sessions Pro',
    NULL,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    price = EXCLUDED.price,
    price_note = EXCLUDED.price_note,
    description = EXCLUDED.description,
    brochure_url = EXCLUDED.brochure_url;

INSERT INTO public.site_sessions (
    program_id, date_display, status, order_index, is_published
) VALUES (
    'afdas-cascadeurs-pro',
    'Session 2026/2027 annoncée prochainement',
    'bientôt',
    0,
    true
);

-- 2. INSERTION DE L'ÉQUIPE (site_team)
INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'lucas-dollfus',
    'Lucas Dollfus',
    'Fondateur & Directeur Général',
    'Coordinateur de Cascades & Formateur Référent',
    ARRAY['Direction de cascades', 'Action Design', 'Sécurité de tournage', 'Chutes de hauteur']::text[],
    'Pionnier et bâtisseur du plus grand centre de formation de cascadeurs au monde, fondé en 2008. Lucas Dollfus a coordonné les cascades de dizaines de longs-métrages, de séries et de spectacles à travers le monde, imposant une méthode d''entraînement basée sur la rigueur absolue, la sécurité et la polyvalence.',
    ARRAY['Bagarre', 'Coka Chicas', 'Longs-métrages cinéma & téléfilms', 'Supervision CUC Stunt Team']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/1-lucas.png',
    'https://www.instagram.com/lucas.dollfus/',
    NULL,
    'https://www.instagram.com/lucas.dollfus/?hl=fr',
    0,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'jerome-gaspard',
    'Jérôme Gaspard',
    'Responsable Pédagogique',
    'Coordinateur de Cascades Référent Cinéma',
    ARRAY['Coordination cascades', 'Chutes de grande hauteur', 'Câblage lourd', 'Combats armés']::text[],
    'Pilier incontournable de la cascade en France et en Europe, Jérôme Gaspard a coordonné des projets d''envergure internationale avec Action Cascade. Il veille à l''adéquation permanente entre les enseignements du campus et les standards impitoyables des plateaux de tournage hollywoodiens et européens.',
    ARRAY['Blockbusters français & internationaux', 'Doublures acteurs majeurs', 'Action Cascade']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/2-jerome.png',
    NULL,
    NULL,
    'https://www.action-cascade.com/coordinateur-de-cascades/',
    1,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'malik-diouf',
    'Malik Diouf',
    'Co-fondateur des Yamakasi',
    'Référent Parkour',
    ARRAY['Parkour originel', 'Franchissement rapide', 'Précision d''appui', 'Mental d''acier']::text[],
    'Membre historique et co-fondateur du groupe Yamakasi, à l''origine de la diffusion du Parkour dans le monde. Malik Diouf a conçu une méthode d''entraînement propre au CUC, adaptée à tous les niveaux, enseignant la précision millimétrée, la lecture de l''environnement et l''économie d''énergie dans l''effort.',
    ARRAY['Yamakasi (Film culte)', 'Les Fils du Vent', 'Productions Luc Besson', 'Pionnier mondial du Parkour']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/3-malik.png',
    NULL,
    'https://www.imdb.com/name/nm0228086/',
    'https://www.imdb.com/name/nm0228086/',
    2,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'franck-blanc',
    'Franck Blanc',
    'Directeur Adjoint',
    'Coach Câblage 3D, Torches & Pyrotechnie',
    ARRAY['Torches humaines intégrales', 'Câblage haute voltige', 'Effets pyrotechniques', 'Gestion du risque']::text[],
    'Directeur adjoint du CUC, expert reconnu dans les disciplines à haute criticité thermique et mécanique. Franck Blanc supervise les cascades de feu et les rigs de câblage complexes, garantissant un taux de sécurité de 100% sur chaque engagement.',
    ARRAY['Torches humaines cinéma & TV', 'Grands spectacles pyrotechniques', 'Rigs de câbles cinéma']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/4-franck.png',
    NULL,
    'https://www.imdb.com/name/nm6923086/',
    'https://www.imdb.com/name/nm6923086/',
    3,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'vincent-bouillon',
    'Vincent Bouillon',
    'Spécialiste Combats & Chutes',
    'Cascadeur Professionnel & Doublure Internationale',
    ARRAY['Combats martiaux de haute vélocité', 'Tricks & acrobaties', 'Chutes violentes', 'Doublure cinéma']::text[],
    'L''une des figures de proue de la cascade d''action moderne. Athlète complet, il a doublé des comédiens de premier plan dans des productions exigeantes (notamment Tomer Sisley dans Largo Winch et Balthazar) et intervient régulièrement au CUC pour transmettre les exigences du cinéma d''action contemporain.',
    ARRAY['Largo Winch', 'Balthazar', 'Séries d''action internationales']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/13-vincent-OK.png',
    NULL,
    NULL,
    'https://fr.vincentbouillon.com/',
    4,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'kefi-abrikh',
    'Kefi Abrikh',
    'Action Designer & Chorégraphe',
    'Spécialiste Chorégraphies de Combat',
    ARRAY['Action design', 'Combat chorégraphié cinématographique', 'Découpage d''action', 'Prévisualisation']::text[],
    'Action Designer et coordinateur de combats réputé pour sa vision dynamique et rythmée des scènes d''affrontement. Il façonne le style visuel des combats à mains nues et armés en étroite collaboration avec les réalisateurs les plus exigeants.',
    ARRAY['Films d''action français et étrangers', 'Chorégraphe de combat', 'Action Director']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/10-kefi.png',
    NULL,
    NULL,
    'http://www.kefiabrikh.com',
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'maurice-chan',
    'Maurice Chan',
    'Instructeur Référent',
    'Spécialiste Combats, Chutes & Comédie d''Action',
    ARRAY['Arts martiaux chinois & wushu', 'Combat rythmé de comédie', 'Chutes synchronisées', 'Tricks']::text[],
    'Artiste martial et cascadeur expérimenté, Maurice Chan associe la rigueur physique martiale à l''humour gestuel de la comédie d''action à la Jackie Chan.',
    ARRAY['Productions Europacorp', 'Spectacles parcs à thème', 'Courts-métrages d''action primés']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/9-maurice.png',
    NULL,
    NULL,
    'https://mauricechan.book.fr',
    6,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'michael-troude',
    'Michaël Troude',
    'Formateur Combat',
    'Spécialiste Actions & Réactions',
    ARRAY['Combat de contact', 'Crédibilité des impacts', 'Chutes de sa hauteur', 'Bagarre urbaine']::text[],
    'Cascadeur réputé pour son sens du réalisme brutal et son travail sur la vérité physique du mouvement. Il enseigne l''art de recevoir les impacts sans dommage tout en projetant une intensité maximale à l''image.',
    ARRAY['Cinéma français & international', 'Séries policières d''action', 'Doublures cascades physiques']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/14-michel.png',
    NULL,
    NULL,
    NULL,
    7,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'amedeo-cazzella',
    'Amédéo Cazzella',
    'Formateur Armes',
    'Spécialiste Combats & Maniement d''Armes',
    ARRAY['Armes blanches', 'Escrime de spectacle', 'Katanas et sabres', 'Chorégraphies multi-adversaires']::text[],
    'Expert en maniement d''armes blanches historiques et modernes. Il enseigne le respect des distances critiques, la précision du tranchant et la mise en scène chorégraphique des affrontements armés.',
    ARRAY['Films historiques', 'Fresques d''époque', 'Duels d''action']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/7-amadeo.png',
    NULL,
    NULL,
    NULL,
    8,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'niels-dalery',
    'Niels Dalery',
    'Formateur Acrobatie & Freerun',
    'Spécialiste Acrobaties & Freerunning',
    ARRAY['Acrobatie aérienne', 'Freerunning urbain', 'Tricks de scène', 'Propulsion trampoline']::text[],
    'Virtuose de l''acrobatie au sol et des évolutions aériennes. Niels Dalery forme les élèves du CUC à la gestion de la rotation corporelle et aux transitions fluides entre cascades acrobatiques et impacts au sol.',
    ARRAY['Performances acrobatiques cinéma', 'Vidéos de freerun virales', 'Doublures acrobatiques']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/6-niels.png',
    NULL,
    NULL,
    NULL,
    9,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'bastien-trouve',
    'Bastien Trouvé',
    'Instructeur & Cascadeur',
    'Cascadeur Professionnel',
    ARRAY['Combats scéniques', 'Chutes de hauteur', 'Acrobaties']::text[],
    'Formateur au CUC et cascadeur professionnel actif sur les productions cinématographiques et séries.',
    ARRAY['Productions d''action', 'Stunt Team CUC']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/19-bastien.png',
    NULL,
    NULL,
    NULL,
    10,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.site_team (
    id, name, role, title, specialties, bio, notable_credits,
    avatar_url, instagram, imdb, external_url, order_index, is_published
) VALUES (
    'alan-cueff',
    'Alan Cueff',
    'Instructeur & Cascadeur',
    'Cascadeur Professionnel',
    ARRAY['Combat', 'Parkour', 'Chutes']::text[],
    'Membre actif de la CUC Stunt Team intervenant sur les stages et formations au Cateau-Cambrésis.',
    ARRAY['Cinéma et séries télévisées']::text[],
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/21-alan-cueff.png',
    NULL,
    NULL,
    NULL,
    11,
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url;

-- 3. INSERTION DE LA FILMOGRAPHIE (site_films)
INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'the-substance',
    'The Substance',
    '2024',
    'Cinéma International',
    'Coralie Fargeat',
    'Cascades physiques extrêmes, prothèses corporelles lourdes, impacts et chutes de tension',
    ARRAY['Demi Moore & Margaret Qualley (Stunt Support)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/The-substance.jpg',
    'FESTIVAL DE CANNES',
    'https://www.imdb.com/title/tt17526714/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=300680.html',
    'https://www.youtube.com/watch?v=mcEFQwRbBZg',
    0,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'lamour-ouf',
    'L''Amour Ouf',
    '2024',
    'Cinéma Français',
    'Gilles Lellouche',
    'Bagarres de rue ultra-violentes, fusillades, chutes sur sol dur et scènes de poursuite',
    ARRAY['François Civil', 'Adèle Exarchopoulos (Cascades Action)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/Lamour-ouf.jpg',
    'Blockbuster',
    'https://www.imdb.com/title/tt27490099/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=221617.html',
    'https://www.youtube.com/watch?v=bSbA6Aeydbs',
    1,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'monte-cristo',
    'Le Comte de Monte-Cristo',
    '2024',
    'Cinéma Français',
    'Matthieu Delaporte & Alexandre de La Patellière',
    'Combats à l''épée d''époque, sauts et chutes en mer, évasion physique du Château d''If',
    ARRAY['Pierre Niney (Équipe Cascades & Combats)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/LE-COMTE-DE-MONTECRISTO-1.jpg',
    'HISTORIQUE',
    'https://www.imdb.com/title/tt26446278/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=288404.html',
    'https://www.youtube.com/watch?v=u0YnbsyvGS0',
    2,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'john-wick-4',
    'John Wick : Chapitre 4',
    '2023',
    'Blockbuster',
    'Chad Stahelski',
    'Combats rapprochés, cascades physiques et chutes dans les escaliers de Montmartre',
    ARRAY['Keanu Reeves (Stunt Doubling Support)', 'High Table Enforcers (CUC Performers)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/John-Wick-4.jpg',
    'Blockbuster',
    'https://www.imdb.com/title/tt10366206/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=274387.html',
    'https://www.youtube.com/watch?v=JjBZ2iEBcxM',
    3,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'the-killer',
    'The Killer',
    '2024',
    'Blockbuster',
    'John Woo',
    'Combats rapprochés et chorégraphiés à la John Woo, câblage, chutes à travers cloisons et fusillades',
    ARRAY['Nathalie Emmanuel & Omar Sy (Doublures Cascades CUC)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/The-Killer.jpg',
    'PEACOCK / UNIVERSAL',
    'https://www.imdb.com/title/tt2552882/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=131724.html',
    'https://www.youtube.com/watch?v=ooNWWB0S1KM',
    4,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'largo-winch-3',
    'Largo Winch : Le Prix de l''argent',
    '2024',
    'Cinéma Français',
    'Olivier Masset-Depasse',
    'Combats véloces à mains nues, chutes de véhicules lancés, rigging aérien et poursuites',
    ARRAY['Tomer Sisley (Doublé par Vincent Bouillon & CUC Team)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/Largo-Winch.jpg',
    'ACTION FRANÇAISE',
    'https://www.imdb.com/title/tt23049322/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=210439.html',
    'https://www.youtube.com/watch?v=3-Dm59tR_rM',
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'elyas',
    'Elyas',
    '2024',
    'Cinéma Français',
    'Florent-Emilio Siri',
    'Combats rapprochés type forces spéciales, CQB (Close Quarters Battle) et fusillades',
    ARRAY['Roschdy Zem (Cascades & Combats Rapprochés)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/ELYAS.jpg',
    'POLAR',
    'https://www.imdb.com/title/tt28336131/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=317127.html',
    'https://www.youtube.com/watch?v=CurKNMuYof8',
    6,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'sous-la-seine',
    'Sous la Seine',
    '2024',
    'Streaming Global',
    'Xavier Gens',
    'Cascades subaquatiques, panique de foule, chutes dans l''eau fluviale et impacts explosions',
    ARRAY['Bérénice Bejo & Nassim Lyes (Équipe Cascades CUC)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/Sous-la-seine.jpg',
    'Cinéma International',
    'https://www.imdb.com/title/tt13964390/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=313341.html',
    'https://www.youtube.com/watch?v=HPfkQ9gMLMY',
    7,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'fast-furious-6',
    'Fast & Furious 6',
    '2013',
    'Blockbuster',
    'Justin Lin',
    'Cascades physiques véhiculaires, impacts cinétiques violents et combats d''action',
    ARRAY['Pilotes & Performers Cascades']::text[],
    false,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/9-Fast-Furious-6.jpg',
    'UNIVERSAL',
    'https://www.imdb.com/title/tt1905041/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=189651.html',
    'https://www.youtube.com/watch?v=Ewu0WTPbOVY',
    8,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'james-bond-spectre',
    '007 Spectre',
    '2015',
    'Blockbuster',
    'Sam Mendes',
    'Cascades d''action urbaine, explosions contrôlées et affrontements rapprochés',
    ARRAY['SPECTRE Enforcers & Performers Action']::text[],
    false,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/4-James-Bond-spectre.jpg',
    'EON PROD',
    'https://www.imdb.com/title/tt2379713/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=206892.html',
    'https://www.youtube.com/watch?v=NlZS1pSF2hU',
    9,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'lucy',
    'Lucy',
    '2014',
    'Blockbuster',
    'Luc Besson',
    'Combats martiaux rapprochés, projections par câblage et réactions physiques aux impacts balistiques',
    ARRAY['Performers de Combat & Rigging CUC']::text[],
    false,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/6-Lucy.jpg',
    'EUROPACORP',
    'https://www.imdb.com/title/tt2872732/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=186452.html',
    'https://www.youtube.com/watch?v=7gPrNpHaFX8',
    10,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'valerian',
    'Valérian et la Cité des mille planètes',
    '2017',
    'Blockbuster',
    'Luc Besson',
    'Wirework complexe 3 axes, harnais suspendus et simulations d''apesanteur en studio',
    ARRAY['Spécialistes Rigging & Cascadeurs CUC']::text[],
    false,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/1-Valerian.jpg',
    'SCIENCE-FICTION',
    'https://www.imdb.com/title/tt2239822/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=237821.html',
    'https://www.youtube.com/watch?v=FPcRK7MvTn4',
    11,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'dunkirk',
    'Dunkerque (Dunkirk)',
    '2017',
    'Blockbuster',
    'Christopher Nolan',
    'Chutes en mer, explosions côtières et mouvements de panique de masse tournés dans les Hauts-de-France',
    ARRAY['Soldats britanniques et marins (Performers Hauts-de-France / CUC)']::text[],
    false,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/25-Dunkirk.jpg',
    'WARNER BROS',
    'https://www.imdb.com/title/tt5013056/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=240850.html',
    'https://www.youtube.com/watch?v=chRUCIk3K94',
    12,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

INSERT INTO public.site_films (
    id, title, year, category, director, stunt_roles, doubled_actors,
    highlight, image, tag, imdb_url, allocine_url, trailer_url, order_index, is_published
) VALUES (
    'yamakasi',
    'Yamakasi : Les samouraïs des temps modernes',
    '2001',
    'Film Culte',
    'Ariel Zeitoun & Julien Seri',
    'Fondation mondiale du Parkour, cascades urbaines en toitures',
    ARRAY['Malik Diouf (Rôle Titulaire Original & Co-fondateur CUC)']::text[],
    true,
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/film-poster/18-Yamakasi.jpg',
    'ORIGINES DU PARKOUR',
    'https://www.imdb.com/title/tt0267129/',
    'https://www.allocine.fr/film/fichefilm_gen_cfilm=29366.html',
    'https://www.youtube.com/watch?v=aA0wW7E-Wok',
    13,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    director = EXCLUDED.director,
    stunt_roles = EXCLUDED.stunt_roles,
    image = EXCLUDED.image;

-- 4. BANDEAU D'ALERTE PAR DÉFAUT (site_announcements)
INSERT INTO public.site_announcements (
    title, message, badge, style, is_active
) VALUES (
    'Inscriptions Ouvertes',
    'Les inscriptions pour les prochains stages cascades & parkour sont actuellement ouvertes.',
    'CUC 2026-2027',
    'gold',
    false
);
