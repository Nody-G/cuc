/**
 * Données complètes et approfondies sur la méthodologie de « Vibe Coding » de Niels.
 *
 * Explications pédagogiques et exhaustives pour Lucas :
 * - Ce à quoi Niels pense avant de prompter
 * - Rôle respectif de Gemini 3.8 Flash et DeepSeek v4.1 Flash
 * - Estimation chiffrée des tokens et des coûts en euros
 * - Le protocole « Zéro Casse » et 3 exemples concrets vécus sur le CUC
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface PrePromptThought {
    category: string;
    question: string;
    explanation: string;
}

export const PRE_PROMPT_THOUGHTS: readonly PrePromptThought[] = [
    {
        category: '1. Cartographie d’impact',
        question: 'Quels fichiers vont bouger et quels sont les effets de bord potentiels ?',
        explanation:
            'Avant d’écrire une seule consigne, Niels identifie la chaîne de dépendances : est-ce qu’une modification de formulaire impacte le schéma Supabase, le thème clair du Cockpit, ou les 807 tests automatisés ?',
    },
    {
        category: '2. Choix du bon modèle IA',
        question: 'Gemini 3.8 Flash ou DeepSeek v4.1 Flash ?',
        explanation:
            'Niels aiguille la tâche vers le modèle optimal : Gemini pour la vitesse, la vision globale et l’ergonomie UI ; DeepSeek pour l’algorithmique pure, la rigueur mathématique et les requêtes SQL complexes.',
    },
    {
        category: '3. Découpage en étapes atomiques',
        question: 'Comment découper pour ne jamais perdre le contrôle ?',
        explanation:
            'Interdiction de donner une consigne géante (« refais tout le site »). Niels découpe chirurgicalement : d’abord les contrats et types stricts, puis la logique métier et les hooks, enfin l’interface visuelle.',
    },
    {
        category: '4. Verrouillage des règles non-négociables',
        question: 'Quelles règles d’or doivent brider l’IA ?',
        explanation:
            'Plafond dur de 300 lignes par fichier (`AGENTS.md`), interdiction du blabla marketing creux (« AI slop »), respect strict du vocabulaire cascadeur et maintien des 807 tests au vert absolu.',
    },
];

export interface FlashModelDetail {
    name: string;
    provider: string;
    speciality: string;
    whyUsed: string;
    stats: string;
}

export const FLASH_MODELS: readonly FlashModelDetail[] = [
    {
        name: 'Gemini 3.8 Flash',
        provider: 'Google DeepMind',
        speciality: 'Contexte Géant & Vitesse Fulgurante',
        whyUsed:
            'Capable d’ingérer plus de 100 fichiers de code en un instant pour comprendre l’ensemble du site CUC sans halluciner ni perdre le fil. Il conçoit les interfaces réactives, gère l’ergonomie et garantit le respect de la charte visuelle.',
        stats: '~150M tokens analysés · Temps de réponse sub-seconde',
    },
    {
        name: 'DeepSeek v4.1 Flash',
        provider: 'DeepSeek AI',
        speciality: 'Raisonnement Algorithmique & Rigueur SQL',
        whyUsed:
            'Utilisé pour les défis de pure logique : compression WebP/AVIF d’images, requêtes relationnelles Supabase, politiques de sécurité Row-Level Security et optimisation fine des structures de données TypeScript.',
        stats: '~20M tokens générés · Raisonnement pas-à-pas strict',
    },
];

export interface CostComparison {
    metric: string;
    agencyTraditional: string;
    nielsVibeCoding: string;
}

export const TOKEN_COST_ESTIMATION = {
    tokensInput: '~140 à 180 Millions de tokens',
    tokensOutput: '~18 à 25 Millions de tokens',
    estimatedCostEuros: '28€ à 38€ au total',
    contextRead: 'Plus de 1 400 fichiers scannés et audités en direct',
    comparisons: [
        {
            metric: 'Coût financier de production',
            agencyTraditional: '20 000€ à 35 000€ (facturation équipe agence)',
            nielsVibeCoding: 'Environ 35€ de tokens d’IA (modèles Flash optimisés)',
        },
        {
            metric: 'Délai de réalisation',
            agencyTraditional: '3 à 5 mois avec multiples réunions intermédiaires',
            nielsVibeCoding: 'Quelques semaines d’ingénierie intensive et itérative',
        },
        {
            metric: 'Sécurité & Tests automatisés',
            agencyTraditional: 'Tests manuels sommaires, failles WordPress fréquentes',
            nielsVibeCoding: '807 tests automatisés validés à chaque commit Git',
        },
        {
            metric: 'Propriété & Dépendance',
            agencyTraditional: 'Abonnements de maintenance captifs, code verrouillé',
            nielsVibeCoding: '100% propriété exclusive du CUC, 0 abonnement logiciel',
        },
    ] as CostComparison[],
};

export interface ConcreteCaseStudy {
    title: string;
    badge: string;
    problem: string;
    solution: string;
    result: string;
}

export const CONCRETE_CASE_STUDIES: readonly ConcreteCaseStudy[] = [
    {
        title: 'La Filière Média Sans Perte (Protection des Négatifs)',
        badge: 'Optimisation & Sécurité',
        problem:
            'Le site avait besoin d’images ultra-légères (WebP/AVIF) pour charger en moins d’une seconde sur mobile, mais Lucas ne devait JAMAIS risquer de perdre les affiches et photos de cascade originales en haute résolution 4K.',
        solution:
            'Niels a conçu un pipeline de stockage : tout fichier téléversé déplace automatiquement son original maître intouché dans un dossier sécurisé `_originals/`, puis génère une version allégée pour le web.',
        result:
            'Temps de chargement divisé par 4, 70% de bande passante économisée, et 100% des fichiers négatifs maîtres préservés à vie.',
    },
    {
        title: 'Verrouillage Étanche : Cockpit vs Application CUC Sign',
        badge: 'Architecture des Rôles',
        problem:
            'Des bribes de code prévoyaient un accès partiel des coachs au Cockpit vitrine, risquant de créer de la confusion avec la future application de gestion de l’école CUC Sign et des failles d’accès.',
        solution:
            'Niels a retiré chirurgicalement le rôle `coach` des autorisations du Cockpit vitrine, mis à jour les contrôles serveur et gravé la règle d’or dans la documentation d’architecture.',
        result:
            'Séparation nette et limpide : le Cockpit pour la direction/secrétariat du site, CUC Sign pour les coachs et élèves (émargement smartphone).',
    },
    {
        title: 'Vérification IMDb des 20 Coachs (Éradication du Blabla IA)',
        badge: 'Vérité Éditoriale',
        problem:
            'Sur le web, beaucoup de sites de cascadeurs inventent des crédits ou génèrent du texte vague (« cascadeur intrépide qui repousse les limites »). Le CUC mérite une crédibilité hollywoodienne irréprochable.',
        solution:
            'Niels a développé un script d’audit qui a extrait et recoupé les crédits réels sur IMDb/TMDB pour chaque coach, en distinguant précisément son rôle (doublure cascadeur, coordinateur, cascadeur) et en reliant les affiches officielles HD.',
        result:
            'Zéro mensonge marketing, authenticité totale et impact immédiat auprès des productions de cinéma internationales.',
    },
];

export interface SafetyProtocolStep {
    step: string;
    name: string;
    action: string;
}

export const SAFETY_PROTOCOL_STEPS: readonly SafetyProtocolStep[] = [
    {
        step: '1',
        name: 'Cadrage Mental & Cibles',
        action: 'Identification précise des fichiers touchés, choix du modèle Flash adapté et définition des limites.',
    },
    {
        step: '2',
        name: 'Diffs Chirurgicaux',
        action: 'L’agent modifie uniquement les lignes nécessaires. Interdiction formelle de réécrire un fichier complet à l’aveugle.',
    },
    {
        step: '3',
        name: 'Le Filet de 807 Tests',
        action: 'Exécution automatique de toute la suite Vitest (accessibilité, liens, thèmes). Si 1 test échoue, le commit est bloqué.',
    },
    {
        step: '4',
        name: 'Validation Git & Vercel',
        action: 'Revue humaine du git diff, commit atomique documenté et déploiement mondial instantané sur Vercel Edge.',
    },
];
