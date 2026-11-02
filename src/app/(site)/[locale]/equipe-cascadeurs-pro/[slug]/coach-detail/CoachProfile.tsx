'use client';

import React from 'react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { ShieldCheck } from 'lucide-react';
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
 * Colonne informations : identité, statut et titre référent.
 */
export const CoachProfile: React.FC<CoachProfileProps> = ({
    member,
    chrome: _chrome,
    tt,
}) => {
    /**
     * Édition en place de la fiche coach (`site_team`) : rôle et titre.
     * Le nom reste hors canal — son identité est vérifiée
     * (`coach_identity_verification.md`) et se corrige dans l'écran Équipe.
     */
    const entityOverrides = usePreviewEntities();
    const coachAttr = (field: 'role' | 'title') => cucEntity('site_team', member.id, field);
    const coachValue = (field: 'role' | 'title', base: string) =>
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
        </div>
    );
};
