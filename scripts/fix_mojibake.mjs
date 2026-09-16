// One-off maintenance script: repair double-encoded UTF-8 (mojibake) in source files.
// Usage: node scripts/fix_mojibake.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'src';
const EXTS = new Set(['.ts', '.tsx', '.css']);

// Ordered longest-first so multi-byte sequences are replaced before their prefixes.
const REPLACEMENTS = [
    ['ðŸ‡²ðŸ‡«', '🇲🇫'],
    ['ðŸ”¥', '🔥'],
    ['ðŸŒ', '🌍'],
    ['âŒ˜', '⌘'],
    ['â€¢', '•'],
    ['â‚¬', '€'],
    ['â€°', '‰'],
    ['â€™', '’'],
    ['â€˜', '‘'],
    ['â€œ', '“'],
    ['â€\u009d', '”'],
    ['â€“', '–'],
    ['â€”', '—'],
    ['â€¦', '…'],
    ['Å“', 'œ'],
    ['Å’', 'Œ'],
    ['Â°', '°'],
    ['Â«', '«'],
    ['Â»', '»'],
    ['Â ', ' '],
    ['Ã©', 'é'],
    ['Ã¨', 'è'],
    ['Ãª', 'ê'],
    ['Ã«', 'ë'],
    ['Ã ', 'à'],
    ['Ã¢', 'â'],
    ['Ã®', 'î'],
    ['Ã¯', 'ï'],
    ['Ã´', 'ô'],
    ['Ã¶', 'ö'],
    ['Ã¹', 'ù'],
    ['Ã»', 'û'],
    ['Ã¼', 'ü'],
    ['Ã§', 'ç'],
    ['Ã‰', 'É'],
    ['Ã€', 'À'],
    ['Ã”', 'Ô'],
    ['ÃŽ', 'Î'],
    ['Ã‡', 'Ç'],
    ['Ã™', 'Ù'],
];

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) out.push(...walk(full));
        else if (EXTS.has(extname(full))) out.push(full);
    }
    return out;
}

let fixed = 0;
for (const file of walk(ROOT)) {
    let text = readFileSync(file, 'utf8');
    const original = text;
    // Strip UTF-8 BOM if present.
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    for (const [bad, good] of REPLACEMENTS) {
        text = text.split(bad).join(good);
    }
    if (text !== original) {
        writeFileSync(file, text, 'utf8');
        console.log('FIXED:', file);
        fixed++;
    }
}
console.log(`Total files fixed: ${fixed}`);
