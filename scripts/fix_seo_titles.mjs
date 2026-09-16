import fs from 'node:fs';
import path from 'node:path';

const appDir = path.join(process.cwd(), 'src', 'app');

// Le template racine est "%s | CUC" : tout suffixe "| CUC" dans les layouts
// de page est donc dupliqué. On le retire des titres (title + openGraph.title).
const layouts = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(appDir, e.name, 'layout.tsx'))
    .filter((p) => fs.existsSync(p));

let changed = 0;
for (const file of layouts) {
    const before = fs.readFileSync(file, 'utf8');
    // Cible uniquement les valeurs de titre se terminant par " | CUC"
    const after = before.replace(
        /(title:\s*)(["'`])([^"'`]*?)\s*\|\s*CUC\2/g,
        (_m, prefix, quote, text) => `${prefix}${quote}${text.trim()}${quote}`
    );
    if (after !== before) {
        fs.writeFileSync(file, after, 'utf8');
        changed++;
        console.log('  fixed:', path.relative(process.cwd(), file));
    }
}
console.log(`\n${changed} layout(s) corrige(s) sur ${layouts.length}.`);
