'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Copy, Download, ExternalLink, Info } from 'lucide-react';
import { formatBytes, type MediaObject } from '@/app/(admin)/admin/media-shared';
import { KIND_ICON } from './media-explorer-shared';

export interface MediaDetailPanelProps {
    detail: MediaObject | null;
    references: Record<string, string[]> | null;
    detailReferences: string[];
    mode: 'manage' | 'pick';
    onCopy: (value: string, label: string) => void;
    onPick: (url: string) => void;
    onTrash: () => void;
}

/**
 * Panneau détail : aperçu, poids, type, date, usage en base, copie d'URL et
 * actions (ouvrir, télécharger, corbeille, choisir en mode sélecteur).
 */
export const MediaDetailPanel: React.FC<MediaDetailPanelProps> = ({
    detail,
    references,
    detailReferences,
    mode,
    onCopy,
    onPick,
    onTrash,
}) => (
    <aside className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 h-fit xl:sticky xl:top-4">
        {!detail ? (
            <div className="text-xs text-gray-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                    Sélectionnez un média pour voir son aperçu, son poids, son chemin et les
                    ressources qui l'utilisent.
                </span>
            </div>
        ) : (
            <div className="space-y-3">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                    {detail.kind === 'image' ? (
                        <Image
                            src={detail.url}
                            alt={detail.name}
                            fill
                            sizes="300px"
                            className="object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {React.createElement(KIND_ICON[detail.kind], { className: 'w-8 h-8' })}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="text-xs font-bold text-white break-all">{detail.name}</div>
                    <div className="text-[10px] font-mono text-gray-400 break-all">{detail.path}</div>
                </div>

                <dl className="text-[11px] font-mono text-gray-300 space-y-1">
                    <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Poids</dt>
                        <dd>{formatBytes(detail.size)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Type</dt>
                        <dd className="truncate">{detail.mimetype || detail.kind}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Ajouté le</dt>
                        <dd>
                            {detail.createdAt
                                ? new Date(detail.createdAt).toLocaleDateString('fr-FR')
                                : '—'}
                        </dd>
                    </div>
                </dl>

                <div className="text-[11px]">
                    {references === null ? (
                        <span className="text-gray-500 font-mono">Vérification de l'usage…</span>
                    ) : detailReferences.length > 0 ? (
                        <span className="text-emerald-300 font-mono">
                            Utilisé par : {detailReferences.join(', ')}
                        </span>
                    ) : (
                        <span className="text-amber-300 font-mono">Aucune référence en base</span>
                    )}
                </div>

                <div className="space-y-1.5">
                    <button
                        type="button"
                        onClick={() => onCopy(detail.url, 'URL publique')}
                        className="w-full px-3 py-2 rounded-lg bg-[#FFE500] text-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                        <Copy className="w-3.5 h-3.5" /> Copier l'URL publique
                    </button>
                    {mode === 'pick' && (
                        <button
                            type="button"
                            onClick={() => onPick(detail.url)}
                            className="w-full px-3 py-2 rounded-lg bg-emerald-500 text-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" /> Utiliser cette image
                        </button>
                    )}
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => onCopy(detail.path, 'Chemin')}
                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px]"
                        >
                            Chemin
                        </button>
                        <a
                            href={detail.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] flex items-center justify-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
                        </a>
                        <a
                            href={detail.url}
                            download
                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] flex items-center justify-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Télécharger
                        </a>
                        <button
                            type="button"
                            onClick={onTrash}
                            className="px-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px]"
                        >
                            Corbeille
                        </button>
                    </div>
                </div>
            </div>
        )}
    </aside>
);
