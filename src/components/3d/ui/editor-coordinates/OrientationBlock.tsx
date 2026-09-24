'use client';

import React from 'react';
import type { EditableFacilityItem } from '../../types/campus3d.types';
import { AxisSlider } from './AxisSlider';
import { ORIENTATION_QUICK_STEPS, formatDegreesDelta } from './editor-coordinates.model';

interface OrientationBlockProps {
    selectedObjectId: string;
    selectedItem: EditableFacilityItem;
    onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

/** Rotation autour de l'axe vertical (lacet), normalisée dans [0, 360[. */
export const OrientationBlock: React.FC<OrientationBlockProps> = ({
    selectedObjectId,
    selectedItem,
    onUpdateFacility,
}) => (
    <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#FFE500]">
            <span>ORIENTATION</span>
            <button
                onClick={() => onUpdateFacility(selectedObjectId, { rotationY: 0 })}
                className="text-[9px] text-[#00e5ff] hover:underline cursor-pointer"
                title="Aligner l'orientation sur l'axe nord-sud"
            >
                Remettre à 0°
            </button>
        </div>

        <AxisSlider
            label="Lacet Y (orientation)"
            dotColor="#FFE500"
            accentClass="accent-[#FFE500]"
            value={selectedItem.rotationY}
            min={0}
            max={360}
            step={1}
            decimals={0}
            unit="°"
            quickSteps={ORIENTATION_QUICK_STEPS}
            quickFormat={formatDegreesDelta}
            onChange={(value) =>
                onUpdateFacility(selectedObjectId, {
                    rotationY: ((value % 360) + 360) % 360,
                })
            }
        />
    </div>
);
