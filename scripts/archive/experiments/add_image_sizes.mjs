/**
 * Ajoute un attribut `sizes` aux <Image fill> qui n'en ont pas.
 *
 * Sans `sizes`, Next.js suppose `100vw` et télécharge l'image la plus large
 * possible — pénalisant les logos et vignettes de petite taille. On déduit
 * une valeur raisonnable à partir de la classe de largeur du conteneur parent
 * (`w-N` Tailwind) quand elle est détectable, sinon on retombe sur `100vw`.
 *
 * Idempotent : ignore les <Image> possédant déjà `sizes`.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");

/** Liste récursivement tous les fichiers .tsx sous un dossier. */
function walk(dir, acc = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) {
            walk(full, acc);
        } else if (entry.endsWith(".tsx")) {
            acc.push(full);
        }
    }
    return acc;
}

/** Convertit une classe Tailwind `w-N` en pixels (N × 4px). */
function tailwindWidthToPx(cls) {
    const m = cls.match(/\bw-(\d+)\b/);
    if (!m) return null;
    return Number(m[1]) * 4;
}

const files = walk(SRC);
let patchedFiles = 0;
let patchedImages = 0;

for (const file of files) {
    const original = readFileSync(file, "utf8");
    let content = original;

    content = content.replace(/<Image\b[\s\S]*?\/>/g, (block) => {
        if (!/\bfill\b/.test(block)) return block;
        if (/\bsizes=/.test(block)) return block;

        const idx = content.indexOf(block);
        const before = content.slice(Math.max(0, idx - 400), idx);
        const widthPx =
            tailwindWidthToPx(block) ??
            tailwindWidthToPx(before.split("\n").slice(-6).join("\n"));

        const sizes = widthPx ? `${widthPx}px` : "100vw";

        patchedImages += 1;
        return block.replace(/(\n(\s*)fill\b)/, `$1\n$2sizes="${sizes}"`);
    });

    if (content !== original) {
        writeFileSync(file, content, "utf8");
        patchedFiles += 1;
        console.log(`OK  ${file.replace(SRC, "src")}`);
    }
}

console.log(`\n${patchedImages} images complétées dans ${patchedFiles} fichiers.`);
