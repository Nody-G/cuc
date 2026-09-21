/**
 * Lot i18n — page TOURNAGE (`/cuc-team-cascadeur`).
 *
 * 1. Injecte le namespace `teamProduction` dans `messages/fr.json` et
 *    `messages/en.json` (injection JSON : aucune séquence d'entité HTML n'est
 *    écrite dans les fichiers, donc aucun risque de décodage parasite).
 * 2. Traduit le chrome des modales partagées (`CelebrityDetailsModal`,
 *    `FilmDetailsModal`) et le libellé de tri de `CucFilmsShowcase`.
 *
 * Les chaînes recherchées contenant `&` / `'` sont construites avec
 * `\x26` pour ne jamais écrire la séquence d'entité littérale.
 *
 * Usage : node scripts/fix_team_production_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');

const AMP = '\x26amp;'; // &
const APOS = '\x26apos;'; // '

const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

/* ------------------------------------------------------------------ */
/* 1. Catalogue                                                        */
/* ------------------------------------------------------------------ */

const FR = {
    hero: {
        breadcrumbHome: 'ACCUEIL',
        breadcrumbCurrent: 'TOURNAGE',
        badge: 'COORDINATION DE CASCADES • CINÉMA',
        title: 'TOURNAGE',
        subtitle:
            "Le Campus Univers Cascades et la CUC Stunt Team accompagnent les productions cinématographiques et audiovisuelles, de la conception des chorégraphies d'action jusqu'au tournage en plateau.",
        ctaPrimary: "Contacter l'Équipe de Production",
        posters: 'Voir les affiches',
        bgAlt: "CUC Stunt Team tournages cinéma et films d'action",
        emblemAlt: 'Blason CUC Stunt Team',
        emblemLabel: 'CAMPUS UNIVERS CASCADES',
    },
    galleries: {
        studioBadge: 'INFRASTRUCTURES DE TOURNAGE',
        studioTitle: "LE STUDIO & LA SALLE D'ACTION",
        doublesBadge: 'DOUBLURES & CHORÉGRAPHES',
        doublesTitle: 'LES CASCADEURS EN ACTION',
        equipmentBadge: 'MATÉRIEL TECHNIQUE CINÉMA',
        equipmentTitle: 'LES ÉQUIPEMENTS DE TOURNAGE',
        zoomStudio: 'Cliquer pour voir en plein écran',
        zoomStunt: 'Cliquer pour agrandir la photo de cascade',
        zoomEquipment: "Cliquer pour voir l'équipement en détail",
        expand: 'Agrandir',
    },
    hallOfFame: {
        emblemAlt: 'Blason CUC',
        badge: 'CRÉDITS & TOURNAGES',
        tag: 'PRODUCTIONS CUC & ANCIENS ÉLÈVES',
        title: "HALL OF FAME DU CINÉMA D'ACTION",
        subtitle:
            'Retrouvez une sélection de productions audiovisuelles et cinématographiques sur lesquelles sont intervenus les cascadeurs et formateurs du CUC.',
        actorsBadge: 'ACTEURS & TOURNAGES',
        actorsTitle: 'LES ACTEURS DOUBLÉS & PRODUCTIONS',
        actorsIntro:
            "Les formateurs et cascadeurs du Campus Univers Cascades interviennent sur les scènes d'action des tournages français et internationaux.",
        photoAlt: 'Comédien doublé {name}',
        imdbTitle: 'Voir la filmographie IMDb de {name}',
        filmsLabel: 'Films :',
        detailLabel: 'Fiche détaillée',
    },
    celebrityModal: {
        title: 'Fiche Tournage & Cascades',
        doublesLabel: 'Doublure cascades :',
        scenesLabel: "Cascades & scènes d'action :",
        filmsLabel: 'Films :',
        imdbCta: 'Fiche IMDb',
        close: 'Fermer',
        closeAria: 'Fermer',
    },
    filmModal: {
        title: 'Détails du Film',
        directedBy: 'Réalisé par {name}',
        doublesLabel: 'Doublures & comédiens :',
        teamLabel: 'Équipe CUC :',
        trailer: 'Bande-annonce',
        close: 'Fermer',
        closeAria: 'Fermer',
        openHint: 'Cliquez pour voir la fiche',
    },
    showcase: {
        sortLabel: 'Trier :',
        sortAria: 'Trier les films',
    },
    services: {
        badge: 'SERVICES AUX PRODUCTIONS',
        title: "TOURNER VOS SCÈNES D'ACTION AVEC LE CUC",
        intro:
            "De la pré-production à l'exécution sur le plateau, le Campus Univers Cascades met à votre disposition ses ressources techniques et humaines :",
        items: [
            {
                label: '1. COORDINATION & CHORÉGRAPHIE :',
                body:
                    "Analyse du scénario, chiffrage budgétaire, découpage technique de l'action et chorégraphies sur-mesure adaptées au jeu des comédiens.",
            },
            {
                label: '2. PRÉPARATION DES COMÉDIENS (STUDIO PARIS / GENNEVILLIERS) :',
                body:
                    'Sessions de répétition en amont du tournage pour habituer les acteurs aux armes factices, aux mouvements de combat et aux réactions de tir.',
            },
            {
                label: '3. MATÉRIEL DE TOURNAGE & DOMAINE :',
                body:
                    'Airbags certifiés, systèmes de câblage (rigging), harnais de cascade et mise à disposition du domaine comme décor naturel.',
            },
        ],
        contactTitle: 'CONTACT PRODUCTION & CASTING',
        contactIntro:
            'Vous préparez un long-métrage, une série, un clip ou un spectacle ? Contactez directement notre bureau de coordination.',
        coordinatorLabel: 'COORDINATEUR RÉFÉRENT :',
        coordinatorValue: 'Lucas Dollfus — CUC PROD',
        phoneLabel: 'TÉLÉPHONE DIRECT :',
        emailLabel: 'EMAIL PRO :',
        cta: 'Demande de Devis & Collaboration',
    },
    celebrities: [
        {
            id: 'tomer-sisley',
            specialty: 'Combats chorégraphiés, cascades physiques et poursuites.',
            doubles: 'Doublé par Vincent Bouillon',
        },
        {
            id: 'keanu-reeves',
            specialty: 'Chute des 222 marches du Sacré-Cœur à Paris (Taurus World Stunt Award 2024).',
            doubles: 'Doublé par Vincent Bouillon',
        },
        {
            id: 'jean-dujardin',
            specialty: 'Cascades physiques et combats chorégraphiés.',
            doubles: 'Doublé par Vincent Bouillon',
        },
        {
            id: 'pierre-niney',
            specialty: "Duels à l'épée et cascades physiques réglés avec les régleurs CUC.",
            doubles: '',
        },
        {
            id: 'francois-civil',
            specialty: 'Combats rapprochés et cascades physiques.',
            doubles: '',
        },
        {
            id: 'roschdy-zem',
            specialty: 'Combats rapprochés et fusillades tactiques.',
            doubles: '',
        },
        {
            id: 'omar-sy',
            specialty: 'Cascades physiques et affrontements armés.',
            doubles: '',
        },
        {
            id: 'gilles-lellouche',
            specialty: 'Cascades physiques et poursuites urbaines.',
            doubles: '',
        },
        {
            id: 'kevin-costner',
            specialty: 'Cascades physiques et poursuites lors du tournage parisien.',
            doubles: '',
        },
        {
            id: 'vincent-cassel',
            specialty: 'Combats et cascades physiques.',
            doubles: '',
        },
        {
            id: 'jean-reno',
            specialty: 'Cascades physiques et affrontements armés.',
            doubles: '',
        },
    ],
};

const EN = {
    hero: {
        breadcrumbHome: 'HOME',
        breadcrumbCurrent: 'FILMING',
        badge: 'STUNT COORDINATION • FILM',
        title: 'FILMING',
        subtitle:
            'Campus Univers Cascades and the CUC Stunt Team support film and audiovisual productions, from designing action choreography through to shooting on set.',
        ctaPrimary: 'Contact the Production Team',
        posters: 'View the posters',
        bgAlt: 'CUC Stunt Team film and action shoots',
        emblemAlt: 'CUC Stunt Team emblem',
        emblemLabel: 'CAMPUS UNIVERS CASCADES',
    },
    galleries: {
        studioBadge: 'FILMING FACILITIES',
        studioTitle: 'THE STUDIO & THE ACTION STAGE',
        doublesBadge: 'DOUBLES & FIGHT CHOREOGRAPHERS',
        doublesTitle: 'STUNT PERFORMERS IN ACTION',
        equipmentBadge: 'FILM TECHNICAL EQUIPMENT',
        equipmentTitle: 'FILMING EQUIPMENT',
        zoomStudio: 'Click to view full screen',
        zoomStunt: 'Click to enlarge the stunt photo',
        zoomEquipment: 'Click to view the equipment in detail',
        expand: 'Enlarge',
    },
    hallOfFame: {
        emblemAlt: 'CUC emblem',
        badge: 'CREDITS & SHOOTS',
        tag: 'CUC PRODUCTIONS & ALUMNI',
        title: 'ACTION CINEMA HALL OF FAME',
        subtitle:
            'A selection of audiovisual and film productions the CUC stunt performers and instructors have worked on.',
        actorsBadge: 'ACTORS & SHOOTS',
        actorsTitle: 'DOUBLED ACTORS & PRODUCTIONS',
        actorsIntro:
            'Campus Univers Cascades instructors and stunt performers work on the action scenes of French and international productions.',
        photoAlt: 'Doubled actor {name}',
        imdbTitle: "View {name}'s IMDb filmography",
        filmsLabel: 'Films:',
        detailLabel: 'Full details',
    },
    celebrityModal: {
        title: 'Shoot & Stunt Details',
        doublesLabel: 'Stunt double:',
        scenesLabel: 'Stunts & action scenes:',
        filmsLabel: 'Films:',
        imdbCta: 'IMDb page',
        close: 'Close',
        closeAria: 'Close',
    },
    filmModal: {
        title: 'Film Details',
        directedBy: 'Directed by {name}',
        doublesLabel: 'Doubles & actors:',
        teamLabel: 'CUC Team:',
        trailer: 'Trailer',
        close: 'Close',
        closeAria: 'Close',
        openHint: 'Click to view the details',
    },
    showcase: {
        sortLabel: 'Sort:',
        sortAria: 'Sort films',
    },
    services: {
        badge: 'SERVICES TO PRODUCTIONS',
        title: 'SHOOT YOUR ACTION SCENES WITH THE CUC',
        intro:
            'From pre-production to delivery on set, Campus Univers Cascades makes its technical and human resources available to you:',
        items: [
            {
                label: '1. COORDINATION & CHOREOGRAPHY:',
                body:
                    "Script analysis, budget costing, technical breakdown of the action and choreography tailored to the actors' performance.",
            },
            {
                label: '2. ACTOR PREPARATION (PARIS STUDIO / GENNEVILLIERS):',
                body:
                    'Rehearsal sessions ahead of the shoot to familiarise the actors with prop weapons, fight movements and gunfire reactions.',
            },
            {
                label: '3. FILM EQUIPMENT & ESTATE:',
                body:
                    'Certified airbags, rigging systems, stunt harnesses and use of the estate as a natural set.',
            },
        ],
        contactTitle: 'PRODUCTION & CASTING CONTACT',
        contactIntro:
            'Preparing a feature film, a series, a music video or a live show? Contact our coordination office directly.',
        coordinatorLabel: 'LEAD COORDINATOR:',
        coordinatorValue: 'Lucas Dollfus — CUC PROD',
        phoneLabel: 'DIRECT PHONE:',
        emailLabel: 'PRO EMAIL:',
        cta: 'Quote & Collaboration Request',
    },
    celebrities: [
        {
            id: 'tomer-sisley',
            specialty: 'Choreographed fights, physical stunts and chases.',
            doubles: 'Doubled by Vincent Bouillon',
        },
        {
            id: 'keanu-reeves',
            specialty: '222-step fall down the Sacré-Cœur in Paris (Taurus World Stunt Award 2024).',
            doubles: 'Doubled by Vincent Bouillon',
        },
        {
            id: 'jean-dujardin',
            specialty: 'Physical stunts and choreographed fights.',
            doubles: 'Doubled by Vincent Bouillon',
        },
        {
            id: 'pierre-niney',
            specialty: 'Sword duels and physical stunts choreographed with the CUC fight coordinators.',
            doubles: '',
        },
        {
            id: 'francois-civil',
            specialty: 'Close-quarters fights and physical stunts.',
            doubles: '',
        },
        {
            id: 'roschdy-zem',
            specialty: 'Close-quarters fights and tactical gunfire.',
            doubles: '',
        },
        {
            id: 'omar-sy',
            specialty: 'Physical stunts and armed confrontations.',
            doubles: '',
        },
        {
            id: 'gilles-lellouche',
            specialty: 'Physical stunts and urban chases.',
            doubles: '',
        },
        {
            id: 'kevin-costner',
            specialty: 'Physical stunts and chases during the Paris shoot.',
            doubles: '',
        },
        {
            id: 'vincent-cassel',
            specialty: 'Fights and physical stunts.',
            doubles: '',
        },
        {
            id: 'jean-reno',
            specialty: 'Physical stunts and armed confrontations.',
            doubles: '',
        },
    ],
};

function injectCatalog(rel, payload) {
    const path = here(rel);
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const existed = Boolean(catalog.teamProduction);
    catalog.teamProduction = payload;
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    return `${rel} ← teamProduction ${existed ? 'remplacé' : 'ajouté'} (${Object.keys(payload).length} groupes)`;
}

/* ------------------------------------------------------------------ */
/* 2. Composants                                                       */
/* ------------------------------------------------------------------ */

const edits = [
    [
        'src/components/sections/hall-of-fame/CelebrityDoublesGallery.tsx',
        [
            [
                'stuntDoubles: copy.doubles ?? actor.stuntDoubles,',
                'stuntDoubles: copy.doubles || actor.stuntDoubles,',
                'doublures : repli sur la donnée si la copie est vide',
            ],
        ],
    ],
    [
        'src/components/sections/hall-of-fame/CelebrityDetailsModal.tsx',
        [
            [
                "import { DoubledCelebrity } from '@/types';",
                "import { useTranslations } from 'next-intl';\nimport { DoubledCelebrity } from '@/types';",
                'import useTranslations',
            ],
            [
                '  if (!celebrity) return null;',
                "  const t = useTranslations('teamProduction');\n\n  if (!celebrity) return null;",
                'hook t',
            ],
            [
                'Fiche Tournage ' + AMP + ' Cascades',
                "              {t('celebrityModal.title')}",
                'titre modale',
            ],
            ['aria-label="Fermer"', "aria-label={t('celebrityModal.closeAria')}", 'aria Fermer'],
            ['Doublure cascades :', "{t('celebrityModal.doublesLabel')}", 'label doublure'],
            [
                'Cascades ' + AMP + ' scènes d' + APOS + 'action :',
                "{t('celebrityModal.scenesLabel')}",
                'label scènes',
            ],
            ['                  Films :\n', "                  {t('celebrityModal.filmsLabel')}\n", 'label films'],
            ['<span>Fiche IMDb</span>', "<span>{t('celebrityModal.imdbCta')}</span>", 'CTA IMDb'],
            ['            Fermer\n', "            {t('celebrityModal.close')}\n", 'bouton Fermer'],
        ],
    ],
    [
        'src/components/sections/hall-of-fame/FilmDetailsModal.tsx',
        [
            [
                "import { FilmCredit, Instructor } from '@/types';",
                "import { useTranslations } from 'next-intl';\nimport { FilmCredit, Instructor } from '@/types';",
                'import useTranslations',
            ],
            [
                '  const [teamMembers, setTeamMembers] = React.useState<Instructor[]>(CUC_TEAM);',
                "  const t = useTranslations('teamProduction');\n  const [teamMembers, setTeamMembers] = React.useState<Instructor[]>(CUC_TEAM);",
                'hook t',
            ],
            ['Détails du Film', "{t('filmModal.title')}", 'titre modale'],
            ['aria-label="Fermer"', "aria-label={t('filmModal.closeAria')}", 'aria Fermer'],
            [
                "                  {movie.year}{movie.director ? ` • Réalisé par ${movie.director}` : ''}",
                "                  {movie.year}{movie.director ? ` • ${t('filmModal.directedBy', { name: movie.director })}` : ''}",
                'réalisé par',
            ],
            ['Doublures ' + AMP + ' comédiens :', "{t('filmModal.doublesLabel')}", 'label doublures'],
            ['Équipe CUC :', "{t('filmModal.teamLabel')}", 'label équipe'],
            ['<span>Bande-annonce</span>', "<span>{t('filmModal.trailer')}</span>", 'bande-annonce'],
            ['            Fermer\n', "            {t('filmModal.close')}\n", 'bouton Fermer'],
        ],
    ],
    [
        'src/components/sections/films/CucFilmsShowcase.tsx',
        [
            [
                "  const tTeam = useTranslations('team');",
                "  const tTeam = useTranslations('team');\n  const tProduction = useTranslations('teamProduction');",
                'hook tProduction',
            ],
            [
                '<span className="uppercase tracking-wider">Trier :</span>',
                '<span className="uppercase tracking-wider">{tProduction(\'showcase.sortLabel\')}</span>',
                'libellé de tri',
            ],
            ['aria-label="Trier les films"', "aria-label={tProduction('showcase.sortAria')}", 'aria de tri'],
            [
                'title={`${film.title} (${film.year}) - Cliquez pour voir la fiche`}',
                "title={`${film.title} (${film.year}) - ${tProduction('filmModal.openHint')}`}",
                'title de vignette',
            ],
        ],
    ],
];

let applied = 0;
const missed = [];

for (const [rel, list] of edits) {
    const path = here(rel);
    let src = readFileSync(path, 'utf8');
    for (const [from, to, label] of list) {
        if (!src.includes(from)) {
            missed.push(`${rel} :: ${label}`);
            continue;
        }
        src = src.replaceAll(from, to);
        applied++;
    }
    if (!dry) writeFileSync(path, src);
}

/* ------------------------------------------------------------------ */
/* 3. Rapport                                                          */
/* ------------------------------------------------------------------ */

console.log(injectCatalog('messages/fr.json', FR));
console.log(injectCatalog('messages/en.json', EN));
console.log(`Composants : ${applied} édition(s) appliquée(s), ${missed.length} manquée(s).`);
for (const m of missed) console.log(`  MANQUÉ → ${m}`);
if (dry) console.log('Mode --dry : aucun fichier écrit.');
