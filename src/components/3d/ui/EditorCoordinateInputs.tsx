'use client';

import React from 'react';
import { Link2, Link2Off, Ruler } from 'lucide-react';
import { EditableFacilityItem } from '../types/campus3d.types';
import {
  TRANSFORM_LIMITS,
  getRealFootprintReference,
  scaleAxisPatch,
  scaleUniformPatch,
} from '../data/facilityTransform';

interface EditorCoordinateInputsProps {
  selectedObjectId: string;
  selectedItem: EditableFacilityItem;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

/** Formate une longueur en mètres, à la française, sans fausse précision. */
function formatMeters(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')} m`;
}

interface AxisSliderProps {
  label: string;
  dotColor: string;
  accentClass: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals?: number;
  unit?: string;
  quickSteps: number[];
  quickFormat?: (delta: number) => string;
  onChange: (value: number) => void;
}

const AxisSlider: React.FC<AxisSliderProps> = ({
  label,
  dotColor,
  accentClass,
  value,
  min,
  max,
  step,
  decimals = 1,
  unit = 'm',
  quickSteps,
  quickFormat,
  onChange,
}) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-zinc-400 text-[11px] flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
        {label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={Number(value.toFixed(decimals))}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
          className="w-20 bg-black border border-zinc-700 px-1.5 py-0.5 text-right text-white font-bold text-xs focus:border-[#00e5ff] focus:outline-none"
        />
        <span className="text-zinc-500 text-[10px] w-4">{unit}</span>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full cursor-pointer ${accentClass}`}
    />
    <div className="flex items-center justify-between gap-1 pt-1 text-[9px]">
      {quickSteps.map((delta) => (
        <button
          key={delta}
          onClick={() => onChange(Number((value + delta).toFixed(decimals + 1)))}
          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
        >
          {quickFormat ? quickFormat(delta) : delta > 0 ? `+${delta}` : delta}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Bloc « Position / Orientation / Dimensions » du studio 3D.
 *
 * Périmètre : déplacer sur le plan du sol, tourner autour de l'axe vertical,
 * redimensionner. Les valeurs de référence affichées proviennent uniquement de
 * l'empreinte OpenStreetMap réelle (`realFacilities.ts`) : aucune dimension
 * n'est inventée. OSM ne fournit aucune hauteur, donc seule la **largeur** et
 * la **profondeur** sont exprimées en mètres — la hauteur reste un facteur.
 */
export const EditorCoordinateInputs: React.FC<EditorCoordinateInputsProps> = ({
  selectedObjectId,
  selectedItem,
  onUpdateFacility,
}) => {
  const footprint = getRealFootprintReference(selectedObjectId);

  const setScale = (axis: 'x' | 'y' | 'z', value: number) => {
    onUpdateFacility(selectedObjectId, scaleAxisPatch(selectedItem, axis, value));
  };

  return (
    <>
      {/* ---------------- Position ---------------- */}
      <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#FFE500]">
          <span>POSITION (MÈTRES)</span>
          <span className="text-zinc-500">±{TRANSFORM_LIMITS.position} m</span>
        </div>

        <AxisSlider
          label="Axe X (Est / Ouest)"
          dotColor="#ff3366"
          accentClass="accent-[#ff3366]"
          value={selectedItem.x}
          min={-TRANSFORM_LIMITS.position}
          max={TRANSFORM_LIMITS.position}
          step={0.1}
          quickSteps={[-5, -1, -0.2, 0.2, 1, 5]}
          onChange={(value) => onUpdateFacility(selectedObjectId, { x: value })}
        />

        <AxisSlider
          label="Axe Z (Nord / Sud)"
          dotColor="#00aaff"
          accentClass="accent-[#00aaff]"
          value={selectedItem.z}
          min={-TRANSFORM_LIMITS.position}
          max={TRANSFORM_LIMITS.position}
          step={0.1}
          quickSteps={[-5, -1, -0.2, 0.2, 1, 5]}
          onChange={(value) => onUpdateFacility(selectedObjectId, { z: value })}
        />
      </div>

      {/* ---------------- Orientation ---------------- */}
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
          quickSteps={[-90, -45, -15, 15, 45, 90]}
          quickFormat={(delta) => (delta > 0 ? `+${delta}°` : `${delta}°`)}
          onChange={(value) =>
            onUpdateFacility(selectedObjectId, {
              rotationY: ((value % 360) + 360) % 360,
            })
          }
        />
      </div>

      {/* ---------------- Dimensions ---------------- */}
      <div className="bg-[#12131b] border border-zinc-800 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase text-[#FFE500] flex items-center gap-1.5">
            <Ruler className="w-3 h-3" />
            DIMENSIONS (FACTEURS)
          </div>
          <button
            onClick={() =>
              onUpdateFacility(selectedObjectId, { uniformScale: !selectedItem.uniformScale })
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
            {selectedItem.uniformScale ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
            <span>{selectedItem.uniformScale ? 'Liée' : 'Libre'}</span>
          </button>
        </div>

        {footprint ? (
          <div className="text-[9px] text-zinc-500 leading-snug bg-black/40 border border-zinc-800 px-2 py-1.5">
            <div>
              Empreinte OSM : {formatMeters(footprint.width)} × {formatMeters(footprint.depth)}
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

        <AxisSlider
          label="Largeur (X)"
          dotColor="#ff3366"
          accentClass="accent-[#ff3366]"
          value={selectedItem.scaleX}
          min={TRANSFORM_LIMITS.scale.min}
          max={TRANSFORM_LIMITS.scale.max}
          step={0.05}
          decimals={2}
          unit="x"
          quickSteps={[-0.5, -0.1, -0.05, 0.05, 0.1, 0.5]}
          quickFormat={(delta) => (delta > 0 ? `+${delta}x` : `${delta}x`)}
          onChange={(value) => setScale('x', value)}
        />

        <AxisSlider
          label="Hauteur (Y)"
          dotColor="#36d399"
          accentClass="accent-[#36d399]"
          value={selectedItem.scaleY}
          min={TRANSFORM_LIMITS.scale.min}
          max={TRANSFORM_LIMITS.scale.max}
          step={0.05}
          decimals={2}
          unit="x"
          quickSteps={[-0.5, -0.1, -0.05, 0.05, 0.1, 0.5]}
          quickFormat={(delta) => (delta > 0 ? `+${delta}x` : `${delta}x`)}
          onChange={(value) => setScale('y', value)}
        />

        <AxisSlider
          label="Profondeur (Z)"
          dotColor="#00aaff"
          accentClass="accent-[#00aaff]"
          value={selectedItem.scaleZ}
          min={TRANSFORM_LIMITS.scale.min}
          max={TRANSFORM_LIMITS.scale.max}
          step={0.05}
          decimals={2}
          unit="x"
          quickSteps={[-0.5, -0.1, -0.05, 0.05, 0.1, 0.5]}
          quickFormat={(delta) => (delta > 0 ? `+${delta}x` : `${delta}x`)}
          onChange={(value) => setScale('z', value)}
        />

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
    </>
  );
};
