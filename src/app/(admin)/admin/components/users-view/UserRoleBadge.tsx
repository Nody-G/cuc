'use client';

import React from 'react';
import { CockpitBadge } from '../ui';
import { roleDescriptor } from './users-model';

interface UserRoleBadgeProps {
    role: string;
    className?: string;
}

/** Badge de rôle — libellé et ton issus du catalogue unique `ROLE_CATALOG`. */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role, className }) => {
    const descriptor = roleDescriptor(role);
    return (
        <CockpitBadge tone={descriptor.tone} className={className}>
            {descriptor.label}
        </CockpitBadge>
    );
};
