/**
 * ==============================================================================
 * CUC — Normaliseur de crédits TMDB
 * ==============================================================================
 * Transforme les crédits bruts TMDB (jobs en anglais, structure hétérogène)
 * en objets crédit structurés et conformes à la doctrine éditoriale CUC.
 *
 * Règles doctrinales appliquées :
 *  - Terminologie technique sobre et factuelle (aucun superlatif marketing)
 *  - Le terme « Parkour » est utilisé EXCLUSIVEMENT (jamais « ADD » ni
 *    « Art du Déplacement »)
 *  - Aucune invention : le rôle provient toujours d'un job TMDB réel
 * ==============================================================================
 */

/**
 * @typedef {Object} NormalizedCredit
 * @property {string} tmdbId       - identifiant TMDB de l'œuvre
 * @property {string} mediaType    - 'movie' | 'tv'
 * @property {string} title        - titre de l'œuvre
 * @property {string} year         - année (ou '')
 * @property {string} role         - rôle normalisé en français sobre
 * @property {string} rawJob       - job TMDB d'origine (traçabilité)
 * @property {string} department   - département TMDB d'origine
 * @property {string} category     - catégorie technique CUC
 * @property {string} character    - personnage doublé (si applicable)
 * @property {number} popularity   - popularité TMDB (tri)
 * @property {string} source       - 'tmdb'
 */

/**
 * Table de correspondance job TMDB (anglais) → rôle CUC (français sobre).
 * L'ordre est significatif : les motifs les plus spécifiques d'abord.
 */
const JOB_MAPPINGS = [
    // Coordination
    { pattern: /stunt coordinator/i, role: 'Coordinateur des cascades', category: 'coordination' },
    { pattern: /stunt supervisor/i, role: 'Superviseur des cascades', category: 'coordination' },
    { pattern: /assistant stunt coordinator/i, role: 'Assistant coordinateur des cascades', category: 'coordination' },
    { pattern: /second unit director/i, role: 'Réalisateur 2e équipe', category: 'coordination' },

    // Chorégraphie / Action design
    { pattern: /fight choreographer/i, role: 'Chorégraphe de combat', category: 'choreography' },
    { pattern: /stunt choreographer/i, role: 'Chorégraphe de cascades', category: 'choreography' },
    { pattern: /action designer/i, role: 'Action Designer', category: 'choreography' },

    // Câblage / rigging
    { pattern: /wire ?(work|rigger|technician)/i, role: 'Câblage', category: 'rigger' },
    { pattern: /rigging/i, role: 'Câblage', category: 'rigger' },

    // Parkour (terminologie imposée)
    { pattern: /parkour/i, role: 'Parkour', category: 'parkour' },
    { pattern: /free ?running/i, role: 'Freerunning', category: 'parkour' },

    // Doublure
    { pattern: /stunt double/i, role: 'Doublure cascades', category: 'doublure' },
    { pattern: /stunt driver/i, role: 'Cascadeur automobile', category: 'stunt' },

    // Cascadeur générique (le plus large, en dernier)
    { pattern: /utility stunts/i, role: 'Cascadeur', category: 'stunt' },
    { pattern: /stunts?/i, role: 'Cascadeur', category: 'stunt' },
];

/**
 * Normalise un job TMDB brut vers un rôle CUC sobre.
 *
 * @param {string} job - job TMDB (ex: 'Stunt Coordinator')
 * @param {string} department - département TMDB (ex: 'Crew')
 * @returns {{ role: string, category: string }}
 */
export function normalizeJob(job, department) {
    const raw = (job || '').trim();

    for (const mapping of JOB_MAPPINGS) {
        if (mapping.pattern.test(raw)) {
            return { role: mapping.role, category: mapping.category };
        }
    }

    // Repli selon le département TMDB
    if (/stunts?/i.test(department || '')) {
        return { role: 'Cascadeur', category: 'stunt' };
    }

    return { role: raw || 'Cascadeur', category: 'stunt' };
}

/**
 * Table de correspondance catégorie IMDb (anglais) → rôle CUC (français sobre).
 * IMDb expose une catégorie unique par crédit (ex. « Stunts », « Stunt
 * Coordinator », « Actor »), sans distinction de département.
 */
const IMDB_CATEGORY_MAPPINGS = [
    { pattern: /^stunt coordinator$/i, role: 'Coordinateur des cascades', category: 'coordination' },
    { pattern: /^stunt supervisor$/i, role: 'Superviseur des cascades', category: 'coordination' },
    { pattern: /^second unit director/i, role: 'Réalisateur 2e équipe', category: 'coordination' },
    { pattern: /^fight choreographer$/i, role: 'Chorégraphe de combat', category: 'choreography' },
    { pattern: /^stunt choreographer$/i, role: 'Chorégraphe de cascades', category: 'choreography' },
    { pattern: /^stunt double$/i, role: 'Doublure cascades', category: 'doublure' },
    { pattern: /^stunt driver$/i, role: 'Cascadeur automobile', category: 'stunt' },
    { pattern: /^rigging$/i, role: 'Câblage', category: 'rigger' },
    { pattern: /^armorer$/i, role: 'Armurier', category: 'rigger' },
    { pattern: /^special effects$/i, role: 'Effets spéciaux', category: 'rigger' },
    { pattern: /^utility stunts$/i, role: 'Cascadeur', category: 'stunt' },
    { pattern: /^additional crew$/i, role: 'Cascadeur', category: 'stunt' },
    { pattern: /^stunts?$/i, role: 'Cascadeur', category: 'stunt' },
    { pattern: /^stunt performer$/i, role: 'Cascadeur', category: 'stunt' },
];

/**
 * Normalise une catégorie IMDb brute vers un rôle CUC sobre.
 *
 * @param {string} category - catégorie IMDb (ex: 'Stunts', 'Actor')
 * @param {string} [discipline] - discipline du coach (contexte Parkour)
 * @returns {string} rôle normalisé
 */
export function normalizeImdbCategory(category, discipline) {
    const raw = (category || '').trim();

    for (const mapping of IMDB_CATEGORY_MAPPINGS) {
        if (mapping.pattern.test(raw)) {
            return enforceEditorialDoctrine(mapping.role);
        }
    }

    // Acting : pertinent uniquement pour les profils Parkour (Yamakasi, etc.).
    if (/^(actor|actress|self)$/i.test(raw)) {
        if (/parkour|acrobat|freerun/i.test(discipline || '')) {
            return 'Cascadeur Parkour';
        }
        return 'Acteur';
    }

    return enforceEditorialDoctrine(raw || 'Cascadeur');
}

/**
 * Applique la doctrine éditoriale : bannit « ADD » et « Art du Déplacement ».
 *
 * @param {string} text
 * @returns {string}
 */
export function enforceEditorialDoctrine(text) {
    if (!text) return text;
    return text
        .replace(/\bADD\b/g, 'Parkour')
        .replace(/Art du D[ée]placement/gi, 'Parkour')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extrait l'année d'une date TMDB ('2024-03-15' → '2024').
 * @param {string} dateStr
 * @returns {string}
 */
function extractYear(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const match = dateStr.match(/^(\d{4})/);
    return match ? match[1] : '';
}

/**
 * Normalise un crédit brut TMDB (film ou série) en objet structuré.
 *
 * @param {any} raw - objet crédit TMDB
 * @param {'movie'|'tv'} mediaType
 * @returns {NormalizedCredit|null}
 */
export function normalizeCredit(raw, mediaType) {
    if (!raw) return null;

    const title = raw.title || raw.name || raw.original_title || raw.original_name || '';
    if (!title) return null;

    const dateStr = raw.release_date || raw.first_air_date || '';
    const { role, category } = normalizeJob(raw.job, raw.department);

    return {
        tmdbId: String(raw.id),
        mediaType,
        title: enforceEditorialDoctrine(title),
        year: extractYear(dateStr),
        role: enforceEditorialDoctrine(role),
        rawJob: raw.job || '',
        department: raw.department || '',
        category,
        character: raw.character || '',
        popularity: typeof raw.popularity === 'number' ? raw.popularity : 0,
        source: 'tmdb',
    };
}

/**
 * Filtre les crédits pertinents pour un cascadeur CUC.
 * Conserve les départements Crew/Stunts et les rôles d'acteur crédités
 * uniquement lorsque le job est explicitement lié aux cascades.
 *
 * @param {any[]} credits
 * @returns {any[]}
 */
export function filterStuntCredits(credits) {
    if (!Array.isArray(credits)) return [];
    return credits.filter((c) => {
        const dept = (c.department || '').toLowerCase();
        const job = (c.job || '').toLowerCase();
        if (dept.includes('stunt') || dept.includes('crew')) return true;
        if (/stunt|parkour|fight|wire|rigg/.test(job)) return true;
        return false;
    });
}

/**
 * Identifiant de titre, quelle que soit la source (TMDB ou IMDb).
 * Évite la collision `undefined:undefined` qui fusionnait tous les crédits
 * IMDb en une seule entrée.
 *
 * @param {NormalizedCredit} credit
 * @returns {string}
 */
function titleKeyOf(credit) {
    const id =
        credit.tmdbId ??
        credit.imdbTitleId ??
        credit.titleId ??
        null;
    if (id) return String(id);
    // Repli : titre + année (crédits sans identifiant exploitable).
    return `${credit.title || '?'}::${credit.year || '?'}`;
}

/**
 * Déduplique les crédits par (titre + rôle), en conservant l'entrée la plus
 * populaire.
 *
 * @param {NormalizedCredit[]} credits
 * @returns {NormalizedCredit[]}
 */
export function dedupeCredits(credits) {
    const map = new Map();
    for (const credit of credits) {
        const key = `${titleKeyOf(credit)}:${credit.role}`;
        const existing = map.get(key);
        if (!existing || credit.popularity > existing.popularity) {
            map.set(key, credit);
        }
    }
    return Array.from(map.values());
}

/**
 * Fusionne les crédits d'un même titre (plusieurs jobs sur la même œuvre)
 * en un seul crédit avec un rôle composite.
 *
 * @param {NormalizedCredit[]} credits
 * @returns {NormalizedCredit[]}
 */
export function mergeCreditsByTitle(credits) {
    const map = new Map();

    for (const credit of credits) {
        const key = titleKeyOf(credit);
        const existing = map.get(key);

        if (!existing) {
            map.set(key, { ...credit, roles: [credit.role] });
            continue;
        }

        if (!existing.roles.includes(credit.role)) {
            existing.roles.push(credit.role);
        }
        // Priorité de catégorie : coordination > choreography > rigger > parkour > doublure > stunt
        const priority = ['coordination', 'choreography', 'rigger', 'parkour', 'doublure', 'stunt'];
        if (priority.indexOf(credit.category) < priority.indexOf(existing.category)) {
            existing.category = credit.category;
        }
        existing.popularity = Math.max(existing.popularity, credit.popularity);
    }

    return Array.from(map.values()).map((c) => ({
        ...c,
        role: c.roles.length > 1 ? c.roles.join(' & ') : c.roles[0],
    }));
}

/**
 * Pipeline complet de normalisation.
 *
 * @param {any[]} rawCredits
 * @param {'movie'|'tv'} mediaType
 * @returns {NormalizedCredit[]}
 */
export function normalizeCredits(rawCredits, mediaType) {
    const filtered = filterStuntCredits(rawCredits);
    const normalized = filtered.map((c) => normalizeCredit(c, mediaType)).filter(Boolean);
    const deduped = dedupeCredits(normalized);
    return mergeCreditsByTitle(deduped);
}

/**
 * Formate un crédit normalisé en chaîne lisible pour `notableCredits`.
 * Format : "Titre (Année) — Rôle"
 *
 * @param {NormalizedCredit} credit
 * @returns {string}
 */
export function formatCreditString(credit) {
    const yearPart = credit.year ? ` (${credit.year})` : '';
    return `${credit.title}${yearPart} — ${credit.role}`;
}
