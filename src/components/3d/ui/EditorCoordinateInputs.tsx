'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';
import { EditableFacilityItem } from '../types/campus3d.types';

interface EditorCoordinateInputsProps {
  selectedObjectId: string;
  selectedItem: EditableFacilityItem;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

export const EditorCoordinateInputs: React.FC<EditorCoordinateInputsProps> = ({
  selectedObjectId,
  selectedItem,
  onUpdateFacility,
}) => {
  return (
    <>
      {/* Position Coordinates X & Z with Direct Numerical Inputs */}
      <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#FFE500]">
          <span>POSITION (MÈTRES)</span>
          <span className="text-zinc-500">(Terrain: ±75m)</span>
        </div>

        {/* X Position */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ff3366]" />
              Axe X (Est / Ouest) :
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="-75"
                max="75"
                value={selectedItem.x}
                onChange={(e) => onUpdateFacility(selectedObjectId, { x: parseFloat(e.target.value) || 0 })}
                className="w-16 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#00e5ff] focus:outline-none"
              />
              <span className="text-zinc-500 text-[10px]">m</span>
            </div>
          </div>
          <input
            type="range"
            min="-75"
            max="75"
            step="0.5"
            value={selectedItem.x}
            onChange={(e) => onUpdateFacility(selectedObjectId, { x: parseFloat(e.target.value) })}
            className="w-full accent-[#ff3366] cursor-pointer"
          />
          <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
            {[-5, -1, -0.2, 0.2, 1, 5].map((delta) => (
              <button
                key={delta}
                onClick={() => onUpdateFacility(selectedObjectId, { x: Math.round((selectedItem.x + delta) * 10) / 10 })}
                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                {delta > 0 ? `+${delta}` : delta}m
              </button>
            ))}
          </div>
        </div>

        {/* Z Position */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00aaff]" />
              Axe Z (Nord / Sud) :
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min="-75"
                max="75"
                value={selectedItem.z}
                onChange={(e) => onUpdateFacility(selectedObjectId, { z: parseFloat(e.target.value) || 0 })}
                className="w-16 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#00e5ff] focus:outline-none"
              />
              <span className="text-zinc-500 text-[10px]">m</span>
            </div>
          </div>
          <input
            type="range"
            min="-75"
            max="75"
            step="0.5"
            value={selectedItem.z}
            onChange={(e) => onUpdateFacility(selectedObjectId, { z: parseFloat(e.target.value) })}
            className="w-full accent-[#00aaff] cursor-pointer"
          />
          <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
            {[-5, -1, -0.2, 0.2, 1, 5].map((delta) => (
              <button
                key={delta}
                onClick={() => onUpdateFacility(selectedObjectId, { z: Math.round((selectedItem.z + delta) * 10) / 10 })}
                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                {delta > 0 ? `+${delta}` : delta}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orientation & Scale */}
      <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="text-[10px] font-bold uppercase text-[#FFE500]">
          ORIENTATION & ÉCHELLE
        </div>

        {/* Rotation Y */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-[#FFE500]" />
              Rotation Y :
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="360"
                step="5"
                value={selectedItem.rotationY}
                onChange={(e) => onUpdateFacility(selectedObjectId, { rotationY: (parseInt(e.target.value, 10) || 0) % 360 })}
                className="w-16 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#FFE500] focus:outline-none"
              />
              <span className="text-zinc-500 text-[10px]">°</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={selectedItem.rotationY}
            onChange={(e) => onUpdateFacility(selectedObjectId, { rotationY: parseInt(e.target.value, 10) })}
            className="w-full accent-[#FFE500] cursor-pointer"
          />
          <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
            {[-90, -45, -15, 15, 45, 90].map((deg) => (
              <button
                key={deg}
                onClick={() => onUpdateFacility(selectedObjectId, { rotationY: (selectedItem.rotationY + deg + 360) % 360 })}
                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                {deg > 0 ? `+${deg}` : deg}°
              </button>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px]">Échelle globale :</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.05"
                min="0.2"
                max="3.0"
                value={selectedItem.scale}
                onChange={(e) => onUpdateFacility(selectedObjectId, { scale: parseFloat(e.target.value) || 1 })}
                className="w-16 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#FFE500] focus:outline-none"
              />
              <span className="text-zinc-500 text-[10px]">x</span>
            </div>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.05"
            value={selectedItem.scale}
            onChange={(e) => onUpdateFacility(selectedObjectId, { scale: parseFloat(e.target.value) })}
            className="w-full accent-[#FFE500] cursor-pointer"
          />
          <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
            <button
              onClick={() => onUpdateFacility(selectedObjectId, { scale: Math.max(0.2, Number((selectedItem.scale - 0.1).toFixed(2))) })}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            >
              -0.1x
            </button>
            <button
              onClick={() => onUpdateFacility(selectedObjectId, { scale: 1.0 })}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-[#FFE500] cursor-pointer"
            >
              1.0x (Standard)
            </button>
            <button
              onClick={() => onUpdateFacility(selectedObjectId, { scale: Math.min(3.0, Number((selectedItem.scale + 0.1).toFixed(2))) })}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            >
              +0.1x
            </button>
          </div>
        </div>

        {/* Height Scale */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-[11px]">Hauteur relative :</span>
            <span className="text-white font-bold">{selectedItem.heightScale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.05"
            value={selectedItem.heightScale}
            onChange={(e) => onUpdateFacility(selectedObjectId, { heightScale: parseFloat(e.target.value) })}
            className="w-full accent-[#FFE500] cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};
