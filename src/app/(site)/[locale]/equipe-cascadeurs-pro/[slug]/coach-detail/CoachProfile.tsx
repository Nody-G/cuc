'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Award, ShieldCheck, Sparkles, Users } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { Instructor } from '@/types';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { entityRef } from '@/lib/preview/entity-ref';
import { cucEntity } from '@/lib/preview/cuc-entity';
import { resolveEntityOverride, usePreviewEntities } from '@/lib/preview/use-preview-entity';

export interface CoachProfileProps {
    member: Instructor;
    chrome: ReturnType<typeof useTranslations<'commonChrome'>>;
    tt: ReturnType<typeof useTranslations<'team'>>;
}

/**
 * Colonne informations : identité, trajectoire (bio), domaines d'expertise,
 * doublures clés et appels à l'action.
 */
export const CoachProfile: React.FC<CoachProfileProps> = ({ member, chrome, tt }) => {
    /**
     * Édition en place de la fiche coach (`site_team`) : rôle, titre et bio.
     * Le **nom** reste hors canal — son identité est vérifiée
     * (`coach_identity_verification.md`) et se corrige dans l'écran Équipe.
     */
    const entityOverrides = usePreviewEntities();
    const coachAttr = (field: 'role' | 'title' | 'bio') => cucEntity('site_team', member.id, field);
    const coachValue = (field: 'role' | 'title' | 'bio', base: string) =>
        resolveEntityOverride(entityOverrides, entityRef('site_team', member.id, field)) ?? base;

    return (
        <div className="lg:col-span-7 space-y-8">
            <div>
                <div className="inline-flex items-center gap-2 mb-3">
                    <StuntBadge variant="yellow" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                        <span {...coachAttr('role')}>{coachValue('role', member.role)}</span>
                    </StuntBadge>
                    <span className="text-xs font-mono-tech text-zinc-400">
                        <span {...cucMicro('team.facultyTag')}>{tt('facultyTag')}</span>
                    </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight text-white leading-none mb-3">
                    {member.name}
                </h1>

                <p className="text-base sm:text-lg text-[#FFE500] font-mono-tech uppercase font-bold tracking-wide">
                    <span {...coachAttr('title')}>{coachValue('title', member.title)}</span>
                </p>
            </div>

            {/* Biographie Détaillée */}
            <div className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 relative">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 uppercase tracking-wider mb-4 pb-3 border-b border-zinc-800/80">
                    <Award className="w-4 h-4 text-[#FFE500]" />
                    <span {...cucMicro('commonChrome.trainingPathTitle')}>
                        {chrome('trainingPathTitle')}
                    </span>
                </div>

                <p className="text-sm sm:text-base font-tech text-zinc-200 leading-relaxed whitespace-pre-line">
                    <span {...coachAttr('bio')}>{coachValue('bio', member.bio)}</span>
                </p>
            </div>

            {/* Domaines d'Expertise Tactique */}
            <div>
                <h2 className="text-sm font-mono-tech uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFE500]" />
                    <span {...cucMicro('team.expertiseLabel')}>{tt('expertiseLabel')}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                    {member.specialties.map((spec, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1.5 bg-[#12121c] border border-zinc-700 text-xs font-mono-tech text-zinc-200 shadow-sm"
                        >
                            {spec}
                        </span>
                    ))}
                </div>
            </div>

            {/* Doublures Acteurs Clés (si existant) */}
            {member.doubledActors && member.doubledActors.length > 0 && (
                <div className="bg-[#14141e] border border-zinc-800 p-5">
                    <h2 className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span {...cucMicro('team.doubledLabel')}>{tt('doubledLabel')}</span>
                    </h2>
                    <p className="text-sm font-tech text-zinc-300">
                        {member.doubledActors.join(' • ')}
                    </p>
                </div>
            )}

            {/* Call to Action Direct */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/contact-cuc?demande=tournage-production" className="w-full sm:w-auto flex-1">
                    <TacticalButton variant="primary" size="lg" className="w-full justify-center">
                        <span {...cucMicro('team.ctaContact')}>{tt('ctaContact')}</span>
                    </TacticalButton>
                </Link>

                <Link href="/formation-de-cascadeur" className="w-full sm:w-auto flex-1">
                    <TacticalButton variant="secondary" size="lg" className="w-full justify-center">
                        <span {...cucMicro('team.ctaTrain')}>{tt('ctaTrain')}</span>
                    </TacticalButton>
                </Link>
            </div>
        </div>
    );
};
