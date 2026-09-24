'use client';

import React from 'react';
import { EditableFacilityItem } from '../types/campus3d.types';
import { DimensionsBlock } from './editor-coordinates/DimensionsBlock';
import { OrientationBlock } from './editor-coordinates/OrientationBlock';
import { PositionBlock } from './editor-coordinates/PositionBlock';

interface EditorCoordinateInputsProps {
  selectedObjectId: string;
  selectedItem: EditableFacilityItem;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
}

/**
 * Bloc « Position / Orientation / Dimensions » du studio 3D — **façade de
 * composition** ; chaque section vit dans `editor-coordinates/` avec son
 * domaine (`editor-coordinates.model.ts`) et son curseur partagé (`AxisSlider`).
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
}) => (
  <>
    <PositionBlock
      selectedObjectId={selectedObjectId}
      selectedItem={selectedItem}
      onUpdateFacility={onUpdateFacility}
    />
    <OrientationBlock
      selectedObjectId={selectedObjectId}
      selectedItem={selectedItem}
      onUpdateFacility={onUpdateFacility}
    />
    <DimensionsBlock
      selectedObjectId={selectedObjectId}
      selectedItem={selectedItem}
      onUpdateFacility={onUpdateFacility}
    />
  </>
);
