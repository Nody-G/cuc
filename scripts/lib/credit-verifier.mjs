/**
 * ==============================================================================
 * CUC — Vérificateur de crédits
 * ==============================================================================
 * Croise les crédits scrapés depuis TMDB avec les crédits actuellement déclarés
 * dans src/data/team.ts, et classe chaque entrée en 4 catégories :
 *
 *   CONFIRMÉ      — présent dans TMDB ET déjà déclaré (rôle cohérent)
 *   NOUVEAU       — présent dans TMDB, absent de la déclaration actuelle
 *   CONTRADICTOIRE— déclaré, mais le rôle TMDB diffère du rôle déclaré
 *   NON VÉRIFIABLE— déclaré, mais introuvable dans TMDB (à arbitrer manuellement)
 *
 * Aucune écriture n'est effectuée ici : le vérificateur produit un rapport.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { normalizeName } from './coach-registry.mjs';

/**
 * @typedef {Object} VerificationEntry
 * @property {string} status      - CONFIRMÉ | NOUVEAU | CONTRADICTOIRE | NON VÉRIFIABLE
 * @property {string} title
 * @property {string} year
 * @property {string} tmdbRole    - rôle issu de TMDB (ou '')
 * @property {string} declaredRole- rôle déclaré dans team.ts (ou '')
 * @property {string} mediaType
 * @property {string} tmdbId
 * @property {string} note
 */

/**
 * Extrait le tableau CUC_TEAM depuis src/data/team.ts sans exécuter le module.
 * Le fichier est un littéral TypeScript ; on isole le tableau puis on l'évalue
 * dans un contexte contrôlé (données locales du dépôt uniquement).
 *
 * @returns {any[]}
 */
export function loadCurrentTeam() {
    const teamPath = path.resolve(process.cwd(), 'src', 'data', 'team.ts');
    const code = fs.readFileSync(teamPath, 'utf8');

    const match = code.match(/export const CUC_TEAM:\s*Instructor\[\]\s*=\s*(\[[\s\S]*?\]);\s*$/);
    if (!match) {
        throw new Error('Impossible de parser CUC_TEAM depuis src/data/team.ts');
    }

    // eslint-disable-next-line no-eval
    return eval(match[1]);
}

/**
 * Analyse une chaîne de crédit déclarée ("Titre (Année) — Rôle") en ses parties.
 *
 * @param {string} creditStr
 * @returns {{ title: string, year: string, role: string }}
 */
export function parseDeclaredCredit(creditStr) {
    const raw = (creditStr || '').trim();
    let title = raw;
    let role = '';

    if (raw.includes(' — ')) {
        const parts = raw.split(' — ');
        title = parts[0].trim();
        role = parts.slice(1).join(' — ').trim();
    }

    let year = '';
    const yearMatch = title.match(/\((\d{4})[^)]*\)/);
    if (yearMatch) {
        year = yearMatch[1];
        title = title.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    }

    return { title, year, role };
}

/**
 * Compare deux titres de façon tolérante (accents, ponctuation, articles).
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function titlesMatch(a, b) {
    const na = normalizeName(a);
    const nb = normalizeName(b);
    if (!na || !nb) return false;
    if (na === nb) return true;
    if (na.includes(nb) || nb.includes(na)) return true;

    // Tolérance sur les sous-titres : "John Wick Chapitre 4" vs "John Wick 4"
    const stripNoise = (s) => s.replace(/\b(chapitre|chapter|partie|part|le|la|les|the|de|du|des)\b/g, '').replace(/\s+/g, ' ').trim();
    const sa = stripNoise(na);
    const sb = stripNoise(nb);
    return sa.length > 3 && sb.length > 3 && (sa === sb || sa.includes(sb) || sb.includes(sa));
}

/**
 * Vérifie les crédits d'un coach.
 *
 * @param {any} coach - entrée du registre (id, name)
 * @param {import('./credit-normalizer.mjs').NormalizedCredit[]} scrapedCredits
 * @param {any} currentMember - entrée CUC_TEAM actuelle (peut être undefined)
 * @returns {{ entries: VerificationEntry[], summary: Record<string, number> }}
 */
export function verifyCoachCredits(coach, scrapedCredits, currentMember, options = {}) {
    const sourceLabel = options.sourceLabel || 'TMDB';
    const entries = [];
    const declared = (currentMember?.notableCredits || []).map(parseDeclaredCredit);
    const matchedDeclaredIndexes = new Set();

    // 1. Parcours des crédits scrapés
    for (const credit of scrapedCredits) {
        const declaredIdx = declared.findIndex((d) => titlesMatch(d.title, credit.title));

        if (declaredIdx === -1) {
            entries.push({
                status: 'NOUVEAU',
                title: credit.title,
                year: credit.year,
                imdbRole: credit.role,
                tmdbRole: credit.role,
                declaredRole: '',
                mediaType: credit.mediaType,
                imdbId: credit.imdbTitleId || credit.tmdbId,
                tmdbId: credit.tmdbId,
                note: `Crédit ${sourceLabel} non déclaré (source : ${credit.imdbCategory || credit.rawJob || credit.department || 'n/a'})`,
            });
            continue;
        }

        matchedDeclaredIndexes.add(declaredIdx);
        const d = declared[declaredIdx];

        const rolesAligned =
            !d.role ||
            normalizeName(d.role).includes(normalizeName(credit.role)) ||
            normalizeName(credit.role).includes(normalizeName(d.role)) ||
            // Tolérance : "Cascadeur" déclaré vs "Cascadeur & Câblage" scrapé
            normalizeName(d.role).split(' ')[0] === normalizeName(credit.role).split(' ')[0];

        if (rolesAligned) {
            entries.push({
                status: 'CONFIRMÉ',
                title: credit.title,
                year: credit.year || d.year,
                imdbRole: credit.role,
                tmdbRole: credit.role,
                declaredRole: d.role,
                mediaType: credit.mediaType,
                imdbId: credit.imdbTitleId || credit.tmdbId,
                tmdbId: credit.tmdbId,
                note: `Rôle cohérent entre ${sourceLabel} et la déclaration actuelle`,
            });
        } else {
            entries.push({
                status: 'CONTRADICTOIRE',
                title: credit.title,
                year: credit.year || d.year,
                imdbRole: credit.role,
                tmdbRole: credit.role,
                declaredRole: d.role,
                mediaType: credit.mediaType,
                imdbId: credit.imdbTitleId || credit.tmdbId,
                tmdbId: credit.tmdbId,
                note: `Rôle déclaré « ${d.role} » vs rôle ${sourceLabel} « ${credit.role} »`,
            });
        }
    }

    // 2. Crédits déclarés non retrouvés dans la source
    declared.forEach((d, idx) => {
        if (matchedDeclaredIndexes.has(idx)) return;
        entries.push({
            status: 'NON VÉRIFIABLE',
            title: d.title,
            year: d.year,
            imdbRole: '',
            tmdbRole: '',
            declaredRole: d.role,
            mediaType: '',
            imdbId: '',
            tmdbId: '',
            note: `Crédit déclaré introuvable dans ${sourceLabel} — à arbitrer manuellement`,
        });
    });

    const summary = entries.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
    }, /** @type {Record<string, number>} */({}));

    return { entries, summary };
}

/**
 * Construit le rapport complet de vérification pour tous les coachs.
 *
 * @param {Array<{ coach: any, credits: any[], currentMember: any }>} inputs
 * @returns {any}
 */
export function buildVerificationReport(inputs, options = {}) {
    const sourceLabel = options.sourceLabel || 'TMDB';
    const coaches = inputs.map(({ coach, identity, credits, currentMember }) => {
        const { entries, summary } = verifyCoachCredits(
            coach,
            credits,
            currentMember,
            { sourceLabel },
        );
        return {
            id: coach.id,
            name: coach.name,
            imdbId: identity?.imdbId ?? coach.imdbId ?? null,
            identity: identity ?? null,
            declaredCreditsCount: (currentMember?.notableCredits || []).length,
            scrapedCreditsCount: credits.length,
            summary,
            entries,
        };
    });

    const globalSummary = coaches.reduce(
        (acc, c) => {
            for (const [status, count] of Object.entries(c.summary)) {
                acc[status] = (acc[status] || 0) + count;
            }
            return acc;
        },
        /** @type {Record<string, number>} */({
            confirmed: 0,
            new: 0,
            unverifiable: 0,
            contradictory: 0,
        }),
    );

    // Alias anglais pour les rapports récents (rendu Markdown).
    globalSummary.confirmed = globalSummary['CONFIRMÉ'] || 0;
    globalSummary.new = globalSummary['NOUVEAU'] || 0;
    globalSummary.unverifiable = globalSummary['NON VÉRIFIABLE'] || 0;
    globalSummary.contradictory = globalSummary['CONTRADICTOIRE'] || 0;

    return {
        generatedAt: new Date().toISOString(),
        source: sourceLabel,
        globalSummary,
        coaches,
    };
}
