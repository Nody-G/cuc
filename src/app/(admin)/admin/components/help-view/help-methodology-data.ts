/**
 * Données structurées sur la méthodologie de travail de Niels (« Vibe Coding » de haute précision).
 *
 * Décrit en toute transparence le workflow d'ingénierie, la stack IA (Google Antigravity,
 * Gemini, DeepSeek), l'infrastructure (Supabase, GitHub, Vercel), le temps investi
 * et le système de règles canoniques garantissant la robustesse du site pour Lucas.
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface StackTool {
    name: string;
    role: string;
    description: string;
    badge: string;
}

export const METHODOLOGY_STACK: readonly StackTool[] = [
    {
        name: 'Google Antigravity',
        role: 'Environnement Agentique de Pointe',
        description:
            'L’IDE de nouvelle génération qui pilote le projet. Permet de coordonner des agents autonomes avec accès direct aux fichiers, au shell, aux navigateurs de test et aux diagnostics temps réel.',
        badge: 'Orchestrateur',
    },
    {
        name: 'Gemini 2.5 Pro & Flash',
        role: 'Raisonnement Système & Vision Globale',
        description:
            'Les modèles d’IA de Google à très large fenêtre de contexte. Utilisés pour cartographier l’architecture globale, concevoir les interfaces réactives et garantir le respect absolu de la marque CUC.',
        badge: 'Intelligence IA',
    },
    {
        name: 'DeepSeek Reasoner',
        role: 'Logique Algorithmique & Optimisations',
        description:
            'Modèle de raisonnement pur utilisé pour résoudre les défis complexes : algorithmes de compression d’images, requêtes SQL relationnelles et synchronisations multi-couches.',
        badge: 'Raisonnement',
    },
    {
        name: 'PostgreSQL Supabase',
        role: 'Données Temps Réel & Sécurité RLS',
        description:
            'La base de données relationnelle de référence. Sécurisée par Row-Level Security, elle gère le catalogue, les révisions de pages, les médias et les canaux de synchronisation temps réel.',
        badge: 'Backend Cloud',
    },
    {
        name: 'GitHub & Git',
        role: 'Versioning Atomique & Traçabilité',
        description:
            'Plus de 350 commits chirurgicaux. Chaque modification de code est documentée, traçable et réversible. Aucune zone d’ombre ni bricolage non consigné.',
        badge: 'Traçabilité',
    },
    {
        name: 'Vercel Edge Platform',
        role: 'Déploiement Continu & CDN Mondial',
        description:
            'Infrastructure d’hébergement planétaire de Next.js. Mises en production instantanées dès chaque validation, zéro interruption de service et latence minimale pour les visiteurs.',
        badge: 'Infrastructure',
    },
];

export interface MethodologyPrinciple {
    title: string;
    subtitle: string;
    detail: string;
    points: string[];
}

export const VIBE_CODING_PRINCIPLES: readonly MethodologyPrinciple[] = [
    {
        title: 'Le « Vibe Coding » selon Niels',
        subtitle: 'L’intuition créative propulsée par une discipline d’ingénierie sans compromis',
        detail:
            'Le Vibe Coding tel que Niels le pratique n’est pas du code jetable ou généré au hasard. C’est la capacité de concevoir, prototyper et livrer des fonctionnalités de niveau studio à une vitesse décuplée, tout en maintenant les standards d’un logiciel bancaire.',
        points: [
            'Vision produit directe : dialoguer avec l’IA au niveau de l’intention métier tout en inspectant chaque ligne générée.',
            'Zéro dette technique : chaque brique ajoutée est typée en TypeScript strict et couverte par des tests.',
            'Boucle de rétroaction continue : tests visuels instantanés, audits de performance réguliers et contrôles qualité.',
            'Des centaines d’heures d’implication passionnée pour offrir au CUC un site à la hauteur de sa réputation internationale.',
        ],
    },
    {
        title: 'Le Système de Règles Canoniques (AGENTS.md)',
        subtitle: 'Le garde-fou indispensable qui canalise l’IA et élimine les erreurs',
        detail:
            'L’intelligence artificielle est puissante mais a tendance à dériver si elle n’est pas strictement encadrée. Niels a conçu une suite de règles gravées dans le projet (`.agents/rules/`), que chaque agent est obligé d’appliquer.',
        points: [
            'Architecture modulaire & SRP : interdiction formelle des fichiers géants (« god components »). Plafond dur à 300 lignes, séparation en 4 couches étanches.',
            'Style éditorial & zéro AI slop : interdiction des poncifs creux du web (« repousser les limites »). Respect du jargon authentique de la cascade et du Parkour.',
            'Vérification IMDb des 20 coachs : recherche et confirmation des crédits réels sur IMDb/TMDB pour bannir toute exagération commerciale.',
            'Filière médias & négatifs : compression automatique pour la vitesse, avec sauvegarde intouchable des fichiers sources dans `_originals`.',
            'Édition bilingue FR ↔ EN : synchronisation en miroir pour qu’aucun texte anglais ne manque ou ne désynchronise la maquette.',
            '802 tests automatisés au vert : avant tout commit, la suite de tests Vitest est exécutée. Si un seul test échoue, le déploiement est stoppé.',
        ],
    },
];

export interface ProjectTimelineStat {
    label: string;
    value: string;
    description: string;
}

export const PROJECT_DEV_STATS: readonly ProjectTimelineStat[] = [
    {
        label: 'Investissement temps',
        value: '300+ heures',
        description: 'Recherche, modélisation 3D, architecture, design system, tests et déploiements',
    },
    {
        label: 'Commits Git atomiques',
        value: '350+ commits',
        description: 'Historique de développement complet, structuré et vérifiable sur GitHub',
    },
    {
        label: 'Garantie de non-régression',
        value: '802 tests validés',
        description: 'Couverture sur l’accessibilité (axe), la réactivité, l’i18n et les règles métier',
    },
    {
        label: 'Liens ou images cassés',
        value: '0 anomalie',
        description: 'Audit automatisé quotidien certifiant une navigation fluide et sans faille',
    },
];
