'use client';

import React from 'react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import { exportInquiriesToCsv } from './inquiries/build-csv';
import { InquiriesHeader } from './inquiries/InquiriesHeader';
import { InquiryDetailModal } from './inquiries/InquiryDetailModal';
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
 * Pôle Admissions & Relations Candidats — façade de composition
 * (`AGENTS.md` § 1).
 *
 * Données et mutations dans `useInquiriesData`, état de vue (recherche,
 * filtre, KPI, rendu progressif) dans `useInquiryFilters`, fiche ouverte dans
 * `useInquiryDetail` (dérivée de la liste par identifiant). Le rendu est
 * réparti dans `inquiries/**`.
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

  const handleExport = () => {
    const ok = exportInquiriesToCsv(data.inquiries);
    showToast(ok ? 'Fichier CSV généré et téléchargé !' : 'Aucune donnée à exporter.');
  };

  const handleRowStatusChange = (id: string, status: SiteInquiry['status']) =>
    void data.changeStatus(id, status);

  return (
    <div className="space-y-6">
      <InquiriesHeader
        loading={data.loading}
        onExport={handleExport}
        onRefresh={() => void data.fetchInquiries()}
      />

      <InquiryListToolbar
        stats={filters.stats}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
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
        onStatusChange={handleRowStatusChange}
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
          onStatusChange={(status) => void data.changeStatus(selected.id, status)}
        />
      )}
    </div>
  );
};
