'use client';

import React from 'react';
import { Layers, Image as ImageIcon } from 'lucide-react';
import type { Instructor } from '@/types';

export interface TeamMemberIdentityFieldsProps {
    member: Instructor;
    onMemberChange: (next: Instructor) => void;
    /** Ouvre la médiathèque pour choisir l'avatar. */
    onOpenMediaPicker: () => void;
}

/**
 * Modal d'édition d'un formateur — colonne gauche « Identité & Profil ».
 *
 * Composant de présentation : chaque champ remonte la fiche complète via
 * `onMemberChange` (aucun état local, aucun accès réseau).
 */
export const TeamMemberIdentityFields: React.FC<TeamMemberIdentityFieldsProps> = ({
    member,
    onMemberChange,
    onOpenMediaPicker,
}) => (
    <div className="space-y-4">
        <div className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider font-bold">
            Identité & Profil
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nom complet</label>
                <input
                    type="text"
                    required
                    value={member.name}
                    onChange={(e) => onMemberChange({ ...member, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rôle</label>
                <input
                    type="text"
                    required
                    value={member.role}
                    onChange={(e) => onMemberChange({ ...member, role: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Titre & Spécialisation</label>
            <input
                type="text"
                required
                value={member.title}
                onChange={(e) => onMemberChange({ ...member, title: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">URL Photo / Avatar</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="/images/... ou https://..."
                    value={member.avatarUrl || ''}
                    onChange={(e) => onMemberChange({ ...member, avatarUrl: e.target.value })}
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
                <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                    title="Choisir dans la médiathèque"
                >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                </button>
            </div>
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
                Domaines d'expertise & Disciplines enseignées (séparés par des virgules)
            </label>
            <input
                type="text"
                placeholder="ex: Combat, Action Design, Chutes, Torches"
                value={
                    Array.isArray(member.specialties)
                        ? member.specialties.join(', ')
                        : (member as any).specialties || ''
                }
                onChange={(e) =>
                    onMemberChange({
                        ...member,
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
                    Array.isArray(member.doubledActors)
                        ? member.doubledActors.join(', ')
                        : (member as any).doubledActors || ''
                }
                onChange={(e) =>
                    onMemberChange({
                        ...member,
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
                value={member.bio}
                onChange={(e) => onMemberChange({ ...member, bio: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Instagram URL</label>
                <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={member.instagram || ''}
                    onChange={(e) => onMemberChange({ ...member, instagram: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                <input
                    type="text"
                    placeholder="https://imdb.com/name/..."
                    value={member.imdb || ''}
                    onChange={(e) => onMemberChange({ ...member, imdb: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
        </div>

        {/* Interconnexions : CUC Sign & Disciplines */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Interconnexions Cockpit & CUC Sign
                </div>
                {member.profile_id && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Compte Lié
                    </span>
                )}
            </div>

            {/* Liaison CUC Sign */}
            <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                    Lier à un compte formateur CUC Sign (Supabase) :
                </label>
                <select
                    value={member.profile_id || ''}
                    onChange={(e) =>
                        onMemberChange({
                            ...member,
                            profile_id: e.target.value || undefined,
                        })
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                >
                    <option value="">-- Aucun compte CUC Sign lié --</option>
                    <option value="92d46b8f-866e-4474-9825-58207293a618">Lucas DOLLFUS (cuc@cuc.fr)</option>
                    <option value="7cf41cec-1f89-48c3-9e42-968cb9054994">Malik DIOUF (cuc2@cuc.fr)</option>
                    <option value="4ef3188e-aee2-40a1-8afd-532816b11888">Bastien TROUVÉ (cuc10@cuc.fr)</option>
                    <option value="050b4b7b-660b-44d2-bf9f-4a1f6591420a">Pierre GOMES (cuc4@cuc.fr)</option>
                    <option value="76177715-c401-454c-8ee6-a4af13baa311">Franck BLANC (cuc1@cuc.fr)</option>
                    <option value="3aae8334-5d77-40c3-b4ab-3b44581ac242">Morgane TAILLARD (cuc3@cuc.fr)</option>
                    <option value="18a663c5-1bc6-4160-8342-e106525e23e6">Admin CUC (admin@cuc.fr)</option>
                    <option value="fcae4c8a-b488-415a-8c3b-4f392f6204a0">Niels Dalery (niels.dalery@gmail.com)</option>
                </select>
            </div>
        </div>
    </div>
);
