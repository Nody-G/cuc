'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

/**
 * Thème clair/sombre du Cockpit.
 *
 * Le thème est appliqué via l'attribut `data-cockpit-theme` posé sur
 * l'élément racine du Cockpit (et non sur `<html>`), afin de ne jamais
 * affecter la vitrine publique. Le choix est persisté dans localStorage
 * et synchronisé avec la préférence système tant que l'utilisateur n'a
 * pas exprimé de choix explicite.
 */

export type CockpitTheme = 'dark' | 'light';

const STORAGE_KEY = 'cuc.cockpit.theme';

interface CockpitThemeContextValue {
    theme: CockpitTheme;
    setTheme: (theme: CockpitTheme) => void;
    toggleTheme: () => void;
    /** Vrai tant que la préférence n'a pas été hydratée côté client. */
    isReady: boolean;
}

const CockpitThemeContext = createContext<CockpitThemeContextValue | null>(null);

function readStoredTheme(): CockpitTheme | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw === 'light' || raw === 'dark' ? raw : null;
    } catch {
        return null;
    }
}

function getSystemTheme(): CockpitTheme {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const CockpitThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialisation paresseuse : la préférence stockée / système n'est lue
    // qu'une fois, côté client. Le rendu serveur retombe sur 'dark' et le
    // drapeau `isReady` évite tout écart d'hydratation visible.
    const [theme, setThemeState] = useState<CockpitTheme>(() => readStoredTheme() ?? getSystemTheme());
    const [isReady, setIsReady] = useState(false);

    // Marque le provider comme hydraté (aucune donnée à synchroniser : la
    // préférence est déjà résolue par l'initialiseur paresseux ci-dessus).
    useEffect(() => {
        // Marque le provider comme hydraté. Le setState est intentionnel : il
        // signale la fin de l'hydratation au reste de l'arbre.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsReady(true);
    }, []);

    // Persistance + application de l'attribut sur la racine du Cockpit.
    useEffect(() => {
        if (!isReady || typeof document === 'undefined') return;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            /* stockage indisponible : on ignore */
        }
        const root = document.querySelector('[data-cockpit-root]');
        if (root) {
            root.setAttribute('data-cockpit-theme', theme);
        }
    }, [theme, isReady]);

    const setTheme = useCallback((next: CockpitTheme) => setThemeState(next), []);
    const toggleTheme = useCallback(
        () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
        [],
    );

    const value = useMemo<CockpitThemeContextValue>(
        () => ({ theme, setTheme, toggleTheme, isReady }),
        [theme, setTheme, toggleTheme, isReady],
    );

    return (
        <CockpitThemeContext.Provider value={value}>{children}</CockpitThemeContext.Provider>
    );
};

export function useCockpitTheme(): CockpitThemeContextValue {
    const ctx = useContext(CockpitThemeContext);
    if (!ctx) {
        throw new Error('useCockpitTheme doit être utilisé dans un <CockpitThemeProvider>.');
    }
    return ctx;
}
