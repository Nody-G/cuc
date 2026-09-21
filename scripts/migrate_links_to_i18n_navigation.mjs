#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Codemod : migration vers la navigation locale-aware (next-intl)
 * ==============================================================================
 * Remplace, dans la vitrine uniquement (le Cockpit `/admin` reste FR et n'est
 * pas touché) :
 *   - `import Link from 'next/link'`              → `import { Link } from '@/i18n/navigation'`
 *   - `usePathname`, `useRouter` depuis 'next/navigation' → '@\/i18n/navigation'
 *
 * Les autres exports de `next/navigation` (`useSearchParams`, `useParams`,
 * `notFound`, `redirect`, …) sont CONSERVÉS. `redirect` n'est volontairement pas
 * déplacé (les redirections serveur restent sur `next/navigation`).
 *
 * Usage :
 *   node scripts/migrate_links_to_i18n_navigation.mjs --dry
 *   node scripts/migrate_links_to_i18n_navigation.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const SRC = 'src';
const EXCLUDE_DIRS = new Set(['(admin)']);
const MOVE_NAMED = new Set(['usePathname', 'useRouter']);

// Fichiers volontairement NON migrés :
//  - global-error.tsx : rendu HORS des providers (next-intl indisponible) ;
//  - usePageDynamicContent.ts : a besoin du pathname BRUT (préfixe de locale).
const EXCLUDE_FILES = new Set(
    [
        'src/app/global-error.tsx',
        'src/lib/hooks/usePageDynamicContent.ts',
    ].map((p) => path.normalize(p))
);

const bare = (n) => n.replace(/\s+as\s+.*/, '').trim();

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            walk(full, out);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

let touched = 0;
const log = [];

for (const file of walk(SRC)) {
    if (EXCLUDE_FILES.has(path.normalize(file))) continue;
    let c = fs.readFileSync(file, 'utf8');
    const original = c;
    const moved = new Set();

    // 1) `import Link from 'next/link'`
    c = c.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, () => {
        moved.add('Link');
        return '';
    });

    // 2) imports nommés depuis 'next/navigation'
    c = c.replace(/import\s*\{([^}]*)\}\s*from\s*['"]next\/navigation['"];?/g, (_m, names) => {
        const list = names.split(',').map((s) => s.trim()).filter(Boolean);
        const keep = [];
        for (const n of list) {
            if (MOVE_NAMED.has(bare(n))) moved.add(n);
            else keep.push(n);
        }
        return keep.length ? `import { ${keep.join(', ')} } from 'next/navigation';` : '';
    });

    if (!moved.size) {
        if (c !== original) {
            log.push(`${file} — imports nettoyés`);
            if (!DRY) fs.writeFileSync(file, c.replace(/\n{3,}/g, '\n\n'), 'utf8');
            touched += 1;
        }
        continue;
    }

    // 3) fusion dans un import '@/i18n/navigation' existant, sinon insertion
    const navRe = /import\s*\{([^}]*)\}\s*from\s*['"]@\/i18n\/navigation['"];?/;
    if (navRe.test(c)) {
        c = c.replace(navRe, (_m, names) => {
            const list = names.split(',').map((s) => s.trim()).filter(Boolean);
            for (const n of moved) {
                if (!list.some((x) => bare(x) === bare(n))) list.push(n);
            }
            return `import { ${list.join(', ')} } from '@/i18n/navigation';`;
        });
    } else {
        const insertion = `import { ${[...moved].join(', ')} } from '@/i18n/navigation';\n`;
        const header = c.match(/^(['"]use client['"];\r?\n)/);
        if (header) {
            c = c.replace(header[0], header[0] + insertion);
        } else {
            const firstImport = c.match(/^import .*?;\r?\n/m);
            c = firstImport ? c.replace(firstImport[0], firstImport[0] + insertion) : insertion + c;
        }
    }

    c = c.replace(/\n{3,}/g, '\n\n');
    log.push(`${file} — ${[...moved].join(', ')}`);
    if (!DRY) fs.writeFileSync(file, c, 'utf8');
    touched += 1;
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${touched} fichier(s).\n`);
for (const l of log) console.log(`  ${l}`);
console.log('');
