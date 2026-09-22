'use client';

import React from 'react';
import { MousePointerClick } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import { usePreviewBridge } from '@/lib/hooks/usePreviewBridge';
import type { PreviewListCommand, PreviewMode } from '@/lib/preview/preview-protocol';
import { cx } from '@/app/(admin)/admin/components/ui';
import { useLivePreviewPane } from './live-preview-pane/useLivePreviewPane';
import { PreviewToolbar } from './live-preview-pane/PreviewToolbar';
import { PreviewFrame } from './live-preview-pane/PreviewFrame';
import type { PreviewLocale } from './live-preview-pane/preview-devices';

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
 *
 * L'orchestration vit dans `useLivePreviewPane` ; les blocs visuels dans
 * `live-preview-pane/**`.
 */
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
    /** L'aperçu demande la médiathèque pour un champ image. */
    onMediaRequest?: (field: string) => void;
    /** Commande d'ajout / suppression / réordonnancement d'item de liste. */
    onListCommand?: (field: string, command: PreviewListCommand, index: number) => void;
    /** Langue servie dans l'aperçu (`/en/...` en anglais). */
    locale?: PreviewLocale;
    /** Demande de bascule de langue (le parent recharge l'URL localisée). */
    onLocaleChange?: (locale: PreviewLocale) => void;
    /** Classe additionnelle pour le conteneur. */
    className?: string;
}

export const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
    draft,
    previewUrl,
    reloadKey,
    onFieldSelect,
    mode = 'inspect',
    onModeChange,
    onFieldCommit,
    onMediaRequest,
    onListCommand,
    locale = 'fr',
    onLocaleChange,
    className,
}) => {
    const pane = useLivePreviewPane({ previewUrl });

    const { iframeRef, isReady, hoveredField } = usePreviewBridge({
        draft,
        mode,
        onFieldSelect,
        onFieldCommit,
        onMediaRequest,
        onListCommand,
    });

    return (
        <div
            className={cx(
                pane.isFullscreen
                    ? 'fixed inset-0 z-[2147483000] flex flex-col gap-2 bg-[#060608] p-2 sm:p-3'
                    : 'flex flex-col gap-3',
                className
            )}
        >
            {/* Barre d'outils de l'aperçu */}
            <PreviewToolbar
                device={pane.device}
                onSelectDevice={pane.setDevice}
                locale={locale}
                onLocaleChange={onLocaleChange}
                mode={mode}
                onModeChange={onModeChange}
                isReady={isReady}
                isFullscreen={pane.isFullscreen}
                onRefresh={pane.handleRefresh}
                onOpenExternal={pane.handleOpenExternal}
                onToggleFullscreen={pane.toggleFullscreen}
            />

            {/* Indice d'édition inline */}
            {!pane.isFullscreen && (
                <div className="flex items-center gap-2 text-[11px] font-mono-tech text-zinc-500 px-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span>
                        {mode === 'edit'
                            ? 'Cliquez un texte ou un lien dans l’aperçu, saisissez, puis Entrée pour valider (Ctrl+Entrée en multi-lignes). Échap annule.'
                            : 'Cliquez un élément surligné dans l’aperçu pour éditer le champ correspondant.'}
                    </span>
                    <span
                        className="shrink-0 px-1.5 py-0.5 rounded border border-[#FFE500]/40 text-[#FFE500] font-bold"
                        title="Langue éditée : basculez-la dans la barre de l’aperçu (FR | EN). La saisie en place écrit dans cette langue."
                    >
                        {locale === 'en' ? 'EN — English' : 'FR — Français'}
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
            <PreviewFrame
                previewUrl={previewUrl}
                reloadKey={reloadKey}
                localKey={pane.localKey}
                iframeRef={iframeRef}
                frameWidth={pane.frameWidth}
                frameHeight={pane.frameHeight}
                isFullscreen={pane.isFullscreen}
            />

            {/* Note de bas de cadre */}
            {!pane.isFullscreen && (
                <p className="text-[11px] text-zinc-500 px-1">
                    L’aperçu reflète le brouillon en cours. Les modifications ne sont visibles du
                    public qu’après publication.
                </p>
            )}
        </div>
    );
};
