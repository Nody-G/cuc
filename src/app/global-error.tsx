'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Frontière d'erreur racine (global-error).
 *
 * Cette frontière remplace le composant `DefaultGlobalError` de Next.js
 * (« This page couldn't load / Reload to try again, or go back. ») qui
 * s'affichait en production lors de la panne du site vitrine.
 *
 * IMPORTANT : `global-error` remplace le layout racine. Elle DOIT donc
 * rendre ses propres balises `<html>` et `<body>`. Les styles Tailwind
 * n'étant pas garantis à ce niveau, on utilise des styles inline sobres.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[CUC] Erreur racine interceptée :', error);
    }, [error]);

    // `global-error` REMPLACE le layout racine : aucun provider next-intl n'est
    // disponible ici. On dérive donc la langue du chemin réel (`/en/...`) et on
    // sert une copie bilingue minimale — c'est la seule surface qui ne peut pas
    // lire les catalogues.
    const isEn =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
    const copy = isEn
        ? {
            title: 'An error occurred',
            text: 'The content could not be displayed. You can try again immediately or return to the home page.',
            retry: 'Try again',
            backHome: 'Back to home',
            reference: 'Reference',
        }
        : {
            title: 'Une erreur est survenue',
            text: "Le contenu n'a pas pu être affiché. Vous pouvez réessayer immédiatement ou revenir à l'accueil.",
            retry: 'Réessayer',
            backHome: "Retour à l'accueil",
            reference: 'Référence',
        };

    return (
        <html lang={isEn ? 'en' : 'fr'}>
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#060608',
                    color: '#ffffff',
                    fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    padding: '24px',
                }}
            >
                <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
                    <p
                        style={{
                            fontSize: '11px',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: '#FFE500',
                            marginBottom: '16px',
                        }}
                    >
                        Campus Univers Cascades
                    </p>
                    <h1
                        style={{
                            fontSize: '32px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            margin: '0 0 16px',
                            lineHeight: 1.1,
                        }}
                    >
                        {copy.title}
                    </h1>
                    <p
                        style={{
                            color: '#a1a1aa',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            marginBottom: '32px',
                        }}
                    >
                        {copy.text}
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => reset()}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#FFE500',
                                color: '#000000',
                                fontSize: '12px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            {copy.retry}
                        </button>
                        <Link
                            href="/"
                            style={{
                                padding: '12px 24px',
                                border: '1px solid #3f3f46',
                                color: '#e4e4e7',
                                fontSize: '12px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                borderRadius: '8px',
                                textDecoration: 'none',
                            }}
                        >
                            {copy.backHome}
                        </Link>
                    </div>

                    {error.digest && (
                        <p
                            style={{
                                marginTop: '32px',
                                fontSize: '10px',
                                color: '#52525b',
                                fontFamily: 'monospace',
                            }}
                        >
                            {copy.reference} : {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
