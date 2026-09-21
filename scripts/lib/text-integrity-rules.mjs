/**
 * ==============================================================================
 * CUC — Règles de DÉTECTION des défauts de texte (source unique)
 * ==============================================================================
 * Partagées par l'audit des textes EN BASE (`audit_text_integrity.mjs`) et par
 * l'audit des textes du DÉPÔT (`audit_repo_text_integrity.mjs`, catalogues
 * `messages/*.json`). Ces deux surfaces doivent être jugées avec exactement les
 * mêmes règles : une divergence produirait un site « propre » en base et sale
 * dans l'interface.
 *
 * ⚠️  LES RÈGLES SONT SENSIBLES À LA LOCALE.
 *   - ` ,` et ` .` sont fautifs en français comme en anglais ;
 *   - ` : `, ` ; `, ` ! `, ` ? ` sont **requis** en français et **fautifs** en
 *     anglais : les traiter avec une règle unique produit 28 faux positifs
 *     (mesuré) et ferait « corriger » du français correct ;
 *   - l'heuristique « texte long sans aucune apostrophe » n'a de sens qu'en
 *     français (l'anglais n'utilise pas d'élision) ;
 *   - les guillemets `« »` ne sont un défaut que dans un texte anglais.
 *
 * Les corrections, elles, vivent dans `scripts/lib/text-repairs.mjs` (avec le
 * garde-fou de substance).
 * ==============================================================================
 */
import { ESCAPED_AMP } from './text-repairs.mjs';

/** Séquences de double-encodage UTF-8 (mêmes paires que `fix_mojibake.mjs`). */
export const MOJIBAKE = [
    'Ã©', 'Ã¨', 'Ãª', 'Ã«', 'Ã ', 'Ã¢', 'Ã®', 'Ã¯', 'Ã´', 'Ã¶', 'Ã¹', 'Ã»', 'Ã¼',
    'Ã§', 'Ã‰', 'Ã€', 'Ã”', 'ÃŽ', 'Ã‡', 'Ã™', 'â€™', 'â€œ', 'â€\u009d', 'â€“',
    'â€”', 'â€¦', 'Â°', 'Â«', 'Â»', 'Å“', 'Å’', 'ðŸ',
];

/** « et commercial » — composé, car le canal d'écriture du dépôt décode les entités. */
const AMP = String.fromCharCode(38);

/** Entités HTML susceptibles de rester écrites en clair dans un texte. */
export const ESCAPED_ENTITIES = {
    amp: ESCAPED_AMP,
    apos: `${AMP}apos;`,
    dec39: `${AMP}#39;`,
    quot: `${AMP}quot;`,
    nbsp: `${AMP}nbsp;`,
};

/**
 * Élisions françaises dont l'apostrophe a pu être supprimée à l'import.
 * Uniquement des formes CASSÉES : `dans`, `lorsque`, `lors`, `dès` n'y figurent
 * pas (ils n'ont pas d'apostrophe et gonflaient la revue de faux positifs).
 */
export const ELISIONS = [
    'dune', 'dun', 'quil', 'quils', 'quune', 'quun', 'quon', 'cest', 'cetait',
    'javais', 'jai', 'jaime', 'jadore', 'letait', 'lhomme', 'lautre',
    'nayant', 'netaient', 'nimporte', 'senivre', 'sentend', 'sechappe',
    'laidera', 'lattirent', 'dinitiation', 'davoir', 'detre', 'jusqua',
    'lorsquil', 'presquil', 'dabord', 'dailleurs', 'quau', 'quaux',
];
export const ELISION_RE = new RegExp(`\\b(${ELISIONS.join('|')})\\b`, 'i');

/** Suite de deux espaces ou plus entre deux caractères visibles (détection). */
export const DOUBLE_SPACE_DETECT = /\S {2,}\S/g;
/** Espace avant `,` ou `.` : fautif dans les deux langues. */
export const PUNCT_BOTH = / [,.]/g;
/** Espace avant `:` `;` `!` `?` : fautif en ANGLAIS, requis en FRANÇAIS. */
export const PUNCT_EN_ONLY = / [;:!?]/g;
/** Guillemets français : défaut uniquement dans un texte anglais. */
export const FRENCH_QUOTES = /[«»]/g;

/** Longueur au-delà de laquelle un texte français SANS apostrophe est suspect. */
export const LONG_TEXT = 60;

/** Extrait vérifiable : les suites d'espaces deviennent visibles. */
export function show(text, at, before = 40, after = 50) {
    return text
        .slice(Math.max(0, at - before), at + after)
        .replace(/\r?\n/g, '⏎')
        .replace(/ {2,}/g, (run) => `⟦${run.length} espaces⟧`);
}

/**
 * Repère un espace avant ponctuation selon la locale, en excluant l'ellipse.
 *
 * L'ellipse est exclue parce que « mot ... » est une convention d'écriture
 * admise : l'inclure produisait deux faux positifs réels sur des synopsis
 * anglais (`indifferent ...`, `such a ball ...`).
 */
export function findBadPunctuation(text, locale) {
    const pattern = locale === 'en' ? / [,.!?;:]/g : PUNCT_BOTH;
    for (const match of text.matchAll(pattern)) {
        const at = match.index ?? 0;
        const char = match[0].slice(1);
        if (char === '.' && text.slice(at + 1, at + 4) === '...') continue;
        return { at, char };
    }
    return null;
}

/**
 * Inspecte une chaîne et renvoie ses défauts, par famille.
 *
 * Chaque entrée porte le type, un libellé court et un extrait **vérifiable**
 * (les suites d'espaces y sont rendues visibles). Aucune écriture, aucune
 * correction : la décision reste humaine.
 */
export function inspectText(text, locale) {
    const found = {
        mojibake: [],
        apostrophes: [],
        entities: [],
        doubleSpace: [],
        punctuation: [],
        frenchQuotes: [],
    };

    const mojibakeHits = MOJIBAKE.filter((sequence) => text.includes(sequence));
    if (mojibakeHits.length) {
        found.mojibake.push({ detail: mojibakeHits.join(' '), sample: text.slice(0, 140) });
    }

    // Heuristique « aucune apostrophe » : FRANÇAIS uniquement.
    if (locale !== 'en' && text.length > LONG_TEXT && !/['’]/.test(text) && ELISION_RE.test(text)) {
        found.apostrophes.push({
            detail: text.match(ELISION_RE)?.[0] ?? '—',
            sample: text.slice(0, 140),
        });
    }

    for (const [name, sequence] of Object.entries(ESCAPED_ENTITIES)) {
        if (text.includes(sequence)) {
            found.entities.push({ detail: name, sample: show(text, text.indexOf(sequence)) });
            break;
        }
    }

    for (const match of text.matchAll(DOUBLE_SPACE_DETECT)) {
        const at = match.index ?? 0;
        found.doubleSpace.push({ detail: '␣␣', sample: show(text, at + 1) });
    }

    const punctuation = findBadPunctuation(text, locale);
    if (punctuation) {
        found.punctuation.push({
            detail: `«${punctuation.char}»`,
            sample: show(text, punctuation.at),
        });
    }

    // Guillemets français : signalés uniquement dans un texte anglais.
    if (locale === 'en') {
        const quote = FRENCH_QUOTES.exec(text);
        if (quote) {
            found.frenchQuotes.push({ detail: quote[0], sample: show(text, quote.index, 30, 30) });
        }
    }

    return found;
}
