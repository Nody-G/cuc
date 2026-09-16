import { StuntProgram } from '@/types';

export const STUNT_PROGRAMS: StuntProgram[] = [
  {
    id: 'pro-longue-duree',
    category: 'pro',
    title: 'Formation Professionnelle Longue Durée',
    badge: 'CURSUS ÉLITE CUC',
    highlight: true,
    tagline: 'Devenez cascadeur professionnel polyvalent pour le cinéma d\'action international.',
    duration: '2 Ans (Cursus de 9 à 10 stages)',
    hours: '720h à 800h de pratique intensive',
    location: 'Campus CUC — Le Cateau-Cambrésis (59)',
    price: 'Sur devis / Éligible financements',
    priceNote: 'Prise en charge AFDAS, France Travail et financements pro possibles',
    ageRequirement: 'Dès 18 ans (Condition physique requise)',
    eligibility: [
      'Avoir validé avec succès le Stage Découverte de 12 jours',
      'Avis favorable de la commission pédagogique CUC',
      'Certificat médical d\'aptitude physique poussée',
      'Engagement sur la progression continue et la sécurité'
    ],
    nextSessions: [
      { date: '16 au 28 août 2026', status: 'complet' },
      { date: '18 au 30 octobre 2026', status: 'complet' },
      { date: '21 février au 05 mars 2027', status: 'complet' },
      { date: '18 au 30 avril 2027', status: 'complet' },
      { date: '27 juin au 09 juillet 2027', status: 'dernières places' }
    ],
    description: 'Le cursus de référence mondiale pour intégrer l\'industrie du cinéma d\'action. 9 à 10 stages immersifs de 12 jours échelonnés tous les deux mois sur deux ans. Évaluation quotidienne, polyvalence absolue, confrontation aux conditions réelles de plateau de tournage.',
    objectives: [
      'Maîtriser l\'intégralité des 10 disciplines de la cascade physique',
      'Paramétrer scientifiquement les risques et assurer la sécurité absolue sur plateau',
      'Exécuter des chorégraphies martiales complexes avec synchronisation caméra',
      'Réaliser des chutes de très grande hauteur (jusqu\'à 21m sur la CUC Tower)',
      'Intégrer les réseaux professionnels de coordinateurs cascades hollywoodiens et européens'
    ],
    keyModules: [
      'Combats chorégraphiés & Action Design',
      'Chutes de hauteur (CUC Tower 21m)',
      'Torche humaine (cascades en feu intégrales)',
      'Câblage 3D & Harnais super-héros',
      'Forces spéciales & maniement d\'armes à blanc',
      'Parkour & Art du déplacement (Yamakasi)',
      'Cascades mécaniques & chutes d\'escaliers'
    ],
    certification: 'Certification QUALIOPI & Éligibilité AFDAS',
    ctaText: 'Postuler au Cursus Pro',
    brochureUrl: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf'
  },
  {
    id: 'stage-decouverte',
    category: 'discovery',
    title: 'Stage Découverte & Sélection',
    badge: 'TREMPLIN OFFICIEL',
    highlight: false,
    tagline: '2 semaines intensives (80h) pour tester vos aptitudes et intégrer le cursus pro.',
    duration: '12 Jours consécutifs',
    hours: '80 heures de pratique',
    location: 'Campus CUC — Le Cateau-Cambrésis (59)',
    price: 'Tarif standard école',
    priceNote: 'Hébergement et restauration disponibles sur le campus (90 places)',
    ageRequirement: 'Dès 17 ans',
    eligibility: [
      'Sportifs motivés (hommes & femmes)',
      'Pratique préalable d\'un sport (arts martiaux, gym, parkour, etc.) appréciée mais non obligatoire',
      'Volonté de tester ses limites dans un cadre sécurisé'
    ],
    nextSessions: [
      { date: '16 au 28 août 2026', status: 'complet' },
      { date: '18 au 30 octobre 2026', status: 'complet' },
      { date: '21 février au 05 mars 2027', status: 'complet' },
      { date: '18 au 30 avril 2027', status: 'dernières places' }
    ],
    description: 'Le point d\'entrée incontournable. Il permet de découvrir le rythme et l\'exigence du métier de cascadeur sans engagement préalable sur le cursus long. À l\'issue de ces 12 jours, l\'équipe pédagogique délivre son verdict d\'admission pour la formation longue durée.',
    objectives: [
      'Découvrir l\'atmosphère réelle d\'un centre d\'entraînement de cascadeurs',
      'S\'initier aux chutes de hauteur, combats cinéma, acrobaties et parkour',
      'Évaluer son potentiel physique, sa résistance et sa discipline mentale',
      'Obtenir la validation pour rejoindre le cursus professionnel'
    ],
    keyModules: [
      'Initiation combat chorégraphié',
      'Chutes de sa hauteur et projections',
      'Sauts de hauteur progressifs (jusqu\'à 6-9m)',
      'Parcours d\'obstacles et Parkour',
      'Découverte des techniques de câblage'
    ],
    certification: 'Attestation de stage CUC & Bilan d\'aptitude',
    ctaText: 'Réserver ma Session Découverte'
  },
  {
    id: 'weekend-immersion',
    category: 'weekend',
    title: 'Formule Week-end Immersion',
    badge: 'ACCESSIBLE À TOUS',
    highlight: false,
    tagline: 'Vivez l\'expérience cascadeur le temps d\'un week-end en pension complète.',
    duration: '2 Jours (Vendredi 17h au Dimanche 17h30)',
    hours: '16 heures d\'entraînement intensif',
    location: 'Campus CUC — Le Cateau-Cambrésis (59)',
    price: '250,00 €',
    priceNote: 'Formule en pension complète (hébergement + tous les repas inclus)',
    ageRequirement: 'Accessible à partir de 16 ans',
    eligibility: [
      'Accessible à tous niveaux, sportifs confirmés ou débutants passionnés',
      'Amateurs de sensations fortes et fans de cinéma d\'action',
      'Autorisation parentale requise pour les mineurs'
    ],
    nextSessions: [
      { date: '12 et 13 septembre 2026', status: 'ouvert' },
      { date: '21 et 22 novembre 2026', status: 'ouvert' },
      { date: '20 et 21 mars 2027', status: 'bientôt' }
    ],
    description: 'Une plongée directe dans l\'univers spectaculaire des cascades de cinéma. Dormez sur le campus, mangez avec les cascadeurs pro et apprenez les bases des chutes, des combats scéniques et du saut sur airbag géant dans une ambiance fraternelle et ultra-sécurisée.',
    objectives: [
      'Repousser ses peurs en toute sécurité sur nos installations professionnelles',
      'Apprendre les rudiments de la bagarre de cinéma crédible',
      'Sauter d\'une plateforme en hauteur sur notre Airbag géant',
      'Découvrir le quotidien d\'un cascadeur professionnel'
    ],
    keyModules: [
      'Chutes de hauteur sur Airbag géant',
      'Bagarre de cinéma et bruitages corporels',
      'Acrobaties et franchissement d\'obstacles',
      'Chutes contrôlées sur praticables',
      'Immersion nocturne sur le campus de 6 hectares'
    ],
    certification: 'Certificat de stage Immersion CUC',
    ctaText: 'Réserver mon Week-end (250€)',
    brochureUrl: 'https://www.campus-universcascades.com/wp-content/uploads/2025/01/Plaquette-Week-end-Immersion-CUC.pdf'
  },
  {
    id: 'afdas-artistes-interpretes',
    category: 'afdas',
    title: 'Stage AFDAS — Artistes Interprètes',
    badge: '100% PRIS EN CHARGE',
    highlight: true,
    tagline: 'Formation cascades dédiée aux comédiens, danseurs, circassiens et intermittents.',
    duration: '2 Semaines (10 jours ouvrés)',
    hours: '70 heures conventionnées',
    location: 'Pôle CUC Île-de-France — Gennevilliers (92)',
    price: '0 € (Prise en charge AFDAS 100%)',
    priceNote: 'Prise en charge intégrale au titre de la formation continue des artistes',
    ageRequirement: 'Dès 18 ans',
    eligibility: [
      'Intermittents du spectacle, artistes interprètes (comédiens, danseurs, circassiens)',
      'Justifier des conditions d\'accès aux financements AFDAS',
      'Artistes souhaitant enrichir leur jeu corporel et leur CV d\'action'
    ],
    nextSessions: [
      { date: '09 au 20 novembre 2026', status: 'ouvert' },
      { date: '18 au 29 janvier 2027', status: 'ouvert' },
      { date: '15 au 26 mars 2027', status: 'bientôt' }
    ],
    description: 'Une formation conçue sur-mesure pour donner aux comédiens et performeurs une crédibilité totale dans les scènes d\'action. Apprenez à recevoir des coups, chuter sans danger, manier des armes factices et dialoguer efficacement avec les coordinateurs de cascades.',
    objectives: [
      'Acquérir l\'autonomie physique sur les scènes d\'action simples à moyennes',
      'Comprendre les axes caméra, la gestion du regard et le rythme cinématique',
      'Maniement réaliste des armes de poing à blanc et des armes blanches',
      'Valoriser son profil auprès des directeurs de casting et réalisateurs'
    ],
    keyModules: [
      'Combat de comédie & scènes dramatiques d\'action',
      'Chutes et réactions d\'impact face caméra',
      'Maniement d\'armes à feu et déplacements tactiques',
      'Chutes d\'escalier théâtralisées',
      'Tournage d\'une bande démo action pour chaque artiste'
    ],
    certification: 'Conventionné AFDAS & Attestation QUALIOPI',
    ctaText: 'Demander ma Prise en Charge AFDAS'
  },
  {
    id: 'stunt-summer-camp',
    category: 'summer',
    title: 'Stunt Summer Camp (Loisirs & Perfectionnement)',
    badge: 'STAGE D\'ÉTÉ INTENSIF',
    highlight: false,
    tagline: '1 semaine estivale d\'adrénaline pure : Parkour, Freerun, Airbag et Combats cinéma.',
    duration: '1 Semaine (Du dimanche après-midi au vendredi soir)',
    hours: '35 heures d\'entraînement',
    location: 'Campus CUC — Le Cateau-Cambrésis (59)',
    price: 'Tarif camp d\'été',
    priceNote: 'Formule internat avec hébergement et restauration sur place',
    ageRequirement: 'Accessible dès 15 ans',
    eligibility: [
      'Jeunes et adultes passionnés d\'acrobaties et d\'arts du déplacement',
      'Pratiquants de Parkour / Tricking / Gymnastique ou débutants motivés',
      'Encadrement assuré par des cascadeurs professionnels chevronnés'
    ],
    nextSessions: [
      { date: '11 au 16 juillet 2027', status: 'ouvert' },
      { date: '08 au 13 août 2027', status: 'ouvert' }
    ],
    description: 'Le rendez-vous annuel de la communauté de l\'action. Une semaine estivale vibrante combinant entraînements rigoureux, dépassement de soi et ambiance de festival. Progressez à pas de géant sur nos installations de pointe aux côtés des meilleurs instructeurs de France.',
    objectives: [
      'Perfectionner sa technique de Parkour et de Freerunning sur Parkour Park pro',
      'Dompter la peur du vide grâce aux sauts répétés sur Airbag géant',
      'Chorégraphier des combats de cinéma en binôme',
      'Vivre une semaine de cohésion inoubliable sur 6 hectares d\'infrastructures'
    ],
    keyModules: [
      'Parkour & Freerun sous la supervision de traceurs d\'élite',
      'Chute de hauteur libre sur Airbag',
      'Acrobaties sur praticables et fosse à cubes',
      'Combats chorégraphiés et tournage d\'un reel',
      'Challenges de fin de stage'
    ],
    certification: 'Diplôme du Stunt Summer Camp CUC',
    ctaText: 'Pré-inscriptions Summer Camp',
    brochureUrl: 'https://www.campus-universcascades.com/wp-content/uploads/2026/08/Plaquette-CUC-Summer-Camp-2k27.pdf'
  },
  {
    id: 'afdas-cascadeurs-pro',
    category: 'afdas',
    title: 'Stage AFDAS — Cascadeurs PRO (Provence Studios)',
    badge: 'PROS SEULEMENT',
    highlight: false,
    tagline: 'Perfectionnement de pointe réservé aux cascadeurs en exercice à Provence Studios.',
    duration: 'Session spécifique de perfectionnement',
    hours: 'Module expert de haut niveau',
    location: 'Provence Studios (Martigues, Bouches-du-Rhône)',
    price: 'Prise en charge AFDAS',
    priceNote: 'Réservé exclusivement aux cascadeurs professionnels immatriculés',
    ageRequirement: 'Cascadeurs professionnels confirmés',
    eligibility: [
      'Cascadeuses et cascadeurs professionnels en activité',
      'Expérience confirmée sur tournages de longs-métrages ou séries',
      'Justificatifs d\'heures de tournage requises pour l\'AFDAS'
    ],
    nextSessions: [
      { date: 'Session 2026/2027 annoncée prochainement', status: 'bientôt' }
    ],
    description: 'Une formation d\'élite organisée au sein de la plus vaste infrastructure de studios de cinéma du Sud de la France (Provence Studios). Conçue par des coordinateurs cascades majeurs pour affiner les gestes techniques extrêmes, les nouveaux dispositifs de câblage et la sécurité pyrotechnique de dernière génération.',
    objectives: [
      'Affiner les réactions biomécaniques sur impacts lourds et projections',
      'Expérimenter les rigs de câblage complexes et déclencheurs pneumatiques',
      'Maîtriser les protocoles de tournage de grosses productions internationales',
      'Mise à niveau sur les normes de sécurité cinéma actuelles'
    ],
    keyModules: [
      'Câblage complexe 3 axes et rachets pneumatiques',
      'Torches intégrales et protocoles de sauvetage express',
      'Cascades de véhicules avancées en plateau fermé',
      'Coordination et prévisualisation d\'action 3D'
    ],
    certification: 'Attestation de Perfectionnement Pro AFDAS',
    ctaText: 'Contacter pour les Sessions Pro'
  }
];
