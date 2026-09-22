'use client';

import React from 'react';
import { RefreshCw, ExternalLink, Pencil, Maximize2, Minimize2 } from 'lucide-react';
import { CockpitIconButton, cx } from '@/app/(admin)/admin/components/ui';
import type { PreviewMode } from '@/lib/preview/preview-protocol';
import { PreviewDeviceSwitcher } from './PreviewDeviceSwitcher';
import { PreviewLocaleSwitcher } from './PreviewLocaleSwitcher';
import type { PreviewDevice, PreviewLocale } from './preview-devices';

interface PreviewToolbarProps {
    device: PreviewDevice;
    onSelectDevice: (device: PreviewDevice) => void;
    locale: PreviewLocale;
    onLocaleChange?: (locale: PreviewLocale) => void;
    mode: PreviewMode;
    onModeChange?: (mode: PreviewMode) => void;
    isReady: boolean;
    isFullscreen: boolean;
    onRefresh: () => void;
    onOpenExternal: () => void;
    onToggleFullscreen: () => void;
}

/** Barre d'outils de l'aperçu : appareil, langue, mode, état Live, actions. */
export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    device,
    onSelectDevice,
    locale,
    onLocaleChange,
    mode,
    onModeChange,
    isReady,
    isFullscreen,
    onRefresh,
    onOpenExternal,
    onToggleFullscreen,
}) => (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0D12] border border-white/10 rounded-xl px-3 py-2 shrink-0">
        <PreviewDeviceSwitcher device={device} onSelectDevice={onSelectDevice} />

        <div className="flex items-center gap-2">
            <PreviewLocaleSwitcher locale={locale} onLocaleChange={onLocaleChange} />

            {!isFullscreen && (
                <button
                    type="button"
                    onClick={() => onModeChange?.(mode === 'edit' ? 'inspect' : 'edit')}
                    aria-pressed={mode === 'edit'}
                    title={
                        mode === 'edit'
                            ? 'Édition en place activée — cliquer pour revenir à l’inspection (le clic ouvre alors le champ dans le formulaire)'
                            : 'Activer l’édition en place — cliquer un texte pour le modifier directement dans l’aperçu'
                    }
                    className={cx(
                        'inline-flex items-center gap-1.5 text-[11px] font-mono-tech px-2 py-1.5 rounded-md border transition-colors',
                        mode === 'edit'
                            ? 'bg-[#FFE500] text-black border-[#FFE500]'
                            : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white hover:border-white/25'
                    )}
                >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                        {mode === 'edit' ? 'Édition en place' : 'Activer l’édition'}
                    </span>
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
                        onClick={onRefresh}
                    />
                    <CockpitIconButton
                        icon={ExternalLink}
                        label="Ouvrir dans un nouvel onglet"
                        onClick={onOpenExternal}
                    />
                </>
            )}

            <CockpitIconButton
                icon={isFullscreen ? Minimize2 : Maximize2}
                label={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Aperçu en plein écran'}
                onClick={onToggleFullscreen}
            />
        </div>
    </div>
);
