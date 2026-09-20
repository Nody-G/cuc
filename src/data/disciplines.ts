import { Discipline } from '@/types';

export const CUC_DISCIPLINES: Discipline[] = [
  {
    id: 'combat-choregraphie',
    number: '01',
    name: 'Combat Chorégraphié & Action Design',
    shortDesc: 'Reproduction martiale millimétrée, gestion des axes caméra, synchronisation des frappes et crédibilité des impacts.',
    fullDesc: 'La maîtrise du combat scénique ne consiste pas à frapper réellement, mais à restituer la puissance d\'un affrontement avec une précision technique. Les cascadeurs apprennent les répertoires martiaux d\'Orient et d\'Occident (boxe, muay-thaï, judo, krav maga, wushu), le calcul des distances de sécurité, et l\'art de valoriser le coup à travers une réaction corporelle synchronisée sur l\'angle de captation de la caméra.',
    iconName: 'Swords',
    level: 'Fondamental',
    equipment: ['Protège-tibias et coquilles dissimulables', 'Mitaines d\'entraînement', 'Sacs de frappe et paos', 'Caméras de contrôle d\'axe'],
    cinemaContext: 'Scènes de corps-à-corps, bastons, duels au couteau, assauts d\'action rapprochés.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-combat-1024x683.jpg'
  },
  {
    id: 'chute-grande-hauteur',
    number: '02',
    name: 'Chute de Grande Hauteur (CUC Tower 21m)',
    shortDesc: 'Défenestration, sauts dans le vide de 6 à 21 mètres, maîtrise aérienne et réceptions sécurisées sur airbags et cartons.',
    fullDesc: 'Unique en Europe, la CUC Tower dresse ses 21 mètres au-dessus du campus avec plusieurs plateformes progressives de saut. Les élèves y apprennent la défenestration, le décrochage arrière, le vrillé et la chute libre. L\'enseignement met l\'accent sur la maîtrise des repères dans l\'espace, la conservation de la posture jusqu\'à la réception et l\'utilisation rigoureuse des dispositifs d\'amortissement (airbag de cascade professionnel, cartons d\'impact).',
    iconName: 'TrendingDown',
    level: 'Extrême',
    equipment: ['Tour de saut CUC 21m', 'Airbag géant CUC homologué', 'Matelas haute densité de réception', 'Cartons de cascade calibrés'],
    cinemaContext: 'Chutes de toits, défenestrations, projections hors de passerelles ou d\'hélicoptères.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chute-hauteur-1024x536.jpg'
  },
  {
    id: 'torche-humaine',
    number: '03',
    name: 'Torche Humaine & Cascades Pyrotechniques',
    shortDesc: 'Embrasement partiel ou intégral du cascadeur avec gel thermique de protection et tenues ignifugées multicouches.',
    fullDesc: 'La torche humaine exige une préparation technique rigoureuse et une sécurité sans compromis. Les stagiaires étudient l\'application du gel thermique isolant, l\'ajustement des combinaisons en fibres d\'aramide (Nomex), la gestion du souffle et la coordination d\'extinction d\'urgence avec les techniciens pyrotechniques.',
    iconName: 'Flame',
    level: 'Extrême',
    equipment: ['Combinaisons Nomex multicouches', 'Gel thermique haute isolation', 'Cagoules & visières ignifugées', 'Extincteurs CO2 et couvertures anti-feu'],
    cinemaContext: 'Victimes d\'explosions, scènes d\'incendie, accidents de laboratoire ou de véhicules.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-torche-1024x682.jpg'
  },
  {
    id: 'cablage-wirework',
    number: '04',
    name: 'Câblage 3D & Wirework Cinéma',
    shortDesc: 'Harnais de voltige, suspensions, projections d\'explosions et wall-running de cinéma.',
    fullDesc: 'Grâce à des systèmes de câbles aéronautiques, poulies de renvoi et harnais ergonomiques sous vêtements, le cascadeur travaille les scènes en suspension. Ce module forme à la propulsion par contrepoids humain ou pneumatique (deadman drop, ratchets), simulant les ondes de choc d\'explosions ou les acrobaties aériennes, avec une fluidité gestuelle adaptée aux tournages.',
    iconName: 'Cable',
    level: 'Avancé',
    equipment: ['Harnais de voltige intégrés', 'Câbles kevlar & acier aéro', 'Poulies à roulement scellé', 'Plaques de protection hanches et lombaires'],
    cinemaContext: 'Films de super-héros, projections arrière suite à un tir balistique, vols acrobatiques de cinéma d\'action.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-cablage-1024x682.jpg'
  },
  {
    id: 'forces-speciales',
    number: '05',
    name: 'Maniement d\'Armes & Rôles d\'Intervention',
    shortDesc: 'Déplacements synchronisés d\'unités d\'intervention, maniement réaliste d\'armes factices et à blanc, rappel sur paroi.',
    fullDesc: 'Ce module enseigne la gestuelle précise des unités d\'intervention au cinéma : manipulation d\'armes à blanc, progression coordonnée en couloir et escalier, communication gestuelle et descentes en rappel sur paroi. Les élèves s\'entraînent face caméra pour parfaire la crédibilité et le réalisme de leurs postures.',
    iconName: 'Crosshair',
    level: 'Avancé',
    equipment: ['Répliques d\'armes factices et à blanc', 'Holsters d\'action', 'Cordes de rappel et descendeurs', 'Gilets tactiques de cinéma'],
    cinemaContext: 'Infiltrations, fusillades d\'action urbaine, interventions policières et scènes de braquage.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-forces-speciales-1024x682.jpg'
  },
  {
    id: 'parkour-yamakasi',
    number: '06',
    name: 'Parkour & Méthode Yamakasi',
    shortDesc: 'Franchissement rapide d\'obstacles urbains, fluidité et technique de Parkour avec Malik Diouf.',
    fullDesc: 'Le Parkour enseigné au CUC bénéficie de l\'expertise directe de Malik Diouf, co-fondateur du groupe Yamakasi. Sur un Parkour Park modulable de plusieurs centaines de mètres carrés, les cascadeurs apprennent le saut de bras, le saut de chat, le passe-muraille, les réceptions roulées sur sol dur et l\'enchaînement de trajectoires en milieu urbain sans rupture de vitesse.',
    iconName: 'Activity',
    level: 'Fondamental',
    equipment: ['Parkour Park dédié modulable', 'Structures métalliques et barres d\'évolution', 'Praticables amortissants', 'Surfaces béton et bois brut'],
    cinemaContext: 'Poursuites sur les toits, fuites agiles, scènes d\'action urbaines réalistes sans trucages numériques.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-parkour-1024x682.jpg'
  },
  {
    id: 'chutes-sa-hauteur',
    number: '07',
    name: 'Chutes de sa Hauteur & Brise-Mobilier',
    shortDesc: 'Apprentissage des réceptions au sol, de l\'absorption des chocs et des impacts sur mobilier de cinéma.',
    fullDesc: 'Ce module enseigne l\'absorption des chocs sur les zones amortissantes du corps afin de préserver la tête, les articulations et la colonne vertébrale. L\'entraînement inclut également les passages à travers le verre en résine et le mobilier cassable de cinéma.',
    iconName: 'ShieldAlert',
    level: 'Fondamental',
    equipment: ['Coudières et genouillères néoprène plates', 'Mobilier cassable de cinéma (balsa)', 'Verre de cinéma résine', 'Revêtements sol béton & carrelage'],
    cinemaContext: 'K.O., bagarres, projections contre des éléments de décor, chutes au sol après impact.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chutes-1024x682.jpg'
  },
  {
    id: 'armes-blanches',
    number: '08',
    name: 'Maniement d\'Armes Blanches Historiques & Modernes',
    shortDesc: 'Katanas, épées, rapières et armes de parade en chorégraphie scénique.',
    fullDesc: 'Le combat à l\'arme blanche exige une rigueur géométrique : sécurité des lames, distance d\'estoc, parades et intentions de frappe. Les cascadeurs manient des armes de répétition en aluminium et mousse avant d\'aborder les armes scéniques. Le travail intègre les combats d\'époque pour le cinéma historique et les combats contemporains.',
    iconName: 'Sparkles',
    level: 'Avancé',
    equipment: ['Katanas de pratique & bokkens', 'Épées médiévales en aluminium scénique', 'Rapières et dagues de parade', 'Boucliers de scène'],
    cinemaContext: 'Fresques historiques, combats d\'époque, duels d\'escrime et scènes d\'action modernes au sabre.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-armes-1024x682.jpg'
  },
  {
    id: 'chute-escalier',
    number: '09',
    name: 'Chutes d\'Escalier',
    shortDesc: 'Dégringolades avant, arrière et latérales sur marches en béton et métal avec protections discrètes.',
    fullDesc: 'Exercice spectaculaire, la chute d\'escalier exige une technique de roulement précise pour contrôler la trajectoire et éviter les traumatismes. Les cascadeurs apprennent à enchaîner les contacts amortis sur les marches, à maintenir le gainage corporel et à finaliser leur course dans l\'axe de la caméra.',
    iconName: 'AlignVerticalJustifyEnd',
    level: 'Avancé',
    equipment: ['Escalier d\'entraînement modulable', 'Protections D3O sous vêtements', 'Système de guidage de rampe', 'Caméras basse perspective'],
    cinemaContext: 'Confrontations rapprochées en cage d\'escalier, bousculades et chutes d\'étage.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chutes-escaliers-1024x637.jpg'
  },
  {
    id: 'acrobatie-physique',
    number: '10',
    name: 'Acrobatie & Gymnastique de Cascade',
    shortDesc: 'Vrilles, saltos, flic-flacs et acrobaties au sol pour préparer les projections et esquives dynamiques.',
    fullDesc: 'L\'acrobatie au CUC prépare le corps aux sollicitations des cascades physiques et des scènes d\'action. Dans les halles d\'entraînement équipées d\'une fosse à cubes de mousse et de trampolines, les élèves développent leur repérage dans l\'espace avant d\'adapter leurs figures aux contraintes de tournage (sols durs, costumes et angles de prise de vue).',
    iconName: 'RotateCcw',
    level: 'Fondamental',
    equipment: ['Fosse à cubes de mousse 50m³', 'Trampolines de gymnastique pro', 'Pistes de tumbling et praticables', 'Tapis de réception de 40cm'],
    cinemaContext: 'Esquives spectaculaires, franchissements de véhicules, roulades d\'impact.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-acro-1024x682.jpg'
  }
];
