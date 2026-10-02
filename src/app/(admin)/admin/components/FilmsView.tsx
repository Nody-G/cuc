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
import { usePendingFilmOpen } from './films-view/usePendingFilmOpen';

interface FilmsViewProps {
  films: FilmCredit[];
  setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
  team?: Instructor[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
  /** Film à ouvrir automatiquement (bouton « Corriger » du Diagnostic). */
  initialFilmId?: string | null;
  /** Signale que la demande d'ouverture a été consommée. */
  onInitialFilmHandled?: () => void;
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
  initialFilmId = null,
  onInitialFilmHandled,
}) => {
  const editor = useFilmEditor({ setFilms, showToast });
  const filters = useFilmFilters(films);

  /**
   * Ouverture différée demandée par un autre onglet (Diagnostic → « Corriger »).
   * Consommée une seule fois ; sans callback, la demande reste inerte.
   */
  usePendingFilmOpen({
    films,
    pendingFilmId: initialFilmId,
    openEdit: editor.openEdit,
    onHandled: onInitialFilmHandled ?? (() => { }),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <FilmsHeader
        count={films.length}
        filteredCount={filters.filteredFilms.length}
        preset={filters.preset}
        onPresetChange={filters.setPreset}
        counts={filters.counts}
        team={team}
        selectedCoachId={filters.selectedCoachId}
        onCoachChange={filters.setSelectedCoachId}
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
          film={editor.activeFilm}
          team={team}
          onChange={editor.patchActive}
          onToggleMember={editor.toggleTeamMember}
          onRoleChange={editor.setMemberRole}
          onOpenMediaPicker={editor.openMediaPicker}
          localeEditor={editor.locale}
          onLocaleChange={editor.changeLocale}
          isFieldReadOnly={editor.isFieldReadOnly}
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
