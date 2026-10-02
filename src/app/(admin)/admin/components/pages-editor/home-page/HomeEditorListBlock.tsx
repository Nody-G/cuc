'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import type { HomeListBlockDef } from './home-blocks.types';
import type { ListCommand } from '@/lib/preview/list-command';
import { HomeBlockFieldControl } from './HomeBlockFieldControl';

/** Items d'un tableau `sections_data` (forme lâche : le brouillon peut être partiel). */
type ListItems = Array<Record<string, string | undefined>>;

const asItems = (value: unknown): ListItems =>
    Array.isArray(value) ? (value as ListItems) : [];

const COMMAND_BUTTON_CLASS =
    'p-1.5 rounded bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white/5';

export interface HomeEditorListBlockProps {
    block: HomeListBlockDef;
    /** Contenu brut du bloc `sections_data` (peut porter les tableaux d'items). */
    blockData: Record<string, unknown> | undefined;
    /** Écrit un chemin canonique complet (`sections_data.…`), copie immuable. */
    onItemChange: (path: string, value: string) => void;
    onPickMedia: (target: string) => void;
    /**
     * Commandes de structure (`add`, `remove`, `move-up`, `move-down`,
     * `duplicate`) exécutées par le moteur partagé `applyListCommand`. Absent, ou
     * `canEditStructure` à faux, la liste garde sa longueur fixe — comportement
     * strictement inchangé pour les listes historiques.
     */
    onListCommand?: (
        arrayPath: string,
        command: ListCommand,
        index: number,
        seed?: ReadonlyArray<Record<string, string | undefined>>
    ) => void;
}

/**
 * Édition des listes d'un bloc d'accueil : `about.pillars`, `partners.items`,
 * `social.posts`, `hero.slides`.
 *
 * La structure reproduit celle de la vitrine : `Math.max(count, items.length)`
 * positions. Les listes historiques restent à longueur fixe. Une liste marquée
 * `canEditStructure` (visuels du hero) expose en plus les commandes d'ajout /
 * suppression / réordonnancement, et affiche le socle par défaut (`seed`) en
 * repli grisé tant qu'aucune surcharge n'est enregistrée — on ne persiste rien
 * et on n'invente aucun contenu.
 */
export const HomeEditorListBlock: React.FC<HomeEditorListBlockProps> = ({
    block,
    blockData,
    onItemChange,
    onPickMedia,
    onListCommand,
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
            const arrayPath = `sections_data.${block.id}.${list.arrayKey}`;
            const canEdit = Boolean(list.canEditStructure && onListCommand);

            const runCommand = (command: ListCommand, index: number) =>
                onListCommand?.(arrayPath, command, index, list.seed);

            return (
                <div key={list.arrayKey} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-[#FFE500] uppercase font-bold">
                            {list.label} ({length})
                        </span>
                        <div className="flex items-center gap-3">
                            {list.desc ? (
                                <span className="text-[10px] text-gray-500 text-right">
                                    {list.desc}
                                </span>
                            ) : null}
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => runCommand('add', -1)}
                                    title="Ajouter un visuel"
                                    className="shrink-0 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5 text-[#FFE500]" />
                                    Ajouter
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length }, (_, index) => {
                            const item = items[index] ?? {};
                            const base = `${arrayPath}.${index}`;
                            const hasOwnValue = list.fields.some(
                                (sub) => (item[sub.fieldKey] ?? '') !== ''
                            );
                            const showFallback = Boolean(list.seed) && !hasOwnValue;

                            return (
                                <div
                                    key={index}
                                    className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-mono text-gray-500 uppercase">
                                            {list.label} #{index + 1}
                                            {showFallback ? ' — repli par défaut' : ''}
                                        </span>
                                        {canEdit && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Monter"
                                                    disabled={index === 0}
                                                    onClick={() => runCommand('move-up', index)}
                                                    className={COMMAND_BUTTON_CLASS}
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Descendre"
                                                    disabled={index === length - 1}
                                                    onClick={() => runCommand('move-down', index)}
                                                    className={COMMAND_BUTTON_CLASS}
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Dupliquer"
                                                    onClick={() => runCommand('duplicate', index)}
                                                    className={COMMAND_BUTTON_CLASS}
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Supprimer"
                                                    disabled={length <= 1}
                                                    onClick={() => runCommand('remove', index)}
                                                    className={COMMAND_BUTTON_CLASS}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                                                    fallbackValue={
                                                        list.seed?.[index]?.[sub.fieldKey]
                                                    }
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
