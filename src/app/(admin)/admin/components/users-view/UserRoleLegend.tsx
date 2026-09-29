'use client';

import React from 'react';
import { Briefcase, GraduationCap, KeyRound, Shield, type LucideIcon } from 'lucide-react';
import { COCKPIT_ACCESS_ROLES, roleDescriptor, type CockpitRole } from './users-model';

const ROLE_ICONS: Record<(typeof COCKPIT_ACCESS_ROLES)[number], LucideIcon> = {
    directeur: KeyRound,
    admin: Shield,
    secretaire: Briefcase,
    coach: GraduationCap,
};

/** Rappel synthétique des droits accordés par chaque rôle d'accès. */
export const UserRoleLegend: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COCKPIT_ACCESS_ROLES.map((role) => {
            const descriptor = roleDescriptor(role as CockpitRole);
            const Icon = ROLE_ICONS[role];
            return (
                <div key={role} className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#FFE500]">
                        <Icon className="w-4 h-4" />
                        {descriptor.label}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{descriptor.description}</p>
                </div>
            );
        })}
    </div>
);
