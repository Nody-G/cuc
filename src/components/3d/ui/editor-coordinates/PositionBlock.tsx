'use client';

import React from 'react';
import { TRANSFORM_LIMITS } from '../../data/facilityTransform';
import type { EditableFacilityItem } from '../../types/campus3d.types';
import { AxisSlider } from './AxisSlider';
import { POSITION_AXES, POSITION_QUICK_STEPS } from './editor-coordinates.model';

interface PositionBlockProps {
    selectedObjectId: string;
    selectedItem: EditableFacilityItem;
    onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

/** Déplacement sur le plan du sol (X est/ouest, Z nord/sud). */
export const PositionBlock: React.FC<PositionBlockProps> = ({
    selectedObjectId,
    selectedItem,
    onUpdateFacility,
}) => (
    <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#FFE500]">
            <span>POSITION (MÈTRES)</span>
            <span className="text-zinc-500">±{TRANSFORM_LIMITS.position} m</span>
        </div>

        {POSITION_AXES.map((axis) => (
            <AxisSlider
                key={axis.key}
                label={axis.label}
                dotColor={axis.dotColor}
                accentClass={axis.accentClass}
                value={selectedItem[axis.key]}
                min={-TRANSFORM_LIMITS.position}
                max={TRANSFORM_LIMITS.position}
                step={0.1}
                quickSteps={POSITION_QUICK_STEPS}
                onChange={(value) =>
                    onUpdateFacility(
                        selectedObjectId,
                        axis.key === 'x' ? { x: value } : { z: value }
                    )
                }
            />
        ))}
    </div>
);
