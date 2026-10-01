/**
 * Sujets « Éditer la vitrine » avec guide pas-à-pas et dépannage.
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

import type { HelpGroup } from './help-content.types';

export const HELP_VITRINE_GROUP: HelpGroup = {
    id: 'vitrine',
    title: '2. Éditer la vitrine & Mode Studio',
    topics: [
        {
            id: 'pages',
            title: 'Éditer une page du site (Contenu, SEO, Versions)',
            summary: 'L’écran central pour modifier textes, visuels, métadonnées et restaurer des versions antérieures.',
            steps: [
                'Allez dans l’onglet « Pages du Site » et choisissez la page dans le sélecteur en haut (ex : Accueil, Formations, Tournages).',
                'Onglet Contenu : modifiez les textes, téléversez de nouvelles photos via la médiathèque intégrée.',
                'Onglet SEO : renseignez le titre Google (50-60 car.), la meta-description (140-160 car.) et vérifiez l’aperçu de partage Facebook/LinkedIn.',
                'Onglet Versions : avant chaque enregistrement, le système crée un instantané complet avec date et auteur.',
                'Cliquez sur « Enregistrer & Mettre en ligne » pour diffuser immédiatement vos changements sur le site public.',
            ],
            bullets: [
                'Chaque version enregistrée peut être prévisualisée ou restaurée en un seul clic.',
                'Les formulaires valident vos saisies en temps réel (détection de liens invalides ou d’images manquantes).',
                'L’indicateur de santé SEO vous avertit si votre texte est trop court ou si la balise de partage manque.',
            ],
            proTip:
                'Si vous avez fait une erreur de saisie et déjà cliqué sur enregistrer, ne paniquez pas : ouvrez immédiatement l’onglet « Versions », sélectionnez la version précédente (celle d’il y a 5 minutes) et cliquez sur « Restaurer ». Le site revient à son état exact antérieur.',
            troubleshooting:
                'Si une image sélectionnée ne s’affiche pas après enregistrement, vérifiez que le fichier existe bien dans la médiathèque et n’a pas été déplacé dans la corbeille `_trash`.',
            keywords: ['pages', 'editeur', 'seo', 'contenu', 'versions', 'restaurer', 'historique'],
        },
        {
            id: 'studio',
            title: 'Mode Studio — édition visuelle directe dans l’aperçu',
            summary: 'Cliquez sur n’importe quel texte de la vraie page pour le modifier sur place.',
            steps: [
                'Dans « Pages du Site », ouvrez l’onglet « Aperçu » puis activez le bouton « Mode Studio » en haut.',
                'Survolez la page : les textes modifiables s’entourent d’un halo jaune pointillé discret.',
                'Cliquez sur le texte à changer : une boîte de saisie s’ouvre directement à cet endroit précis.',
                'Tapez votre nouveau texte, puis appuyez sur Entrée pour valider (ou Échap pour annuler).',
                'Ouvrez le tiroir « Inspecteur de brouillon » en bas pour voir la liste de vos retouches, les tester en direct, puis cliquer sur « Publier tout ».',
            ],
            bullets: [
                'Le bouton « Vue partagée » permet de voir l’éditeur de formulaire à gauche et l’aperçu live à droite.',
                'La bascule FR | EN dans la barre d’aperçu permet de visualiser et d’éditer directement la version anglaise en direct.',
                'Tant que vous ne cliquez pas sur « Publier », vos modifications restent en brouillon local dans votre navigateur.',
            ],
            proTip:
                'Pour tester l’apparence sur smartphone sans sortir de votre bureau, utilisez les boutons d’émulation mobile / tablette situés dans la barre supérieure de l’aperçu.',
            troubleshooting:
                'Si un clic sur un texte n’ouvre pas l’éditeur en place, assurez-vous que le commutateur « Mode Studio » est bien activé (vert) et que vous ne cliquez pas sur une animation 3D ou un bouton de navigation externe.',
            keywords: ['studio', 'apercu', 'live preview', 'edition en place', 'inspecteur', 'brouillon'],
        },
        {
            id: 'publication',
            title: 'Publier ou laisser en brouillon',
            summary: 'Gérer la visibilité publique d’une page en toute sécurité.',
            steps: [
                'Sélectionnez la page souhaitée dans l’écran « Pages du Site ».',
                'En haut à droite du formulaire, ajustez le sélecteur « Statut de publication » : « Publiée » ou « Brouillon ».',
                'Une page en « Brouillon » est immédiatement retirée du sitemap XML de Google et des menus du site.',
                'Cliquez sur « Enregistrer » pour appliquer le statut.',
            ],
            bullets: [
                'Une page en brouillon reste accessible en prévisualisation dans le Cockpit pour que vous puissiez préparer son contenu à l’avance.',
                'Si un visiteur tape l’adresse directe d’une page en brouillon, il est redirigé proprement vers la page d’accueil sans erreur 404 agressive.',
            ],
            proTip:
                'Lorsque vous créez une nouvelle formule de stage qui n’est pas encore ouverte à la vente, gardez-la en Brouillon. Vous pourrez ainsi peaufiner les tarifs et la photo tranquillement avant le lancement officiel.',
            troubleshooting:
                'Si une page publiée n’apparaît pas dans la barre de navigation du site public, c’est normal : vérifiez l’écran « Menus du Site » pour relier cette page à une entrée de menu visible.',
            keywords: ['publier', 'brouillon', 'draft', 'sitemap', 'visibilite', 'en ligne'],
        },
        {
            id: 'bilingue',
            title: 'Édition bilingue Français ↔ Anglais',
            summary: 'Maintenir la version anglaise en miroir sans casser la maquette ni les liens.',
            steps: [
                'Dans n’importe quel formulaire de page ou de fiche coach, repérez le sélecteur de langue [ FR | EN ].',
                'Rédigez d’abord la version française (la langue maîtresse).',
                'Basculez sur [ EN ] : les champs qui n’ont pas encore été traduits sont signalés par un repère jaune.',
                'Saisissez le texte anglais correspondant et validez avec Enregistrer.',
            ],
            bullets: [
                'Repli automatique intelligent : si un champ anglais reste vide, le site affiche temporairement la version française sans jamais afficher de trou blanc ni de texte brisé.',
                'Pour les listes à puces (ex : prérequis d’un stage), veillez à conserver le même nombre d’éléments en français et en anglais.',
            ],
            proTip:
                'Pour traduire rapidement un paragraphe long, vous pouvez utiliser DeepL ou Gemini, mais relisez toujours les termes spécifiques à la cascade (ex : wirework, high fall, fire burn, precision driving).',
            troubleshooting:
                'Si un visiteur étranger voit encore un texte en français sur la vitrine anglaise `/en/...`, vérifiez dans le Cockpit que l’onglet EN de cette page a bien été rempli et enregistré.',
            keywords: ['bilingue', 'anglais', 'en', 'i18n', 'traduction', 'multilingue', 'langue'],
        },
        {
            id: 'menus',
            title: 'Menus, pied de page et textes récurrents',
            summary: 'Distinguer les 4 sources de navigation et de micro-textes.',
            steps: [
                '« Menus du Site » : pour changer l’ordre des onglets dans l’en-tête (Navbar) et le gros bouton d’appel à l’action.',
                '« Bas de Page (Footer) » : pour éditer les colonnes de liens, le texte d’accroche et les mentions légales.',
                '« Réseaux Sociaux » : source unique pour modifier vos liens Instagram, YouTube, TikTok et LinkedIn (mis à jour partout en 1 clic).',
                '« Textes & Boutons du Site » : pour retoucher les libellés génériques récurrents (ex : « En savoir plus », « Candidater », messages d’état).',
            ],
            bullets: [
                'Chaque entrée de menu est reliée à une page interne ou une ancre précise.',
                'Toute modification de menu est répliquée en temps réel sur la version mobile et desktop.',
            ],
            proTip:
                'Ne surchargez pas la barre de navigation principale : 5 à 6 onglets maximum garantissent une lecture instantanée sur tablette et petit écran d’ordinateur portable.',
            troubleshooting:
                'Si un lien de pied de page renvoie vers une erreur, vérifiez dans « Bas de Page » que l’adresse saisie commence bien par `/` (pour une page interne) ou par `https://` (pour un site externe).',
            keywords: ['menus', 'navbar', 'footer', 'pied de page', 'reseaux sociaux', 'liens', 'microcopy'],
        },
    ],
};
