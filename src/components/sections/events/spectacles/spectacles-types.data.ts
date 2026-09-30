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
    id: 'yamakasi-parkour',
    badge: 'Urbain & Yamakasi',
    title: 'Show Parkour & Art du Déplacement',
    subtitle: 'Chorégraphié par les pionniers de la discipline',
    description:
      'Une démonstration physique d’une intensité rare : franchissements vertigineux, courses-poursuites dynamiques, acrobaties de rue et franchissements de modules. Conçu et interprété en collaboration avec les co-fondateurs historiques des Yamakasi et l’élite des traceurs CUC.',
    specs: [
      { label: 'Espace requis :', value: 'Intérieur ou extérieur (modules adaptables)' },
      { label: 'Artistes :', value: '3 à 12 cascadeurs / traceurs pros' },
      { label: 'Durée :', value: 'De 10 min (format explosif) à 45 min scénarisées' },
      { label: 'Adaptabilité :', value: 'Scènes, toitures, structures métalliques, arènes' },
    ],
    image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.webp',
    imageAlt: 'Spectacle Parkour et Yamakasi CUC',
  },
  {
    id: 'medieval-combats',
    badge: 'Historique & Épée',
    title: 'Spectacle Médiéval & Duels Chorégraphiés',
    subtitle: 'Escrime de spectacle, chutes de remparts et combats d’époque',
    description:
      'L’authenticité du combat médiéval au service du spectacle vivant : passes d’armes tranchantes, combats en armure, chutes depuis des échafaudages ou remparts, et duels théâtralisés à haute cadence. Coordination millimétrée par nos maîtres d’armes et régleurs cinéma.',
    specs: [
      { label: 'Armes utilisées :', value: 'Épées à deux mains, dagues, boucliers, haches d’époque' },
      { label: 'Artistes :', value: '4 à 20 bretteurs & cascadeurs équestres' },
      { label: 'Durée :', value: 'Tableaux de 15 min ou spectacle complet de 1h' },
      { label: 'Public :', value: 'Tous publics, festivals historiques, châteaux, parcs' },
    ],
    image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-7-scaled.webp',
    imageAlt: 'Combat médiéval et cascades historiques CUC',
  },
  {
    id: 'pyrotechnie-feu',
    badge: 'Pyrotechnie & Extrême',
    title: 'Torches Humaines & Cascades de Feu',
    subtitle: 'Embrasements intégraux sécurisés et explosions visuelles',
    description:
      'La signature visuelle la plus spectaculaire : torches humaines intégrales à 360°, cascades enflammées et effets de déflagrations contrôlées. Encadrement rigoureux sous la surveillance de nos artificiers agréés et de nos pompiers de sécurité dédiés.',
    specs: [
      { label: 'Sécurité :', value: 'Gels thermiques haute résistance, protocoles cinéma' },
      { label: 'Équipe d’extinction :', value: 'Pompiers & techniciens sécurité CUC dédiés' },
      { label: 'Durée brûlure :', value: '25 à 45 secondes par torche humaine' },
      { label: 'Autorisations :', value: 'Prise en charge complète des dossiers préfectoraux' },
    ],
    image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-6-scaled.webp',
    imageAlt: 'Torche humaine et cascade de feu CUC',
  },
  {
    id: 'chutes-aeriennes',
    badge: 'Câblage & Hauteur',
    title: 'Cascades Aériennes & Chutes Vertigineuses',
    subtitle: 'Vols câblés 3D et réceptions sur coussins d’impact cinéma',
    description:
      'Prenez de la hauteur avec des cascades aériennes époustouflantes : vols au-dessus du public, chutes de 8 à 25 mètres sur matelas de réception cinéma ou airbags géants, et descentes en rappel tactique. Le matériel de rigging le plus avancé déployé sur votre site.',
    specs: [
      { label: 'Hauteur de chute :', value: 'De 6 mètres à 25 mètres' },
      { label: 'Systèmes de retenue :', value: 'Câblage 3D, freins dynamiques, treuils homologués' },
      { label: 'Impacts :', value: 'Airbags cascade CUC certifiés et caisses d’impact' },
      { label: 'Usage :', value: 'Stades, festivals, lancements de marques, conventions' },
    ],
    image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.webp',
    imageAlt: 'Cascade aérienne et chute de hauteur CUC',
  },
];
