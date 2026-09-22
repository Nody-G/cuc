import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { HomeFieldDef } from './home-blocks';
import { LinkField } from '../LinkField';

const INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none';
const LABEL_CLASS = 'block text-xs font-mono text-gray-400 mb-1';

export interface HomeBlockFieldControlProps {
    block: string;
    field: HomeFieldDef;
    value: string;
    onChange: (value: string) => void;
    onPickMedia: (target: string) => void;
}

export const HomeBlockFieldControl: React.FC<HomeBlockFieldControlProps> = ({
    block,
    field,
    value,
    onChange,
    onPickMedia,
}) => {
    /**
     * Attribut d'édition inline : permet à l'aperçu live de retrouver l'input
     * correspondant lorsqu'un élément est cliqué dans l'iframe.
     */
    const fieldAttr = field.liveEdit
        ? { 'data-cuc-field': `sections_data.${block}.${field.key}` }
        : {};

    if (field.media) {
        return (
            <div>
                <label className={LABEL_CLASS}>{field.label}</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={INPUT_CLASS}
                    />
                    <button
                        type="button"
                        onClick={() => onPickMedia(`sections_data.${block}.${field.key}`)}
                        className="shrink-0 p-2 rounded bg-white/10 text-white hover:bg-white/20"
                        title="Choisir dans la médiathèque"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    /** Champ de lien : sélecteur de pages — plus de chemin tapé à la main. */
    if (field.key.endsWith('_link')) {
        return (
            <div>
                <label className={LABEL_CLASS}>{field.label}</label>
                <LinkField
                    value={value}
                    onChange={onChange}
                    field={field.liveEdit ? `sections_data.${block}.${field.key}` : undefined}
                />
            </div>
        );
    }

    return (
        <div>
            <label className={LABEL_CLASS}>{field.label}</label>
            {field.kind === 'textarea' ? (
                <textarea
                    rows={field.rows ?? 2}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={INPUT_CLASS}
                    {...fieldAttr}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={INPUT_CLASS}
                    {...fieldAttr}
                />
            )}
        </div>
    );
};
