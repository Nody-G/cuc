/**
 * Exporteur de données Instagram pour le Cockpit CUC.
 * Génération de fichiers CSV compatibles Excel (BOM UTF-8) et téléchargement client.
 */

import type { InstagramReelMetric } from '@/types/instagram-monitor';

function escapeCsvField(field: string | number | undefined | null): string {
    if (field === undefined || field === null) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
}

/**
 * Génère le contenu d'un CSV tabulé pour l'ensemble des Reels Instagram.
 * Inclut le BOM UTF-8 (\uFEFF) pour compatibilité totale avec Excel français.
 */
export function generateReelsCsv(reels: InstagramReelMetric[]): string {
    const headers = [
        'Shortcode',
        'Titre',
        'Catégorie',
        'Vues Exactes',
        'Vues Formatées',
        'Likes',
        'Date de Publication',
        'URL Instagram',
        'Description',
    ];

    const rows = reels.map((reel) => [
        reel.shortcode,
        reel.title,
        reel.stuntCategory || 'general',
        reel.views,
        reel.viewsFormatted || `${reel.views}`,
        reel.likes || '',
        reel.date || '',
        reel.url,
        reel.description || '',
    ]);

    const csvLines = [
        headers.map(escapeCsvField).join(';'),
        ...rows.map((row) => row.map(escapeCsvField).join(';')),
    ];

    return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Déclenche le téléchargement du fichier CSV côté client dans le navigateur.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
