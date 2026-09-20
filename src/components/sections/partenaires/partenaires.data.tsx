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
        description: "Certification qualité nationale délivrée au titre des actions de formation. Elle atteste de la conformité du processus pédagogique et rend les formations éligibles aux financements professionnels (AFDAS, France Travail, Régions).",
        logo: "/images/partenaires/qualiopi.png",
        bgVariant: 'light',
        website: "https://www.campus-universcascades.com/wp-content/uploads/2024/12/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf",
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
        description: "Équipementier sportif mondial, référence internationale pour les vêtements de sport, tenues d'entraînement et chaussures d'athlétisme.",
        logo: "/images/partenaires/nike.jpg",
        bgVariant: 'dark',
        website: "https://www.nike.com",
      },
      {
        name: "RXR Protect",
        category: "Protections",
        role: "Gilets & Protections Corporelles",
        description: "Fabricant français d'équipements de protection corporelle et gilets gonflables utilisant la technologie brevetée Air Shock Absorber (coussin d'air absorbant).",
        logo: "/images/partenaires/rxr-protect.jpg",
        bgVariant: 'dark',
        website: "https://www.rxrprotect.com",
      },
      {
        name: "Gravity",
        category: "Vêtements de sport",
        role: "Textiles Parkour & Streetwear",
        description: "Marque de vêtements et streetwear créée par et pour les pratiquants de parkour, d'art du déplacement et de freerunning.",
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
        description: "Entreprise spécialisée dans les effets spéciaux physiques pour le cinéma et la télévision : pyrotechnie, armurerie de tournage et effets atmosphériques.",
        logo: "/images/partenaires/c17.jpg",
        bgVariant: 'light',
        website: "https://c17sfx.com",
      },
      {
        name: "Kiloutou",
        category: "Location de Matériel",
        role: "Levage & Nacelles",
        description: "Groupe de location de matériel et d'engins : nacelles élévatrices, chariots télescopiques et équipements d'élévation pour chantiers et événements.",
        logo: "/images/partenaires/kiloutou.jpg",
        bgVariant: 'light',
        website: "https://www.kiloutou.fr",
      },
      {
        name: "OTM Incendie",
        category: "Sécurité Incendie",
        role: "Protection Incendie",
        description: "Entreprise spécialisée dans la vente, la pose et la maintenance d'équipements de sécurité incendie, extincteurs et matériel de secours.",
        logo: "/images/partenaires/otm-incendie.jpg",
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
        description: "Équipe de cascadeurs et coordinateurs de cascades physiques pour le cinéma, la télévision et les spectacles vivants.",
        logo: "/images/partenaires/action-cascade.jpg",
        bgVariant: 'dark',
        website: "https://www.instagram.com/actioncascade/",
      },
      {
        name: "AYA Catch",
        category: "Catch & Lutte",
        role: "Catch Professionnel",
        description: "Association et école française de catch professionnel, dédiée aux combats scénarisés, à la lutte sportive et au spectacle.",
        logo: "/images/partenaires/aya-catch.jpg",
        bgVariant: 'dark',
        website: "https://www.youtube.com/@ayacatch",
      },
      {
        name: "Cascade Demo Team",
        category: "Arts Martiaux & Acrobaties",
        role: "Démonstration & XMA",
        description: "Troupe de démonstration pionnière en France d'arts martiaux artistiques (XMA), d'acrobaties martiales et de chorégraphies de combat.",
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
        description: "Société de production et distributeur audiovisuel international spécialisé dans les contenus de sports extrêmes, d'action et d'aventure.",
        logo: "/images/partenaires/xtrem-video.jpg",
        bgVariant: 'light',
        website: "https://www.youtube.com/@XtremVideo",
      },
      {
        name: "TaffCoeur",
        category: "Production Audiovisuelle",
        role: "Réalisation & Captation",
        description: "Studio de production audiovisuelle réalisant des clips, captations de spectacle et vidéos promotionnelles pour les professionnels du spectacle.",
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
        description: "Maison Familiale Rurale située au Cateau-Cambrésis, accueillant les stagiaires en hébergement et restauration pendant leurs sessions de formation.",
        logo: "/images/partenaires/mfr-le-cateau.jpg",
        bgVariant: 'light',
        website: "https://www.mfr.fr/",
      },
      {
        name: "BSN Nutrition",
        category: "Nutrition Sportive",
        role: "Nutrition & Compléments",
        description: "Marque internationale de référence dans la nutrition sportive et les compléments alimentaires pour athlètes.",
        logo: "/images/partenaires/bsn.jpg",
        bgVariant: 'light',
        website: "https://www.gobsn.com",
      },
    ],
  },
];
