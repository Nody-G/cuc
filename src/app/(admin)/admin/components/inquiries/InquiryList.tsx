'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { CockpitLoadMore } from '../ui';
import { InquiryRow } from './InquiryRow';

export interface InquiryListProps {
    /** Nombre de candidatures après filtres (pour l'état vide). */
    totalFiltered: number;
    /** Fenêtre visible (rendu progressif). */
    inquiries: SiteInquiry[];
    visibleCount: number;
    totalCount: number;
    hasMore: boolean;
    onLoadMore: () => void;
    onOpen: (inquiry: SiteInquiry) => void;
    onStatusChange: (id: string, status: SiteInquiry['status']) => void;
}

/** Liste des candidatures : état vide, lignes et pagination progressive. */
export const InquiryList: React.FC<InquiryListProps> = ({
    totalFiltered,
    inquiries,
    visibleCount,
    totalCount,
    hasMore,
    onLoadMore,
    onOpen,
    onStatusChange,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden">
        {totalFiltered === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-gray-600" />
                <p className="text-sm text-gray-400">Aucune demande trouvée.</p>
                <p className="text-xs">Les candidatures du site vitrine apparaîtront ici en temps réel.</p>
            </div>
        ) : (
            <div className="divide-y divide-white/5">
                {inquiries.map((inq) => (
                    <InquiryRow
                        key={inq.id}
                        inquiry={inq}
                        onOpen={onOpen}
                        onStatusChange={onStatusChange}
                    />
                ))}
                {hasMore && (
                    <div className="p-4">
                        <CockpitLoadMore
                            visibleCount={visibleCount}
                            total={totalCount}
                            onLoadMore={onLoadMore}
                            label="Afficher plus de candidatures"
                        />
                    </div>
                )}
            </div>
        )}
    </div>
);
