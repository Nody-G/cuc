'use client';

/**
 * Export du journal — CSV pour un tableur, JSON pour joindre un dossier.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1). L'assemblage des fichiers
 * vit dans `log-hub-format.ts` (pur) ; ce hook ne fait que déclencher le
 * téléchargement et dire ce qui s'est passé.
 */

import { useCallback, useState } from 'react';
import { downloadCsv } from '@/lib/csv-export';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { buildLogsCsv, buildLogsJson } from './log-hub-format';

export interface UseLogHubExportArgs {
    entries: ActivityLogEntry[];
    showToast: (message: string) => void;
}

export interface UseLogHubExportResult {
    exporting: boolean;
    handleExportCsv: () => void;
    handleExportJson: () => void;
}

/** Horodatage compact pour nommer un fichier sans caractères interdits. */
function fileStamp(now: Date = new Date()): string {
    return now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

export function useLogHubExport({
    entries,
    showToast,
}: UseLogHubExportArgs): UseLogHubExportResult {
    const [exporting, setExporting] = useState(false);

    const handleExportCsv = useCallback(() => {
        const csv = buildLogsCsv(entries);
        if (!csv) {
            showToast('Aucun événement à exporter avec les filtres actuels.');
            return;
        }
        setExporting(true);
        try {
            downloadCsv(`journal-activite-${fileStamp()}.csv`, csv);
            showToast(`${entries.length} événement(s) exporté(s) en CSV.`);
        } finally {
            setExporting(false);
        }
    }, [entries, showToast]);

    const handleExportJson = useCallback(() => {
        if (entries.length === 0) {
            showToast('Aucun événement à exporter avec les filtres actuels.');
            return;
        }
        setExporting(true);
        try {
            const blob = new Blob([buildLogsJson(entries)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `journal-activite-${fileStamp()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast(`${entries.length} événement(s) exporté(s) en JSON.`);
        } finally {
            setExporting(false);
        }
    }, [entries, showToast]);

    return { exporting, handleExportCsv, handleExportJson };
}
