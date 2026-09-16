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
        description: "Certification qualité délivrée au titre des actions de formation. Elle rend nos formations éligibles aux financements professionnels (AFDAS, France Travail, Régions).",
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
        description: "Tenues de training, chaussures d'impact et vêtements de performance pour les cascadeurs du campus.",
        logo: "/images/partenaires/nike.jpg",
        bgVariant: 'dark',
        website: "https://www.nike.com",
      },
      {
        name: "RXR Protect",
        category: "Protections",
        role: "Gilets Gonflables",
        description: "Protections thoraciques et dorsales à airbag, conçues pour amortir les impacts et les chutes à haute vitesse.",
        logo: "/images/partenaires/rxr-protect.jpg",
        bgVariant: 'dark',
        website: "https://www.rxrprotect.com",
      },
      {
        name: "Gravity",
        category: "Vêtements & Parkour",
        role: "Textiles Parkour",
        description: "Textiles pensés pour le parkour et les cascades physiques, alliant résistance et liberté de mouvement.",
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
        role: "Pyrotechnie & SFX",
        description: "Effets spéciaux physiques, explosions contrôlées, armurerie de spectacle et feux de cascade pour le cinéma.",
        logo: "/images/partenaires/c17.jpg",
        bgVariant: 'light',
        website: "https://c17sfx.com",
      },
      {
        name: "Kiloutou",
        category: "Logistique Plateau",
        role: "Levage & Nacelles",
        description: "Nacelles élévatrices, chariots télescopiques et engins de levage pour la mise en place des câblages de cascades.",
        logo: "/images/partenaires/kiloutou.jpg",
        bgVariant: 'light',
        website: "https://www.kiloutou.fr",
      },
      {
        name: "OTM Incendie",
        category: "Sécurité Feu",
        role: "Protection Incendie",
        description: "Extincteurs spécialisés, gels ignifugés et tenues coupe-feu pour les exercices de torches humaines.",
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
        category: "Coordination",
        role: "Régie de Cascades",
        description: "Équipe de coordination de cascades qui forme nos élèves aux exigences des plateaux de tournage.",
        logo: "/images/partenaires/action-cascade.jpg",
        bgVariant: 'dark',
        website: "https://www.instagram.com/actioncascade/",
      },
      {
        name: "AYA Catch",
        category: "Combat & Projections",
        role: "Lutte & Projections",
        description: "Apprentissage des projections théâtrales, prises de catch et absorptions corporelles.",
        logo: "/images/partenaires/aya-catch.jpg",
        bgVariant: 'dark',
        website: "https://www.facebook.com/ayacatch/",
      },
      {
        name: "Cascade Demo Team",
        category: "Acrobaties Martiales",
        role: "Arts Martiaux Artistiques",
        description: "Troupe d'arts martiaux artistiques (XMA) et de combats chorégraphiés, présente sur nos modules techniques.",
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
        category: "Diffusion & Média",
        role: "Média Sports Extrêmes",
        description: "Production audiovisuelle et diffusion des contenus vidéo de la CUC Stunt Team.",
        logo: "/images/partenaires/xtrem-video.jpg",
        bgVariant: 'light',
        website: "https://www.youtube.com/@XtremVideo",
      },
      {
        name: "TaffCoeur",
        category: "Production Audiovisuelle",
        role: "Réalisation & Captation",
        description: "Studio de production de contenus promotionnels, clips et showreels pour les cascadeurs et comédiens du campus.",
        logo: "/images/partenaires/taffcoeur.jpg",
        bgVariant: 'light',
      },
    ],
  },
  {
    category: "Établissement Institutionnel & Nutrition",
    icon: <Building2 className="w-4 h-4 text-[#FFE500]" />,
    partners: [
      {
        name: "MFR Le Cateau-Cambrésis",
        category: "Institutionnel",
        role: "Hébergement & Restauration",
        description: "Hébergement, restauration et accueil en pension complète de nos stagiaires sur un parc de 6 hectares.",
        logo: "/images/partenaires/mfr-le-cateau.jpg",
        bgVariant: 'light',
        website: "https://www.mfr.fr/",
      },
      {
        name: "BSN Nutrition",
        category: "Nutrition Sportive",
        role: "Nutrition Sportive",
        description: "Suppléments et protéines accompagnant la préparation physique des cascadeurs.",
        logo: "/images/partenaires/bsn.jpg",
        bgVariant: 'light',
        website: "https://www.gobsn.com",
      },
    ],
  },
];
