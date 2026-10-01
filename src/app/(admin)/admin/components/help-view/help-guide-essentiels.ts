/**
 * Sujets « Les essentiels du Cockpit » avec guide pas-à-pas et dépannage.
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

import type { HelpGroup } from './help-content.types';

export const HELP_ESSENTIELS_GROUP: HelpGroup = {
    id: 'essentiels',
    title: '1. Les essentiels du Cockpit',
    topics: [
        {
            id: 'navigation',
            title: 'Naviguer et trouver un écran instantanément',
            summary: 'Maîtriser la barre latérale, la palette de commandes Ctrl+K et les raccourcis directs.',
            steps: [
                'Appuyez sur Ctrl+K (ou ⌘K sur Mac) depuis n’importe où dans le Cockpit pour ouvrir la palette.',
                'Tapez les premières lettres de ce que vous cherchez (ex : « sess », « devis », « film », « media »).',
                'Naviguez avec les flèches du clavier et validez avec Entrée pour atterrir directement sur l’écran.',
                'Utilisez Ctrl+B pour replier la barre latérale si vous travaillez sur un écran compact ou un ordinateur portable.',
            ],
            bullets: [
                'Chaque écran du Cockpit possède une adresse URL directe et partageable (ex : /admin/pages, /admin/inquiries).',
                'La palette mémorise vos 5 derniers écrans visités pour des allers-retours instantanés.',
                'Les raccourcis Alt+1 à Alt+7 ouvrent directement les vues principales.',
            ],
            proTip:
                'Sur un petit écran ou un ordinateur portable, repliez la sidebar (Ctrl+B) : cela libère 260px de largeur pour éditer vos tableaux et pages confortablement.',
            troubleshooting:
                'Si un écran semble bloqué ou ne charge pas ses données, vérifiez d’abord votre connexion et le voyant « Système » en haut à droite. Un simple rafraîchissement F5 recharge la vue sans perdre vos identifiants.',
            keywords: ['navigation', 'palette', 'ctrl k', 'recherche', 'menu', 'sidebar', 'raccourcis'],
        },
        {
            id: 'roles',
            title: 'Ce que chaque rôle voit & périmètre de sécurité',
            summary: 'Règles d’accès strictes entre Direction, Secrétariat et l’espace CUC Sign.',
            steps: [
                'Consultez votre rôle actuel affiché en bas à gauche de la barre latérale (badge doré ou neutre).',
                'Direction & Administrateur : accès illimité, y compris aux comptes utilisateurs, aux sauvegardes, au journal d’audit et aux configurations sensibles.',
                'Secrétariat : accès complet à l’exploitation courante (candidatures, sessions, contenus des pages, films et médiathèque), sans accès aux réglages système ni aux purges de base.',
            ],
            bullets: [
                'Règle d’or CUC Sign : les coachs et formateurs n’ont aucun accès au Cockpit du site vitrine.',
                'L’espace dédié des coachs (émargement tactile, feuilles de présence, plannings) sera accessible exclusivement dans la future application métier CUC Sign.',
                'Les menus et onglets non autorisés sont masqués par construction côté serveur (sécurité RLS), jamais par simple cache CSS.',
            ],
            proTip:
                'Si vous devez créer un compte pour un nouveau collaborateur administratif, rendez-vous dans « Comptes & Accès ». Privilégiez toujours le rôle « Secrétariat » pour l’exploitation quotidienne.',
            troubleshooting:
                'Si un membre de votre équipe reçoit un message « Accès refusé », assurez-vous que son rôle dans la table des profils est bien « directeur », « admin » ou « secretaire ». Tout compte ayant le rôle « coach » est automatiquement bloqué à l’entrée.',
            keywords: ['roles', 'permissions', 'directeur', 'secretaire', 'coach', 'cuc sign', 'acces refuse'],
        },
        {
            id: 'theme',
            title: 'Thème et confort visuel (Sombre / Clair)',
            summary: 'Basculer entre le mode studio sombre et le mode bureau clair sans perturber la vitrine.',
            steps: [
                'Cliquez sur l’icône Soleil / Lune située dans la barre supérieure du Cockpit.',
                'Le Cockpit s’adapte instantanément en inversant les contrastes pour un confort de lecture optimal en plein jour.',
                'Votre préférence est automatiquement mémorisée dans votre navigateur.',
            ],
            bullets: [
                'Le thème clair du Cockpit est strictement isolé : il n’affecte JAMAIS le site vitrine public, qui conserve son univers cinématographique sombre permanent.',
                'Tous les contrastes du thème clair sont validés selon la norme d’accessibilité WCAG AA (texte foncé sur surface blanche immaculée).',
            ],
            proTip:
                'En fin de journée ou dans une pièce sombre, le mode sombre réduit la fatigue oculaire. En plein jour au bureau ou sur un écran avec reflets, le mode clair offre une lisibilité maximale pour les longs textes.',
            troubleshooting:
                'Si le thème revient en sombre après avoir nettoyé votre navigateur, c’est normal : le choix est stocké dans le localStorage de votre machine. Cliquez simplement à nouveau sur le bouton soleil.',
            keywords: ['theme', 'sombre', 'clair', 'dark', 'light', 'contraste', 'confort', 'yeux'],
        },
    ],
};
