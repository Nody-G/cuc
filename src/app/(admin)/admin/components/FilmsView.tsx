'use client';

import React from 'react';
import { FilmCredit, Instructor, Discipline } from '@/types';
import { MediaPickerModal } from './MediaPickerModal';
import { CockpitLoadMore } from './ui';
import { FilmCategoryChips } from './films-view/FilmCategoryChips';
import { FilmEditorModal } from './films-view/FilmEditorModal';
import { FilmGrid } from './films-view/FilmGrid';
import { FilmsHeader } from './films-view/FilmsHeader';
import { useFilmEditor } from './films-view/useFilmEditor';
import { useFilmFilters } from './films-view/useFilmFilters';

interface FilmsViewProps {
  films: FilmCredit[];
  setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
  team?: Instructor[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
}

/**
 * Filmographie CUC — façade de composition (`AGENTS.md` § 1).
 *
 * Édition dans `useFilmEditor` (fiche en cours, enregistrement optimiste,
 * intervenants CUC avec rôles, affiche), état de vue dans `useFilmFilters`
 * (recherche, catégorie, rendu progressif) ; le rendu est réparti dans
 * `films-view/**`.
 */
export const FilmsView: React.FC<FilmsViewProps> = ({
  films,
  setFilms,
  team = [],
  disciplines = [],
  showToast,
}) => {
  const editor = useFilmEditor({ setFilms, showToast });
  const filters = useFilmFilters(films);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <FilmsHeader
        count={films.length}
        filteredCount={filters.filteredFilms.length}
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        onCreate={editor.openCreate}
      />

      <FilmCategoryChips
        categoryFilter={filters.categoryFilter}
        onCategoryChange={filters.setCategoryFilter}
      />

      <FilmGrid
        films={filters.visibleFilms}
        team={team}
        disciplines={disciplines}
        onEdit={editor.openEdit}
        onDelete={editor.remove}
      />

      <CockpitLoadMore
        visibleCount={filters.visibleFilmCount}
        total={filters.totalFilms}
        onLoadMore={filters.loadMoreFilms}
        label="Afficher plus de projets"
      />

      {/* Modal édition film */}
      {editor.editingFilm && (
        <FilmEditorModal
          film={editor.editingFilm}
          team={team}
          onChange={editor.patchEditing}
          onToggleMember={editor.toggleTeamMember}
          onRoleChange={editor.setMemberRole}
          onOpenMediaPicker={editor.openMediaPicker}
          onClose={editor.closeEditor}
          onSubmit={editor.handleSave}
        />
      )}

      {/* MediaPicker pour l'affiche */}
      {editor.showMediaPicker && (
        <MediaPickerModal
          isOpen={true}
          onClose={editor.closeMediaPicker}
          onSelectUrl={(url) => editor.applyPoster(url)}
        />
      )}
    </div>
  );
};
