/**
 * Export CSV côté client (Cockpit) : échappement, assemblage, téléchargement.
 *
 * Service partagé des vues admin qui exportent des données (audit, analytique)
 * — un seul point de vérité pour le format et le BOM UTF-8.
 */

/** Échappe une cellule CSV (guillemets doublés, encadrement systématique). */
export const escapeCsvCell = (value: string): string => `"${String(value).replace(/"/g, '""')}"`;

/** Assemble des lignes en CSV séparé par points-virgules (fin de ligne CRLF). */
export function toCsv(rows: string[][]): string {
    return rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
}

/** Déclenche le téléchargement d'un fichier CSV (BOM UTF-8). */
export function downloadCsv(filename: string, csv: string): void {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
