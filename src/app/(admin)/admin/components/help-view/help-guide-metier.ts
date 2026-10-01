/**
 * Sujets « Catalogue & Exploitation métier » avec guide pas-à-pas et dépannage.
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

import type { HelpGroup } from './help-content.types';

export const HELP_METIER_GROUP: HelpGroup = {
    id: 'metier',
    title: '4. Exploitation métier & Candidatures',
    topics: [
        {
            id: 'contact',
            title: 'Contact & gestion des dossiers candidats (Pipelines)',
            summary: 'Traiter chaque demande entrante selon son projet sans perdre l’historique du candidat.',
            steps: [
                'Ouvrez « Contact & Candidatures » dans le menu latéral.',
                'Sélectionnez le pipeline adapté en haut : Formation Pro, Découverte, Production cinéma, Événementiel ou Presse.',
                'Cliquez sur une ligne pour ouvrir le dossier complet du candidat : coordonnées, motivation, expérience sportive et liens vidéo.',
                'Utilisez le menu déroulant de statut pour faire évoluer le dossier : « Nouveau », « En cours d’examen », « Validé » ou « Refusé ».',
                'Cliquez sur « Exporter CSV » pour récupérer la liste filtrée exploitable dans Excel.',
            ],
            bullets: [
                'Mémoire candidat intelligente : si une personne a déjà postulé l’année passée ou suivi un stage Découverte, son historique passé est rappelé dans sa fiche.',
                'Re-catégorisation possible : si une demande de formation s’avère être une demande de tournage, vous pouvez la transférer vers le bon pipeline d’un clic.',
                'Pré-remplissage automatique : les boutons d’inscription sur le site vitrine ouvrent le formulaire avec le programme déjà sélectionné.',
            ],
            proTip:
                'Chaque matin, filtrez sur le statut « Nouveau » pour traiter les dernières candidatures reçues dans les 24 heures et garantir une réactivité maximale aux candidats.',
            troubleshooting:
                'Si un candidat signale ne pas avoir reçu de réponse, vérifiez dans l’historique du dossier si un email a été envoyé ou copiez directement ses coordonnées pour un appel téléphonique direct.',
            keywords: ['contact', 'candidatures', 'pipelines', 'devis', 'leads', 'inquiries', 'csv', 'candidat'],
        },
        {
            id: 'sessions',
            title: 'Sessions de formation : dates, calendrier & statut Complet',
            summary: 'Ouvrir des dates de stages et gérer le remplissage des effectifs.',
            steps: [
                'Allez dans « Sessions de formation » et choisissez le programme concerné (Cascadeur Pro, Découverte, etc.).',
                'Pour ajouter une nouvelle session : cliquez sur « Nouvelle session », choisissez les dates sur le calendrier interactif et définissez l’effectif max.',
                'Pour déclarer une session pleine : basculez simplement son statut sur « Complet » d’un clic.',
                'Sur le site public, le badge « Complet » apparaît immédiatement et bloque les réservations directes pour cette date.',
            ],
            bullets: [
                'Le calendrier interactif moderne élimine tout risque de faute de frappe sur les dates ou les jours de la semaine.',
                'Le taux de remplissage moyen alimente automatiquement les statistiques du tableau de bord de direction.',
            ],
            proTip:
                'Ne supprimez pas une session passée : archivez-la simplement en statut « Terminée ». Cela préserve votre historique et vos statistiques d’activité annuelle.',
            troubleshooting:
                'Si une nouvelle date ajoutée n’est pas visible sur la fiche de formation du site vitrine, vérifiez que la case « Publiée » est bien cochée et que le programme associé est bien actif.',
            keywords: ['sessions', 'stages', 'dates', 'calendrier', 'complet', 'inscriptions', 'places'],
        },
        {
            id: 'coachs',
            title: 'Coachs, crédits IMDb & filmographies vérifiées',
            summary: 'Gérer les profils des cascadeurs, leurs disciplines et leurs crédits cinématographiques.',
            steps: [
                'Allez dans « Coachs & Formateurs » pour voir l’annuaire des formateurs du CUC.',
                'Cliquez sur un coach pour éditer sa bio, ses spécialités (combat, chute, torche...) et sa photo portrait HD.',
                'Dans la section Filmographie : retrouvez la liste des productions auxquelles il a participé.',
                'Précisez pour chaque film son rôle exact : Coordinateur des cascades, Cascadeur, Doublure cascade d’un acteur précis (ex : doublure de Tom Cruise).',
                'Cliquez sur l’Étoile dorée pour mettre en avant ses 3 crédits majeurs sur sa carte d’équipe.',
            ],
            bullets: [
                'Règle d’or de vérité éditoriale : les crédits et participations sont certifiés et vérifiés sur IMDb pour valoriser le vrai savoir-faire du CUC sans exagération.',
                'L’outil filmographie permet de filtrer « qui a bossé dans quel film » pour répondre rapidement aux demandes des productions.',
            ],
            proTip:
                'Sur la page de chaque coach, les 3 jaquettes de ses films phares s’affichent en miniature pour un impact visuel immédiat auprès des visiteurs et des casteurs.',
            troubleshooting:
                'Si une affiche de film n’apparaît pas, vérifiez que le film a bien été sélectionné dans le catalogue central « Films & Cascades » et que l’affiche officielle y est rattachée.',
            keywords: ['coachs', 'formateurs', 'cascadeurs', 'imdb', 'credits', 'films', 'doublure', 'coordinateur'],
        },
        {
            id: 'instagram',
            title: 'Instagram & flux vidéo du campus',
            summary: 'Synchroniser les statistiques Meta et sélectionner les Reels affichés sur le site.',
            steps: [
                'Ouvrez « Instagram & Vidéos » dans le menu latéral.',
                'Le tableau de bord relève automatiquement le nombre d’abonnés, les vues des dernières vidéos et le taux d’engagement via l’API Meta officielle.',
                'Cliquez sur « Actualiser les données » pour forcer une nouvelle synchronisation en direct.',
                'Sélectionnez les Reels que vous souhaitez afficher sur la page vidéos du site vitrine (mode automatique ou sélection manuelle coup de cœur).',
            ],
            bullets: [
                'Les chiffres affichés sont des métriques mesurées réelles, pas des estimations approximatives.',
                'Le flux s’adapte pour charger les vidéos sans ralentir l’affichage du reste de la page.',
            ],
            proTip:
                'Mettez en avant les Reels montrant des entraînements spectaculaires au campus : ce sont les vidéos qui génèrent le plus de clics vers le formulaire de candidature.',
            troubleshooting:
                'Si la synchronisation affiche une alerte de jeton expiré, l’administrateur technique peut régénérer la clé d’API Instagram en 1 minute depuis la console Meta Developer.',
            keywords: ['instagram', 'reels', 'videos', 'meta', 'vues', 'abonnés', 'flux', 'social'],
        },
        {
            id: 'visites',
            title: 'Visites du site & audience mesurée',
            summary: 'Analyser la fréquentation réelle du site en toute conformité RGPD.',
            steps: [
                'Allez dans « Visites du Site » pour visualiser les courbes de trafic.',
                'Choisissez votre période d’analyse dans la barre supérieure : Aujourd’hui, 7 jours, 30 jours ou 12 mois.',
                'Observez le flux « En direct » pour voir les visiteurs actuellement en train de naviguer sur le site.',
                'Consultez les pages les plus lues (généralement Accueil, Formations et Équipe) pour savoir ce qui intéresse vos prospects.',
                'Cliquez sur « Export CSV » pour archiver vos statistiques d’audience mensuelle.',
            ],
            bullets: [
                'Mesure éthique et respectueuse : le système respecte le RGPD sans déposer de cookies publicitaires intrusifs.',
                'Seules les visites réelles humaines sont comptabilisées (les robots de spam sont filtrés à la volée).',
            ],
            proTip:
                'Surveillez les pics de fréquentation après le passage du CUC à la télévision (ex : reportage TF1 ou France 2) pour mesurer l’impact média direct sur les candidatures.',
            troubleshooting:
                'Si le compteur en direct affiche 0 en pleine nuit, c’est normal : le flux ne triche pas et ne simule aucune fausse présence.',
            keywords: ['visites', 'trafic', 'audience', 'analytics', 'visiteurs', 'rgpd', 'statistiques'],
        },
    ],
};
