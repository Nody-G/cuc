'use client';

import React, { useMemo } from 'react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import {
  buildApplicantHistory,
  groupByApplicant,
  normalizeApplicantEmail,
  previousDossiers,
  type ApplicantHistory,
} from '@/lib/inquiries/applicant-history';
import { pipelineOfMetadata, stageLabel } from '@/lib/inquiries/pipeline-read';
import { exportInquiriesToCsv } from './inquiries/build-csv';
import { InquiriesHeader } from './inquiries/InquiriesHeader';
import { InquiryDetailModal, type DiscoveryVerdict } from './inquiries/InquiryDetailModal';
import type { PreviousDossierView } from './inquiries/InquiryApplicantHistorySection';
import { InquiryList } from './inquiries/InquiryList';
import { InquiryListToolbar } from './inquiries/InquiryListToolbar';
import { useInquiriesData } from './inquiries/useInquiriesData';
import { useInquiryDetail } from './inquiries/useInquiryDetail';
import { useInquiryFilters } from './inquiries/useInquiryFilters';

interface InquiriesViewProps {
  showToast: (msg: string) => void;
  onInquiriesCountChange?: (count: number) => void;
  programs?: StuntProgram[];
}

/**
 * Pôle Contact & Projets — façade de composition (`AGENTS.md` § 1).
 *
 * La page sert de **pont entre les projets** du campus : chaque dossier suit le
 * pipeline de sa demande (Formation, Production, Événementiel, Presse), peut
 * être re-catégorisé, et une personne qui re-postule garde son passé visible
 * (candidature recalée, session Découverte non suivie).
 */
export const InquiriesView: React.FC<InquiriesViewProps> = ({
  showToast,
  onInquiriesCountChange,
  programs = [],
}) => {
  const data = useInquiriesData({ showToast, onInquiriesCountChange });
  const filters = useInquiryFilters(data.inquiries);
  const detail = useInquiryDetail({
    inquiries: data.inquiries,
    showToast,
    persistNotes: data.persistNotes,
    removeInquiry: data.removeInquiry,
    convertInquiry: data.convertInquiry,
  });

  const selected = detail.selectedInquiry;

  /**
   * Index par personne : compte de dossiers par dossier (étiquette « ancien
   * candidat ») et historique dérivé. Calculé sur **toute** la file, jamais sur
   * la fenêtre rendue — sinon l'historique disparaîtrait à la pagination.
   */
  const applicantIndex = useMemo(() => {
    const groups = groupByApplicant(data.inquiries);
    const counts = new Map<string, number>();
    const histories = new Map<string, ApplicantHistory>();
    for (const inquiry of data.inquiries) {
      counts.set(inquiry.id, groups.get(normalizeApplicantEmail(inquiry.email))?.length ?? 1);
    }
    for (const [key, dossiers] of groups) {
      histories.set(key, buildApplicantHistory(key, dossiers));
    }
    return { counts, histories };
  }, [data.inquiries]);

  const selectedHistory = selected
    ? applicantIndex.histories.get(normalizeApplicantEmail(selected.email)) ?? null
    : null;

  const previousApplicants: PreviousDossierView[] = selected
    ? previousDossiers(data.inquiries, selected.id).map((dossier) => ({
      id: dossier.id,
      created_at: dossier.created_at,
      label: dossier.program_title || dossier.program_id,
      stageLabel: stageLabel(pipelineOfMetadata(dossier.metadata), dossier.status),
    }))
    : [];

  const handleExport = () => {
    const ok = exportInquiriesToCsv(data.inquiries);
    showToast(ok ? 'Fichier CSV généré et téléchargé !' : 'Aucune donnée à exporter.');
  };

  const handleRowStageChange = (id: string, stage: string) => {
    void data.changeStage(id, stage);
  };

  return (
    <div className="space-y-6">
      <InquiriesHeader
        loading={data.loading}
        onExport={handleExport}
        onRefresh={() => void data.fetchInquiries()}
      />

      <InquiryListToolbar
        pipeline={filters.pipeline}
        pipelineFilter={filters.pipelineFilter}
        pipelineTotals={filters.pipelineTotals}
        onPipelineChange={filters.setPipelineFilter}
        stats={filters.stats}
        stageFilter={filters.stageFilter}
        onStageFilterChange={filters.setStageFilter}
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
      />

      <InquiryList
        totalFiltered={filters.filteredInquiries.length}
        inquiries={filters.visibleInquiries}
        visibleCount={filters.visibleInquiryCount}
        totalCount={filters.totalInquiries}
        hasMore={filters.hasMoreInquiries}
        onLoadMore={filters.loadMoreInquiries}
        onOpen={detail.openInquiryModal}
        onStageChange={handleRowStageChange}
        applicantDossierCounts={applicantIndex.counts}
      />

      {selected && (
        <InquiryDetailModal
          inquiry={selected}
          programs={programs}
          checklist={detail.currentChecklist}
          onToggleChecklist={detail.toggleChecklist}
          selectedTemplateId={detail.selectedTemplateId}
          onSelectTemplate={detail.selectTemplate}
          copiedTemplate={detail.copiedTemplate}
          onCopyTemplate={detail.copyTemplate}
          notes={detail.editingNotes}
          onNotesChange={detail.setEditingNotes}
          onSaveNotes={detail.saveNotes}
          isSavingNotes={detail.isSavingNotes}
          onSessionDateChange={(date) => data.updateSessionDate(selected.id, date)}
          isConverting={detail.isConverting}
          onConvert={detail.convertSelected}
          onClose={detail.closeInquiryModal}
          onDelete={detail.deleteSelected}
          onStageChange={(stage) => void data.changeStage(selected.id, stage)}
          onDiscoveryVerdict={(verdict: DiscoveryVerdict) =>
            void data.recordDiscoveryVerdict(selected.id, verdict)
          }
          onReclassify={(targetPipeline, reason) =>
            void data.reclassify(selected.id, targetPipeline, reason)
          }
          applicantHistory={selectedHistory}
          previousApplicants={previousApplicants}
        />
      )}
    </div>
  );
};

/** Ré-export du type de dossier pour les appelants historiques. */
export type { SiteInquiry };
