'use client';

import { useCallback } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Révèle un bloc à sa première entrée dans le viewport (une seule fois), sans
 * état React et donc sans re-render.
 *
 * Le callback ref écrit `data-revealed="true"` sur l'élément ; les classes
 * Tailwind (état masqué de base + variante `data-[revealed=true]`) portent la
 * transition CSS. Remplace le `whileInView` de framer-motion sans embarquer la
 * librairie.
 *
 * `prefers-reduced-motion` (ou l'absence d'`IntersectionObserver`) révèle
 * immédiatement — la transition est de toute façon neutralisée globalement par
 * `globals-base.css`.
 */
export function useRevealOnView<T extends HTMLElement>() {
    return useCallback((el: T | null): void | (() => void) => {
        if (!el) return;

        if (
            typeof IntersectionObserver === 'undefined' ||
            window.matchMedia(REDUCED_MOTION_QUERY).matches
        ) {
            el.dataset.revealed = 'true';
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        el.dataset.revealed = 'true';
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
}
