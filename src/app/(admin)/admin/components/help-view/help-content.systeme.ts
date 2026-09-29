/**
 * Sujets « Système & sécurité » de l'aide du Cockpit.
 *
 * Extrait de `help-content.ts` pour respecter le plafond dur de 300 lignes
 * (`AGENTS.md` § 2). Données pures — aucune React.
 */

import type { HelpGroup } from './help-content.types';

export const HELP_SYSTEM_GROUP: HelpGroup = {
    id: 'systeme',
    title: 'Système & sécurité',
    topics: [
        {
            id: 'journal',
            title: 'Journal & Activité',
            summary: 'Trois onglets : métier, système, rétention.',
            bullets: [
                '« Métier » : qui a créé, modifié, publié ou supprimé quoi.',
                '« Système » : erreurs classées, dégradations d’outils, synchronisations.',
                '« Rétention » : ce qui sera purgé et quand — l’action demande confirmation.',
                'Lecture réservée à la Direction ; le journal est en ajout seul.',
            ],
            keywords: ['journal', 'logs', 'activite', 'audit', 'erreurs', 'incidents', 'retention'],
        },
        {
            id: 'sante',
            title: 'Diagnostic du Site',
            summary: 'Ce qui est cassé ou incomplet, détecté automatiquement.',
            bullets: [
                'Liens internes cassés, images manquantes, contenus orphelins.',
                'Métadonnées SEO incomplètes, rôles et doublures restés à préciser.',
                'Chaque anomalie renvoie directement vers l’endroit à corriger.',
            ],
            keywords: ['diagnostic', 'sante', 'health', 'liens casses', 'images', 'seo', 'orphelins'],
        },
        {
            id: 'analytics',
            title: 'Statistiques & Conversion',
            summary: 'Indicateurs dérivés des candidatures, sessions et contenus.',
            bullets: [
                'Entonnoir de conversion et pression sur les sessions.',
                'Aucun chiffre n’est estimé : tout provient de la base ou du journal d’audit.',
            ],
            keywords: ['statistiques', 'analytics', 'conversion', 'kpi', 'entonnoir', 'funnel'],
        },
        {
            id: 'sauvegarde',
            title: 'Sauvegarde & restauration',
            summary: 'Instantané complet du site, ou retour à une configuration antérieure.',
            bullets: [
                'Accessible depuis la barre supérieure ou la palette de commandes.',
                'La restauration écrase les données actuelles : elle demande confirmation.',
            ],
            keywords: ['sauvegarde', 'backup', 'restauration', 'export', 'import', 'snapshot'],
        },
        {
            id: 'comptes',
            title: 'Comptes & accès',
            summary: 'Inviter un collaborateur et régler ses droits.',
            bullets: [
                'Un email d’invitation part si le SMTP est configuré ; sinon un lien copiable est généré.',
                'Un rôle détermine les onglets visibles et les actions autorisées.',
                'Réinitialiser un mot de passe génère un lien à transmettre.',
            ],
            keywords: ['comptes', 'acces', 'utilisateurs', 'invitation', 'mot de passe', 'roles'],
        },
        {
            id: 'module-systeme',
            title: 'Moniteur système',
            summary: 'État mesuré des dépendances du Cockpit.',
            bullets: [
                'Latence Supabase, état des canaux temps réel et fraîcheur des données.',
                '« Relancer la sonde » force une nouvelle mesure.',
            ],
            keywords: ['systeme', 'moniteur', 'latence', 'supabase', 'realtime', 'statut'],
        },
    ],
};
