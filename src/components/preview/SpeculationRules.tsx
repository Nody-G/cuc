'use client';

import { useEffect } from 'react';

/**
 * Speculation Rules API — préchargement/prérendu des navigations internes.
 *
 * **Désactivé lorsque la page est encadrée** (aperçu live du Cockpit).
 * Dans une iframe, le `prerender` de Chrome est restreint : une navigation
 * prérendue peut échouer et remplacer le contenu du cadre par la page d'erreur
 * du navigateur (« This page couldn't load »), alors que la page s'affiche
 * correctement une fraction de seconde auparavant.
 *
 * Les règles sont donc injectées uniquement en navigation de premier niveau,
 * où elles apportent leur bénéfice sans risque.
 */
export const SpeculationRules: React.FC = () => {
    useEffect(() => {
        // Ne jamais activer la spéculation dans un cadre embarqué (aperçu Cockpit).
        const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
        if (isEmbedded) return;

        const script = document.createElement('script');
        script.type = 'speculationrules';
        script.textContent = JSON.stringify({
            prerender: [
                {
                    where: {
                        and: [
                            { href_matches: '/*' },
                            { not: { href_matches: '/api/*' } },
                            { not: { selector_matches: '[target=_blank]' } },
                            { not: { selector_matches: '[rel~=nofollow]' } },
                        ],
                    },
                    eagerness: 'moderate',
                },
            ],
            prefetch: [
                {
                    where: {
                        and: [
                            { href_matches: '/*' },
                            { not: { href_matches: '/api/*' } },
                        ],
                    },
                    eagerness: 'conservative',
                },
            ],
        });
        document.head.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    return null;
};
