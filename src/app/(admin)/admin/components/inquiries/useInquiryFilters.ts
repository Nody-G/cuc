'use client';

import { useMemo, useState } from 'react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { useProgressiveList } from '../ui';

/** Filtre de statut de la liste (valeur spéciale `all`). */
export type InquiryStatusFilter = 'all' | SiteInquiry['status'];

/**
 * État de vue de la liste des candidatures : recherche, filtre de statut,
 * statistiques KPI et rendu progressif.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : aucune requête réseau,
 * uniquement des dérivations de la liste fournie.
 */
export function useInquiryFilters(inquiries: SiteInquiry[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<InquiryStatusFilter>('all');

    const filteredInquiries = useMemo(() => {
        return inquiries.filter((item) => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const q = searchQuery.toLowerCase();
            const matchesQuery =
                !searchQuery ||
                item.full_name.toLowerCase().includes(q) ||
                item.email.toLowerCase().includes(q) ||
                item.phone.toLowerCase().includes(q) ||
                (item.program_title && item.program_title.toLowerCase().includes(q)) ||
                (item.message && item.message.toLowerCase().includes(q));
            return matchesStatus && matchesQuery;
        });
    }, [inquiries, statusFilter, searchQuery]);

    /**
     * Rendu progressif : on ne monte qu'une fenêtre bornée de candidatures.
     * La fenêtre se réinitialise à chaque changement de filtre ou de recherche
     * pour éviter de conserver un rendu étendu hors contexte.
     */
    const {
        visibleItems: visibleInquiries,
        visibleCount: visibleInquiryCount,
        total: totalInquiries,
        hasMore: hasMoreInquiries,
        loadMore: loadMoreInquiries,
    } = useProgressiveList(filteredInquiries, {
        step: 25,
        initial: 25,
        resetKey: `${statusFilter}|${searchQuery}`,
    });

    const stats = useMemo(() => {
        return {
            total: inquiries.length,
            nouveau: inquiries.filter((i) => i.status === 'nouveau').length,
            en_cours: inquiries.filter((i) => i.status === 'en_cours').length,
            admis: inquiries.filter((i) => i.status === 'admis').length,
        };
    }, [inquiries]);

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        filteredInquiries,
        stats,
        visibleInquiries,
        visibleInquiryCount,
        totalInquiries,
        hasMoreInquiries,
        loadMoreInquiries,
    };
}
