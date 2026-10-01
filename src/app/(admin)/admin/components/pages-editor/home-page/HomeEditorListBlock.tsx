'use client';

import React from 'react';
import type { HomeListBlockDef } from './home-blocks.types';
import { HomeBlockFieldControl } from './HomeBlockFieldControl';

/** Items d'un tableau `sections_data` (forme lâche : le brouillon peut être partiel). */
type ListItems = Array<Record<string, string | undefined>>;

const asItems = (value: unknown): ListItems =>
    Array.isArray(value) ? (value as ListItems) : [];

export interface HomeEditorListBlockProps {
    block: HomeListBlockDef;
    /** Contenu brut du bloc `sections_data` (peut porter les tableaux d'items). */
    blockData: Record<string, unknown> | undefined;
    /** Écrit un chemin canonique complet (`sections_data.…`), copie immuable. */
    onItemChange: (path: string, value: string) => void;
    onPickMedia: (target: string) => void;
}

/**
 * Édition des listes **fixes** d'un bloc d'accueil : `about.pillars`,
 * `partners.items`, `social.posts`.
 *
 * La structure reproduit celle de la vitrine : `Math.max(count, items.length)`
 * positions, sans bouton d'ajout ni de suppression — on n'invente ni ne vide
 * jamais une liste (invariant Mode Studio). Chaque contrôle réutilise
 * `HomeBlockFieldControl` avec le chemin complet de l'item, si bien qu'un clic
 * dans l'aperçu focalise **la même** saisie.
 */
export const HomeEditorListBlock: React.FC<HomeEditorListBlockProps> = ({
    block,
    blockData,
    onItemChange,
    onPickMedia,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {block.title}
                </h3>
                <p className="text-xs text-gray-400">{block.desc}</p>
            </div>
            <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {block.tag}
            </span>
        </div>

        {block.lists.map((list) => {
            const items = asItems(blockData?.[list.arrayKey]);
            const length = Math.max(list.count, items.length);

            return (
                <div key={list.arrayKey} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-[#FFE500] uppercase font-bold">
                            {list.label} ({length})
                        </span>
                        {list.desc ? (
                            <span className="text-[10px] text-gray-500 text-right">{list.desc}</span>
                        ) : null}
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length }, (_, index) => {
                            const item = items[index] ?? {};
                            const base = `sections_data.${block.id}.${list.arrayKey}.${index}`;

                            return (
                                <div
                                    key={index}
                                    className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-3"
                                >
                                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                                        {list.label} #{index + 1}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {list.fields.map((sub) => (
                                            <div
                                                key={sub.fieldKey}
                                                className={
                                                    sub.kind === 'textarea'
                                                        ? 'sm:col-span-2'
                                                        : undefined
                                                }
                                            >
                                                <HomeBlockFieldControl
                                                    block={block.id}
                                                    field={{
                                                        key: sub.fieldKey,
                                                        label: sub.label,
                                                        kind: sub.kind,
                                                        rows: sub.rows,
                                                        media: sub.media,
                                                        liveEdit: true,
                                                    }}
                                                    path={`${base}.${sub.fieldKey}`}
                                                    value={item[sub.fieldKey] || ''}
                                                    onChange={(value) =>
                                                        onItemChange(
                                                            `${base}.${sub.fieldKey}`,
                                                            value
                                                        )
                                                    }
                                                    onPickMedia={onPickMedia}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
    </div>
);
