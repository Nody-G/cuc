'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { normalizeRole } from '@/lib/credit-role';
import { renderRoleSet } from '@/lib/i18n/role-labels';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { FilmCredit, Instructor } from '@/types';
import { resolveMemberRawRole } from './role-resolution';

interface FilmTeamListProps {
    movie: FilmCredit;
    members: Instructor[];
    onNavigate: () => void;
}

/** Équipe CUC créditée sur le film : portrait, nom, rôle traduit, lien fiche. */
export const FilmTeamList: React.FC<FilmTeamListProps> = ({ movie, members, onNavigate }) => {
    const t = useTranslations('teamProduction');
    /** Namespace `team` : libellés de rôle déjà traduits (FR/EN). */
    const tTeam = useTranslations('team');

    if (members.length === 0) return null;

    return (
        <div className="space-y-1.5">
            <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                <span {...cucMicro('teamProduction.filmModal.teamLabel')}>
                    {t('filmModal.teamLabel')}
                </span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((member) => (
                    <Link
                        key={member.id}
                        href={`/equipe-cascadeurs-pro/${member.id}`}
                        onClick={onNavigate}
                        className="flex items-center gap-2.5 p-1.5 bg-[#141419] border border-zinc-800 hover:border-zinc-600 transition-colors"
                    >
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            {member.avatarUrl ? (
                                <Image
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    fill
                                    sizes="28px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                    {member.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-mono-tech text-white truncate font-bold">
                                {member.name}
                            </div>
                            <FilmMemberRoleLabel movie={movie} member={member} tTeam={tTeam} />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

interface FilmMemberRoleLabelProps {
    movie: FilmCredit;
    member: Instructor;
    tTeam: ReturnType<typeof useTranslations<'team'>>;
}

/**
 * Rôle du membre ramené à un libellé canonique puis **traduit** : un libellé
 * français (« Cascadeur », « Doublure de X ») s'affichait tel quel sur les pages
 * anglaises avant cette normalisation.
 */
const FilmMemberRoleLabel: React.FC<FilmMemberRoleLabelProps> = ({ movie, member, tTeam }) => {
    const normalized = normalizeRole(resolveMemberRawRole(movie, member));
    const isCoord = normalized.roles.includes('Coordinateur des cascades');
    const roleLabelText = renderRoleSet(
        { roles: normalized.roles, doubledActors: normalized.doubledActors },
        tTeam
    );

    return (
        <div
            className={`text-[10px] font-mono-tech truncate ${isCoord ? 'text-[#FFE500] font-semibold' : 'text-zinc-400'
                }`}
            title={normalized.detail || roleLabelText}
        >
            {roleLabelText}
        </div>
    );
};
