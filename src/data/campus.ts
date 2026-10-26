import { InfrastructureSpot } from '@/types';

export const CAMPUS_FACILITIES: InfrastructureSpot[] = [
  {
    id: 'cuc-tower',
    code: '01',
    name: 'CUC Tower (Tour de Saut 21m)',
    size: 'Hauteur : 21 mètres',
    description:
      'Structure emblématique inaugurée en octobre 2024 au Cateau-Cambrésis. Plus de 20 mètres de hauteur avec plusieurs paliers de saut sécurisés, escalier extérieur en acier galvanisé et airbag géant de réception pour chutes libres de 6 à 21 mètres, défenestrations et rappels de cinéma.',
    features: [
      'Paliers de saut étagés (6m, 9m, 12m, 15m, 21m)',
      'Escalier industriel galvanisé multi-volées',
      'Plateforme de défenestration avec baies ouvertes pour cadrage caméra',
      'Ancrages de rappel pour scènes d’action verticales',
      'Zone de réception XXL pour Airbag de cascade professionnel',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-01-cuc-tower.webp',
    specifications:
      'Structure métallique haute résistance, paliers de saut étagés, réception Airbag cinéma professionnel',
  },
  {
    id: 'zoe-bell-hall',
    code: '02',
    name: 'Zoé Bell Hall',
    size: '700 m² couverts',
    description:
      'Espace dédié à l’acrobatie, au tumbling et aux réceptions techniques, baptisé en hommage à Zoé Bell, marraine du Campus. Doté d’un praticable acrobatique complet et de surfaces d’absorption haute densité.',
    features: [
      'Piste d’acrobatie, praticable et trampolines de haute performance',
      'Surface de réception et tapis de chute de 40 cm',
      'Agrès d’entraînement acrobatique et aérien',
      'Système de captation vidéo avec retour écran instantané',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-02-zoe-bell-hall.webp',
    specifications:
      'Sol amortissant continu, hauteur sous plafond de 8 mètres, éclairage zénithal cinéma',
  },
  {
    id: 'hangar-wirework',
    code: '03',
    name: 'Parkour Park & Hall Câblage',
    size: '600 m² couverts',
    description:
      'Grand plateau couvert réunissant le Parkour Park modulaire (tubulaires, murs de franchissement, plans inclinés) et le Hall Câblage dédié au rigging 3D, aux éjections câblées et aux cascades physiques.',
    features: [
      'Structures tubulaires et modules de franchissement Parkour sur mesure',
      'Portiques homologués 2 tonnes pour câblage 3 axes (Wirework)',
      'Systèmes de tirage, contrepoids manuels et pistes d’élan',
      'Plateau modulable de répétition et de tournage intérieur',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-03-parkour-park-et-hall-cablage.webp',
    specifications:
      'Poutrelles IPN renforcées, ligne de vie continue, modules Parkour et tapis de réception',
  },
  {
    id: 'dojos-sceniques',
    code: '04',
    name: 'Dojos & Espaces Combats',
    size: '3 surfaces de tatamis distinctes',
    description:
      'Espaces dédiés aux combats chorégraphiés, aux arts martiaux scéniques, au close-combat et aux techniques de désarmement face caméra sous la supervision des régleurs.',
    features: [
      'Tatamis haute densité spécial impact pour répétitions intensives',
      'Ateliers de close-combat, self-défense et tactique cinéma',
      'Mur d’escalade et agrès de préparation physique intégrés',
      'Écrans de relecture vidéo pour analyse des axes caméra',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-04-dojos-et-espaces-combats.webp',
    specifications: 'Norme arts martiaux professionnels, chauffage et climatisation régulés',
  },
  {
    id: 'manege-equestre',
    code: '05',
    name: 'Manège Équestre Couvert & Écuries',
    size: '900 m² couverts + écuries',
    description:
      'Installation permettant le travail de la cascade équestre, de la chute de cheval de cinéma et de la voltige en selle à l’abri des intempéries.',
    features: [
      'Carrière couverte avec sol fibré étudié pour le travail cinéma',
      'Écuries internes hébergeant des chevaux dressés pour les scènes d’action',
      'Matériel de voltige et harnachements d’époque',
      'Zone de briefing et sellerie',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-05-manege-equestre-couvert-et-ecuries.webp',
    specifications:
      'Sol meuble fibré haute absorption, 900 m² d’évolution sans pilier central',
  },
  {
    id: 'espace-mecanique',
    code: '06',
    name: 'Salle d’Armes',
    size: 'Plateau d’escrime & combat armé',
    description:
      'Salle dédiée à l’escrime artistique et historique, au maniement des armes blanches de spectacle (épées, boucliers, dagues, haches, bâtons) et au réglage de duels chorégraphiés pour le cinéma et la scène.',
    features: [
      'Armurerie complète d’entraînement (épées, boucliers, rapières, katanas, armes d’hast)',
      'Sol amortissant adapté aux déplacements rapides et aux chutes armées',
      'Travail des distances, parades, cibles et sécurité partenaire',
      'Préparation des chorégraphies historiques, fantasy et contemporaines',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-06-salle-d-armes.webp',
    specifications:
      'Répliques d’armes de spectacle sécurisées, équipements de protection et encadrement maître d’armes',
  },
  {
    id: 'site-tournage',
    code: '07',
    name: 'Site Extérieur & Décors Naturels de Tournage',
    size: 'Domaine privé clos',
    description:
      'Vaste domaine extérieur arboré et sécurisé offrant de multiples perspectives de tournage : courses-poursuites, explosions, décors urbains et naturels.',
    features: [
      'Domaine arboré clos de murs',
      'City stade et installations sportives extérieures',
      'Zones dégagées pour cascades pyrotechniques',
      'Plateaux modulables pour équipes de tournage',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-07-site-exterieur-et-decors-naturel.webp',
    specifications: 'Domaine privé clos, adapté aux tournages cinématographiques',
  },
  {
    id: 'qg-staff-hebergement',
    code: '08',
    name: 'Hébergement & Base de Vie (90 Places)',
    size: '90 couchages sur place',
    description:
      'Un campus en vase clos capable d’héberger et de restaurer jusqu’à 90 stagiaires et formateurs directement sur place pour une immersion totale.',
    features: [
      'Chambres équipées avec sanitaires et accès internet',
      'Réfectoire et cuisine professionnelle adaptée',
      'Salles de débriefing vidéo et cours théoriques',
      'Espace d’accueil et bureaux de production',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-08-hebergement-et-base-de-vie.webp',
    specifications: 'Cadre arboré et sécurisé à 1h40 de Paris (Le Cateau-Cambrésis)',
  },
  {
    id: 'city-stade-exterieur',
    code: '09',
    name: 'City Stade & Espace Sportif Extérieur',
    size: 'Infrastructures sportives plein air',
    description:
      'Terrain multisports extérieur et espace de préparation physique en plein air pour le travail foncier et cardio-vasculaire.',
    features: [
      'City stade moderne aux normes sportives',
      'Zones d’entraînement extérieur',
      'Pistes de fractionné et d’échauffement collectif',
      'Vue directe sur la CUC Tower',
    ],
    image:
      'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus-09-city-stade-et-espace-sportif.webp',
    specifications: 'Revêtement synthétique amortissant toutes saisons',
  },
];
