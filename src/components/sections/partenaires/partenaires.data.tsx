import React from 'react';
import {
  ShieldCheck,
  Flame,
  Award,
  Video,
  Building2,
} from 'lucide-react';

export interface Partner {
  name: string;
  category: string;
  role: string;
  description: string;
  /** Chemin vers le logo du partenaire. */
  logo: string;
  bgVariant?: 'light' | 'dark';
  website?: string;
  featuredCertificate?: string;
}

export interface PartnerCategoryGroup {
  category: string;
  icon: React.ReactNode;
  partners: Partner[];
}

export const CUC_PARTNERS: PartnerCategoryGroup[] = [
  {
    category: "Agrément & Certification d'État",
    icon: <Award className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "Qualiopi",
        category: "Certification",
        role: "Certification Qualiopi",
        description: "Certification qualité des actions de formation (éligible AFDAS, France Travail).",
        logo: "/images/partenaires/qualiopi.png",
        bgVariant: 'light',
        website: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf",
        featuredCertificate: "Certificat N° 21452296",
      },
    ],
  },
  {
    category: "Équipementiers & Protections",
    icon: <ShieldCheck className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "Nike",
        category: "Équipementier",
        role: "Textiles & Chaussures",
        description: "Équipementier sportif (textiles et chaussures de sport).",
        logo: "/images/partenaires/nike.jpg",
        bgVariant: 'dark',
        website: "https://www.nike.com",
      },
      {
        name: "RXR Protect",
        category: "Protections",
        role: "Protections Corporelles",
        description: "Gilets et équipements de protection corporelle gonflables (technologie Air Shock Absorber).",
        logo: "/images/partenaires/rxr-protect.jpg",
        bgVariant: 'dark',
        website: "https://www.rxrprotect.com",
      },
      {
        name: "Gravity",
        category: "Vêtements de sport",
        role: "Textiles Parkour",
        description: "Vêtements et streetwear pour le parkour et le freerunning.",
        logo: "/images/partenaires/gravity.jpg",
        bgVariant: 'light',
      },
    ],
  },
  {
    category: "Matériel & Équipement de Tournage",
    icon: <Flame className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "C17 Special Effects",
        category: "Effets Spéciaux",
        role: "SFX & Pyrotechnie",
        description: "Effets spéciaux physiques, pyrotechnie et armurerie pour le cinéma.",
        logo: "/images/partenaires/c17.jpg",
        bgVariant: 'light',
        website: "https://c17sfx.com",
      },
      {
        name: "Kiloutou",
        category: "Location de Matériel",
        role: "Levage & Nacelles",
        description: "Location de nacelles élévatrices, engins de levage et matériel de chantier.",
        logo: "/images/partenaires/kiloutou.jpg",
        bgVariant: 'light',
        website: "https://www.kiloutou.fr",
      },
      {
        name: "TM Incendie",
        category: "Sécurité Incendie",
        role: "Protection Incendie",
        description: "Vente et maintenance de matériel de sécurité incendie et extincteurs.",
        logo: "/images/partenaires/tm-incendie.jpg",
        bgVariant: 'dark',
      },
    ],
  },
  {
    category: "Pédagogie & Cascades Professionnelles",
    icon: <Award className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "Action Cascade",
        category: "Cascades & Tournage",
        role: "Coordination de Cascades",
        description: "Équipe de cascadeurs et coordination de cascades pour les tournages et spectacles.",
        logo: "/images/partenaires/action-cascade.jpg",
        bgVariant: 'dark',
        website: "https://www.instagram.com/actioncascade/",
      },
      {
        name: "AYA Catch",
        category: "Catch & Lutte",
        role: "Catch Professionnel",
        description: "École et association française de catch professionnel et lutte scénarisée.",
        logo: "/images/partenaires/aya-catch.jpg",
        bgVariant: 'dark',
        website: "https://www.youtube.com/@ayacatch",
      },
      {
        name: "Cascade Demo Team",
        category: "Arts Martiaux & Acrobaties",
        role: "Démonstration & XMA",
        description: "Troupe de démonstration d'arts martiaux artistiques (XMA) et acrobaties martiales.",
        logo: "/images/partenaires/cascade-demo-team.jpg",
        bgVariant: 'light',
        website: "https://www.instagram.com/cascadedemoteam/",
      },
    ],
  },
  {
    category: "Multimédia & Production",
    icon: <Video className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "Xtrem Video",
        category: "Média & Vidéo",
        role: "Média Sports Extrêmes",
        description: "Production et distribution de contenus vidéo de sports d'action et extrêmes.",
        logo: "/images/partenaires/xtrem-video.jpg",
        bgVariant: 'light',
        website: "https://www.youtube.com/@XtremVideo",
      },
      {
        name: "TaffCoeur",
        category: "Production Audiovisuelle",
        role: "Réalisation & Captation",
        description: "Studio de réalisation vidéo, clips et captations de spectacles.",
        logo: "/images/partenaires/taffcoeur.jpg",
        bgVariant: 'light',
      },
    ],
  },
  {
    category: "Établissement & Nutrition",
    icon: <Building2 className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "MFR Le Cateau-Cambrésis",
        category: "Hébergement & Accueil",
        role: "Hébergement & Restauration",
        description: "Hébergement et restauration des stagiaires au Cateau-Cambrésis.",
        logo: "/images/partenaires/mfr-le-cateau.jpg",
        bgVariant: 'light',
        website: "https://www.mfr.fr/",
      },
      {
        name: "BSN Nutrition",
        category: "Nutrition Sportive",
        role: "Nutrition Sportive",
        description: "Nutrition sportive et compléments alimentaires pour athlètes.",
        logo: "/images/partenaires/bsn.jpg",
        bgVariant: 'light',
        website: "https://www.gobsn.com",
      },
    ],
  },
];
