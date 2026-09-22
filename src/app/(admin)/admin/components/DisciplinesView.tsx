'use client';

import React from 'react';
import { Discipline, Instructor, FilmCredit, StuntProgram } from '@/types';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { MediaPickerModal } from './MediaPickerModal';
import { CockpitLoadMore } from './ui';
import { DisciplineEditorModal } from './disciplines-view/DisciplineEditorModal';
import { DisciplineFiltersBar } from './disciplines-view/DisciplineFiltersBar';
import { DisciplineGrid } from './disciplines-view/DisciplineGrid';
import { DisciplinesHeader } from './disciplines-view/DisciplinesHeader';
import { useDisciplineEditor } from './disciplines-view/useDisciplineEditor';
import { useDisciplineFilters } from './disciplines-view/useDisciplineFilters';

interface DisciplinesViewProps {
  disciplines: Discipline[];
  setDisciplines: React.Dispatch<React.SetStateAction<Discipline[]>>;
  team: Instructor[];
  campusPOIs: POI[];
  films: FilmCredit[];
  programs: StuntProgram[];
  showToast: (msg: string) => void;
}

/**
 * Modules & Disciplines de Cascade — façade de composition (`AGENTS.md` § 1).
 *
 * Édition dans `useDisciplineEditor` (fiche en cours, enregistrement optimiste,
 * liaisons croisées, image), état de vue dans `useDisciplineFilters` (niveau,
 * recherche, rendu progressif) ; le rendu est réparti dans `disciplines-view/**`.
 */
export const DisciplinesView: React.FC<DisciplinesViewProps> = ({
  disciplines,
  setDisciplines,
  team,
  campusPOIs,
  films,
  programs,
  showToast,
}) => {
  const editor = useDisciplineEditor({ disciplines, setDisciplines, showToast });
  const filters = useDisciplineFilters(disciplines);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <DisciplinesHeader count={disciplines.length} onCreate={editor.openCreate} />

      <DisciplineFiltersBar
        filterLevel={filters.filterLevel}
        onFilterChange={filters.setFilterLevel}
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
      />

      <DisciplineGrid
        disciplines={filters.visibleDisciplines}
        campusPOIs={campusPOIs}
        team={team}
        films={films}
        programs={programs}
        onEdit={editor.openEdit}
        onDelete={editor.handleDelete}
      />

      <CockpitLoadMore
        visibleCount={filters.visibleDisciplineCount}
        total={filters.totalDisciplines}
        onLoadMore={filters.loadMoreDisciplines}
        label="Afficher plus de modules"
      />

      {/* Modal d'édition / création ultra-complète */}
      {editor.editingDiscipline && (
        <DisciplineEditorModal
          discipline={editor.editingDiscipline}
          campusPOIs={campusPOIs}
          team={team}
          films={films}
          programs={programs}
          onChange={editor.patchEditing}
          onToggleLink={editor.toggleArrayItem}
          onOpenMediaPicker={editor.openMediaPicker}
          onClose={editor.closeEditor}
          onSubmit={editor.handleSave}
        />
      )}

      {/* Modal Médiathèque */}
      <MediaPickerModal
        isOpen={editor.showMediaPicker}
        onClose={editor.closeMediaPicker}
        onSelectUrl={(url: string) => editor.applyHeroImage(url)}
      />
    </div>
  );
};
