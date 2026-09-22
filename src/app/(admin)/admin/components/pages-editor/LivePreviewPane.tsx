'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Monitor,
    Tablet,
    Smartphone,
    RefreshCw,
    ExternalLink,
    MousePointerClick,
    Pencil,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import { usePreviewBridge } from '@/lib/hooks/usePreviewBridge';
import type { PreviewMode } from '@/lib/preview/preview-protocol';
import { CockpitIconButton, cx } from '@/app/(admin)/admin/components/ui';

/**
 * Aperçu live du Cockpit — côte à côte ou **plein écran**.
 *
 * L'iframe charge la page vitrine réelle. Le brouillon courant est poussé via
 * `postMessage` (voir `usePreviewBridge`) : toute modification du formulaire est
 * reflétée instantanément, sans écriture en base ni rechargement.
 *
 * - sélection d'un champ (`onFieldSelect`) : en mode inspection, l'éditeur fait
 *   défiler et focalise l'input correspondant ;
 * - **bascule de langue** `FR | EN` : elle pilote la locale d'édition du parent,
 *   donc l'URL de l'iframe (`/en/...`) et le brouillon poussé ;
 * - **plein écran** : l'iframe occupe tout l'écran, la barre se réduit au
 *   sélecteur d'appareil, à la langue, à l'état Live et à la sortie (Échap).
 */
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type PreviewLocale = 'fr' | 'en';

interface LivePreviewPaneProps {
    /** Contenu brouillon courant (non publié). */
    draft: SitePageContent;
    /** URL absolue de la page vitrine à charger. */
    previewUrl: string;
    /** Change à chaque changement de page pour forcer le rechargement de l'iframe. */
    reloadKey: number;
    /** Callback déclenché à la sélection d'un champ dans l'aperçu (édition inline). */
    onFieldSelect?: (field: string) => void;
    /** `inspect` : clic = focus du formulaire. `edit` : clic = saisie en place. */
    mode?: PreviewMode;
    /** Demande de bascule de mode (état contrôlé par le parent). */
    onModeChange?: (mode: PreviewMode) => void;
    /** Valeur validée dans l'aperçu (édition en place) → brouillon du Cockpit. */
    onFieldCommit?: (field: string, value: string) => void;
    /** Langue servie dans l'aperçu (`/en/...` en anglais). */
    locale?: PreviewLocale;
    /** Demande de bascule de langue (le parent recharge l'URL localisée). */
    onLocaleChange?: (locale: PreviewLocale) => void;
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

const LOCALES: PreviewLocale[] = ['fr', 'en'];

export const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
    draft,
    previewUrl,
    reloadKey,
    onFieldSelect,
    mode = 'inspect',
    onModeChange,
    onFieldCommit,
    locale = 'fr',
    onLocaleChange,
    className,
}) => {
    const [device, setDevice] = useState<PreviewDevice>('desktop');
    const [localKey, setLocalKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { iframeRef, isReady, hoveredField } = usePreviewBridge({
        draft,
        mode,
        onFieldSelect,
        onFieldCommit,
    });

    const handleRefresh = useCallback(() => {
        setLocalKey((prev) => prev + 1);
    }, []);

    const handleOpenExternal = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
        }
    }, [previewUrl]);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    // Plein écran : Échap pour sortir, page figée derrière l'aperçu.
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsFullscreen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isFullscreen]);

    const frameWidth = useMemo(() => DEVICE_WIDTHS[device], [device]);
    const frameHeight = isFullscreen ? '100%' : '72vh';

    /** Sélecteur d'appareil — seul contrôle conservé en plein écran. */
    const renderDeviceSwitcher = () => (
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
    );

    /** Bascule de langue : recharge l'aperçu dans la langue choisie. */
    const renderLocaleSwitcher = () => (
        <div className="flex items-center rounded-md border border-white/10 overflow-hidden">
            {LOCALES.map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onLocaleChange?.(value)}
                    aria-pressed={locale === value}
                    title={
                        value === 'fr'
                            ? 'Afficher et éditer la version française'
                            : 'Afficher et éditer la version anglaise'
                    }
                    className={cx(
                        'px-2 py-1 text-[11px] font-mono-tech uppercase transition-colors',
                        locale === value
                            ? 'bg-[#FFE500] text-black font-bold'
                            : 'bg-black/40 text-zinc-400 hover:text-white'
                    )}
                >
                    {value}
                </button>
            ))}
        </div>
    );

    return (
        <div
            className={cx(
                isFullscreen
                    ? 'fixed inset-0 z-[2147483000] flex flex-col gap-2 bg-[#060608] p-2 sm:p-3'
                    : 'flex flex-col gap-3',
                className
            )}
        >
            {/* Barre d'outils de l'aperçu */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0D12] border border-white/10 rounded-xl px-3 py-2 shrink-0">
                {renderDeviceSwitcher()}

                <div className="flex items-center gap-2">
                    {renderLocaleSwitcher()}

                    {!isFullscreen && (
                        <button
                            type="button"
                            onClick={() => onModeChange?.(mode === 'edit' ? 'inspect' : 'edit')}
                            aria-pressed={mode === 'edit'}
                            title={
                                mode === 'edit'
                                    ? 'Revenir au mode inspection'
                                    : 'Éditer les textes directement dans l’aperçu'
                            }
                            className={cx(
                                'inline-flex items-center gap-1.5 text-[11px] font-mono-tech px-2 py-1.5 rounded-md border transition-colors',
                                mode === 'edit'
                                    ? 'bg-[#FFE500] text-black border-[#FFE500]'
                                    : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/25'
                            )}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Édition en place</span>
                        </button>
                    )}

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

                    {!isFullscreen && (
                        <>
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
                        </>
                    )}

                    <CockpitIconButton
                        icon={isFullscreen ? Minimize2 : Maximize2}
                        label={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Aperçu en plein écran'}
                        onClick={toggleFullscreen}
                    />
                </div>
            </div>

            {/* Indice d'édition inline */}
            {!isFullscreen && (
                <div className="flex items-center gap-2 text-[11px] font-mono-tech text-zinc-500 px-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span>
                        {mode === 'edit'
                            ? 'Cliquez un texte ou un lien dans l’aperçu, saisissez, puis Entrée pour valider (Ctrl+Entrée en multi-lignes). Échap annule.'
                            : 'Cliquez un élément surligné dans l’aperçu pour éditer le champ correspondant.'}
                    </span>
                    {hoveredField && (
                        <span
                            className="ml-auto text-[#FFE500] truncate max-w-[40%]"
                            title={hoveredField}
                        >
                            {hoveredField}
                        </span>
                    )}
                </div>
            )}

            {/* Cadre de l'aperçu */}
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

            {/* Note de bas de cadre */}
            {!isFullscreen && (
                <p className="text-[11px] text-zinc-500 px-1">
                    L’aperçu reflète le brouillon en cours. Les modifications ne sont visibles du
                    public qu’après publication.
                </p>
            )}
        </div>
    );
};
