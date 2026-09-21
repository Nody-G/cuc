'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Piège le focus à l'intérieur d'un conteneur modal (WCAG 2.2 — 2.1.2 / 2.4.3).
 *
 * - Déplace le focus sur le premier élément interactif à l'ouverture.
 * - Boucle la tabulation entre le premier et le dernier élément focusable.
 * - Restaure le focus sur l'élément déclencheur à la fermeture.
 * - Ferme la modale sur `Échap` via `onEscape`.
 *
 * @param active  Active/désactive le piège (généralement `isOpen`).
 * @param onEscape Callback déclenché sur la touche Échap.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
    active: boolean,
    onEscape?: () => void
) {
    const containerRef = useRef<T | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!active) return;

        previouslyFocused.current = document.activeElement as HTMLElement | null;
        const container = containerRef.current;

        const getFocusable = (): HTMLElement[] => {
            if (!container) return [];
            return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
                (el) => el.offsetParent !== null || el === document.activeElement
            );
        };

        // Focus initial : premier élément focusable, sinon le conteneur lui-même.
        const focusables = getFocusable();
        if (focusables.length > 0) {
            focusables[0].focus();
        } else if (container) {
            container.setAttribute('tabindex', '-1');
            container.focus();
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onEscape?.();
                return;
            }

            if (event.key !== 'Tab') return;

            const items = getFocusable();
            if (items.length === 0) {
                event.preventDefault();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement as HTMLElement | null;

            if (event.shiftKey) {
                if (current === first || !container?.contains(current)) {
                    event.preventDefault();
                    last.focus();
                }
            } else if (current === last || !container?.contains(current)) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            previouslyFocused.current?.focus?.();
        };
    }, [active, onEscape]);

    return containerRef;
}
