export interface SpectacleTypeItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  specs: Array<{ label: string; value: string }>;
  image: string;
  imageAlt: string;
  accentColor?: string;
}

export const SPECTACLE_TYPES: SpectacleTypeItem[] = [
  {
    id: 'show-parkour-acrobatie',
    badge: '01 • Urbain & Voltige',
    title: 'Show Parkour & Acrobatie',
    subtitle: 'Franchissements synchronisés, voltige urbaine et énergie pure',
    description:
      'Une démonstration physique d’une intensité rare : franchissements vertigineux sur modules, saltos synchronisés, courses-poursuites dynamiques et acrobaties au sol. Conçu et interprété par les cascadeurs et traceurs professionnels du CUC.',
    specs: [
      { label: 'Espace requis :', value: 'Intérieur ou extérieur (modules cubiques et praticables adaptables)' },
      { label: 'Artistes :', value: '3 à 10 cascadeurs / traceurs professionnels' },
      { label: 'Durée :', value: 'De 8 min (format impact) à 30 min scénarisées' },
      { label: 'Adaptabilité :', value: 'Scènes, salons, lancements de produits, arènes sportives' },
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/spectacles-01-show-parkour-acrobatie.webp',
    imageAlt: 'Show Parkour et Acrobatie CUC Events',
  },
  {
    id: 'show-james-bond',
    badge: '02 • Cinéma & Espionnage',
    title: 'Show James Bond 007',
    subtitle: 'Smoking, close-combat millimétré et poursuites dignes du grand écran',
    description:
      'Plongez vos invités au cœur d’une scène d’action digne de 007 : irruption surprise au milieu du public ou sur scène, combats à mains nues en smoking, désarmements, projections acrobatiques et chorégraphies réglées au millimètre.',
    specs: [
      { label: 'Mise en scène :', value: 'Intervention sur scène ou infiltration surprise parmi les convives' },
      { label: 'Artistes :', value: '2 à 6 cascadeurs-comédiens en costume' },
      { label: 'Durée :', value: 'Tableau explosif de 8 à 15 minutes' },
      { label: 'Idéal pour :', value: 'Soirées de gala, conventions d’entreprise, casinos, réceptions VIP' },
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/spectacles-02-show-james-bond.webp',
    imageAlt: 'Show James Bond 007 cascades CUC Events',
  },
  {
    id: 'show-super-heros',
    badge: '03 • Grand Spectacle & Pop Culture',
    title: 'Show Super-Héros',
    subtitle: 'Affrontements iconiques, acrobaties aériennes et effets scéniques',
    description:
      'Les plus grands duels de l’univers des comics prennent vie devant votre public : confrontations spectaculaires entre héros et antagonistes (univers Gotham, Marvel/DC), sauts acrobatiques, maniement d’accessoires de cinéma et humour scénique.',
    specs: [
      { label: 'Costumes & Accessoires :', value: 'Répliques cinéma haute finition et accessoires d’impact sécurisés' },
      { label: 'Artistes :', value: '2 à 8 cascadeurs et acrobates spécialisés' },
      { label: 'Durée :', value: 'Show de 10 à 25 minutes + séance photo avec le public' },
      { label: 'Public :', value: 'Festivals pop-culture, parcs de loisirs, événements familiaux et marques' },
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/spectacles-03-show-super-heros.webp',
    imageAlt: 'Show Super-Héros cascades CUC Events',
  },
  {
    id: 'show-casa-de-papel',
    badge: '04 • Immersion & Braquage Scénique',
    title: 'Show Casa de Papel',
    subtitle: 'Combinaisons rouges, prise d’otage théâtralisée et intervention tactique',
    description:
      'Un happening immersif à très haute tension : entrée spectaculaire en combinaisons rouges et masques iconiques, confrontation chorégraphiée avec les forces d’intervention, cascades physiques, humour et interaction directe avec la salle.',
    specs: [
      { label: 'Format :', value: 'Happening immersif en salle + chorégraphie de combat et acrobaties' },
      { label: 'Artistes :', value: '3 à 8 cascadeurs-comédiens' },
      { label: 'Durée :', value: '10 à 20 minutes d’action rythmée' },
      { label: 'Usage :', value: 'Séminaires, soirées d’entreprise, ouvertures de plénières, événements privés' },
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/spectacles-04-show-casa-de-papel.webp',
    imageAlt: 'Show Casa de Papel cascades CUC Events',
  },
  {
    id: 'show-acro-performances',
    badge: '05 • Comédie, Tricks & Grand Spectacle',
    title: 'Show Acro & Performances',
    subtitle: 'Comédie visuelle, personnages déjantés, escrime et cascades sur-mesure',
    description:
      'La rencontre explosive entre la comédie physique, le tricking et la cascade de cinéma : tableaux inspirés de The Mask, Pirates des Caraïbes ou Mission Impossible, mêlant humour, danse acrobatique, duels à l’épée et performances aériennes.',
    specs: [
      { label: 'Répertoire :', value: 'Créations originales sur-mesure, comédie d’action, cape et épée, tricking' },
      { label: 'Artistes :', value: '3 à 12 artistes pluridisciplinaires (cascadeurs, danseurs-acrobates, bretteurs)' },
      { label: 'Durée :', value: 'De 10 min à 45 min (spectacle complet multi-tableaux)' },
      { label: 'Adaptabilité :', value: 'Théâtres, festivals, collectivités, parcs à thèmes, télévision' },
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/spectacles-05-show-acro-performances.webp',
    imageAlt: 'Show Acro et Performances CUC Events',
  },
];
