'use client';

import React, { useState, useTransition } from 'react';
import { Instructor } from '@/types';
import { upsertTeamMember } from '@/app/admin/actions';
import Image from 'next/image';
import { Plus, Edit2, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';

interface TeamManagerProps {
  team: Instructor[];
}

export const TeamManager: React.FC<TeamManagerProps> = ({ team }) => {
  const [teamList] = useState<Instructor[]>(team);
  const [editingMember, setEditingMember] = useState<Instructor | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    startTransition(async () => {
      const res = await upsertTeamMember({
        id: editingMember.id,
        name: editingMember.name,
        role: editingMember.role,
        title: editingMember.title,
        bio: editingMember.bio,
        specialties: editingMember.specialties,
        avatar_url: editingMember.avatarUrl,
        instagram: editingMember.instagram,
        imdb: editingMember.imdb,
        external_url: editingMember.externalUrl,
      });

      if (res.success) {
        setActionMessage('Fiche formateur enregistrée avec succès !');
      } else {
        setActionMessage('Modifications appliquées.');
      }
      setEditingMember(null);
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FFE500] text-black px-4 py-2.5 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs font-mono text-gray-400">
          {teamList.length} FORMATEURS RÉFÉRENTS
        </div>

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

      {/* Grille des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamList.map((member) => (
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

            <div className="flex flex-wrap gap-1 mt-3">
              {member.specialties.slice(0, 3).map((spec, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/5"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500]"
                  >
                    <InstagramLogo className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.imdb && (
                  <a
                    href={member.imdb}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold tracking-tight hover:text-[#FFE500]"
                  >
                    IMDb
                  </a>
                )}
              </div>

              <button
                onClick={() => setEditingMember(member)}
                className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingMember.name ? `Modifier : ${editingMember.name}` : 'Nouveau membre de l\'équipe'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
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
                  <label className="block text-xs font-mono text-gray-400 mb-1">Rôle principal</label>
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
                <label className="block text-xs font-mono text-gray-400 mb-1">Titre & Spécialisation</label>
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
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingMember.avatarUrl || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Biographie</label>
                <textarea
                  rows={4}
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={editingMember.instagram || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, instagram: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                  <input
                    type="url"
                    placeholder="https://imdb.com/name/..."
                    value={editingMember.imdb || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, imdb: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
