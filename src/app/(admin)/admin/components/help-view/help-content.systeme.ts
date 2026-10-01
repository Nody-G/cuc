/**
 * Sujets « Système & sécurité » avec guide pas-à-pas et dépannage.
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

import type { HelpGroup } from './help-content.types';

export const HELP_SYSTEM_GROUP: HelpGroup = {
    id: 'systeme',
    title: '5. Système, Sécurité & Sauvegardes',
    topics: [
        {
            id: 'journal',
            title: 'Journal & Activité (Audit exhaustif)',
            summary: 'Traçabilité complète : savoir qui a créé, modifié, publié ou supprimé quoi.',
            steps: [
                'Ouvrez « Journal & Activité » dans la section Système.',
                'Onglet « Métier » : historique chronologique de chaque action de l’équipe (ex : mise à jour d’un tarif, modification d’une photo, changement de statut d’un candidat).',
                'Onglet « Système » : journal des erreurs techniques, tentatives d’accès bloquées et synchronisations.',
                'Onglet « Rétention » : règles de purge automatique pour garder une base de données rapide et propre.',
            ],
            bullets: [
                'Sécurité maximale : le journal est en ajout seul (append-only), personne ne peut modifier ou effacer une ligne d’audit passée.',
                'La lecture complète est réservée aux comptes Direction et Administrateur.',
            ],
            proTip:
                'Si un contenu a changé sur le site et que vous voulez savoir qui a effectué la modification et à quelle heure, recherchez simplement le titre de la page dans le journal.',
            troubleshooting:
                'Si le journal semble vide pour aujourd’hui, c’est qu’aucune modification n’a encore été effectuée depuis minuit.',
            keywords: ['journal', 'logs', 'activite', 'audit', 'erreurs', 'incidents', 'tracabilite'],
        },
        {
            id: 'sante',
            title: 'Diagnostic du Site & Intégrité des liens',
            summary: 'Détecter automatiquement ce qui est cassé, incomplet ou orphelin.',
            steps: [
                'Ouvrez « Diagnostic du Site » pour lancer un scan d’intégrité.',
                'Le rapport liste immédiatement : les liens internes cassés (erreur 404), les images manquantes et les pages orphelines.',
                'Vérifiez la section SEO pour identifier les pages dont la description Google manque.',
                'Cliquez directement sur l’anomalie pour ouvrir l’écran précis où corriger le problème.',
            ],
            bullets: [
                'Zéro lien cassé : le robot de scan vérifie chaque URL interne à chaque déploiement.',
                'Détection des doublures et rôles de cascadeurs restés à préciser dans la filmographie.',
            ],
            proTip:
                'Passez sur cet écran une fois par mois : un site avec 0 anomalie est favorisé par les algorithmes de Google pour le référencement naturel.',
            troubleshooting:
                'Si une image apparaît en anomalie « introuvable », vérifiez son URL dans le formulaire de la page ou remplacez-la par une photo valide depuis la médiathèque.',
            keywords: ['diagnostic', 'sante', 'health', 'liens casses', 'images manquantes', 'seo', 'erreurs'],
        },
        {
            id: 'sauvegarde',
            title: 'Sauvegarde manuelle & Import / Export JSON',
            summary: 'Télécharger à la demande une sauvegarde de contenu, la recharger ou revenir en arrière sans risque.',
            steps: [
                'Pour créer une sauvegarde : bouton « Ouvrir l’outil Import / Export JSON » (ou Ctrl+K → « Import / Export d’un contenu JSON »), puis « Télécharger la Sauvegarde Complète (.json) ». Le fichier se conserve où vous le souhaitez.',
                'Pour recharger un export : ouvrez le même outil et sélectionnez un fichier .json antérieur. Réservé aux comptes Direction et Administrateur.',
                'Il n’y a aujourd’hui aucune sauvegarde automatique : la fraîcheur de votre sauvegarde est la date de votre dernier export.',
            ],
            bullets: [
                'L’import ne supprime rien : il écrit ou met à jour les lignes du fichier, et les éléments créés après l’export subsistent. Ce n’est pas un retour arrière strict de version.',
                'L’import ne touche que les tables de contenu de la vitrine. Aucune table du produit CUC Sign n’est lue ni écrite : l’opération est sans risque pour CUC Sign.',
                'Si personne n’exporte pendant un mois, on ne peut revenir que d’un mois : exportez régulièrement et avant toute opération sensible.',
                'Le panneau « Versions & Restauration » (versions chiffrées hors projet Supabase) existe mais est inactif par choix ; il redeviendra opérationnel si le dispositif est activé plus tard.',
            ],
            proTip:
                'Exportez avant toute modification importante : c’est le geste qui garantit votre filet de sécurité.',
            troubleshooting:
                'Le panneau « Versions & Restauration » indique des sauvegardes versionnées désactivées : c’est volontaire, aucune sauvegarde automatique n’est prévue. Le geste à utiliser est l’export/import JSON ci-dessus.',
            keywords: ['sauvegarde', 'backup', 'restauration', 'export', 'import', 'json', 'securite'],
        },
        {
            id: 'comptes',
            title: 'Comptes & Accès (Gestion de l’équipe)',
            summary: 'Inviter un collaborateur administratif et définir ses autorisations.',
            steps: [
                'Allez dans « Comptes & Accès » pour voir la liste des utilisateurs du Cockpit.',
                'Pour ajouter un collaborateur : cliquez sur « Inviter un utilisateur », saisissez son email professionnel et choisissez son rôle (Direction ou Secrétariat).',
                'Un email d’activation lui est envoyé avec un lien sécurisé pour choisir son mot de passe.',
                'Pour suspendre un compte : désactivez son accès en un clic depuis sa fiche.',
            ],
            bullets: [
                'Chaque compte dispose de son propre mot de passe renforcé et d’une session chiffrée.',
                'Les coachs et élèves sont gérés séparément dans CUC Sign et n’apparaissent pas ici.',
            ],
            proTip:
                'Ne partagez jamais vos identifiants administrateur : créez un compte nominatif par personne pour que le journal d’activité puisse tracer précisément chaque action.',
            troubleshooting:
                'Si un collaborateur n’a pas reçu l’email d’invitation, vérifiez son dossier Spam/Indésirables ou générez un lien d’invitation copiable directement depuis sa fiche pour lui transmettre par message.',
            keywords: ['comptes', 'utilisateurs', 'acces', 'invitation', 'mot de passe', 'roles', 'equipe'],
        },
        {
            id: 'module-systeme',
            title: 'Moniteur Système & État des serveurs',
            summary: 'Surveiller en direct la latence Supabase et l’état du cloud.',
            steps: [
                'Regardez le badge « Système » dans la barre supérieure : un point vert indique que tout fonctionne à 100%.',
                'Cliquez dessus pour ouvrir le moniteur : temps de réponse de la base (latence en millisecondes), statut des canaux temps réel et quota de stockage restant.',
                'Cliquez sur « Relancer la sonde » pour tester la réactivité des serveurs en direct.',
            ],
            bullets: [
                'Hébergement Vercel Edge avec temps de disponibilité mesuré supérieur à 99,99%.',
                'Surveillance automatique des quotas de stockage de médias Supabase pour anticiper les besoins.',
            ],
            proTip:
                'Si la latence est inférieure à 100 ms, votre expérience est optimale. Tout est calculé pour une réactivité instantanée.',
            troubleshooting:
                'Si le voyant passe au orange ou au rouge, c’est généralement une micro-coupure de votre réseau local ou une maintenance programmée de Supabase. Le Cockpit repasse au vert dès la reconnexion.',
            keywords: ['systeme', 'moniteur', 'latence', 'supabase', 'serveurs', 'realtime', 'quotas'],
        },
    ],
};
