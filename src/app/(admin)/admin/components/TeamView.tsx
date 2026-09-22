'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Instructor, FilmCredit, Discipline } from '@/types';
import { MediaPickerModal } from './MediaPickerModal';
import { TeamMemberEditorModal } from './team-view/TeamMemberEditorModal';
import { TeamMembersGrid } from './team-view/TeamMembersGrid';
import { useTeamEditing } from './team-view/useTeamEditing';
import { useCreditModel } from './team-view/useCreditModel';
import { useCreditActions } from './team-view/useCreditActions';

interface TeamViewProps {
  team: Instructor[];
  setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
  films?: FilmCredit[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
}

/**
 * Cockpit — Gestion des formateurs (composition).
 *
 * Vue déclarative : l'état et les écritures vivent dans les hooks
 * `team-view/**` (orchestration), les dérivations de crédits dans
 * `useCreditModel`, le rendu des cartes dans `TeamMembersGrid` et l'édition
 * dans `TeamMemberEditorModal` (règle SRP `AGENTS.md` § 1-2).
 */
export const TeamView: React.FC<TeamViewProps> = ({
  team,
  setTeam,
  films = [],
  disciplines = [],
  showToast,
}) => {
  const {
    startTransition,
    editingMember,
    setEditingMember,
    showMediaPickerTeam,
    setShowMediaPickerTeam,
    handleSaveTeamMember,
    handleDeleteTeamMember,
  } = useTeamEditing({ setTeam, showToast });

  const credits = useCreditModel(editingMember, films);
  const creditActions = useCreditActions({
    editingMember,
    setEditingMember,
    creditIndex: credits.creditIndex,
    startTransition,
    showToast,
    newFilmDraft: credits.newFilmDraft,
    setNewFilmDraft: credits.setNewFilmDraft,
    setCreditSearch: credits.setCreditSearch,
  });

  /** Nouvelle fiche vierge, prête pour le modal d'édition. */
  const handleAddMember = () =>
    setEditingMember({
      id: `coach-${Date.now()}`,
      name: '',
      role: 'Coach & Intervenant',
      title: 'Formateur Spécialisé',
      specialties: ['Combat', 'Acrobatie'],
      bio: '',
      notableCredits: [],
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" /> Équipe & Instructeurs
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Gestion des Formateurs
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Mettez à jour les formateurs, leurs bios, spécialités et réseaux.
        </p>
      </div>

      <TeamMembersGrid
        team={team}
        films={films}
        disciplines={disciplines}
        onAdd={handleAddMember}
        onEdit={(member) => setEditingMember(member)}
        onDelete={handleDeleteTeamMember}
      />

      {/* Modal édition membre */}
      {editingMember && (
        <TeamMemberEditorModal
          member={editingMember}
          onMemberChange={(next) => setEditingMember(next)}
          onClose={() => setEditingMember(null)}
          onSubmit={handleSaveTeamMember}
          onOpenMediaPicker={() => setShowMediaPickerTeam(true)}
          credits={{
            selectedCount: credits.selectedCount,
            featuredCount: credits.featuredCount,
            search: credits.creditSearch,
            onSearchChange: credits.setCreditSearch,
            searchResults: credits.searchResults,
            creditIndex: credits.creditIndex,
            onToggleFilm: creditActions.toggleFilmCredit,
            onSetRole: creditActions.setCreditRole,
            newFilmDraft: credits.newFilmDraft,
            onNewFilmDraftChange: credits.setNewFilmDraft,
            onCreateFilmAndCredit: creditActions.createFilmAndCredit,
            catalogueItems: credits.catalogueFilms,
            onMoveFeatured: creditActions.moveFeatured,
            onToggleFeatured: creditActions.toggleFeatured,
            rows: credits.allCredits,
            sortedRows: credits.allCreditsSorted,
            sortMode: credits.creditSort,
            onSortModeChange: credits.setCreditSort,
            featuredSet: credits.featuredSet,
            featuredOrder: credits.featuredCreditsOrdered,
            onRemoveCredit: creditActions.removeCredit,
          }}
        />
      )}

      {/* MediaPicker pour l'avatar */}
      {showMediaPickerTeam && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setShowMediaPickerTeam(false)}
          onSelectUrl={(url) => {
            if (editingMember) {
              setEditingMember({ ...editingMember, avatarUrl: url });
            }
            setShowMediaPickerTeam(false);
          }}
        />
      )}
    </div>
  );
};
