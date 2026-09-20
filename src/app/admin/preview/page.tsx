import React, { Suspense } from 'react';
import { PreviewRenderer } from './PreviewRenderer';

/**
 * Route d'aperçu live du Cockpit — **même origine garantie**.
 *
 * Pourquoi une route dédiée plutôt que l'encadrement de la page vitrine réelle ?
 * L'iframe d'aperçu encadrait auparavant l'URL publique (`window.location.origin`
 * + slug). Cela échouait dès que l'origine du Cockpit différait de celle de la
 * page encadrée (déploiements de prévisualisation Vercel, domaine `www` vs apex,
 * domaine personnalisé) : le navigateur bloquait alors l'encadrement et affichait
 * « This page couldn't load ».
 *
 * Cette route est servie par la **même application et la même origine** que le
 * Cockpit : l'encadrement est donc toujours autorisé, quel que soit le domaine
 * d'accès. Elle rend les vrais composants de section de la vitrine et reçoit le
 * brouillon non publié via `postMessage` (voir `PreviewBridgeClient`).
 */
export default function AdminPreviewPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#060608] text-zinc-500 flex items-center justify-center text-[11px] font-mono">
                    Initialisation de l’aperçu…
                </div>
            }
        >
            <PreviewRenderer />
        </Suspense>
    );
}
