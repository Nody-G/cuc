'use client';

import React from 'react';
import type { SitePartner } from '@/lib/data/site-service';
import { PartnerCard } from './PartnerCard';

interface PartnersGridProps {
    partners: SitePartner[];
    onEdit: (partner: SitePartner) => void;
    onDelete: (id: string, name: string) => void;
}

/** Grille des partenaires filtrés. */
export const PartnersGrid: React.FC<PartnersGridProps> = ({ partners, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {partners.map((partner) => (
            <PartnerCard
                key={partner.id}
                partner={partner}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ))}
    </div>
);
