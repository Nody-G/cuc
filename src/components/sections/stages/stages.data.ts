export interface StageData {
  id: string;
  badge: {
    text: string;
    variant: 'yellow' | 'emerald' | 'red';
  };
  subBadge?: string;
  highlightText?: string;
  title: string;
  description: string;
  details: Array<{
    icon: 'clock' | 'bed' | 'utensils' | 'map' | 'shield' | 'sparkles' | 'users';
    text: string;
  }>;
  buttonLabel: string;
  pdfLink?: {
    href: string;
    label: string;
  };
  image: {
    src: string;
    alt: string;
  };
  isPopular?: boolean;
}

export const STAGES_LIST: StageData[] = [
  {
    id: 'weekend-immersion',
    isPopular: true,
    badge: {
      text: 'OFFRE POPULAIRE',
      variant: 'yellow',
    },
    subBadge: 'ACCESSIBLE DÈS 16 ANS',
    highlightText: 'PENSION COMPLÈTE INCLUSE',
    title: 'FORMULE WEEK-END IMMERSION CUC',
    description: "Vivez la vie d'un cascadeur de cinéma pendant deux jours complets. Dormez sur le campus, partagez les repas avec l'équipe et sautez sur l'airbag géant en toute sécurité. Idéal pour découvrir ses capacités physiques et faire le plein de sensations fortes.",
    details: [
      { icon: 'clock', text: 'Vendredi 17h au Dimanche 17h30 (16h de pratique)' },
      { icon: 'bed', text: 'Hébergement sur place (chambres campus)' },
      { icon: 'utensils', text: 'Tous les repas compris (du vendredi soir au dimanche midi)' },
      { icon: 'map', text: 'Domaine CUC, Le Cateau-Cambrésis (59)' },
    ],
    buttonLabel: 'Réserver mon Week-end (250,00 €)',
    pdfLink: {
      href: 'https://www.campus-universcascades.com/wp-content/uploads/2025/01/Plaquette-Week-end-Immersion-CUC.pdf',
      label: 'Télécharger la Plaquette Week-end (PDF)',
    },
    image: {
      src: 'https://www.campus-universcascades.com/wp-content/uploads/2021/05/Stage-WE-Immersion.png',
      alt: 'Affiche Stage Week-end Immersion CUC',
    },
  },
  {
    id: 'afdas-artistes-interpretes',
    badge: {
      text: 'PRISE EN CHARGE AFDAS 100%',
      variant: 'emerald',
    },
    subBadge: 'COMÉDIENS • DANSEURS • CIRCASSIENS',
    title: 'STAGE AFDAS — ARTISTES INTERPRÈTES',
    description: "Donnez à vos rôles une crédibilité totale dans les scènes d'action. Formation de 70 heures conventionnée AFDAS dispensée au sein de notre studio parisien à Gennevilliers. Apprenez à encaisser les impacts, manipuler des armes à blanc, chuter dans les escaliers et tournez votre bande-démo d'action.",
    details: [
      { icon: 'clock', text: '2 Semaines (10 jours ouvrés / 70 heures)' },
      { icon: 'map', text: 'Pôle CUC Île-de-France, 92230 Gennevilliers' },
      { icon: 'shield', text: 'Conventionné AFDAS (0€ de reste à charge pour l\'artiste)' },
      { icon: 'sparkles', text: 'Tournage d\'une bande-démo action individuelle' },
    ],
    buttonLabel: 'Demander ma Prise en Charge AFDAS',
    image: {
      src: 'https://www.campus-universcascades.com/wp-content/uploads/2022/04/Stage-AFDAS.png',
      alt: 'Affiche Stage AFDAS Artistes Interprètes CUC',
    },
  },
  {
    id: 'stunt-summer-camp',
    badge: {
      text: "STAGE D'ÉTÉ INTENSIF",
      variant: 'yellow',
    },
    subBadge: 'DÈS 15 ANS • PARKOUR & AIRBAG',
    title: 'STUNT SUMMER CAMP CUC',
    description: "Le rendez-vous de la saison estivale : une semaine d'entraînement intensif et d'adrénaline pure. Parkour Park Yamakasi, sauts libres sur airbag géant, acrobaties sur fosse à cubes et combats de cinéma. Formule internat avec ambiance fraternelle et défis d'action.",
    details: [
      { icon: 'clock', text: '1 Semaine (Du dimanche au vendredi soir / 35h)' },
      { icon: 'bed', text: 'Formule internat avec hébergement et pension complète' },
      { icon: 'users', text: 'Encadré par les traceurs d\'élite et cascadeurs CUC' },
      { icon: 'map', text: 'Campus CUC, 59360 Le Cateau-Cambrésis' },
    ],
    buttonLabel: 'Pré-inscriptions Summer Camp',
    pdfLink: {
      href: 'https://www.campus-universcascades.com/wp-content/uploads/2026/08/Plaquette-CUC-Summer-Camp-2k27.pdf',
      label: 'Télécharger la Plaquette Summer Camp (PDF)',
    },
    image: {
      src: 'https://www.campus-universcascades.com/wp-content/uploads/2023/10/Stage-Summer-Camp-2.png',
      alt: 'Affiche Stunt Summer Camp CUC',
    },
  },
  {
    id: 'afdas-cascadeurs-pro',
    badge: {
      text: 'CASCADEURS PROS EN EXERCICE',
      variant: 'red',
    },
    subBadge: 'PROVENCE STUDIOS (MARTIGUES)',
    title: 'STAGE AFDAS — CASCADEURS PRO (PROVENCE STUDIOS)',
    description: "Session de perfectionnement d'élite organisée au sein des infrastructures monumentales de Provence Studios. Rigs de câblage 3 axes haute vitesse, catapultes pneumatiques (ratchets), torches humaines intégrales et protocoles de sauvetage d'urgence pour tournages hollywoodiens.",
    details: [
      { icon: 'map', text: 'Provence Studios, Martigues (Bouches-du-Rhône)' },
      { icon: 'shield', text: 'Prise en charge AFDAS Intermittents Cascadeurs' },
    ],
    buttonLabel: 'Contacter pour les Sessions Pro',
    image: {
      src: 'https://www.campus-universcascades.com/wp-content/uploads/2025/04/Stage-Cascadeur-Pro.png',
      alt: 'Affiche Stage Cascadeur Pro CUC Provence Studios',
    },
  },
];
