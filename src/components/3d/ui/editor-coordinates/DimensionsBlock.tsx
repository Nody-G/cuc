'use client';

import React from 'react';
import { Link2, Link2Off, Ruler } from 'lucide-react';
import {
    TRANSFORM_LIMITS,
    getRealFootprintReference,
    scaleAxisPatch,
    scaleUniformPatch,
} from '../../data/facilityTransform';
import type { EditableFacilityItem } from '../../types/campus3d.types';
import { AxisSlider } from './AxisSlider';
import {
    SCALE_AXES,
    SCALE_QUICK_STEPS,
    formatMeters,
    formatScaleDelta,
} from './editor-coordinates.model';

interface DimensionsBlockProps {
    selectedObjectId: string;
    selectedItem: EditableFacilityItem;
    onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

/**
 * Dimensions du repère : facteurs d'échelle (liés ou libres) et rappel de
 * l'empreinte OpenStreetMap réelle. **Aucune dimension n'est inventée** : sans
 * empreinte mesurée, seuls les facteurs sont affichés.
 */
export const DimensionsBlock: React.FC<DimensionsBlockProps> = ({
    selectedObjectId,
    selectedItem,
    onUpdateFacility,
}) => {
    const footprint = getRealFootprintReference(selectedObjectId);

    const setScale = (axis: 'x' | 'y' | 'z', value: number) => {
        onUpdateFacility(selectedObjectId, scaleAxisPatch(selectedItem, axis, value));
    };

    return (
        <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase text-[#FFE500] flex items-center gap-1.5">
                    <Ruler className="w-3 h-3" />
                    DIMENSIONS (FACTEURS)
                </div>
                <button
                    onClick={() =>
                        onUpdateFacility(selectedObjectId, {
                            uniformScale: !selectedItem.uniformScale,
                        })
                    }
                    className={`flex items-center gap-1 px-2 py-0.5 border text-[10px] cursor-pointer ${selectedItem.uniformScale
                        ? 'bg-[#FFE500]/15 border-[#FFE500] text-[#FFE500]'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                    title={
                        selectedItem.uniformScale
                            ? 'Échelle liée : les trois axes varient ensemble'
                            : 'Échelle libre : chaque axe est indépendant'
                    }
                >
                    {selectedItem.uniformScale ? (
                        <Link2 className="w-3 h-3" />
                    ) : (
                        <Link2Off className="w-3 h-3" />
                    )}
                    <span>{selectedItem.uniformScale ? 'Liée' : 'Libre'}</span>
                </button>
            </div>

            {footprint ? (
                <div className="text-[9px] text-zinc-500 leading-snug bg-black/40 border border-zinc-800 px-2 py-1.5">
                    <div>
                        Empreinte OSM : {formatMeters(footprint.width)} ×{' '}
                        {formatMeters(footprint.depth)}
                    </div>
                    <div className="text-zinc-400">
                        Taille appliquée :{' '}
                        <span className="text-white font-bold">
                            {formatMeters(footprint.width * selectedItem.scaleX)} ×{' '}
                            {formatMeters(footprint.depth * selectedItem.scaleZ)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-[9px] text-zinc-500 bg-black/40 border border-zinc-800 px-2 py-1.5">
                    Repère sans empreinte réelle : aucune dimension de référence n'existe, seuls les
                    facteurs s'appliquent.
                </div>
            )}

            {SCALE_AXES.map((axis) => (
                <AxisSlider
                    key={axis.key}
                    label={axis.label}
                    dotColor={axis.dotColor}
                    accentClass={axis.accentClass}
                    value={selectedItem[axis.field]}
                    min={TRANSFORM_LIMITS.scale.min}
                    max={TRANSFORM_LIMITS.scale.max}
                    step={0.05}
                    decimals={2}
                    unit="x"
                    quickSteps={SCALE_QUICK_STEPS}
                    quickFormat={formatScaleDelta}
                    onChange={(value) => setScale(axis.key, value)}
                />
            ))}

            <button
                onClick={() => onUpdateFacility(selectedObjectId, scaleUniformPatch(1))}
                className="w-full py-1 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 text-[10px] cursor-pointer"
                title="Revenir à l'emprise réelle, sans agrandissement"
            >
                Échelle 1:1 (emprise réelle)
            </button>

            {!selectedItem.uniformScale && (
                <p className="text-[9px] text-zinc-500 leading-snug">
                    Une mise à l'échelle non uniforme éloigne la maquette de l'emprise réelle
                    mesurée sur le terrain.
                </p>
            )}
        </div>
    );
};
