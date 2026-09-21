import { Discipline } from '@/types';

/**
 * Référentiel éditorial des disciplines enseignées.
 *
 * Doctrine : les descriptions sont courtes et factuelles. Chaque phrase doit
 * apporter une information vérifiable (équipement, geste technique, contexte de
 * tournage) et non une appréciation. Aucun superlatif, aucune promesse.
 */
export const CUC_DISCIPLINES: Discipline[] = [
  {
    id: 'combat-choregraphie',
    number: '01',
    name: 'Combat Chorégraphié & Action Design',
    shortDesc: 'Reproduction martiale millimétrée, gestion des axes caméra, synchronisation des frappes et crédibilité des impacts.',
    fullDesc: 'Le combat scénique ne consiste pas à frapper réellement, mais à restituer la puissance d\'un affrontement. Répertoires martiaux, distances de sécurité et valorisation du coup selon l\'axe de la caméra.',
    iconName: 'Swords',
    level: 'Fondamental',
    equipment: ['Protège-tibias et coquilles dissimulables', 'Mitaines d\'entraînement', 'Sacs de frappe et paos', 'Caméras de contrôle d\'axe'],
    cinemaContext: 'Scènes de corps-à-corps, bastons, duels au couteau, assauts d\'action rapprochés.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-combat-1024x683.jpg'
  },
  {
    id: 'chute-grande-hauteur',
    number: '02',
    name: 'Chute de Grande Hauteur (CUC Tower 21m)',
    shortDesc: 'Défenestration, sauts dans le vide de 6 à 21 mètres, maîtrise aérienne et réceptions sécurisées sur airbags et cartons.',
    fullDesc: 'La CUC Tower offre plusieurs plateformes de saut jusqu\'à 21 mètres. Défenestration, décrochage arrière et vrillé, avec un travail sur les repères dans l\'espace, la posture jusqu\'à la réception et les dispositifs d\'amortissement.',
    iconName: 'TrendingDown',
    level: 'Extrême',
    equipment: ['Tour de saut CUC 21m', 'Airbag géant CUC homologué', 'Matelas haute densité de réception', 'Cartons de cascade calibrés'],
    cinemaContext: 'Chutes de toits, défenestrations, projections hors de passerelles ou d\'hélicoptères.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-chute-hauteur-1024x536.jpg'
  },
  {
    id: 'torche-humaine',
    number: '03',
    name: 'Torche Humaine & Cascades Pyrotechniques',
    shortDesc: 'Embrasement partiel ou intégral du cascadeur avec gel thermique de protection et tenues ignifugées multicouches.',
    fullDesc: 'Application du gel thermique isolant, combinaisons en fibres d\'aramide (Nomex), gestion du souffle et coordination de l\'extinction d\'urgence avec les techniciens pyrotechniques.',
    iconName: 'Flame',
    level: 'Extrême',
    equipment: ['Combinaisons Nomex multicouches', 'Gel thermique haute isolation', 'Cagoules & visières ignifugées', 'Extincteurs CO2 et couvertures anti-feu'],
    cinemaContext: 'Victimes d\'explosions, scènes d\'incendie, accidents de laboratoire ou de véhicules.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-torche-1024x682.jpg'
  },
  {
    id: 'cablage-wirework',
    number: '04',
    name: 'Câblage 3D & Wirework Cinéma',
    shortDesc: 'Harnais de voltige, suspensions, projections d\'explosions et wall-running de cinéma.',
    fullDesc: 'Câbles aéronautiques, poulies de renvoi et harnais ergonomiques portés sous les vêtements. Le module forme à la propulsion par contrepoids humain ou pneumatique (deadman drop, ratchets).',
    iconName: 'Cable',
    level: 'Avancé',
    equipment: ['Harnais de voltige intégrés', 'Câbles kevlar & acier aéro', 'Poulies à roulement scellé', 'Plaques de protection hanches et lombaires'],
    cinemaContext: 'Films de super-héros, projections arrière suite à un tir balistique, vols acrobatiques de cinéma d\'action.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-cablage-1024x682.jpg'
  },
  {
    id: 'forces-speciales',
    number: '05',
    name: 'Maniement d\'Armes & Rôles d\'Intervention',
    shortDesc: 'Déplacements synchronisés d\'unités d\'intervention, maniement réaliste d\'armes factices et à blanc, rappel sur paroi.',
    fullDesc: 'Gestuelle des unités d\'intervention au cinéma : manipulation d\'armes à blanc, progression coordonnée en couloir et escalier, communication gestuelle et descentes en rappel sur paroi.',
    iconName: 'Crosshair',
    level: 'Avancé',
    equipment: ['Répliques d\'armes factices et à blanc', 'Holsters d\'action', 'Cordes de rappel et descendeurs', 'Gilets tactiques de cinéma'],
    cinemaContext: 'Infiltrations, fusillades d\'action urbaine, interventions policières et scènes de braquage.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-forces-speciales-1024x682.jpg'
  },
  {
    id: 'parkour-yamakasi',
    number: '06',
    name: 'Parkour & Méthode Yamakasi',
    shortDesc: 'Franchissement rapide d\'obstacles urbains, fluidité et technique de Parkour avec Malik Diouf.',
    fullDesc: 'Enseigné avec Malik Diouf, co-fondateur du groupe Yamakasi. Sur un Parkour Park modulable : saut de bras, saut de chat, passe-muraille, réceptions roulées sur sol dur et enchaînements sans rupture de vitesse.',
    iconName: 'Activity',
    level: 'Fondamental',
    equipment: ['Parkour Park dédié modulable', 'Structures métalliques et barres d\'évolution', 'Praticables amortissants', 'Surfaces béton et bois brut'],
    cinemaContext: 'Poursuites sur les toits, fuites agiles, scènes d\'action urbaines réalistes sans trucages numériques.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-parkour-1024x682.jpg'
  },
  {
    id: 'chutes-sa-hauteur',
    number: '07',
    name: 'Chutes de sa Hauteur & Brise-Mobilier',
    shortDesc: 'Apprentissage des réceptions au sol, de l\'absorption des chocs et des impacts sur mobilier de cinéma.',
    fullDesc: 'Absorption des chocs sur les zones amortissantes du corps, pour préserver la tête, les articulations et la colonne vertébrale. Inclut les passages à travers le verre en résine et le mobilier cassable.',
    iconName: 'ShieldAlert',
    level: 'Fondamental',
    equipment: ['Coudières et genouillères néoprène plates', 'Mobilier cassable de cinéma (balsa)', 'Verre de cinéma résine', 'Revêtements sol béton & carrelage'],
    cinemaContext: 'K.O., bagarres, projections contre des éléments de décor, chutes au sol après impact.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-chutes-1024x682.jpg'
  },
  {
    id: 'armes-blanches',
    number: '08',
    name: 'Maniement d\'Armes Blanches Historiques & Modernes',
    shortDesc: 'Katanas, épées, rapières et armes de parade en chorégraphie scénique.',
    fullDesc: 'Sécurité des lames, distance d\'estoc, parades et intentions de frappe. Le travail commence avec des armes de répétition en aluminium et mousse, puis aborde les armes scéniques, d\'époque comme contemporaines.',
    iconName: 'Sparkles',
    level: 'Avancé',
    equipment: ['Katanas de pratique & bokkens', 'Épées médiévales en aluminium scénique', 'Rapières et dagues de parade', 'Boucliers de scène'],
    cinemaContext: 'Fresques historiques, combats d\'époque, duels d\'escrime et scènes d\'action modernes au sabre.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-armes-1024x682.jpg'
  },
  {
    id: 'chute-escalier',
    number: '09',
    name: 'Chutes d\'Escalier',
    shortDesc: 'Dégringolades avant, arrière et latérales sur marches en béton et métal avec protections discrètes.',
    fullDesc: 'Roulement précis pour contrôler la trajectoire et éviter les traumatismes : contacts amortis sur les marches, gainage corporel et sortie de chute dans l\'axe de la caméra.',
    iconName: 'AlignVerticalJustifyEnd',
    level: 'Avancé',
    equipment: ['Escalier d\'entraînement modulable', 'Protections D3O sous vêtements', 'Système de guidage de rampe', 'Caméras basse perspective'],
    cinemaContext: 'Confrontations rapprochées en cage d\'escalier, bousculades et chutes d\'étage.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-chutes-escaliers-1024x637.jpg'
  },
  {
    id: 'acrobatie-physique',
    number: '10',
    name: 'Acrobatie & Gymnastique de Cascade',
    shortDesc: 'Vrilles, saltos, flic-flacs et acrobaties au sol pour préparer les projections et esquives dynamiques.',
    fullDesc: 'Fosse à cubes de mousse et trampolines : les élèves développent leur repérage dans l\'espace avant d\'adapter leurs figures aux contraintes de tournage (sols durs, costumes, angles de prise de vue).',
    iconName: 'RotateCcw',
    level: 'Fondamental',
    equipment: ['Fosse à cubes de mousse 50m³', 'Trampolines de gymnastique pro', 'Pistes de tumbling et praticables', 'Tapis de réception de 40cm'],
    cinemaContext: 'Esquives spectaculaires, franchissements de véhicules, roulades d\'impact.',
    heroImage: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-formation-acro-1024x682.jpg'
  }
];
