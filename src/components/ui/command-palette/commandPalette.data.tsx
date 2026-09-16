import React from 'react';
import {
  Compass,
  Building,
  Award,
  Flame,
  PhoneCall,
  Video,
  ExternalLink,
  Layers,
  Users,
  Film,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category:
    | 'CAMPUS 3D'
    | 'FORMATIONS'
    | 'DISCIPLINES'
    | 'OUTILS & 360°'
    | 'ÉQUIPE & TOURNAGES'
    | 'CONTACT';
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
}

export const COMMAND_ITEMS: CommandItem[] = [
  // Outils & 3D
  {
    id: 'tool-plan3d',
    title: 'Plan 3D Interactif du Domaine',
    subtitle: 'Explorer les 6 hectares et les 9 installations en Three.js',
    category: 'OUTILS & 360°',
    href: '/visite-virtuelle#plan-3d-campus',
    icon: <Layers className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'tool-vr360',
    title: 'Visite Virtuelle 360° HD Media',
    subtitle: 'Immersion photoréaliste panoramique au Cateau-Cambrésis',
    category: 'OUTILS & 360°',
    href: '/visite-virtuelle',
    icon: <Compass className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'tool-visite-guidee',
    title: 'Visite Guidée des 6 Hectares & Infrastructures',
    subtitle:
      "Découverte complète des zones d'entraînement et équipements de tournage",
    category: 'OUTILS & 360°',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },

  // Formations
  {
    id: 'form-pro',
    title: 'Formation Professionnelle de Cascadeur (2 Ans)',
    subtitle: "Cursus d'élite certifié Qualiopi • Prise en charge AFDAS",
    category: 'FORMATIONS',
    href: '/formation-de-cascadeur',
    icon: <Award className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'form-decouverte',
    title: 'Formule Découverte (12 jours)',
    subtitle: 'Initiation intensive pour sportifs et acteurs au Campus',
    category: 'FORMATIONS',
    href: '/formation-de-cascadeur',
    icon: <Award className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'form-stages',
    title: 'Stages Week-end Immersion (250€)',
    subtitle: 'Initiation accessible tous niveaux dès 16 ans',
    category: 'FORMATIONS',
    href: '/stages-cascades-parkour-2',
    icon: <Flame className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'form-workshop',
    title: 'International Stunt Workshop',
    subtitle: "Masterclasses et perfectionnement d'athlètes internationaux",
    category: 'FORMATIONS',
    href: '/stunt-workshop-cuc',
    icon: <Award className="w-4 h-4 text-[#FFE500]" />,
  },

  // Campus 3D
  {
    id: 'campus-tower',
    title: 'CUC Tower 21M (Tour de Saut)',
    subtitle: '5 paliers de saut (6m à 21m) et défenestration cinéma',
    category: 'CAMPUS 3D',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'campus-zoe',
    title: 'Zoé Bell Hall (700 m²)',
    subtitle: 'Fosse olympique à cubes de mousse 50m³ et praticables',
    category: 'CAMPUS 3D',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'campus-wire',
    title: 'Hall Câblage & Cascades Physiques',
    subtitle: "Câblage 3D, potences IPN et simulateurs d'impacts",
    category: 'CAMPUS 3D',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'campus-dojo',
    title: 'Dojos Scéniques & Salle d\'Armes',
    subtitle: 'Combats chorégraphiés, armes blanches factices et tatamis',
    category: 'CAMPUS 3D',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'campus-meca',
    title: 'Zone Mécanique & Piste Drift',
    subtitle: 'Perceuse de bitume, quads, motos et dérapages',
    category: 'CAMPUS 3D',
    href: '/visite-guidee',
    icon: <Building className="w-4 h-4 text-[#FFE500]" />,
  },

  // Équipe & Tournages
  {
    id: 'team-lucas',
    title: 'Lucas Dollfus — Fondateur du CUC',
    subtitle: "Cascadeur pro, coordinateur d'action et régleur",
    category: 'ÉQUIPE & TOURNAGES',
    href: '/equipe-cascadeurs-pro',
    icon: <Users className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'team-yamakasi',
    title: 'Équipe Cascadeurs & Yamakasi',
    subtitle: "Instructeurs d'élite et performers cinéma mondiaux",
    category: 'ÉQUIPE & TOURNAGES',
    href: '/equipe-cascadeurs-pro',
    icon: <Users className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'movies-filmography',
    title: 'Filmographie & Longs-Métrages',
    subtitle: 'Coka Chicas, Lucy, Marvel, productions internationales',
    category: 'ÉQUIPE & TOURNAGES',
    href: '/cuc-team-cascadeur',
    icon: <Film className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'videos-reels',
    title: 'Vidéos & Démos Cascadeurs',
    subtitle: "Showreels officiels d'action et cascades réelles",
    category: 'ÉQUIPE & TOURNAGES',
    href: '/videos-cascadeur',
    icon: <Video className="w-4 h-4 text-[#FFE500]" />,
  },

  // Contact
  {
    id: 'contact-standard',
    title: 'Appeler le Campus CUC',
    subtitle: 'Téléphone direct : 06 72 84 94 92',
    category: 'CONTACT',
    href: 'tel:+33672849492',
    icon: <PhoneCall className="w-4 h-4 text-[#FFE500]" />,
  },
  {
    id: 'contact-page',
    title: 'Formulaire de Contact & Dossier de Candidature',
    subtitle: 'Transmettre votre candidature ou demander un devis AFDAS',
    category: 'CONTACT',
    href: '/contact-cuc',
    icon: <ExternalLink className="w-4 h-4 text-[#FFE500]" />,
  },
];
