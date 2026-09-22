'use client';

import React from 'react';
import { Save, Trash2, Image as ImageIcon } from 'lucide-react';
import type { SiteEvent } from '@/lib/data/site-service';
import { EVENTS_INPUT_CLASS } from './events-form';

interface EventEditModalProps {
    editingEvent: SiteEvent;
    setEditingEvent: React.Dispatch<React.SetStateAction<SiteEvent | null>>;
    featureInput: string;
    setFeatureInput: React.Dispatch<React.SetStateAction<string>>;
    onSave: (e: React.FormEvent) => void;
    onClose: () => void;
    onAddFeature: () => void;
    onRemoveFeature: (index: number) => void;
    onOpenMediaPicker: () => void;
}

/** Modale d'édition d'une prestation (formulaire complet + atouts). */
export const EventEditModal: React.FC<EventEditModalProps> = ({
    editingEvent,
    setEditingEvent,
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
                {editingEvent.title ? `Modifier : ${editingEvent.title}` : 'Nouvelle offre'}
            </h3>

            <form onSubmit={onSave} className="space-y-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Titre de la prestation</label>
                    <input
                        type="text"
                        required
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className={EVENTS_INPUT_CLASS}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Sous-titre court</label>
                        <input
                            type="text"
                            value={editingEvent.subtitle || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                            className={EVENTS_INPUT_CLASS}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Badge</label>
                        <input
                            type="text"
                            value={editingEvent.badge || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, badge: e.target.value })}
                            className={EVENTS_INPUT_CLASS}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Description commerciale</label>
                    <textarea
                        rows={3}
                        required
                        value={editingEvent.description || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                        className={EVENTS_INPUT_CLASS}
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">URL Image</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="/images/... ou https://..."
                            value={editingEvent.image_url || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                            className={`flex-1 ${EVENTS_INPUT_CLASS.replace('w-full ', '')}`}
                        />
                        <button
                            type="button"
                            onClick={onOpenMediaPicker}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                        >
                            <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        </button>
                    </div>
                </div>

                {/* Atouts & points forts */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Atouts inclus</label>
                    <div className="space-y-1.5 mb-2">
                        {(editingEvent.features || []).map((feat, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 text-xs text-white"
                            >
                                <span>{feat}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveFeature(idx)}
                                    className="text-gray-500 hover:text-red-400"
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
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onAddFeature();
                                }
                            }}
                            className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <button
                            type="button"
                            onClick={onAddFeature}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
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
                            value={editingEvent.price_indicator || ''}
                            onChange={(e) =>
                                setEditingEvent({ ...editingEvent, price_indicator: e.target.value })
                            }
                            className={EVENTS_INPUT_CLASS}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Texte bouton CTA</label>
                        <input
                            type="text"
                            value={editingEvent.cta_text || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, cta_text: e.target.value })}
                            className={EVENTS_INPUT_CLASS}
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
                        className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
);
