import { InfrastructureSpot } from '@/types';

export const CAMPUS_FACILITIES: InfrastructureSpot[] = [
  {
    id: 'cuc-tower',
    code: '01',
    name: 'CUC Tower (Tour de Saut 21m)',
    size: 'Hauteur : 21 mètres',
    description: 'Structure emblématique inaugurée en octobre 2024 au Cateau-Cambrésis. Haute de plus de 20 mètres avec plusieurs plateformes de saut sécurisées, escalier extérieur galvanisé et coussin airbag géant pour chutes libres de 6 à 21 mètres, défenestrations et descentes en rappel de cinéma.',
    features: [
      'Plateformes de saut étagées (6m, 9m, 12m, 15m, 21m)',
      'Escalier industriel galvanisé à volées multiples',
      'Plateforme de défenestration avec baies ouvertes pour prises de vues',
      'Ancrages de rappel pour scènes d\'action verticales',
      'Zone de réception XXL pour airbag de cascade professionnel'
    ],
    specifications: 'Structure acier haute résistance, plateformes de saut étagées, réception airbag professionnel cinéma',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2025/01/CUC-TOWER-Team-scaled.jpg'
  },
  {
    id: 'zoe-bell-hall',
    code: '02',
    name: 'Zoé Bell Hall — Gymnase & Fosse Olympique',
    size: '700 m² couverts',
    description: 'Espace dédié aux acrobaties et aux chutes, baptisé en hommage à Zoé Bell, marraine du Campus. Équipé d\'une fosse à cubes de mousse de plus de 50 m³ et d\'un praticable olympique complet.',
    features: [
      'Fosse à cubes de mousse haute résilience 50m³',
      'Piste de tumbling et trampoline de compétition',
      'Matelas de réception "Crash Mat" 40cm',
      'Système de caméras avec retour écran instantané'
    ],
    specifications: 'Sol amortissant continu, hauteur sous plafond 8 mètres, éclairage cinéma zénithal',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/Zoé-Bell-Hall.jpg'
  },
  {
    id: 'hangar-wirework',
    code: '03',
    name: 'Hall Câblage & Cascades Physiques',
    size: '600 m² couverts',
    description: 'Espace dédié au câblage 3D, aux simulateurs de blasts et aux chutes de mobilier. Les structures permettent d\'accrocher des poulies de renvoi haute charge et rachets.',
    features: [
      'Poutres de levage certifiées 2 tonnes pour câblage 3 axes',
      'Zone de fracas de mobilier et bris de verre cinéma',
      'Systèmes de catapultes et contrepoids manuels',
      'Plateau modulable de tournage intérieur'
    ],
    specifications: 'Poutres IPN renforcées, ligne de vie continue, sol béton lissé pour glissades et tractions',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2022/06/Rigging.jpg'
  },
  {
    id: 'dojos-sceniques',
    code: '04',
    name: 'Dojos Scéniques & Salle d\'Armes',
    size: '3 Espaces distincts tatamis',
    description: 'Dédiés aux combats chorégraphiés, aux arts martiaux scéniques et au maniement des armes blanches et armes de poing à blanc sous la supervision des formateurs.',
    features: [
      'Tatamis d\'impact haute densité pour répétitions intensives',
      'Armurerie factice (katanas, épées, rapières, répliques de scène)',
      'Grands miroirs d\'axe pour le calage des angles de frappe',
      'Écrans de relecture pédagogique'
    ],
    specifications: 'Norme arts martiaux professionnels, climatisation/chauffage régulés',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/04/salle-3.jpg'
  },
  {
    id: 'manege-equestre',
    code: '05',
    name: 'Manège Équestre Couvert & Écuries',
    size: '900 m² couverts + Écuries',
    description: 'Installation permettant la pratique des cascades équestres, chutes de cheval de cinéma et voltige en selle sous abri.',
    features: [
      'Manège couvert en sable fibré spécial cinéma',
      'Écurie sur site pour les chevaux entraînés aux scènes d\'action',
      'Matériel de voltige et harnachement historique',
      'Zone de briefing et sellerie'
    ],
    specifications: 'Sol meuble fibré haute absorption, 900 m² d\'évolution sans pilier central',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/Page-Campus-Manège-équestre2-2.jpg'
  },
  {
    id: 'espace-mecanique',
    code: '06',
    name: 'Espace Mécanique & Cascades Véhicules',
    size: 'Zone bitume & terre fermée',
    description: 'Circuit clos pour les dérapages contrôlés, manœuvres d\'action en voiture et quad, percussions de cascadeurs équipés et simulations de tonneaux.',
    features: [
      'Piste d\'évolution bitumée et aire de dégagement sécurisée',
      'Véhicules équipés d\'arceaux de sécurité homologués',
      'Quads et motos de cascade',
      'Systèmes de déclenchement d\'impacts contrôlés'
    ],
    specifications: 'Accès restreint, encadrement de sécurité et dispositifs d\'extinction permanents',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/Espace-mécanique-campus.jpg'
  },
  {
    id: 'site-tournage',
    code: '07',
    name: 'Site Extérieur & Décors Naturels de Tournage',
    size: 'Domaine de 6 hectares',
    description: 'Grand parc extérieur arboré et sécurisé offrant de multiples perspectives de tournage : poursuites, explosions, décors urbains et naturels.',
    features: [
      'Domaine arboré clos de 6 hectares',
      'City Stade et installations sportives extérieures',
      'Zones dégagées pour cascades pyrotechniques',
      'Plateaux modulables pour équipes de tournage'
    ],
    specifications: 'Domaine privé clos, adapté aux tournages',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/Page-Campus-site-tournage.jpg'
  },
  {
    id: 'qg-staff-hebergement',
    code: '08',
    name: 'Hébergement & Base de Vie (90 Places)',
    size: 'Domaine de 6 hectares',
    description: 'Un campus clos permettant d\'héberger et de restaurer jusqu\'à 90 stagiaires et formateurs sur place pour une immersion complète.',
    features: [
      'Chambres avec sanitaires et connexion internet',
      'Réfectoire et cuisine professionnelle adaptée',
      'Salles de débriefing vidéo et cours théoriques',
      'Bureaux d\'accueil et de production'
    ],
    specifications: 'Cadre arboré et sécurisé, situé à 1h40 de Paris (Le Cateau-Cambrésis)',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2020/11/QG-STAFF-CUC-5.0-Copie.jpg'
  },
  {
    id: 'city-stade-exterieur',
    code: '09',
    name: 'City Stade & Espace Sportif',
    size: 'Installations sportives plein air',
    description: 'Terrain multisports extérieur et zone de conditionnement physique en plein air pour le renforcement musculaire et le travail cardio.',
    features: [
      'City stade moderne aux normes sportives',
      'Espaces d\'entraînement extérieur',
      'Pistes d\'évolution et échauffement collectif',
      'Vue directe sur la CUC Tower'
    ],
    specifications: 'Revêtement synthétique amortissant tout temps',
    image: 'https://www.campus-universcascades.com/wp-content/uploads/2025/06/City-Stade-CUC-2.0.jpg'
  }
];
