'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { InstagramLogo, ImdbLogo } from '@/components/ui/BrandLogos';
import { Instructor } from '@/types';
import { upsertTeamMember, deleteTeamMember } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface TeamViewProps {
  team: Instructor[];
  setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
  showToast: (msg: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  team,
  setTeam,
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [editingMember, setEditingMember] = useState<Instructor | null>(null);
  const [showMediaPickerTeam, setShowMediaPickerTeam] = useState(false);

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated: Instructor = {
      ...editingMember,
      specialties: Array.isArray(editingMember.specialties)
        ? editingMember.specialties
        : typeof (editingMember as any).specialties === 'string'
        ? (editingMember as any).specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      doubledActors: Array.isArray(editingMember.doubledActors)
        ? editingMember.doubledActors
        : typeof (editingMember as any).doubledActors === 'string'
        ? (editingMember as any).doubledActors.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      notableCredits: Array.isArray(editingMember.notableCredits)
        ? editingMember.notableCredits
        : typeof (editingMember as any).notableCredits === 'string'
        ? (editingMember as any).notableCredits.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    };

    setTeam((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      if (exists) return prev.map((m) => (m.id === updated.id ? updated : m));
      return [...prev, updated];
    });
    setEditingMember(null);
    showToast(`Formateur "${updated.name}" enregistré.`);

    startTransition(async () => {
      await upsertTeamMember({
        id: updated.id,
        name: updated.name,
        role: updated.role,
        title: updated.title,
        avatar_url: updated.avatarUrl,
        bio: updated.bio,
        specialties: updated.specialties,
        doubled_actors: updated.doubledActors,
        notable_credits: updated.notableCredits,
        instagram: updated.instagram,
        imdb: updated.imdb,
        external_url: updated.externalUrl,
      });
    });
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le formateur "${name}" ?`)) return;

    setTeam((prev) => prev.filter((m) => m.id !== id));
    showToast(`Formateur "${name}" supprimé.`);

    startTransition(async () => {
      await deleteTeamMember(id);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" /> Équipe &amp; Instructeurs
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Gestion des Formateurs
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Mettez à jour les formateurs, leurs bios, spécialités et réseaux.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs font-mono text-gray-400">{team.length} FORMATEURS</div>
        <button
          onClick={() =>
            setEditingMember({
              id: `coach-${Date.now()}`,
              name: '',
              role: 'Coach & Intervenant',
              title: 'Formateur Spécialisé',
              specialties: ['Combat', 'Acrobatie'],
              bio: '',
              notableCredits: [],
            })
          }
          className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
        >
          <Plus className="w-4 h-4" />
          Ajouter un formateur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                    CUC
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">{member.name}</div>
                <div className="text-xs text-[#FFE500] font-medium truncate">{member.role}</div>
                <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.title}</div>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>

            {member.specialties && member.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {member.specialties.slice(0, 4).map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-400">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Instagram"
                  >
                    <InstagramLogo className="w-4 h-4" />
                  </a>
                )}
                {member.imdb && (
                  <a
                    href={member.imdb}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Fiche IMDb"
                  >
                    <ImdbLogo className="w-5 h-3.5" />
                  </a>
                )}
                {member.externalUrl && (
                  <a
                    href={member.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Site officiel / Portfolio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingMember(member)}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteTeamMember(member.id, member.name)}
                  title="Supprimer le formateur"
                  className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal édition membre */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingMember.name ? `Modifier : ${editingMember.name}` : 'Nouveau formateur'}
            </h3>
            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Rôle</label>
                  <input
                    type="text"
                    required
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Titre &amp; Spécialisation</label>
                <input
                  type="text"
                  required
                  value={editingMember.title}
                  onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">URL Photo / Avatar</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/images/... ou https://..."
                    value={editingMember.avatarUrl || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaPickerTeam(true)}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                    title="Choisir dans la médiathèque"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Spécialités (séparées par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="ex: Combat, Action Design, Chutes, Torches"
                  value={
                    Array.isArray(editingMember.specialties)
                      ? editingMember.specialties.join(', ')
                      : (editingMember as any).specialties || ''
                  }
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Comédiens doublés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="ex: Tomer Sisley, Pierre Niney, Keanu Reeves"
                  value={
                    Array.isArray(editingMember.doubledActors)
                      ? editingMember.doubledActors.join(', ')
                      : (editingMember as any).doubledActors || ''
                  }
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      doubledActors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Biographie</label>
                <textarea
                  rows={3}
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={editingMember.instagram || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, instagram: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                  <input
                    type="text"
                    placeholder="https://imdb.com/name/..."
                    value={editingMember.imdb || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, imdb: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
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
