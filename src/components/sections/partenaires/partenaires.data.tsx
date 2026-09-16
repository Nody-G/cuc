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
  /** Chemin vers le logo officiel du partenaire (fichier image réel). */
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
        name: "Qualiopi — République Française",
        category: "Certification d'État",
        role: "Actions de Formation Certifiées",
        description: "Certification officielle de qualité délivrée au titre des Actions de Formation sous l'égide de la République Française. Garantit la conformité pédagogique et permet les prises en charge financières (AFDAS, France Travail, Régions).",
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
        role: "Équipementier Officiel",
        description: "Fournisseur officiel de tenues techniques de training, chaussures d'impact et vêtements de performance pour les cascadeurs du campus.",
        logo: "/images/partenaires/nike.jpg",
        bgVariant: 'dark',
        website: "https://www.nike.com",
      },
      {
        name: "RXR Protect",
        category: "Protections",
        role: "Gilets Gonflables Haute Technologie",
        description: "Pionnier des protections thoraciques et dorsales intégrant la technologie Air Shock Absorber pour amortir les impacts violents et chutes à haute vélocité.",
        logo: "/images/partenaires/rxr-protect.jpg",
        bgVariant: 'dark',
        website: "https://www.rxrprotect.com",
      },
      {
        name: "Gravity",
        category: "Vêtements & Parkour",
        role: "Ligne Spécialisée Mouvement",
        description: "Marque textile dédiée aux athlètes d'action, aux traceurs de Parkour et aux cascadeurs physiques, alliant robustesse et souplesse totale.",
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
        role: "Pyrotechnie & SFX Cinéma",
        description: "Société de référence en effets spéciaux physiques, explosions contrôlées, armurerie de spectacle et feux de cascade pour le cinéma.",
        logo: "/images/partenaires/c17.jpg",
        bgVariant: 'light',
        website: "https://c17sfx.com",
      },
      {
        name: "Kiloutou",
        category: "Logistique Plateau",
        role: "Matériel de Levage & Nacelles",
        description: "Partenaire matériel mettant à disposition les nacelles élévatrices, chariots télescopiques et engins nécessaires à la mise en place des câblages de cascades.",
        logo: "/images/partenaires/kiloutou.jpg",
        bgVariant: 'light',
        website: "https://www.kiloutou.fr",
      },
      {
        name: "OTM Incendie",
        category: "Sécurité Feu",
        role: "Matériel de Protection Incendie",
        description: "Expert en protection incendie, extincteurs spécialisés, gels ignifugés et tenues coupe-feu pour les exercices de torches humaines en toute sécurité.",
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
        role: "Régie de Scènes d'Action",
        description: "Équipe de coordination de cascades collaborant avec le CUC pour former les élèves aux exigences réelles des plateaux de tournage internationaux.",
        logo: "/images/partenaires/action-cascade.jpg",
        bgVariant: 'dark',
        website: "https://www.instagram.com/actioncascade/",
      },
      {
        name: "AYA Catch",
        category: "Combat & Projections",
        role: "Techniques de Lutte Spectacle",
        description: "Structure de référence pour l'apprentissage des techniques de projections théâtrales, prises de catch et absorptions corporelles sans blessure.",
        logo: "/images/partenaires/aya-catch.jpg",
        bgVariant: 'dark',
        website: "https://www.facebook.com/ayacatch/",
      },
      {
        name: "Cascade Demo Team",
        category: "Acrobaties Martiales",
        role: "Arts Martiaux Artistiques",
        description: "Troupe légendaire d'arts martiaux artistiques (XMA) et de combats chorégraphiés de renommée mondiale intervenant lors de nos modules techniques.",
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
        role: "Média d'Action & Sports Extrêmes",
        description: "Réseau et société de production audiovisuelle internationale assurant la valorisation et la visibilité des contenus vidéo de la CUC Stunt Team.",
        logo: "/images/partenaires/xtrem-video.jpg",
        bgVariant: 'light',
        website: "https://www.youtube.com/@XtremVideo",
      },
      {
        name: "TaffCoeur",
        category: "Production Audiovisuelle",
        role: "Réalisation & Captation",
        description: "Studio de création visuelle et de production de contenus promotionnels, clips et showreels pour les cascadeurs et comédiens du campus.",
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
        role: "Hébergement & Logistique Locale",
        description: "Partenaire institutionnel historique au Cateau-Cambrésis assurant les infrastructures d'hébergement, la restauration et l'accueil en pension complète de nos stagiaires sur un parc de 6 hectares.",
        logo: "/images/partenaires/mfr-le-cateau.jpg",
        bgVariant: 'light',
        website: "https://www.mfr.fr/",
      },
      {
        name: "BSN Nutrition",
        category: "Nutrition Sportive",
        role: "Performance & Récupération",
        description: "Marque internationale de suppléments nutritionnels et protéines de haute qualité accompagnant la préparation physique intensive des cascadeurs.",
        logo: "/images/partenaires/bsn.jpg",
        bgVariant: 'light',
        website: "https://www.gobsn.com",
      },
    ],
  },
];
