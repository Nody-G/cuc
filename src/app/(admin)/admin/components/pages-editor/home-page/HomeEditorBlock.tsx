import React from 'react';
import type { HomeBlockDef } from './home-blocks';
import { HomeBlockFieldControl } from './HomeBlockFieldControl';

/**
 * Classes de grille littérales : Tailwind ne détecte pas les classes
 * construites dynamiquement (`sm:grid-cols-${n}`).
 */
const GRID_CLASS: Record<2 | 3, string> = {
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
};

/** En-tête de bloc réutilisable (défini hors rendu pour rester stable). */
const BlockHeader: React.FC<{ title: string; desc: string; tag: string }> = ({
    title,
    desc,
    tag,
}) => (
    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
        <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {tag}
        </span>
    </div>
);

export interface HomeEditorBlockProps {
    block: HomeBlockDef;
    data: Record<string, string | undefined> | undefined;
    onChange: (key: string, value: string) => void;
    onPickMedia: (target: string) => void;
}

export const HomeEditorBlock: React.FC<HomeEditorBlockProps> = ({
    block,
    data,
    onChange,
    onPickMedia,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <BlockHeader title={block.title} desc={block.desc} tag={block.tag} />

        {block.rows.map((row, rowIndex) => {
            const controls = row.fields.map((field) => (
                <HomeBlockFieldControl
                    key={field.key}
                    block={block.id}
                    field={field}
                    value={data?.[field.key] || ''}
                    onChange={(value) => onChange(field.key, value)}
                    onPickMedia={onPickMedia}
                />
            ));

            if (row.columns) {
                return (
                    <div key={rowIndex} className={GRID_CLASS[row.columns]}>
                        {controls}
                    </div>
                );
            }

            return <React.Fragment key={rowIndex}>{controls}</React.Fragment>;
        })}
    </div>
);
