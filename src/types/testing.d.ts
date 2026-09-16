import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

/**
 * Augmentation des types Vitest pour exposer les matchers jest-dom
 * (`toBeInTheDocument`, `toBeDisabled`, `toContainElement`, …) au compilateur
 * TypeScript. Les matchers sont enregistrés à l'exécution dans `vitest.setup.mts`.
 *
 * Reproduit le pattern officiel de `@testing-library/jest-dom/types/vitest.d.ts`
 * (déclaration merging sur l'interface `Assertion` de Vitest).
 */
declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> { }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> { }
}
