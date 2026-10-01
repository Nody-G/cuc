/**
 * Données structurées pour la FAQ et réponses clés destinées à Lucas Dollfus.
 *
 * Réponses concrètes, chiffrées et transparentes sur les coûts, la propriété,
 * l'autonomie au quotidien, la sécurité et la roadmap.
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface FaqItem {
    question: string;
    answer: string;
    category: 'finances' | 'autonomie' | 'technique' | 'securite';
    highlight?: string;
}

export const LUCAS_FAQ_ITEMS: readonly FaqItem[] = [
    {
        question: 'Combien coûte l’exploitation du site chaque mois ?',
        answer:
            'Deux abonnements seulement sont requis : Vercel pour l’hébergement et Supabase pour la base de données. Grâce à l’optimisation extrême du code (pages pré-générées, images allégées sans serveur lourd), l’offre Vercel est gratuite ou à 20$/mois en plan Pro. Supabase Pro coûte 25$/mois (nécessaire pour la marge de données). Total mensuel : environ 25 à 45€/mois, bien inférieur aux coûts d’un WordPress avec hébergement dédié et licences de plugins payants.',
        category: 'finances',
        highlight: 'Environ 25 à 45€/mois au total.',
    },
    {
        question: 'À qui appartient le code source et la base de données ?',
        answer:
            'Le site, l’intégralité de son code source sur GitHub, les médias et les bases de données Supabase sont la propriété exclusive à 100% du Campus Univers Cascades. Aucun abonnement logiciel captif, aucun verrou propriétaire.',
        category: 'autonomie',
        highlight: '100% propriété du Campus Univers Cascades.',
    },
    {
        question: 'L’équipe du CUC a-t-elle besoin d’un développeur pour changer un contenu ?',
        answer:
            'Non. Le Cockpit d’administration et son Mode Studio permettent à Lucas, à la direction et au secrétariat de modifier textes, photos, dates de stages, tarifs, fiches coachs et films en toute autonomie. La saisie se fait directement sur l’écran avec un aperçu fidèle en temps réel.',
        category: 'autonomie',
        highlight: 'Autonomie totale au quotidien sans aucune ligne de code.',
    },
    {
        question: 'Que se passe-t-il en cas de fausse manipulation ou de suppression par erreur ?',
        answer:
            'Le système est blindé contre les erreurs humaines : chaque modification de page enregistre un instantané complet dans l’onglet Versions (restaurable en un clic). Les images supprimées partent dans un dossier corbeille sécurisé (_trash). Les négatifs haute fidélité restent archivés dans (_originals). La sauvegarde du contenu se fait par un export manuel téléchargé depuis le Cockpit, à la demande.',
        category: 'securite',
        highlight: 'Historique annulable, corbeille réversible et export de sauvegarde manuel.',
    },
    {
        question: 'Pourquoi le site est-il tellement plus rapide que l’ancien WordPress ?',
        answer:
            'L’ancien site chargeait des dizaines de scripts PHP lourds et non optimisés à chaque visiteur. Le nouveau site utilise Next.js 15 App Router et le réseau mondial Vercel Edge : les pages sont pré-calculées et servies en quelques millisecondes depuis le serveur le plus proche du visiteur, avec des images compressées au pixel près.',
        category: 'technique',
        highlight: 'Temps de chargement divisé par 5 à 10.',
    },
    {
        question: 'Comment s’articulera la mise en place de CUC Sign ?',
        answer:
            'CUC Sign partagera directement la base de données Supabase avec le site vitrine. Dès qu’une candidature reçue sur le site est validée, elle devient automatiquement un profil élève dans CUC Sign sans aucune ressaisie. Les coachs et élèves se connecteront directement sur CUC Sign pour les émargements et le suivi terrain.',
        category: 'technique',
        highlight: 'Zéro ressaisie, flux continu candidature → élève.',
    },
];
