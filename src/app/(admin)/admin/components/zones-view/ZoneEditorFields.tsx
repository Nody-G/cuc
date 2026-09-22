import React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { POI } from '@/components/ui/campus-map/campusMap.data';

export interface ZoneEditorFieldsProps {
    poi: POI;
    onChange: (patch: Partial<POI>) => void;
    onOpenMediaPicker: () => void;
}

const fieldClass =
    'w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold';

export const ZoneEditorFields: React.FC<ZoneEditorFieldsProps> = ({
    poi,
    onChange,
    onOpenMediaPicker,
}) => (
    <>
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Nom de l'Infrastructure / Spot
            </label>
            <input
                type="text"
                required
                value={poi.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="ex: Tour de Saut 21m"
                className={fieldClass}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Catégorie
                </label>
                <input
                    type="text"
                    required
                    value={poi.category}
                    onChange={(e) => onChange({ category: e.target.value })}
                    placeholder="Hauteur, Combat, Câbles..."
                    className={fieldClass}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Badge Affiché (Vitrine)
                </label>
                <input
                    type="text"
                    value={poi.badge}
                    onChange={(e) => onChange({ badge: e.target.value })}
                    placeholder="ex: HOMOLOGUÉ APAVE"
                    className={fieldClass}
                />
            </div>
        </div>

        {/* Visuel de la zone (Supabase Storage) */}
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Visuel de la Zone (Vitrine)
            </label>
            <div className="flex items-center gap-3">
                <div className="relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
                    {poi.image_url ? (
                        <Image
                            src={poi.image_url}
                            alt={poi.name || 'Visuel zone'}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                </div>
                <input
                    type="text"
                    value={poi.image_url || ''}
                    onChange={(e) => onChange({ image_url: e.target.value })}
                    placeholder="URL Supabase Storage ou chemin local"
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-cuc-gold"
                />
                <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-200 text-xs font-semibold hover:bg-zinc-800 transition shrink-0"
                >
                    Médiathèque
                </button>
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Description Détaillée
            </label>
            <textarea
                rows={3}
                required
                value={poi.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className={fieldClass}
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Spécifications Techniques & Homologations
            </label>
            <input
                type="text"
                required
                value={poi.specs}
                onChange={(e) => onChange({ specs: e.target.value })}
                placeholder="ex: Hauteur 21m • Paliers 5/8/12/16/21m • Poutre de largage"
                className={fieldClass}
            />
        </div>
    </>
);
