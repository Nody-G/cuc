'use client';

import { useEffect } from 'react';

/**
 * Speculation Rules API — **préchargement uniquement** (`prefetch`).
 *
 * Le `prerender` a été retiré volontairement. Il demandait à Chrome de rendre
 * en arrière-plan chaque lien interne survolé (`/*`). Sur ce site, les pages
 * sont lourdes (HTML volumineux + dizaines d'images distantes) : un prérendu
 * interrompu ou en échec pouvait être activé par le navigateur et **remplacer
 * la page courante par sa propre page d'erreur** (« This page couldn't load »),
 * alors que la page s'affichait correctement une fraction de seconde auparavant.
 *
 * Le `prefetch` ne fait que télécharger la ressource en avance : il ne remplace
 * jamais le contenu affiché et ne peut donc pas provoquer cet écran d'erreur.
 * Le gain de latence reste réel, sans le risque.
 *
 * Les règles sont en outre désactivées dans un cadre embarqué (aperçu Cockpit).
 */
export const SpeculationRules: React.FC = () => {
    useEffect(() => {
        // Ne jamais activer la spéculation dans un cadre embarqué (aperçu Cockpit).
        const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
        if (isEmbedded) return;

        const script = document.createElement('script');
        script.type = 'speculationrules';
        script.textContent = JSON.stringify({
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
