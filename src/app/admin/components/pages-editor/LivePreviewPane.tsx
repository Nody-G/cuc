'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, MousePointerClick } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import { usePreviewBridge } from '@/lib/hooks/usePreviewBridge';
import { CockpitIconButton, cx } from '@/app/admin/components/ui';

/**
 * Aperçu live (split-screen) du Cockpit.
 *
 * L'iframe charge la page vitrine réelle. Le brouillon courant est poussé via
 * `postMessage` (voir `usePreviewBridge`) : toute modification du formulaire est
 * reflétée instantanément, sans écriture en base ni rechargement.
 *
 * Le clic sur un élément `[data-cuc-field]` de l'aperçu renvoie l'identifiant du
 * champ au parent, qui peut alors faire défiler et focaliser l'input
 * correspondant (édition inline).
 */

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewPaneProps {
    /** Contenu brouillon courant (non publié). */
    draft: SitePageContent;
    /** URL absolue de la page vitrine à charger. */
    previewUrl: string;
    /** Change à chaque changement de page pour forcer le rechargement de l'iframe. */
    reloadKey: number;
    /** Callback déclenché au clic d'un champ dans l'aperçu (édition inline). */
    onFieldFocus?: (field: string) => void;
    /** Classe additionnelle pour le conteneur. */
    className?: string;
}

const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '834px',
    mobile: '390px',
};

const DEVICE_ICONS: Record<PreviewDevice, React.ComponentType<{ className?: string }>> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
};

const DEVICE_LABELS: Record<PreviewDevice, string> = {
    desktop: 'Ordinateur',
    tablet: 'Tablette',
    mobile: 'Mobile',
};

export const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
    draft,
    previewUrl,
    reloadKey,
    onFieldFocus,
    className,
}) => {
    const [device, setDevice] = useState<PreviewDevice>('desktop');
    const [localKey, setLocalKey] = useState(0);

    const { iframeRef, isReady, hoveredField } = usePreviewBridge({
        draft,
        onFieldFocus,
    });

    const handleRefresh = useCallback(() => {
        setLocalKey((prev) => prev + 1);
    }, []);

    const handleOpenExternal = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
        }
    }, [previewUrl]);

    const frameWidth = useMemo(() => DEVICE_WIDTHS[device], [device]);

    return (
        <div className={cx('flex flex-col gap-3', className)}>
            {/* Barre d'outils de l'aperçu */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0D12] border border-white/10 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5">
                    {(Object.keys(DEVICE_WIDTHS) as PreviewDevice[]).map((key) => {
                        const Icon = DEVICE_ICONS[key];
                        const active = device === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setDevice(key)}
                                aria-label={`Aperçu ${DEVICE_LABELS[key]}`}
                                aria-pressed={active}
                                title={DEVICE_LABELS[key]}
                                className={cx(
                                    'p-2 rounded-lg border transition-colors',
                                    active
                                        ? 'bg-[#FFE500] text-black border-[#FFE500]'
                                        : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/25'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={cx(
                            'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono-tech px-2 py-1 rounded-md border',
                            isReady
                                ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                                : 'text-zinc-400 border-white/10 bg-black/40'
                        )}
                        title={
                            isReady
                                ? 'Le brouillon est synchronisé avec l’aperçu'
                                : 'En attente de la page d’aperçu'
                        }
                    >
                        <span
                            className={cx(
                                'w-1.5 h-1.5 rounded-full',
                                isReady ? 'bg-emerald-400' : 'bg-zinc-500'
                            )}
                        />
                        {isReady ? 'Live' : 'Connexion…'}
                    </span>

                    <CockpitIconButton
                        icon={RefreshCw}
                        label="Recharger l’aperçu"
                        onClick={handleRefresh}
                    />
                    <CockpitIconButton
                        icon={ExternalLink}
                        label="Ouvrir dans un nouvel onglet"
                        onClick={handleOpenExternal}
                    />
                </div>
            </div>

            {/* Indice d'édition inline */}
            <div className="flex items-center gap-2 text-[11px] font-mono-tech text-zinc-500 px-1">
                <MousePointerClick className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>
                    Cliquez un élément surligné dans l’aperçu pour éditer le champ correspondant.
                </span>
                {hoveredField && (
                    <span className="ml-auto text-[#FFE500] truncate max-w-[40%]" title={hoveredField}>
                        {hoveredField}
                    </span>
                )}
            </div>

            {/* Cadre de l'aperçu */}
            <div className="relative w-full bg-[#060608] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex justify-center bg-[#0a0a0f] p-2 sm:p-3">
                    <div
                        className="bg-black border border-white/10 rounded-lg overflow-hidden transition-[width] duration-200 ease-out"
                        style={{ width: frameWidth, maxWidth: '100%' }}
                    >
                        {previewUrl ? (
                            <iframe
                                key={`${reloadKey}-${localKey}`}
                                ref={iframeRef}
                                src={previewUrl}
                                title="Aperçu live de la page"
                                className="w-full border-0 bg-[#060608]"
                                style={{ height: '72vh' }}
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
                                style={{ height: '72vh' }}
                            >
                                Initialisation de l’aperçu…
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Note de bas de cadre */}
            <p className="text-[11px] text-zinc-500 px-1">
                L’aperçu reflète le brouillon en cours. Les modifications ne sont visibles du public
                qu’après publication.
            </p>
        </div>
    );
};
