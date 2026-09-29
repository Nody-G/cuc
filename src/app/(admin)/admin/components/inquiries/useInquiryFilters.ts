'use client';

import { useMemo, useState } from 'react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { DEFAULT_PIPELINE_ID, getPipeline, type PipelineId } from '@/lib/inquiries/pipelines';
import { computePipelineStats, countByPipeline, filterByPipeline } from '@/lib/inquiries/inquiry-stats';
import { useProgressiveList } from '../ui';

/** Filtre d'étape de la liste (valeur spéciale `all`). */
export type InquiryStageFilter = 'all' | string;

/**
 * État de vue de la liste des dossiers : pipeline actif, recherche, filtre
 * d'étape, KPI et rendu progressif.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : aucune requête réseau,
 * uniquement des dérivations de la liste fournie.
 */
export function useInquiryFilters(inquiries: SiteInquiry[]) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pipelineFilter, setPipelineFilter] = useState<PipelineId>(DEFAULT_PIPELINE_ID);
    const [stageFilter, setStageFilter] = useState<InquiryStageFilter>('all');

    /** Nombre de dossiers par pipeline — alimente le sélecteur de pipeline. */
    const pipelineTotals = useMemo(() => countByPipeline(inquiries), [inquiries]);

    const pipeline = useMemo(() => getPipeline(pipelineFilter), [pipelineFilter]);

    const pipelineInquiries = useMemo(
        () => filterByPipeline(inquiries, pipelineFilter),
        [inquiries, pipelineFilter]
    );

    const stats = useMemo(
        () => computePipelineStats(pipeline, pipelineInquiries),
        [pipeline, pipelineInquiries]
    );

    const filteredInquiries = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return pipelineInquiries.filter((item) => {
            const matchesStage = stageFilter === 'all' || item.status === stageFilter;
            const matchesQuery =
                !searchQuery ||
                item.full_name.toLowerCase().includes(q) ||
                item.email.toLowerCase().includes(q) ||
                item.phone.toLowerCase().includes(q) ||
                (item.program_title && item.program_title.toLowerCase().includes(q)) ||
                (item.message && item.message.toLowerCase().includes(q));
            return matchesStage && matchesQuery;
        });
    }, [pipelineInquiries, stageFilter, searchQuery]);

    /**
     * Rendu progressif : on ne monte qu'une fenêtre bornée de dossiers. La
     * fenêtre se réinitialise à chaque changement de pipeline, de filtre ou de
     * recherche, pour ne pas conserver un rendu étendu hors contexte.
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
        resetKey: `${pipelineFilter}|${stageFilter}|${searchQuery}`,
    });

    return {
        searchQuery,
        setSearchQuery,
        pipelineFilter,
        setPipelineFilter,
        pipeline,
        pipelineTotals,
        stageFilter,
        setStageFilter,
        filteredInquiries,
        stats,
        visibleInquiries,
        visibleInquiryCount,
        totalInquiries,
        hasMoreInquiries,
        loadMoreInquiries,
    };
}
