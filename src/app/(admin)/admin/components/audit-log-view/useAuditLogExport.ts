'use client';

import { useCallback } from 'react';
import type { AuditLogEntry } from '@/lib/data/site-service';
import { buildAuditCsv, downloadCsv } from './audit-format';

export interface UseAuditLogExportArgs {
    filteredLogs: AuditLogEntry[];
    showToast: (msg: string) => void;
}

export interface UseAuditLogExportResult {
    handleExportCsv: () => void;
}

export function useAuditLogExport({
    filteredLogs,
    showToast,
}: UseAuditLogExportArgs): UseAuditLogExportResult {
    const handleExportCsv = useCallback(() => {
        const csv = buildAuditCsv(filteredLogs);
        if (csv === null) {
            showToast('Aucune entrée à exporter avec les filtres actuels.');
            return;
        }

        downloadCsv(`cuc-journal-audit-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        showToast(`${filteredLogs.length} entrée(s) exportée(s) au format CSV.`);
    }, [filteredLogs, showToast]);

    return { handleExportCsv };
}
