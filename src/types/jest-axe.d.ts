/**
 * Déclaration locale pour `jest-axe` (le paquet ne publie pas de types).
 *
 * Volontairement minimale : seule l'API `axe()` est utilisée (l'assertion
 * `serious`/`critical` est la nôtre, dans `src/lib/testing/a11y-harness.tsx`).
 *
 * NE PAS installer `@types/jest-axe` : il tire `@types/jest` dans le programme
 * TypeScript et écrase la signature Vitest `expect(actual, message)` utilisée
 * dans toute la suite de tests.
 */
declare module 'jest-axe' {
    import type { AxeResults, RunOptions } from 'axe-core';

    export function axe(html: Element | string, options?: RunOptions): Promise<AxeResults>;
}
