import type { FilmCredit } from '@/types';

/**
 * Données et contrats du bloc « tournages » de la page Accueil.
 */

export interface HighlightProject {
    title: string;
    year: string;
    poster: string;
}

/**
 * Données éditables du bloc « tournages » (page Accueil).
 * Toutes les clés sont optionnelles : en leur absence, les valeurs
 * certifiées ci-dessous sont utilisées (zéro régression).
 */
export interface HomeTournagesData {
    badge?: string;
    title?: string;
    subtitle?: string;
    team_tag?: string;
    cta_text?: string;
    cta_link?: string;
    cta_production?: string;
    cta_catalog?: string;
    pillar1_title?: string;
    pillar1_desc?: string;
    pillar2_title?: string;
    pillar2_desc?: string;
    pillar3_title?: string;
    pillar3_desc?: string;
    featured_films?: HighlightProject[];
}

export interface HomeVirtualTourData {
    badge?: string;
    title?: string;
    subtitle?: string;
    tag?: string;
    cta_text?: string;
    cta_link?: string;
    installations_cta?: string;
    hud_title?: string;
    hud_hint?: string;
    image_url?: string;
}

/**
 * Sélection éditoriale de longs métrages — vérifiés comme tels (typologie
 * IMDb `movie`, cf. `metadata.title_type` en base). La seule distinction
 * autorisée est reprise ici : aucune étiquette marketing.
 *
 * Source de vérité des affiches : `site_films` (résolution par titre
 * normalisé `creditTitleKey`). La jaquette IMDb ci-dessous n'est qu'un
 * dernier recours d'AFFICHAGE pour une sélection éditoriale pas encore
 * cataloguée — la navigation de repli reste le catalogue complet.
 *
 * Doctrine i18n : titres et années sont des données (noms propres, aucune
 * traduction) ; les rôles d'intervention par production vivent dans
 * `home.tournages.actorRoles` (alignés par index, cf. `FEATURED_PRODUCTIONS`).
 */
export const FEATURED_PRODUCTIONS: HighlightProject[] = [
    {
        title: "L'Amour ouf",
        year: '2024',
        poster: 'https://m.media-amazon.com/images/M/MV5BNjY0NGU4NDMtYWI2ZS00NDE2LWE5MzUtM2UyODUyNmFmN2ZhXkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Nouveaux riches',
        year: '2023',
        poster: 'https://m.media-amazon.com/images/M/MV5BNTNkOTYzZjgtYzE0Yy00NGY1LThjNmQtMjFkMWZiMTNmMmZlXkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Bagarre',
        year: '2026',
        poster: 'https://m.media-amazon.com/images/M/MV5BNWQyOTZjZGYtZjFlZC00NzI2LTg3ZmItYjJhYjM2YmFjNDZmXkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Néro',
        year: '2025',
        poster: 'https://m.media-amazon.com/images/M/MV5BYzJmOTQzMmUtOWVjNS00MzhhLWE3OTYtMmNlMDlkYjAxMTBjXkEyXkFqcGc@._V1_.jpg',
    },
];

/**
 * Socle initial des films coordonnés par Lucas Dollfus pour un affichage
 * immédiat du carrousel de l'accueil avant hydratation Supabase.
 */
export const INITIAL_COORDINATED_FILMS: FilmCredit[] = [
  {"id":"johnny","title":"Johnny","year":"2027","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BNjExYjUyM2ItNzM1Yy00M2M0LTlhZGEtYTAwYmNmNGNjODIwXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt37205945/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades"},"description":"Biopic d'envergure retraçant le parcours mythique de Johnny Hallyday, de ses débuts d'idole yé-yé jusqu'aux concerts monumentaux au Parc des Princes en 1993.","director":"Cédric Jimenez"},
  {"id":"forty-love","title":"Forty Love","year":"2026","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"/images/films/forty-love.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt38361305/","allocineUrl":"https://www.allocine.fr/film/fichefilm_gen_cfilm=1000028064.html","trailerUrl":"","cuc_team_involved":["lucas-dollfus"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades"},"description":"Sacha Gallo, un prodige du tennis de 21 ans entraîné par son père, voit sa vie basculer lors de sa préparation pour un tournoi majeur à Paris lorsqu'il rencontre un rival passionné.","director":"Pierre-Ange Carlotti"},
  {"id":"sorority","title":"Sorority","year":"2026","category":"Série","stuntRoles":"","doubledActors":[],"highlight":false,"image":"","tag":"","imdbUrl":"https://www.imdb.com/title/tt40188328/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","franck-blanc"],"cuc_team_roles":{"franck-blanc":"Assistant coordinateur des cascades","lucas-dollfus":"Coordinateur des cascades"},"description":"Paris, 1889. Trois femmes aux destins croisés s'unissent pour conquérir leur indépendance et leur liberté au cœur d'une société patriarcale.","director":"Savina Dellicour, Vania Leturcq"},
  {"id":"jupiter","title":"Jupiter","year":"2026","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BYzFkY2QwOTctYzkxMS00NmJlLTg1ODMtYTg4NTdhNjcwOWY3XkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt37424290/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","alan-cueff"],"cuc_team_roles":{"alan-cueff":"Cascadeur","lucas-dollfus":"Coordinateur des cascades"},"description":"Le nouveau président français Paul Archambault affronte sa première épreuve lorsqu'une crise nucléaire éclate suite à une attaque contre le dirigeant russe. Réfugié dans un bunker sous l'Élysée, il doit prendre des décisions cruciales.","director":"Alexandre Smia"},
  {"id":"bagarre","title":"Bagarre","year":"2026","category":"Film","stuntRoles":"","doubledActors":["Nassim Lyes"],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BNWQyOTZjZGYtZjFlZC00NzI2LTg3ZmItYjJhYjM2YmFjNDZmXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt34724686/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","malik-diouf","bastien-trouve","alan-cueff","jonathan-bernard","teddy-ponceau","nicolas-retabi"],"cuc_team_roles":{"alan-cueff":"Cascadeur","malik-diouf":"Cascadeur","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","bastien-trouve":"Cascadeur","nicolas-retabi":"Cascadeur","jonathan-bernard":"Cascadeur"},"description":"Naïm est un amour dans la vie et un monstre quand il s'agit de se battre. Pour soigner sa chienne malade il est contraint d'intégrer « Allo Bagarre » un service de combattants de rue qui règlent les embrouilles à coups de poings.","director":"Julien Royal"},
  {"id":"la-nirvana","title":"La nirvana","year":"2026","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BY2MzM2I1ODAtYjkzZC00MzFiLWFlZGEtNDM1MzkzMjg4NTdiXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt40571633/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","teddy-ponceau"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur"},"description":"Jean, un agriculteur en faillite, voit sa vie sauvée in extremis quand Foued, un jeune de cité en cavale, encastre son 4x4 plein de drogue dans sa grange. Pour rembourser leurs dettes, ils décident de s'associer et de cultiver une variété de cannabis bio au milieu des chèvres : « la nirvana ».","director":"Hakim Bougheraba"},
  {"id":"pour-le-plaisir","title":"Pour le plaisir","year":"2026","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BNGY3ZGU2ODItYzM0Mi00ZDQwLWE5NTEtZDA3NWQwZGRjM2JmXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt38607784/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","franck-blanc"],"cuc_team_roles":{"franck-blanc":"Coordinateur des cascades","lucas-dollfus":"Coordinateur des cascades"},"description":"Fanny et Tom sont mariés depuis 20 ans. Lorsqu'il est révélé que Fanny n'a jamais eu d'orgasme, Tom, ingénieur, décide d'inventer un appareil pour révolutionner le plaisir féminin. Le couple se lance dans une aventure folle et touchante.","director":"Reem Kherici"},
  {"id":"chien-51","title":"Chien 51","year":"2025","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BMzgxMjMyZDUtOTA5Yy00ODYyLWJhMDEtNDBhMDc1YjQwNGE4XkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt33255286/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","malik-diouf","amedeo-cazzella","alan-cueff","teddy-ponceau"],"cuc_team_roles":{"alan-cueff":"Cascadeur","malik-diouf":"Coordinateur des cascades","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","amedeo-cazzella":"Cascadeur"},"description":"Paris a été divisé en 3 zones qui séparent les classes sociales et où l'IA nommée ALMA a révolutionné le travail de la police. Jusqu'à ce que son inventeur soit assassiné et que Salia et Zem soient forcés à collaborer pour mener l'enquête.","director":"Cédric Jimenez"},
  {"id":"coka-chicas","title":"Coka Chicas","year":"2025","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BMDA3ZTYzMGQtZWU0Ni00YjYwLTlmZjgtYmM5N2RiMTljYThjXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt33270077/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","malik-diouf","amedeo-cazzella","bastien-trouve","teddy-ponceau"],"cuc_team_roles":{"malik-diouf":"Cascadeur","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","bastien-trouve":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades"},"description":"Sarah, Jessica et Chanel, trois amies de banlieue, partent aux Caraïbes pour convoyer de la drogue et financer leur bar à ongles. Après l'arrestation, Jessica disparaît. Sarah et Chanel plongent dans les bas-fonds pour la retrouver.","director":"Roxine Helberg"},
  {"id":"nero","title":"Néro","year":"2025","category":"Série","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BYzJmOTQzMmUtOWVjNS00MzhhLWE3OTYtMmNlMDlkYjAxMTBjXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt32400599/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","jerome-gaspard","franck-blanc","kefi-abrikh","amedeo-cazzella","bastien-trouve","alan-cueff","pierre-toubas","nicolas-retabi"],"cuc_team_roles":{"alan-cueff":"Cascadeur","kefi-abrikh":"Cascadeur","franck-blanc":"Cascadeur","lucas-dollfus":"Coordinateur des cascades","pierre-toubas":"Cascadeur","bastien-trouve":"Assistant coordinateur des cascades","jerome-gaspard":"Coordinateur des cascades","nicolas-retabi":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades"},"description":"Sud de la France, XVIe siècle. Notre héros, homme de main au service d'un noble assoiffé de pouvoir, devra sauver sa propre fille, en danger, qu'il connaît à peine.","director":"Ludovic Colbeau-Justin"},
  {"id":"lamour-ouf","title":"L'Amour ouf","year":"2024","category":"Film","stuntRoles":"","doubledActors":["François Civil","Adèle Exarchopoulos (Cascades Action)"],"highlight":true,"image":"https://m.media-amazon.com/images/M/MV5BNjY0NGU4NDMtYWI2ZS00NDE2LWE5MzUtM2UyODUyNmFmN2ZhXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt27490099/","allocineUrl":"https://www.allocine.fr/film/fichefilm_gen_cfilm=221617.html","trailerUrl":"https://www.youtube.com/watch?v=bSbA6Aeydbs","cuc_team_involved":["lucas-dollfus","malik-diouf","franck-blanc","amedeo-cazzella","bastien-trouve","alan-cueff","michel-bouis","teddy-ponceau","nicolas-retabi"],"cuc_team_roles":{"alan-cueff":"Cascadeur","malik-diouf":"Cascadeur","franck-blanc":"Coordinateur de rigging","michel-bouis":"Coordinateur de rigging","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","bastien-trouve":"Cascadeur","nicolas-retabi":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades"},"description":"L'histoire d'une relation improbable entre deux personnes. Une fille issue d'une famille de la classe moyenne supérieure et un garçon issu d'un milieu modeste tombent amoureux, mais s'éloignent l'un de l'autre.","director":"Gilles Lellouche"},
  {"id":"sous-ecrous","title":"Sous écrous","year":"2024","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BNzdjNzBkMmItZGEyNC00YzdlLTg0MTgtODQ3Zjg5Mjk2MDcwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt33396612/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","malik-diouf","franck-blanc","amedeo-cazzella","bastien-trouve","teddy-ponceau"],"cuc_team_roles":{"malik-diouf":"Cascadeur","franck-blanc":"Cascadeur","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","bastien-trouve":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades"},"description":"Sammy, jeune étudiant en droit et livreur de pizzas, est arrêté par erreur et confondu avec son sosie, un dangereux braqueur surnommé l'artificier. Jeté en prison, il doit s'adapter à la vie carcérale.","director":"Hakim Bougheraba"},
  {"id":"le-negociateur","title":"Le négociateur","year":"2023","category":"Série","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BY2Y2MTViMWItYTgyOS00ZGRhLWE0YzItNzQ3ZmM5MjA1NjE3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt27470643/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","vincent-bouillon","pierre-toubas"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades","pierre-toubas":"Coordinateur des cascades","vincent-bouillon":"Rigger"},"description":"Ancien négociateur d'élite de la police, Antoine Clerc se retrouve pris en otage dans une banque avec sa fille. Forcé de reprendre du service malgré lui, il intègre la brigade du RAID pour résoudre les crises les plus périlleuses.","director":"Arnauld Mercadier"},
  {"id":"nouveaux-riches","title":"Nouveaux riches","year":"2023","category":"Film","stuntRoles":"","doubledActors":["Nassim Lyes"],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BNTNkOTYzZjgtYzE0Yy00NGY1LThjNmQtMjFkMWZiMTNmMmZlXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt27921620/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","franck-blanc","maurice-chan","amedeo-cazzella","bastien-trouve","frederic-dessains","anthony-pho","sarah-belala","teddy-ponceau"],"cuc_team_roles":{"anthony-pho":"Cascadeur","franck-blanc":"Rigger","maurice-chan":"Cascadeur","sarah-belala":"Cascadeur","lucas-dollfus":"Coordinateur des cascades","teddy-ponceau":"Cascadeur","bastien-trouve":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades","frederic-dessains":"Cascadeur"},"description":"Entre un arnaqueur dans la dèche et une millionnaire en crypto, le courant passe plutôt bien. Est-elle la cible idéale… ou l'escroc est-il sur le point de se faire escroquer ?","director":"Julien Royal"},
  {"id":"wankil-studio-laink-et-terracid","title":"Wankil Studio - Laink et Terracid","year":"2022","category":"Film","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BZjZkMmQ0YmItMTVmZC00NTExLWE2ZWUtNzdiMjBmNDA4OTFjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt39366998/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","bastien-trouve"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades","bastien-trouve":"Cascadeur"},"description":"Court-métrage d'action scénarisé pour Wankil Studio : Laink se fait enlever par la mafia et Terracid monte une opération commando pour le libérer, avec cascades automobiles et combats spectaculaires.","director":"Thomas Iturralde & Damien Laguionie"},
  {"id":"kavinsky-ft-kareen-lomax-cameo","title":"Kavinsky ft. Kareen Lomax: Cameo","year":"2022","category":"Court métrage","stuntRoles":"","doubledActors":[],"highlight":false,"image":"https://m.media-amazon.com/images/M/MV5BMjJkZDkzMGItNTIxNS00N2M5LWE2ZTktMTIwZmE3ZmFjNTAwXkEyXkFqcGc@._V1_.jpg","tag":"","imdbUrl":"https://www.imdb.com/title/tt19064356/","allocineUrl":"","trailerUrl":"","cuc_team_involved":["lucas-dollfus","franck-blanc","amedeo-cazzella","jonathan-bernard","bastien-trouve","teddy-ponceau","nicolas-retabi"],"cuc_team_roles":{"lucas-dollfus":"Coordinateur des cascades","franck-blanc":"Cascadeur","amedeo-cazzella":"Coordinateur des cascades","jonathan-bernard":"Cascadeur","bastien-trouve":"Cascadeur","teddy-ponceau":"Cascadeur","nicolas-retabi":"Cascadeur"},"description":"Music video for the song Cameo by Kavinsky ft. Kareen Lomax from the album Reborn.","director":"Filip Nilsson"}
];
