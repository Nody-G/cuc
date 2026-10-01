/**
 * Données structurées sur l'interconnexion avec CUC Sign et la vision d'avenir.
 *
 * Décrit la passerelle entre le site vitrine et l'application métier de l'école,
 * les fonctionnalités de CUC Sign, les défis opérationnels (Qualiopi, PWA hors-ligne,
 * gestion du matériel cascade) et la feuille de route stratégique pour Lucas.
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface CucSignFeature {
    title: string;
    description: string;
    icon: 'pen' | 'shield' | 'smartphone' | 'users' | 'clipboard' | 'zap';
}

export const CUC_SIGN_FEATURES: readonly CucSignFeature[] = [
    {
        title: 'Émargement Numérique Tactile',
        description:
            'Signature sur smartphone ou tablette à chaque demi-journée de formation. Horodatage certifié et valeur probante conformes aux exigences Qualiopi.',
        icon: 'pen',
    },
    {
        title: 'Espace Dédié des Coachs',
        description:
            'Planning des cours, validation des présences, fiches pédagogiques et suivi des modules sans aucun mélange avec la gestion du site vitrine.',
        icon: 'users',
    },
    {
        title: 'Dossier Élève & Certifications',
        description:
            'Chaque stagiaire retrouve son planning, ses attestations de formation, son suivi d’évaluation technique et ses documents administratifs en un lieu unique.',
        icon: 'smartphone',
    },
    {
        title: 'Inventaire Matériel & Sécurité',
        description:
            'Suivi du cycle de vie des équipements de cascade (harnais, câbles, mousquetons, matelas d’impact) et alertes d’usure pour une sécurité maximale.',
        icon: 'shield',
    },
];

export interface BridgeStep {
    step: string;
    title: string;
    description: string;
}

export const VITRINE_TO_SIGN_BRIDGE: readonly BridgeStep[] = [
    {
        step: '1',
        title: 'Candidature sur la Vitrine',
        description: 'Le candidat remplit son dossier sur le site vitrine (choix du cursus, expérience physique, vidéo démo).',
    },
    {
        step: '2',
        title: 'Validation dans le Cockpit',
        description: 'Le secrétariat ou la direction examine le dossier dans le pipeline Contact et valide l’admission du stagiaire.',
    },
    {
        step: '3',
        title: 'Bascule Automatique CUC Sign',
        description: 'Les données sont transmises sans aucune ressaisie vers la base partagée CUC Sign pour créer le compte élève.',
    },
    {
        step: '4',
        title: 'Vie au Campus & Émargement',
        description: 'L’élève et les coachs utilisent CUC Sign au quotidien pour les présences, modules et bilans de fin de session.',
    },
];

export interface StrategicChallenge {
    title: string;
    category: string;
    solution: string;
}

export const CUC_SIGN_CHALLENGES: readonly StrategicChallenge[] = [
    {
        title: 'Fonctionnement Terrain Hors-Ligne',
        category: 'Technique',
        solution:
            'Le campus comportant des zones d’entraînement avec réseau intermittent, CUC Sign est conçu en PWA (Progressive Web App) avec cache local et synchronisation automatique dès reconnexion.',
    },
    {
        title: 'Conformité Qualiopi & Contrôles OPCO',
        category: 'Réglementaire',
        solution:
            'Feuilles d’émargement dématérialisées infalsifiables, exportables en PDF horodatés avec signatures électroniques conformes au règlement eIDAS pour les dossiers de financement.',
    },
    {
        title: 'Séparation Étanche des Accès',
        category: 'Organisationnel',
        solution:
            'Règle d’or : le Cockpit vitrine reste l’outil de l’administration du site ; l’application CUC Sign est le portail des élèves et des coachs. Zéro confusion des rôles.',
    },
    {
        title: 'Traçabilité et Contrôle des Équipements',
        category: 'Sécurité Cascade',
        solution:
            'Signalements instantanés de matériel abîmé ou d’incident via QR Code apposé sur les agrès pour une intervention immédiate de l’armurerie/régie technique.',
    },
];
