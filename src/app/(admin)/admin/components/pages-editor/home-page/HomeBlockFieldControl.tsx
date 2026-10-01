import React from 'react';
import type { HomeFieldDef } from './home-blocks.types';
import { LinkField } from '../LinkField';
import { MediaImageField } from '../MediaImageField';

const INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none';
const LABEL_CLASS = 'block text-xs font-mono text-gray-400 mb-1';

export interface HomeBlockFieldControlProps {
    block: string;
    field: HomeFieldDef;
    value: string;
    onChange: (value: string) => void;
    onPickMedia: (target: string) => void;
    /**
     * Chemin explicite du champ. Utile aux items de liste
     * (`sections_data.<bloc>.<tableau>.<index>.<clé>`), qui ne se déduisent pas
     * de `block` + `field.key`. À défaut : `sections_data.<bloc>.<clé>`.
     */
    path?: string;
}

export const HomeBlockFieldControl: React.FC<HomeBlockFieldControlProps> = ({
    block,
    field,
    value,
    onChange,
    onPickMedia,
    path,
}) => {
    /**
     * Attribut d'édition inline : permet à l'aperçu live de retrouver l'input
     * correspondant lorsqu'un élément est cliqué dans l'iframe.
     *
     * Posé sur **tous** les contrôles — texte, zone de texte, média et lien —
     * sinon le clic d'inspection dans la page n'aurait rien à focaliser pour les
     * images et les liens (ils sont pourtant cliquables là-bas).
     */
    const fieldPath = path ?? `sections_data.${block}.${field.key}`;
    const fieldAttr = field.liveEdit ? { 'data-cuc-field': fieldPath } : {};

    if (field.media) {
        return (
            <MediaImageField
                label={field.label}
                value={value}
                onChange={onChange}
                onPickMedia={() => onPickMedia(fieldPath)}
                data-cuc-field={field.liveEdit ? fieldPath : undefined}
            />
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
                    field={field.liveEdit ? fieldPath : undefined}
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
