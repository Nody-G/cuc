import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Configuration Vitest (Phase 6 — tests unitaires 2026).
 *
 * - Environnement `jsdom` pour tester les composants React.
 * - Alias `@/` aligné sur `tsconfig.json` (baseUrl = racine du projet).
 * - Couverture V8 avec seuils minimaux sur la logique métier pure.
 */
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.mts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', '.next', 'scripts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary'],
            include: ['src/lib/**', 'src/data/**', 'src/components/**'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/index.ts',
                'src/components/3d/engine/**',
            ],
        },
    },
});
