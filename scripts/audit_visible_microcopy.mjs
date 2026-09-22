#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit des micro-textes visibles par les visiteurs
 * ==============================================================================
 * « Fouiller partout » doit être une MESURE, pas une promesse. Ce script passe
 * au crible les composants de vitrine et classe chaque texte visible :
 *
 *   1. ANNOTÉ        — porte `data-cuc-field` ou est posé via `cucField()` /
 *                      `itemPath()` : éditable en place dans le Mode Studio ;
 *   2. DONNÉES       — rendu depuis les données (`content.*`, `settings.*`,
 *                      `heroData`, `formData`…) : éditable par un écran existant ;
 *   3. TRADUCTION    — rendu par `t('…')` / `tf('…')` sans chemin de données :
 *                      **à brancher** sur une clé de page pour devenir éditable ;
 *   4. CODÉ EN DUR   — chaîne littérale dans le JSX : **dette** (elle ne suit ni
 *                      la langue ni le Cockpit ; cas réel : fuite française
 *                      affichée sur `/en`).
 *
 * Sortie : `plans/revue-micro-textes-visiteurs.md`, code 2 s'il reste des
 * textes CODÉS EN DUR (catégorie 4).
 *
 * Les libellés passant par `t('…')` (catégorie 3) ne sont plus une dette : ils
 * sont éditables sans redéploiement depuis l'écran « Micro-textes du site » du
 * Cockpit, qui écrit une surcharge (`site_settings.microcopy_overrides`)
 * appliquée aux catalogues i18n (cf. `src/lib/i18n/microcopy.ts`).
 *
 * Limite assumée : l'analyse est statique et syntaxique (pas un AST JSX). Les
 * libellés techniques (noms de marque, `alt`, `title`, `aria-label`) sont hors
 * périmètre : ce ne sont pas des textes éditoriaux visibles.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = join(ROOT, 'plans', 'revue-micro-textes-visiteurs.md');

/** Périmètre : tout ce qui peut produire du texte vu par un visiteur. */
const TARGET_DIRS = [
    join(ROOT, 'src', 'components', 'sections'),
    join(ROOT, 'src', 'components', 'layout'),
    join(ROOT, 'src', 'components', 'ui'),
    join(ROOT, 'src', 'app', '(site)'),
];

/** Attributs techniques : jamais du contenu éditorial visible. */
const TECHNICAL_ATTR_RE = /\b(alt|title|aria-label|aria-describedby|placeholder|id|key|href|src|className|style|data-[\w-]+)=/;

/** Une ligne de texte seul (pas de balise, pas d’expression JSX, pas de code). */
const TEXT_LINE_RE = /^([A-Za-zÀ-ÖØ-öø-ÿ0-9][^<>{};=]*[A-Za-zÀ-ÖØ-öø-ÿ0-9!?»….)])$/;

/** Texte inline : `>Texte<`. */
const INLINE_TEXT_RE = />\s*([^<>{};=]{2,})\s*</g;

/** Expression JSX pure : `{expression}` — données ou appel de traduction. */
const JSX_EXPRESSION_RE = /^\{([^{}]+)\}$/;

/**
 * Appels de traduction : guillemets **et** gabarits (`t(`options.${id}`)`) — un
 * gabarit est une clé composée, donc du texte déjà pris en charge par le
 * catalogue et surchargeable depuis le Cockpit.
 */
const TRANSLATION_CALL_RE = /\b(?:t|t[A-Z]\w*|tf|tp|td)\s*\(\s*['"`]/;

/**
 * Catégorie 5 — libellés TECHNIQUES : marques, plateformes, adresses, formats.
 * Ce ne sont pas des textes éditoriaux : les traduire ou les confier au CMS
 * n'aurait aucun sens (et un « Google Maps » localisé serait un contresens).
 */
const TECHNICAL_LABEL_RE =
    /^(?:IMDb|Allociné|AlloCiné|Allocine|Google Maps|Apple Maps|Waze|Instagram|Facebook|YouTube|TikTok|LinkedIn|Vimeo|Spotify|Portfolio|Allo Ciné|SNCF Connect)$/i;
const TECHNICAL_PATTERNS = [
    /@[\w.-]+\.[a-z]{2,}/i, // adresse e-mail
    /^https?:\/\//i, // URL
    /^(?:LAT|LON)\b/i, // coordonnées
    /^[\d\s.,%°•:+hHm²-]+$/, // nombres, unités, mesures
    // Adresse postale : une donnée, jamais un libellé éditorial.
    /\b\d{2,4}\s?(?:bis\s)?(?:Rue|Avenue|Boulevard|Route|Chemin|Impasse)\b/i,
    /\b\d{5}\b\s+[A-ZÀ-Ý]/,
];

/**
 * Routes d'image (Open Graph, icônes) : le texte y est *peint* dans un visuel
 * généré, pas rendu dans une interface — il ne relève pas des micro-textes.
 */
const IMAGE_ROUTE_RE = /opengraph-image|og-image|icon\.tsx/;
const ANNOTATION_RE = /data-cuc-field|cucField\(|itemPath\(/;
const DATA_HINT_RE =
    /(?:content|settings|hero|heroData|formulesData|data|formData|member|film|coach|program|stat|item|section|overlay|copy)\./i;

function walk(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (['.tsx', '.ts'].includes(extname(full)) && !IMAGE_ROUTE_RE.test(full)) {
            out.push(full);
        }
    }
    return out;
}

/** Vrai si la ligne appartient à un commentaire (bloc ou ligne). */
function isComment(line) {
    const trimmed = line.trim();
    return (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('*/')
    );
}

function looksEditorial(text) {
    const clean = text.trim();
    if (clean.length < 3) return false;
    if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(clean)) return false;
    // Fragments de code fréquents qui ne sont pas du texte visible.
    if (/^(from|import|export|const|let|var|function|return|case|break|default)$/.test(clean)) {
        return false;
    }
    if (clean.includes('=>') || clean.includes('===') || clean.includes('&&')) return false;
    return true;
}

/**
 * Faux positifs structurels : expressions JSX calculées, attributs booléens et
 * identifiants nus. Ce ne sont **pas** des micro-textes — les compter comme dette
 * ferait mentir le rapport autant que les oublier.
 */
const CODE_NOISE_PATTERNS = [
    /\.\w+\(/, // appel de méthode : .split(, .replace(, .substring(, .toLowerCase(
    /\.length\b/,
    /\{[^{}]*\+[^{}]*\}/, // {currentIndex + 1}
    /^[a-z][\w$]*(\.[\w$]+)*$/, // identifiant nu ou chemin : priority, role, navigation.items
    /^[a-z]\w*=\{[^}]*\}$/, // attribut JSX booléen ou calculé
    /\bString\(|\bNumber\(|\bparseInt\(|\bJSON\./,
];

function isCodeNoise(text) {
    const clean = text.trim();
    if (!clean) return true;
    return CODE_NOISE_PATTERNS.some((pattern) => pattern.test(clean));
}

function classify({ text, lines, index }) {
    const sourceLine = lines[index] ?? '';
    const annotationContext = [lines[index - 1], lines[index], lines[index + 1]]
        .filter(Boolean)
        .some((line) => ANNOTATION_RE.test(line));
    if (annotationContext) return 1;

    /**
     * `<em>` encadre systématiquement un nom propre (titre de film, marque) :
     * ce n'est pas un texte éditorial à traduire, c'est une donnée.
     */
    if (/<em>/.test(sourceLine)) return 5;

    const expression = text.trim().match(JSX_EXPRESSION_RE);
    const expressionBody = expression ? expression[1].trim() : null;

    if (expressionBody) {
        if (TRANSLATION_CALL_RE.test(text)) return 3;
        if (DATA_HINT_RE.test(expressionBody) || /^[A-Za-z_$][\w$?.\[\]'"]*$/.test(expressionBody)) {
            return 2;
        }
        return 3;
    }

    if (TRANSLATION_CALL_RE.test(text)) return 3;
    if (TECHNICAL_LABEL_RE.test(text) || TECHNICAL_PATTERNS.some((re) => re.test(text))) {
        return 5;
    }
    return 4;
}

function analyzeFile(file) {
    const source = readFileSync(file, 'utf8');
    const lines = source.split(/\r?\n/);
    const findings = [];

    const push = (text, index) => {
        const clean = text.trim();
        if (!looksEditorial(clean)) return;
        if (TECHNICAL_ATTR_RE.test(clean)) return;
        if (isCodeNoise(clean)) return;
        if (isComment(lines[index])) return;
        findings.push({ text: clean, line: index + 1, category: classify({ text: clean, lines, index }) });
    };

    // Commentaires JSX multi-lignes : jamais du contenu visible.
    let jsxCommentOpen = false;

    lines.forEach((line, index) => {
        if (jsxCommentOpen) {
            if (line.includes('*/}')) jsxCommentOpen = false;
            return;
        }
        if (line.includes('{/*')) {
            if (!line.includes('*/}')) jsxCommentOpen = true;
            return;
        }
        if (isComment(line)) return;
        if (TECHNICAL_ATTR_RE.test(line)) return;

        // 1. Texte inline dans une balise : `> Texte < `
        for (const match of line.matchAll(INLINE_TEXT_RE)) push(match[1], index);

        // 2. Ligne d'expression JSX seule : `{ t('…') } `, `{ heroData?.title || t('…') } `…
        //    Sans cela, tout le contenu piloté par les données ou les traductions
        //    serait invisible à l'audit — et le rapport mentirait par omission.
        const trimmed = line.trim();
        if (/^\{.+\}$/.test(trimmed)) {
            push(trimmed, index);
        }

        // 3. Ligne de texte seule entre deux balises (cas le plus fréquent ici).
        if (TEXT_LINE_RE.test(trimmed)) {
            // Une ligne JSX texte commence par une lettre, jamais par un mot-clé
            // de code : on exige que la ligne voisine contienne une balise.
            const neighbours = [lines[index - 1], lines[index + 1]].filter(Boolean);
            const inJsx =
                neighbours.some((neighbour) => /[<>]/.test(neighbour)) ||
                /[<>]/.test(line.slice(0, line.indexOf(trimmed)));
            if (inJsx) push(trimmed, index);
        }
    });

    return findings;
}

function main() {
    const files = TARGET_DIRS.flatMap((dir) => walk(dir)).filter(
        (file) => !file.includes('.test.')
    );

    const byCategory = new Map([
        [1, []],
        [2, []],
        [3, []],
        [4, []],
        [5, []],
    ]);
    let total = 0;

    for (const file of files) {
        const findings = analyzeFile(file);
        if (findings.length === 0) continue;
        for (const finding of findings) {
            total += 1;
            byCategory.get(finding.category).push({ file: relative(ROOT, file), ...finding });
        }
    }

    const label = {
        1: 'ANNOTÉ — éditable en place',
        2: 'DONNÉES — éditable par un écran existant',
        3: 'TRADUCTION — éditable via « Micro-textes du site » (surcharge i18n)',
        4: 'CODÉ EN DUR — dette (aucune prise en charge par le Cockpit)',
        5: 'HORS PÉRIMÈTRE — libellé technique (marque, adresse, coordonnées)',
    };

    const lines = [];
    lines.push('# Revue — Micro-textes visibles par les visiteurs');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_visible_microcopy.mjs\`.`);
    lines.push('');
    lines.push('Analyse statique des composants de vitrine : chaque texte visible est classé.');
    lines.push('Les libellés techniques (marques, `alt`, `title`, `aria-label`) sont hors périmètre.');
    lines.push('');
    lines.push('| Catégorie | Occurrences |');
    lines.push('| --- | ---: |');
    for (const category of [1, 2, 3, 4, 5]) {
        lines.push(`| ${label[category]} | ${byCategory.get(category).length} |`);
    }
    lines.push(`| **Total** | **${total}** |`);
    lines.push('');

    for (const category of [1, 2, 3, 4, 5]) {
        const entries = byCategory.get(category);
        lines.push(`## ${category}. ${label[category]}`);
        lines.push('');
        if (entries.length === 0) {
            lines.push('Aucune occurrence.');
            lines.push('');
            continue;
        }
        const byFile = new Map();
        for (const entry of entries) {
            if (!byFile.has(entry.file)) byFile.set(entry.file, []);
            byFile.get(entry.file).push(entry);
        }
        for (const [file, fileEntries] of [...byFile.entries()].sort()) {
            lines.push(`### \`${file}\``);
            lines.push('');
            for (const entry of fileEntries) {
                lines.push(`- l.${entry.line} — \`${entry.text.replace(/`/g, '’')}\``);
            }
            lines.push('');
        }
    }

    writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

    /** Seul le codé en dur reste une dette : la catégorie 3 est éditable en Cockpit. */
    const debt = byCategory.get(4).length;
    const editable = byCategory.get(1).length + byCategory.get(2).length + byCategory.get(3).length;
    console.log(`[audit:microcopy] ${files.length} fichiers analysés, ${total} textes visibles classés.`);
    console.log(
        `[audit:microcopy] Éditables : ${editable} (annotés ${byCategory.get(1).length} · données ${byCategory.get(2).length} · traduction ${byCategory.get(3).length}) · codés en dur : ${byCategory.get(4).length} · techniques : ${byCategory.get(5).length}`
    );
    console.log(`[audit:microcopy] Rapport : ${relative(ROOT, REPORT)}`);

    if (debt > 0) {
        console.error(
            `[audit:microcopy] DETTE — ${debt} texte(s) codé(s) en dur, à brancher sur une donnée ou une clé (code 2).`
        );
        process.exitCode = 2;
    } else {
        console.log('[audit:microcopy] OK — aucun texte orphelin détecté.');
    }
}

main();
