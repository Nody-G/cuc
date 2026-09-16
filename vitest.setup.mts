import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

/**
 * Setup global des tests (Phase 6).
 *
 * - Enregistrement des matchers jest-dom (`toBeInTheDocument`, `toBeDisabled`…).
 * - Nettoyage du DOM après chaque test (évite les fuites entre tests).
 * - Stubs des APIs navigateur non implémentées par jsdom mais utilisées
 *   par les composants CUC (matchMedia, IntersectionObserver, WebGL).
 *
 * Note : `globals: true` est activé dans `vitest.config.mts`, donc
 * `expect` / `afterEach` / `vi` sont disponibles globalement.
 */

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

// `matchMedia` — utilisé par les composants réactifs au thème / motion.
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// `IntersectionObserver` — utilisé par les animations au scroll.
class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// `ResizeObserver` — utilisé par les composants adaptatifs.
class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

// `scrollTo` — non implémenté par jsdom.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
