/**
 * Socle d'affichage des ateliers team building : il alimente la page tant que le
 * Cockpit n'a pas écrit `sections_data.workshops` (zéro régression). Données
 * éditoriales isolées de la vue (`AGENTS.md` § 1-2).
 */

/** Forme minimale d'un atelier : celle écrite par le Cockpit et le socle statique. */
export interface TeamBuildingWorkshop {
    id?: string;
    title?: string;
    category?: string;
    desc?: string;
    img?: string;
}

export const TEAM_BUILDING_WORKSHOPS: TeamBuildingWorkshop[] = [
    {
        title: 'Chute de Hauteur sur Airbag',
        category: 'Adrénaline & Confiance',
        desc: "En intérieur comme en extérieur, faites goûter à vos collaborateurs les sensations de la chute libre sur coussin d'air géant de cinéma. Dépassement de soi et cohésion collective garantie.",
        img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-chute-hauteur-1.jpg',
    },
    {
        title: 'Combats au Cinéma',
        category: 'Chorégraphie & Précision',
        desc: 'Initiation aux techniques de combats de films : esquives, feintes, coups scéniques et synchronisation avec les axes caméra.',
        img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg',
    },
    {
        title: 'Parkour & Yamakasi',
        category: 'Agilité & Mouvement',
        desc: "Initiation encadrée par des cascadeurs professionnels et spécialistes du déplacement urbain : franchissements d'obstacles, sauts de précision et motricité.",
        img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-parkour-1.jpg',
    },
    {
        title: 'Maquillage Effets Spéciaux (SFX)',
        category: 'Coulisses & Cinéma',
        desc: "Découvrez les secrets des maquilleurs de cinéma : création de blessures ultra-réalistes, fausses cicatrices, impacts de balles et prothèses d'action.",
        img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-maquillage.jpg',
    },
    {
        title: 'Doublage de Voix & Post-Production',
        category: 'Créativité & Voix',
        desc: "Mettez-vous dans la peau d'un comédien de doublage ! Enregistrez en équipe les répliques et bruitages de séquences cultes du cinéma d'action.",
        img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-doublage-voix.jpg',
    },
];
