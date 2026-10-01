import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import type { EditorLocaleOption } from '../ui';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { ZoneEditorFields } from './ZoneEditorFields';
import { ZoneSignSection } from './ZoneSignSection';
import { ZoneGeoSection } from './ZoneGeoSection';
import { ZoneStatusToggle } from './ZoneStatusToggle';

export interface ZoneEditorModalProps {
    /** Zone active : français en FR, contenu localisé en EN. */
    poi: POI;
    /** Patch des champs traduisibles. */
    onChange: (patch: Partial<POI>) => void;
    /** Zone source française : visuel, géo, signalétique, statut. */
    sourcePoi: POI;
    /** Patch des champs techniques (source FR). */
    onSourceChange: (patch: Partial<POI>) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onOpenMediaPicker: () => void;
    /** État bilingue : barre FR | EN et verrous de champs. */
    localeEditor: EntityEditorLocale<POI>;
    onLocaleChange: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
}

/**
 * Modale d'édition d'une zone du campus. En anglais, seuls les textes de
 * l'allow-list (`ZONE_CODEC`) restent éditables ; visuel, géolocalisation,
 * signalétique CUC Sign et statut de publication basculent en lecture seule.
 */
export const ZoneEditorModal: React.FC<ZoneEditorModalProps> = ({
    poi,
    onChange,
    sourcePoi,
    onSourceChange,
    onClose,
    onSubmit,
    onOpenMediaPicker,
    localeEditor,
    onLocaleChange,
    isFieldReadOnly,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">
                        {poi.name || 'Nouvelle Zone du Campus'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Bascule FR | EN : la traduction s'édite dans le même formulaire. */}
                <EntityLocaleBar
                    entityLabel={poi.name || 'Nouvelle zone'}
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
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <ZoneEditorFields
                    poi={poi}
                    onChange={onChange}
                    sourcePoi={sourcePoi}
                    onSourceChange={onSourceChange}
                    onOpenMediaPicker={onOpenMediaPicker}
                    isFieldReadOnly={isFieldReadOnly}
                />

                {/* Signalétique, géo et statut : techniques, verrouillés en anglais. */}
                <fieldset disabled={localeEditor.isEnglish} className="m-0 min-w-0 space-y-4 border-0 p-0">
                    <ZoneSignSection poi={sourcePoi} onChange={onSourceChange} />
                    <ZoneGeoSection poi={sourcePoi} onChange={onSourceChange} />
                    <ZoneStatusToggle poi={sourcePoi} onChange={onSourceChange} />
                </fieldset>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={
                            localeEditor.isEnglish && (localeEditor.saving || !localeEditor.ready)
                        }
                        className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
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

export default ZoneEditorModal;
