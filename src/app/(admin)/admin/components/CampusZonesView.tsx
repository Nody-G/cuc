'use client';

import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { Discipline } from '@/types';
import { MediaPickerModal } from './MediaPickerModal';
import { useCampusZoneEditor } from './zones-view/useCampusZoneEditor';
import { useCampusZoneFilters } from './zones-view/useCampusZoneFilters';
import { ZonesHeader } from './zones-view/ZonesHeader';
import { ZoneRadarPreview } from './zones-view/ZoneRadarPreview';
import { ZoneCategoryFilters } from './zones-view/ZoneCategoryFilters';
import { ZoneGrid } from './zones-view/ZoneGrid';
import { ZoneEditorModal } from './zones-view/ZoneEditorModal';

interface CampusZonesViewProps {
  campusPOIs: POI[];
  setCampusPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
  disciplines: Discipline[];
  showToast: (msg: string) => void;
}

export const CampusZonesView: React.FC<CampusZonesViewProps> = ({
  campusPOIs,
  setCampusPOIs,
  disciplines,
  showToast,
}) => {
  const filters = useCampusZoneFilters(campusPOIs);
  const editor = useCampusZoneEditor({ campusPOIs, setCampusPOIs, showToast });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <ZonesHeader zoneCount={campusPOIs.length} onAddZone={editor.openNewZone} />

      <ZoneRadarPreview pois={campusPOIs} onEditPoi={editor.openEditor} />

      <ZoneCategoryFilters
        categories={filters.categories}
        selectedCategory={filters.selectedCategory}
        totalCount={campusPOIs.length}
        onSelectCategory={filters.setSelectedCategory}
      />

      <ZoneGrid
        pois={filters.filteredPOIs}
        disciplines={disciplines}
        onEditPoi={editor.openEditor}
        onDeletePoi={editor.handleDelete}
      />

      {editor.editingPOI && (
        <ZoneEditorModal
          poi={editor.editingPOI}
          onChange={editor.updateDraft}
          onClose={editor.closeEditor}
          onSubmit={editor.handleSave}
          onOpenMediaPicker={editor.openMediaPicker}
        />
      )}

      <MediaPickerModal
        isOpen={editor.showMediaPicker}
        onClose={editor.closeMediaPicker}
        onSelectUrl={editor.handleMediaSelect}
        title="Sélectionner le visuel de la zone"
      />
    </div>
  );
};
