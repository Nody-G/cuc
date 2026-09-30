'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

import { formatBytes } from '@/app/(admin)/admin/media-shared';
import type { MediaUploadItem, UseMediaUploadReturn } from './useMediaUpload';

interface MediaUploadPanelProps {
    upload: UseMediaUploadReturn;
}

const STATUS_LABELS: Record<MediaUploadItem['status'], string> = {
    pending: 'En attente',
    compressing: 'Compression…',
    uploading: 'Dépôt…',
    done: 'Déposé',
    error: 'Refusé',
};

/**
 * Panneau d'import — composant de présentation pur (`AGENTS.md` § 1).
 *
 * Il ne calcule rien et n'appelle rien : le hook `useMediaUpload` lui fournit
 * l'état, les actions et les plafonds. Son seul rôle est de rendre visible ce
 * que la compression a réellement produit — poids avant, poids après, gain — et
 * pourquoi un fichier a été refusé. Sans cet affichage, une photo qui passe de
 * 8 Mo à 500 Ko et une photo refusée à 9 Mo se ressembleraient.
 */
export const MediaUploadPanel: React.FC<MediaUploadPanelProps> = ({ upload }) => {
    const { items, uploading, progress, profileLabel, canKeepOriginal, keepOriginal } = upload;

    if (items.length === 0) return null;

    const done = items.filter((item) => item.status === 'done');
    const failed = items.filter((item) => item.status === 'error');
    const savedBytes = done.reduce(
        (total, item) => total + Math.max(0, item.sourceBytes - item.uploadedBytes),
        0,
    );

    return (
        <section className="border border-white/10 rounded-xl bg-[#0D0D12] p-3 space-y-3" aria-live="polite">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="text-gray-200 font-bold uppercase tracking-wider">
                    Import — {profileLabel}
                </span>
                <span className="text-gray-500 font-mono">
                    {uploading ? `${progress.processed}/${progress.total}` : `${done.length}/${items.length}`}
                </span>
                {savedBytes > 0 && (
                    <span className="text-emerald-400 font-mono">{formatBytes(savedBytes)} économisés</span>
                )}
                {failed.length > 0 && (
                    <span className="text-amber-400 font-mono">{failed.length} refusé(s)</span>
                )}
            </header>

            {canKeepOriginal && (
                <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={keepOriginal}
                        disabled={uploading}
                        onChange={(event) => upload.setKeepOriginal(event.target.checked)}
                        className="mt-0.5 accent-[#FFE500]"
                    />
                    <span>
                        Conserver aussi l'original haute qualité (négatif)
                        <span className="block text-gray-500">
                            Rangé sous <code className="text-[#FFE500]">_originals/</code>, jamais servi par le
                            site, plafond {formatBytes(upload.imageOriginalCeilingBytes)}. Un négatif occupe
                            environ douze fois son dérivé : à réserver aux visuels de référence.
                        </span>
                    </span>
                </label>
            )}

            <ul className="space-y-1.5">
                {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs">
                        <span className="mt-0.5 shrink-0">
                            {item.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            {item.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                            {(item.status === 'pending' ||
                                item.status === 'compressing' ||
                                item.status === 'uploading') && (
                                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                                )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-gray-200">{item.name}</span>
                            <span className="block font-mono text-gray-500">
                                {formatBytes(item.sourceBytes)}
                                {item.compressed && ` → ${formatBytes(item.uploadedBytes)} (${item.gainLabel})`}
                                {item.keptOriginal && ' · négatif conservé'}
                                {!item.compressed && item.status !== 'error' && ' · déposé tel quel'}
                            </span>
                            {item.error && <span className="block text-amber-400">{item.error}</span>}
                        </span>
                        <span className="shrink-0 font-mono text-gray-500">{STATUS_LABELS[item.status]}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
};
