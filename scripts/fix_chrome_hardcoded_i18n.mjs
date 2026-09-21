/**
 * Lot i18n — chrome restant en dur dans les composants publics.
 *
 * Le crawler ne voit que le rendu initial : les libellés cachés (aria-label,
 * `title`, attributs `alt`, états vides, héro d'une section pilotée par la base)
 * restaient français sur les pages anglaises. Chaque chaîne rejoint le namespace
 * DÉJÀ utilisé par son fichier — aucun namespace fourre-tout.
 *
 * Sont volontairement conservés tels quels (ce ne sont pas des traductions) :
 * noms propres et marques (`AlloCiné`, `Le Cateau-Cambrésis`), adresses postales,
 * et les valeurs envoyées en base par le formulaire de candidature.
 *
 * Usage : node scripts/fix_chrome_hardcoded_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));
/** Ampersand construit par échappement : évite d'écrire une entité littérale. */
const AMP = '\x26';

const NEW_KEYS = {
    fr: {
        team: {
            coachNotFound:
                "Ce membre de l'équipe pédagogique n'existe pas ou a été déplacé.",
            coachBackToTeam: "Retour à l'équipe",
            coachAllocineTitle: 'Fiche Allociné',
            coachSortFilmographyAria: 'Trier la filmographie',
            externalLinkAria: 'Fiche & Références externes',
        },
        teamProduction: {
            teamBannersBadge: 'CRÉDITS CINÉMATOGRAPHIQUES',
            teamBannersTitle: 'LES FILMS COORDONNÉS PAR LE CUC & LUCAS DOLLFUS',
            teamBannersPosterTitle: "Cliquer pour ouvrir l'affiche en plein écran",
        },
        films: {
            filmCardDetails: 'Cliquer pour les détails',
        },
        eventsAgence: {
            bannerAlt1: 'Bandes affiches film série 1',
            bannerAlt2: 'Bandes affiches film série 2',
            bannerAlt3: 'Bandes affiches film série 3',
            bannerAlt4: 'Bandes affiches film série 4',
            heroBadge: "AGENCE ÉVÉNEMENTIELLE D'ACTION",
            heroTitle: 'CUC EVENTS : SPECTACLES & ANIMATIONS',
            heroSubtitle:
                "Marquez les esprits lors de vos festivals, lancements de marque, parcs à thème ou séminaires d'entreprise grâce à des shows d'action spectaculaires orchestrés par les cascadeurs professionnels du Campus Univers Cascades.",
            heroCtaPrimary: 'Demander un Devis Événementiel',
            heroCtaSecondary: 'Voir nos Vidéos en Direct',
            heroImageAlt: 'CUC Events spectacles de cascades et animations en direct',
            animationsBody:
                "Offrez à votre public des sensations uniques grâce à nos animations interactives encadrées par des professionnels : le <strong>FreeJump Airbag</strong> (sauts sécurisés de 4 à 8 mètres de haut), simulateur de câblage cinéma, ou ateliers d'initiation au parkour avec les membres des Yamakasi.",
        },
        visiteGuidee: {
            accessAddress: 'Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis (France)',
            domainClosed: 'DOMAINE CLOS • LE CATEAU-CAMBRÉSIS',
        },
        stuntWorkshop: {
            briAlt: "CUC BRI — Formation cascade Brigade de Recherche et d'Intervention",
        },
    },
    en: {
        team: {
            coachNotFound: 'This member of the teaching team does not exist or has been moved.',
            coachBackToTeam: 'Back to the team',
            coachAllocineTitle: 'AlloCiné page',
            coachSortFilmographyAria: 'Sort the filmography',
            externalLinkAria: 'Profile & external references',
        },
        teamProduction: {
            teamBannersBadge: 'FILM CREDITS',
            teamBannersTitle: 'FILMS COORDINATED BY THE CUC & LUCAS DOLLFUS',
            teamBannersPosterTitle: 'Click to open the poster full screen',
        },
        films: {
            filmCardDetails: 'Click for details',
        },
        eventsAgence: {
            bannerAlt1: 'Film & series poster strip 1',
            bannerAlt2: 'Film & series poster strip 2',
            bannerAlt3: 'Film & series poster strip 3',
            bannerAlt4: 'Film & series poster strip 4',
            heroBadge: 'ACTION EVENT AGENCY',
            heroTitle: 'CUC EVENTS: SHOWS & ANIMATIONS',
            heroSubtitle:
                'Make a lasting impression at your festivals, brand launches, theme parks or corporate seminars with spectacular action shows staged by the professional stunt performers of Campus Univers Cascades.',
            heroCtaPrimary: 'Request an Event Quote',
            heroCtaSecondary: 'Watch our Live Videos',
            heroImageAlt: 'CUC Events live stunt shows and animations',
            animationsBody:
                'Give your audience unique thrills with our interactive animations supervised by professionals: the <strong>FreeJump Airbag</strong> (secured jumps from 4 to 8 metres high), a film rigging simulator, or parkour initiation workshops with members of the Yamakasi.',
        },
        visiteGuidee: {
            accessAddress: 'CUC grounds, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis (France)',
            domainClosed: 'PRIVATE ESTATE • LE CATEAU-CAMBRÉSIS',
        },
        stuntWorkshop: {
            briAlt: "CUC BRI — riot police stunt training (Brigade de Recherche et d'Intervention)",
        },
    },
};

/** Le cas échéant : ajoute la clé dans une sous-section existante (`contact.map`). */
const NESTED_KEYS = {
    fr: { contact: { map: { mapAddressLabel: 'Le Cateau-Cambrésis • Domaine CUC' } } },
    en: { contact: { map: { mapAddressLabel: 'Le Cateau-Cambrésis • CUC Campus' } } },
};

const IMPORT_LINE = "import { useTranslations } from 'next-intl';\n";

const EDITS = [
    [
        'src/app/(site)/[locale]/equipe-cascadeurs-pro/[slug]/CoachDetailClient.tsx',
        [
            ["            Ce membre de l'équipe pédagogique n'existe pas ou a été déplacé.\n", "            {tt('coachNotFound')}\n", 'état vide'],
            ["<span>Retour à l'équipe</span>", "<span>{tt('coachBackToTeam')}</span>", 'retour équipe'],
            ['title="Fiche Allociné"', "title={tt('coachAllocineTitle')}", 'lien AlloCiné'],
            ['aria-label="Trier la filmographie"', "aria-label={tt('coachSortFilmographyAria')}", 'tri filmographie'],
        ],
    ],
    [
        'src/components/sections/team/TeamBannersSection.tsx',
        [
            [
                "import { Film, Maximize2 } from 'lucide-react';",
                "import { useTranslations } from 'next-intl';\nimport { Film, Maximize2 } from 'lucide-react';",
                'import useTranslations',
            ],
            [
                '}) => {\n',
                "}) => {\n  const t = useTranslations('teamProduction');\n",
                'hook teamProduction',
            ],
            ['            CRÉDITS CINÉMATOGRAPHIQUES\n', "            {t('teamBannersBadge')}\n", 'badge'],
            [
                '            LES FILMS COORDONNÉS PAR LE CUC & LUCAS DOLLFUS\n',
                "            {t('teamBannersTitle')}\n",
                'titre',
            ],
            [
                'title="Cliquer pour ouvrir l\'affiche en plein écran"',
                "title={t('teamBannersPosterTitle')}",
                'title affiche',
            ],
        ],
    ],
    [
        'src/components/sections/hall-of-fame/FilmGridCard.tsx',
        [
            [
                "import { ExternalLink, Film, Info } from 'lucide-react';",
                "import { useTranslations } from 'next-intl';\nimport { ExternalLink, Film, Info } from 'lucide-react';",
                'import useTranslations',
            ],
            ['}) => {\n  return (\n', "}) => {\n  const t = useTranslations('films');\n\n  return (\n", 'hook films'],
            ['<span>Cliquer pour les détails</span>', "<span>{t('filmCardDetails')}</span>", 'libellé détails'],
        ],
    ],
    [
        'src/components/sections/events/EventsHeroSection.tsx',
        [
            [
                "import Image from 'next/image';",
                "import Image from 'next/image';\nimport { useTranslations } from 'next-intl';",
                'import useTranslations',
            ],
            [
                'export const EventsHeroSection: React.FC<EventsHeroSectionProps> = ({ hero }) => {\n',
                "export const EventsHeroSection: React.FC<EventsHeroSectionProps> = ({ hero }) => {\n  const t = useTranslations('eventsAgence');\n",
                'hook eventsAgence',
            ],
            [
                'const badge = hero?.badge || "AGENCE ÉVÉNEMENTIELLE D\'ACTION";',
                "const badge = hero?.badge || t('heroBadge');",
                'badge par défaut',
            ],
            [
                "const title = hero?.title || 'CUC EVENTS : SPECTACLES & ANIMATIONS';",
                "const title = hero?.title || t('heroTitle');",
                'titre par défaut',
            ],
            [
                '  const subtitle =\n    hero?.subtitle ||\n    "Marquez les esprits lors de vos festivals, lancements de marque, parcs à thème ou séminaires' +
                " d'entreprise grâce à des shows d'action spectaculaires orchestrés par les cascadeurs" +
                ' professionnels du Campus Univers Cascades.";',
                "  const subtitle = hero?.subtitle || t('heroSubtitle');",
                'sous-titre par défaut',
            ],
            [
                "const ctaPrimaryText = hero?.cta_primary_text || 'Demander un Devis Événementiel';",
                "const ctaPrimaryText = hero?.cta_primary_text || t('heroCtaPrimary');",
                'CTA principal',
            ],
            [
                "const ctaSecondaryText = hero?.cta_secondary_text || 'Voir nos Vidéos en Direct';",
                "const ctaSecondaryText = hero?.cta_secondary_text || t('heroCtaSecondary');",
                'CTA secondaire',
            ],
            [
                'alt="CUC Events spectacles de cascades et animations en direct"',
                "alt={t('heroImageAlt')}",
                'alt visuel',
            ],
        ],
    ],
    [
        'src/components/sections/events/EventsPartnersBanners.tsx',
        [
            ['alt="Bandes affiches film série 1"', "alt={t('bannerAlt1')}", 'alt bandeau 1'],
            ['alt="Bandes affiches film série 2"', "alt={t('bannerAlt2')}", 'alt bandeau 2'],
            ['alt="Bandes affiches film série 3"', "alt={t('bannerAlt3')}", 'alt bandeau 3'],
            ['alt="Bandes affiches film série 4"', "alt={t('bannerAlt4')}", 'alt bandeau 4'],
        ],
    ],
    [
        'src/components/sections/events/EventsPillarsSection.tsx',
        [
            [
                '                    Offrez à votre public des sensations uniques grâce à nos animations interactives encadrées par des professionnels : le <strong className="text-white">FreeJump Airbag</strong> (sauts sécurisés de 4 à 8 mètres de haut), simulateur de câblage cinéma, ou ateliers d' +
                AMP +
                'apos;initiation au parkour avec les membres des Yamakasi.\n',
                "                    {t.rich('animationsBody', {\n                      strong: (chunks) => <strong className=\"text-white\">{chunks}</strong>,\n                    })}\n",
                'paragraphe animations',
            ],
        ],
    ],
    [
        'src/components/sections/visite/VisiteAccessTransport.tsx',
        [
            [
                '                Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis (France)\n',
                "                {t('accessAddress')}\n",
                'adresse',
            ],
        ],
    ],
    [
        'src/app/(site)/[locale]/visite-guidee/page.tsx',
        [
            [
                '                    DOMAINE CLOS • LE CATEAU-CAMBRÉSIS\n',
                "                    {t('domainClosed')}\n",
                'mention domaine clos',
            ],
        ],
    ],
    [
        'src/components/ui/InteractiveCampusMap.tsx',
        [
            [
                '<span>Le Cateau-Cambrésis • Domaine CUC</span>',
                "<span>{t('mapAddressLabel')}</span>",
                'libellé adresse carte',
            ],
        ],
    ],
    [
        'src/app/(site)/[locale]/equipe-cascadeurs-pro/page.tsx',
        [
            ['title="Fiche & Références externes"', "title={t('externalLinkAria')}", 'aria fiche externe'],
        ],
    ],
    [
        'src/app/(site)/[locale]/stunt-workshop-cuc/page.tsx',
        [
            [
                'alt="CUC BRI — Formation cascade Brigade de Recherche et d\'Intervention"',
                "alt={t('briAlt')}",
                'alt BRI',
            ],
        ],
    ],
];

/* --- 1. Catalogues ------------------------------------------------------- */
for (const rel of ['messages/fr.json', 'messages/en.json']) {
    const path = here(rel);
    const locale = rel.includes('en.json') ? 'en' : 'fr';
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const added = [];
    for (const [namespace, keys] of Object.entries(NEW_KEYS[locale])) {
        const current = catalog[namespace] ?? {};
        catalog[namespace] = { ...current, ...keys };
        added.push(`${namespace}(${Object.keys(keys).length})`);
    }
    for (const [namespace, sections] of Object.entries(NESTED_KEYS[locale])) {
        const current = catalog[namespace] ?? {};
        catalog[namespace] = { ...current };
        for (const [section, keys] of Object.entries(sections)) {
            catalog[namespace][section] = { ...(current[section] ?? {}), ...keys };
            added.push(`${namespace}.${section}(${Object.keys(keys).length})`);
        }
    }
    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    console.log(`${rel} : ${added.join(', ')}`);
}

/* --- 2. Composants ------------------------------------------------------- */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toPattern = (value) => new RegExp(escapeRegExp(value).replace(/\n/g, '\\r?\\n'), 'g');

let applied = 0;
const missed = [];
for (const [rel, edits] of EDITS) {
    const path = here(rel);
    let src = readFileSync(path, 'utf8');
    for (const [from, to, label] of edits) {
        const pattern = toPattern(from);
        if (!pattern.test(src)) {
            if (src.includes(to.trim())) continue; // déjà appliqué
            missed.push(`${rel} :: ${label}`);
            continue;
        }
        src = src.replace(pattern, to);
        applied += 1;
    }
    if (!dry) writeFileSync(path, src);
}

console.log(`\n${applied} édition(s) appliquée(s)`);
for (const item of missed) console.log(`  MANQUÉ → ${item}`);
if (dry) console.log('Mode --dry : aucun fichier écrit.');
