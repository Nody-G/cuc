import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { ZoneEditorFields } from './ZoneEditorFields';
import { ZoneSignSection } from './ZoneSignSection';
import { ZoneGeoSection } from './ZoneGeoSection';
import { ZoneStatusToggle } from './ZoneStatusToggle';

export interface ZoneEditorModalProps {
    poi: POI;
    onChange: (patch: Partial<POI>) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onOpenMediaPicker: () => void;
}

export const ZoneEditorModal: React.FC<ZoneEditorModalProps> = ({
    poi,
    onChange,
    onClose,
    onSubmit,
    onOpenMediaPicker,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
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

            <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <ZoneEditorFields poi={poi} onChange={onChange} onOpenMediaPicker={onOpenMediaPicker} />
                <ZoneSignSection poi={poi} onChange={onChange} />
                <ZoneGeoSection poi={poi} onChange={onChange} />
                <ZoneStatusToggle poi={poi} onChange={onChange} />

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
                        className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
);
