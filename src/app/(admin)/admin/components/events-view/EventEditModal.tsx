'use client';

import React from 'react';
import { Save, Trash2, Image as ImageIcon } from 'lucide-react';
import type { SiteEvent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '../ui';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { EVENTS_INPUT_CLASS } from './events-form';

/** Opacité + curseur des champs verrouillés (médias/technique en anglais). */
const DISABLED = ' disabled:opacity-50 disabled:cursor-not-allowed';

interface EventEditModalProps {
    /** Prestation active : français en FR, contenu localisé en EN. */
    event: SiteEvent;
    onEventChange: (next: SiteEvent) => void;
    /** Prestation source française : médias et champs techniques. */
    sourceEvent: SiteEvent;
    onSourceChange: (patch: Partial<SiteEvent>) => void;
    /** État bilingue : barre FR | EN et verrous de champs. */
    localeEditor: EntityEditorLocale<SiteEvent>;
    onLocaleChange: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
    featureInput: string;
    setFeatureInput: React.Dispatch<React.SetStateAction<string>>;
    onSave: (e: React.FormEvent) => void;
    onClose: () => void;
    onAddFeature: () => void;
    onRemoveFeature: (index: number) => void;
    onOpenMediaPicker: () => void;
}

/**
 * Modale d'édition d'une prestation. En anglais, seuls les champs de
 * l'allow-list (`EVENT_CODEC`) restent éditables : le visuel et la liste
 * d'atouts basculent leur structure hors édition.
 */
export const EventEditModal: React.FC<EventEditModalProps> = ({
    event,
    onEventChange,
    sourceEvent,
    onSourceChange,
    localeEditor,
    onLocaleChange,
    isFieldReadOnly,
    featureInput,
    setFeatureInput,
    onSave,
    onClose,
    onAddFeature,
    onRemoveFeature,
    onOpenMediaPicker,
}) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
                {event.title ? `Modifier : ${event.title}` : 'Nouvelle offre'}
            </h3>

            {/* Bascule FR | EN : la traduction s'édite dans le même formulaire. */}
            <EntityLocaleBar
                entityLabel={event.title || 'Nouvelle offre'}
                locale={localeEditor.locale}
                onLocaleChange={onLocaleChange}
                coverage={localeEditor.coverage}
                dirty={localeEditor.isEnglish && localeEditor.dirty}
                busy={localeEditor.loading}
                ready={localeEditor.ready}
                saving={localeEditor.saving}
                onSaveTranslation={() => void localeEditor.saveTranslation()}
                onRevertTranslation={localeEditor.revertTranslation}
                onRemoveTranslation={() => void localeEditor.removeTranslation()}
            />

            {localeEditor.error && (
                <p role="alert" className="text-[11px] text-red-400">
                    {localeEditor.error}
                </p>
            )}

            <form onSubmit={onSave} className="space-y-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Titre de la prestation</label>
                    <input
                        type="text"
                        required
                        disabled={isFieldReadOnly('title')}
                        value={event.title}
                        onChange={(e) => onEventChange({ ...event, title: e.target.value })}
                        className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Sous-titre court</label>
                        <input
                            type="text"
                            disabled={isFieldReadOnly('subtitle')}
                            value={event.subtitle || ''}
                            onChange={(e) => onEventChange({ ...event, subtitle: e.target.value })}
                            className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Badge</label>
                        <input
                            type="text"
                            disabled={isFieldReadOnly('badge')}
                            value={event.badge || ''}
                            onChange={(e) => onEventChange({ ...event, badge: e.target.value })}
                            className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Description commerciale</label>
                    <textarea
                        rows={3}
                        required
                        disabled={isFieldReadOnly('description')}
                        value={event.description || ''}
                        onChange={(e) => onEventChange({ ...event, description: e.target.value })}
                        className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                    />
                </div>

                {/* URL Image : champ technique verrouillé en anglais. */}
                <fieldset disabled={localeEditor.isEnglish} className="m-0 min-w-0 border-0 p-0">
                    <label className="block text-xs font-mono text-gray-400 mb-1">URL Image</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="/images/... ou https://..."
                            value={sourceEvent.image_url || ''}
                            onChange={(e) => onSourceChange({ image_url: e.target.value })}
                            className={`flex-1 ${EVENTS_INPUT_CLASS.replace('w-full ', '')}${DISABLED}`}
                        />
                        <button
                            type="button"
                            onClick={onOpenMediaPicker}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                        >
                            <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        </button>
                    </div>
                </fieldset>

                {/* Atouts & points forts (tableau traduisible) */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Atouts inclus</label>
                    <div className="space-y-1.5 mb-2">
                        {(event.features || []).map((feat, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 text-xs text-white"
                            >
                                <span>{feat}</span>
                                <button
                                    type="button"
                                    disabled={isFieldReadOnly('features')}
                                    onClick={() => onRemoveFeature(idx)}
                                    className="text-gray-500 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ex: Matériel professionnel fourni..."
                            disabled={isFieldReadOnly('features')}
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onAddFeature();
                                }
                            }}
                            className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            disabled={isFieldReadOnly('features')}
                            onClick={onAddFeature}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Indication tarifaire</label>
                        <input
                            type="text"
                            disabled={isFieldReadOnly('price_indicator')}
                            value={event.price_indicator || ''}
                            onChange={(e) => onEventChange({ ...event, price_indicator: e.target.value })}
                            className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Texte bouton CTA</label>
                        <input
                            type="text"
                            disabled={isFieldReadOnly('cta_text')}
                            value={event.cta_text || ''}
                            onChange={(e) => onEventChange({ ...event, cta_text: e.target.value })}
                            className={`${EVENTS_INPUT_CLASS}${DISABLED}`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={
                            localeEditor.isEnglish && (localeEditor.saving || !localeEditor.ready)
                        }
                        className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {localeEditor.isEnglish
                            ? localeEditor.saving
                                ? 'Enregistrement…'
                                : 'Enregistrer EN'
                            : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default EventEditModal;
