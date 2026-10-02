'use client';

import React from 'react';
import { Layers, Image as ImageIcon } from 'lucide-react';
import type { Instructor } from '@/types';
import { coerceStringList } from '@/lib/comma-list';
import { CommaListField } from '../ui';

export interface TeamMemberIdentityFieldsProps {
    member: Instructor;
    onMemberChange: (next: Instructor) => void;
    /** Ouvre la médiathèque pour choisir l'avatar. */
    onOpenMediaPicker: () => void;
    /**
     * Champ verrouillé dans la locale courante : en anglais, seuls `role`,
     * `title`, `bio` et `specialties` restent éditables (médias, identité,
     * liens et connecteurs CUC Sign sont des données sources).
     */
    isFieldReadOnly: (field: string) => boolean;
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
    isFieldReadOnly,
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
                    disabled={isFieldReadOnly('name')}
                    value={member.name}
                    onChange={(e) => onMemberChange({ ...member, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rôle</label>
                <input
                    type="text"
                    required
                    disabled={isFieldReadOnly('role')}
                    value={member.role}
                    onChange={(e) => onMemberChange({ ...member, role: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Titre & Spécialisation</label>
            <input
                type="text"
                required
                disabled={isFieldReadOnly('title')}
                value={member.title}
                onChange={(e) => onMemberChange({ ...member, title: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">URL Photo / Avatar</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="/images/... ou https://..."
                    disabled={isFieldReadOnly('avatarUrl')}
                    value={member.avatarUrl || ''}
                    onChange={(e) => onMemberChange({ ...member, avatarUrl: e.target.value })}
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    disabled={isFieldReadOnly('avatarUrl')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <CommaListField
                key={`member-specialties-${member.id}`}
                value={coerceStringList(member.specialties)}
                onChange={(specialties) => onMemberChange({ ...member, specialties })}
                disabled={isFieldReadOnly('specialties')}
                placeholder="ex: Combat, Action Design, Chutes, Torches"
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Domaines d’expertise et disciplines enseignées"
            />
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
                Comédiens doublés (séparés par des virgules)
            </label>
            <CommaListField
                key={`member-doubled-${member.id}`}
                value={coerceStringList(member.doubledActors)}
                onChange={(doubledActors) => onMemberChange({ ...member, doubledActors })}
                disabled={isFieldReadOnly('doubledActors')}
                placeholder="ex: Tomer Sisley, Pierre Niney, Keanu Reeves"
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Comédiens doublés"
            />
        </div>

        <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Biographie</label>
            <textarea
                rows={3}
                disabled={isFieldReadOnly('bio')}
                value={member.bio}
                onChange={(e) => onMemberChange({ ...member, bio: e.target.value })}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Instagram URL</label>
                <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    disabled={isFieldReadOnly('instagram')}
                    value={member.instagram || ''}
                    onChange={(e) => onMemberChange({ ...member, instagram: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                <input
                    type="text"
                    placeholder="https://imdb.com/name/..."
                    disabled={isFieldReadOnly('imdb')}
                    value={member.imdb || ''}
                    onChange={(e) => onMemberChange({ ...member, imdb: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isFieldReadOnly('profile_id')}
                    onChange={(e) =>
                        onMemberChange({
                            ...member,
                            profile_id: e.target.value || undefined,
                        })
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">-- Aucun compte CUC Sign lié --</option>
                    <option value="d96d7d35-4baa-4844-8146-e32f7d8fa5ab">Lucas DOLLFUS (lucas.d@campus-universcascades.com)</option>
                    <option value="fcae4c8a-b488-415a-8c3b-4f392f6204a0">Niels Dalery (niels.dalery@gmail.com)</option>
                </select>
            </div>
        </div>
    </div>
);
