/**
 * Sujets « Médias & Campus 3D » avec guide pas-à-pas et dépannage.
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

import type { HelpGroup } from './help-content.types';

export const HELP_MEDIAS_GROUP: HelpGroup = {
    id: 'medias',
    title: '3. Médiathèque & Plan 3D Campus',
    topics: [
        {
            id: 'mediatheque',
            title: 'Médiathèque : téléverser, classer et protéger vos images',
            summary: 'Gérer tous les fichiers du stockage Cloud Supabase en toute sécurité.',
            steps: [
                'Allez dans l’écran « Médiathèque » : l’arborescence à gauche liste les dossiers (coaches, campus, films, hero...).',
                'Glissez-déposez vos fichiers directement dans la zone centrale ou cliquez sur « Téléverser » pour choisir une photo.',
                'Utilisez la barre de recherche en haut pour retrouver un fichier par son nom en une fraction de seconde.',
                'Pour utiliser une image dans une page, cliquez sur « Choisir un média » depuis n’importe quel formulaire : l’explorateur s’ouvre directement.',
            ],
            bullets: [
                'Protection des négatifs : tout fichier téléversé conserve son original haute résolution intouché dans `_originals/`.',
                'Compression WebP/AVIF automatique : le système allège les images pour que le site charge à toute vitesse sur mobile.',
                'Corbeille réversible : quand vous supprimez un fichier, il n’est pas effacé définitivement, il est placé dans le dossier sécurisé `_trash`.',
            ],
            proTip:
                'Pour remplacer la photo d’un coach sans casser ses liens partout sur le site, donnez à votre nouveau fichier le même nom exact, ou mettez à jour la fiche coach dans « Coachs & Formateurs » en sélectionnant la nouvelle image.',
            troubleshooting:
                'Si une photo téléversée semble lourde ou tarde à s’afficher, pas d’inquiétude : le serveur de médias génère automatiquement une miniature optimisée dès la première seconde. Si un fichier a été supprimé par erreur, contactez l’administrateur pour le restaurer depuis le dossier `_trash`.',
            keywords: ['mediatheque', 'media', 'photos', 'images', 'upload', 'televersement', 'trash', 'corbeille', 'webp'],
        },
        {
            id: 'campus',
            title: 'Campus : placement 3D & zones d’entraînement (POI)',
            summary: 'Ajuster les bâtiments 3D et enrichir les points d’intérêt du campus.',
            steps: [
                'Ouvrez « Campus 3D » dans le menu latéral. Deux sous-onglets sont disponibles : « Plan 3D » et « Zones & Bâtiments ».',
                'Dans « Plan 3D » : cliquez sur un bâtiment pour faire apparaître le gizmo de transformation.',
                'Déplacez l’objet avec la souris ou les flèches du clavier (Maj = pas de 2,5 m pour aller vite, Alt = pas fin de 0,1 m).',
                'La touche F cadre automatiquement la caméra sur le bâtiment sélectionné. Ctrl+Z annule votre dernier déplacement.',
                'Dans « Zones & Bâtiments » : complétez le nom, la description et les photos de chaque zone (Hangar combat, fosse de saut, cascade mécanique...).',
            ],
            bullets: [
                'Le plan 3D utilise la technologie WebGL Three.js pour un rendu fluide et léger sans surcharger le navigateur.',
                'Toute modification de position ou de rotation est enregistrée automatiquement en base de données.',
            ],
            proTip:
                'Pour une démonstration spectaculaire à un client ou à la presse, ouvrez la page `/campus` sur grand écran et utilisez le mode plein écran pour faire la visite virtuelle 3D du campus.',
            troubleshooting:
                'Si le plan 3D affiche un écran noir ou saccade, vérifiez que l’accélération matérielle est bien activée dans les paramètres de votre navigateur web (Google Chrome / Edge). Sur les machines d’ancienne génération, la vue simplifiée en carte reste disponible.',
            keywords: ['campus', '3d', 'threejs', 'webgl', 'batiments', 'poi', 'hangar', 'zones', 'placement'],
        },
    ],
};
