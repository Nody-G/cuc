import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

/**
 * Garde éditoriale permanente (doctrine « zéro AI slop » / sobriété).
 *
 * Le client a explicitement demandé de retirer la sur-utilisation de
 * « 6 hectares / 6 Ha » présente partout dans la vitrine. Ce test empêche
 * toute réintroduction dans le code rendu de `src/`.
 *
 * Le fichier de test se neutralise lui-même (motif `\b6\s?(?:ha|hectares)\b`
 * écrit avec des métacaractères afin de ne pas s'auto-déclencher).
 */

const SRC = join(process.cwd(), 'src');
const FORBIDDEN = /\b6\s?(?:ha|hectares)\b/i;
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md']);

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

describe('Garde éditoriale — zéro mention « 6 ha »', () => {
    it('aucun fichier de src/ ne réintroduit « 6 hectares / 6 Ha »', () => {
        const violations: string[] = [];
        for (const file of walk(SRC)) {
            if (file.includes('no-6ha')) continue;
            if (!ALLOWED_EXT.has(extname(file))) continue;
            const lines = readFileSync(file, 'utf8').split(/\r?\n/);
            lines.forEach((line, i) => {
                if (FORBIDDEN.test(line)) {
                    violations.push(`${relative(process.cwd(), file)}:${i + 1}  ${line.trim()}`);
                }
            });
        }
        expect(violations, `Mentions « 6 ha » interdites :\n${violations.join('\n')}`).toEqual([]);
    });
});
