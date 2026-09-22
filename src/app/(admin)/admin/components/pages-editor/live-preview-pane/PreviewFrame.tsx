'use client';

import React from 'react';
import { cx } from '@/app/(admin)/admin/components/ui';

interface PreviewFrameProps {
    previewUrl: string;
    /** Change à chaque changement de page pour forcer le rechargement. */
    reloadKey: number;
    /** Incrémenté par « Recharger l'aperçu ». */
    localKey: number;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    frameWidth: string;
    frameHeight: string;
    isFullscreen: boolean;
}

/** Cadre de l'aperçu : page vitrine réelle dans une iframe de confiance. */
export const PreviewFrame: React.FC<PreviewFrameProps> = ({
    previewUrl,
    reloadKey,
    localKey,
    iframeRef,
    frameWidth,
    frameHeight,
    isFullscreen,
}) => (
    <div
        className={cx(
            'relative w-full bg-[#060608] border border-white/10 rounded-xl overflow-hidden',
            isFullscreen && 'flex-1 min-h-0'
        )}
    >
        <div
            className={cx(
                'flex justify-center bg-[#0a0a0f] p-2 sm:p-3',
                isFullscreen && 'h-full'
            )}
        >
            <div
                className={cx(
                    'bg-black border border-white/10 rounded-lg overflow-hidden transition-[width] duration-200 ease-out',
                    isFullscreen && 'h-full'
                )}
                style={{
                    width: frameWidth,
                    maxWidth: '100%',
                    height: isFullscreen ? '100%' : undefined,
                }}
            >
                {previewUrl ? (
                    <iframe
                        key={`${reloadKey}-${localKey}`}
                        ref={iframeRef}
                        src={previewUrl}
                        title="Aperçu live de la page"
                        className="w-full border-0 bg-[#060608]"
                        style={{ height: frameHeight }}
                        // Pas de `sandbox` : le contenu est notre propre
                        // route same-origin et de confiance. Un sandbox
                        // (même avec `allow-same-origin`) peut faire
                        // échouer l'aperçu après un affichage fugace.
                        referrerPolicy="same-origin"
                        loading="eager"
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center text-[11px] font-mono-tech text-zinc-500"
                        style={{ height: frameHeight }}
                    >
                        Initialisation de l’aperçu…
                    </div>
                )}
            </div>
        </div>
    </div>
);
