import { Discipline } from '@/types';

export const CUC_DISCIPLINES: Discipline[] = [
  {
    id: 'combat-choregraphie',
    number: 'MOD-01',
    name: 'Combat Chorégraphié & Action Design',
    shortDesc: 'Reproduction martiale millimétrée, gestion des axes caméra, synchronisation des frappes et crédibilité des impacts.',
    fullDesc: 'La maîtrise du combat scénique ne consiste pas à frapper réellement, mais à restituer la puissance et la férocité d\'un affrontement avec une précision chirurgicale. Les cascadeurs apprennent les répertoires martiaux d\'Orient et d\'Occident (boxe, muay-thaï, judo, krav maga, wushu), le calcul des distances de sécurité, et surtout l\'art de "vendre le coup" à travers une réaction corporelle viscérale et synchronisée sur l\'angle de captation de la caméra.',
    iconName: 'Swords',
    level: 'Fondamental',
    equipment: ['Protège-tibias et coquilles dissimulables', 'Mitaines d\'entraînement', 'Sacs de frappe et paos', 'Caméras de contrôle d\'axe'],
    cinemaContext: 'Scènes de corps-à-corps, bastons de bar, duels au couteau, assauts militaires rapprochés (style John Wick, Jason Bourne, The Raid).',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-combat-1024x683.jpg'
  },
  {
    id: 'chute-grande-hauteur',
    number: 'MOD-02',
    name: 'Chute de Grande Hauteur (CUC Tower 21m)',
    shortDesc: 'Défenestration, sauts dans le vide de 6 à 21 mètres, maîtrise aérienne et réceptions sécurisées sur airbags et cartons.',
    fullDesc: 'Unique en Europe, la CUC Tower dresse ses 21 mètres au-dessus du campus avec 5 paliers progressifs de saut. Les élèves y apprennent la défenestration, le décrochage arrière, le vrillé et la chute désespérée. L\'enseignement met l\'accent sur la déconnexion de l\'instinct de survie, la conservation de la posture jusqu\'à l\'impact et le déploiement des dispositifs d\'arrêt (airbags géants haute vélocité, pyramides de cartons d\'amortissement calibrés).',
    iconName: 'TrendingDown',
    level: 'Extrême',
    equipment: ['Tour CUC 21m 5 paliers', 'Airbag géant CUC homologué', 'Matelas haute densité de réception', 'Cartons de cascade calibrés'],
    cinemaContext: 'Chutes de toits, défenestrations d\'immeubles en flammes, projections hors de passerelles industrielles ou d\'hélicoptères.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chute-hauteur-1024x536.jpg'
  },
  {
    id: 'torche-humaine',
    number: 'MOD-03',
    name: 'Torche Humaine & Cascades Pyrotechniques',
    shortDesc: 'Embrasement partiel ou intégral du cascadeur sous protocole pyro thermique et gel isolant multicouches.',
    fullDesc: 'Discipline reine de l\'adrénaline maîtrisée, la torche humaine transforme le cascadeur en brasier vivant sous des protocoles de sécurité impitoyables. Les stagiaires étudient la préparation cutanée, l\'application du gel thermique ignifugeant, la superposition des combinaisons en fibres d\'aramide (Nomex), la régulation du souffle en apnée contrôlée et l\'extinction d\'urgence coordonnée par l\'équipe de safety pyrotechniciens.',
    iconName: 'Flame',
    level: 'Extrême',
    equipment: ['Combinaisons Nomex multicouches', 'Gel Pyro haute isolation', 'Cagoules & visières ignifugées', 'Extincteurs CO2 et couvertures anti-feu'],
    cinemaContext: 'Victimes d\'explosions, attaques au lance-flammes, créatures enflammées, accidents de laboratoire ou de véhicules.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-torche-1024x682.jpg'
  },
  {
    id: 'cablage-wirework',
    number: 'MOD-04',
    name: 'Câblage 3D & Wirework Cinéma',
    shortDesc: 'Harnais tactiques, lévitation, blasts d\'explosions par catapultes pneumatiques et wall-running super-héroïque.',
    fullDesc: 'Grâce à des systèmes de câbles aéronautiques, poulies de renvoi et harnais ergonomiques sous vêtements, le cascadeur défie les lois de la gravité. Ce module forme à la propulsion par contrepoids humain ou pneumatique (deadman drop, ratchets), simulant les ondes de choc d\'explosions ou les pouvoirs surhumains de comics américains, tout en conservant une fluidité biomécanique impeccable dans l\'air.',
    iconName: 'Cable',
    level: 'Avancé',
    equipment: ['Harnais de voltige intégrés', 'Câbles kevlar & acier aéro', 'Poulies à roulement scellé', 'Plaques de protection hanches et lombaires'],
    cinemaContext: 'Films de super-héros (Marvel, DC), projections arrière suite à un tir de fusil à pompe, vols mystiques de cinéma asiatique (wuxia).',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-cablage-1024x682.jpg'
  },
  {
    id: 'forces-speciales',
    number: 'MOD-05',
    name: 'Forces Spéciales & Maniement Tactique',
    shortDesc: 'Déplacements tactiques d\'unités d\'élite, maniement réaliste d\'armes de poing et d\'assaut à blanc, rappel commando.',
    fullDesc: 'Inspiré des doctrines du GIGN, du RAID et des Navy SEALs, ce module enseigne la gestuelle des opérateurs de forces spéciales : tenue d\'arme, rechargement d\'urgence sous tension, progression en couloir et en escalier, communication par signes, descente de paroi en rappel tactique tête en bas. Les élèves tournent des courts-métrages tactiques pour vérifier la crédibilité chirurgicale de leur attitude à l\'écran.',
    iconName: 'Crosshair',
    level: 'Tactique',
    equipment: ['Répliques Glock & fusils d\'assaut à blanc', 'Holsters tactiques Kydex', 'Cordes de rappel et descendeurs en huit', 'Gilets pare-balles de cinéma'],
    cinemaContext: 'Raids anti-terroristes, infiltrations commandos, fusillades d\'action urbaine, braquages de haute volée.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-forces-speciales-1024x682.jpg'
  },
  {
    id: 'parkour-yamakasi',
    number: 'MOD-06',
    name: 'Parkour & Art du Déplacement (Yamakasi)',
    shortDesc: 'Franchissement rapide d\'obstacles urbains, fluidité cinétique et méthode originale conçue avec Malik Diouf.',
    fullDesc: 'L\'Art du Déplacement enseigné au CUC bénéficie de l\'expertise directe de Malik Diouf, co-fondateur du légendaire groupe Yamakasi. Sur un Parkour Park modulable de plusieurs centaines de mètres carrés, les cascadeurs apprennent le saut de bras, le saut de chat, le passe-muraille, les réceptions roulées sur sol dur et l\'enchaînement de cascades en milieu urbain et industriel sans rupture de vitesse.',
    iconName: 'Activity',
    level: 'Fondamental',
    equipment: ['Parkour Park dédié modulable', 'Structures métalliques et barres d\'évolution', 'Praticables amortissants', 'Surfaces béton et bois brut'],
    cinemaContext: 'Poursuites sur les toits, fuites de voleurs agiles, scènes d\'action urbaines réalistes sans trucages numériques.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-parkour-1024x682.jpg'
  },
  {
    id: 'chutes-sa-hauteur',
    number: 'MOD-07',
    name: 'Chutes de sa Hauteur & Brise-Mobilier',
    shortDesc: 'L\'art fondamental de s\'effondrer sur sol dur, d\'encaisser les projections et de briser tables et chaises en sucre.',
    fullDesc: 'La chute de sa hauteur est la signature absolue du cascadeur professionnel : celle qui le différencie du simple athlète. Les élèves apprennent à absorber l\'onde de choc sur les parties charnues du corps sans heurter la tête, les coudes ou les vertèbres. Le module comprend l\'apprentissage des passages à travers les baies vitrées en résine (sucre/candygas) et le fracas contre du mobilier brisable de cinéma.',
    iconName: 'ShieldAlert',
    level: 'Fondamental',
    equipment: ['Coudières et genouillères néoprène plates', 'Mobilier cassable de cinéma (balsa)', 'Verre de cinéma résine', 'Revêtements sol béton & carrelage'],
    cinemaContext: 'K.O. instantanés, bagarres de saloon, projections contre des comptoirs, corps projetés au sol après tir.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chutes-1024x682.jpg'
  },
  {
    id: 'armes-blanches',
    number: 'MOD-08',
    name: 'Maniement d\'Armes Blanches Historiques & Modernes',
    shortDesc: 'Katanas, épées médiévales bâtardes, rapières, glaives et couteaux tactiques en chorégraphie collective.',
    fullDesc: 'Le combat à l\'arme blanche exige une rigueur géométrique : sécurité des lames, distance d\'estoc, parades et bruitages. Les cascadeurs manient des armes de répétition en aluminium et mousse haute densité avant de passer aux lames d\'apparence réelle. Le travail intègre les combats d\'époque pour le cinéma historique et les combats de sabre dynamiques contemporains.',
    iconName: 'Sparkles',
    level: 'Avancé',
    equipment: ['Katanas de pratique & bokkens', 'Épées médiévales en aluminium scénique', 'Rapières et dagues de parade', 'Boucliers de scène'],
    cinemaContext: 'Fresques médiévales, combats de gladiateurs, thrillers d\'assassins au katana, duels d\'escrime cape et d\'épée.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-armes-1024x682.jpg'
  },
  {
    id: 'chute-escalier',
    number: 'MOD-09',
    name: 'Chutes d\'Escalier Spectaculaires',
    shortDesc: 'Dégringolades avant, arrière et latérales sur marches en béton et métal avec protection invisible.',
    fullDesc: 'Considérée comme l\'un des exercices les plus impressionnants visuellement, la chute d\'escalier exige une technique de roulement très précise pour éviter de briser la trajectoire ou de subir des contusions osseuses. Les cascadeurs apprennent à enchaîner les rebonds contrôlés sur les marches, à garder les extrémités gainées et à finir leur course face à la lentille de l\'opérateur.',
    iconName: 'AlignVerticalJustifyEnd',
    level: 'Avancé',
    equipment: ['Escalier d\'entraînement modulable', 'Protections sous-cutanées D3O invisibles', 'Système de guidage de rampe', 'Caméras basse perspective'],
    cinemaContext: 'Policiers ou criminels poussés dans une cage d\'escalier lors d\'une confrontation rapprochée.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-chutes-escaliers-1024x637.jpg'
  },
  {
    id: 'acrobatie-physique',
    number: 'MOD-10',
    name: 'Acrobatie & Gymnastique de Stunt',
    shortDesc: 'Vrilles, saltos, flic-flacs et acrobaties sur sols durs pour préparer les projections violentes et esquives acrobatiques.',
    fullDesc: 'L\'acrobatie au CUC n\'a rien d\'un spectacle de cirque convenu : elle prépare le corps aux sollicitations mécaniques violentes des explosions et des cascades physiques. Dans les hangars de 700m² et 600m² équipés d\'une immense fosse à cubes de mousse et de trampolines de compétition, les élèves développent leur proprioception 3D avant d\'adapter leurs figures aux sols durs et aux costumes exigus des tournages.',
    iconName: 'RotateCcw',
    level: 'Fondamental',
    equipment: ['Fosse à cubes de mousse 50m³', 'Trampolines de gymnastique pro', 'Pistes de tumbling et praticables', 'Tapis de réception de 40cm'],
    cinemaContext: 'Esquives spectaculaires, passages par-dessus des véhicules en mouvement, roulades d\'impact.',
    heroImage: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-formation-acro-1024x682.jpg'
  }
];
