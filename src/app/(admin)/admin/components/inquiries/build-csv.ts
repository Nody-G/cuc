/**
 * Export CSV des candidatures (séparateur `;`, BOM UTF-8 pour Excel).
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : génération pure + téléchargement
 * navigateur isolés du composant de vue.
 */
import type { SiteInquiry } from '@/lib/data/site-service';

/** Construit le contenu CSV complet (en-têtes + lignes échappées `"`). */
export function buildInquiriesCsv(inquiries: SiteInquiry[]): string {
    const headers = [
        'ID',
        'Date',
        'Nom & Prénom',
        'Email',
        'Téléphone',
        'Programme',
        'Âge',
        'Statut AFDAS',
        'Expérience',
        'Statut',
        'Notes Internes',
        'Message',
    ];

    const rows = inquiries.map((i) => [
        `"${i.id}"`,
        `"${new Date(i.created_at).toLocaleDateString('fr-FR')}"`,
        `"${i.full_name.replace(/"/g, '""')}"`,
        `"${i.email}"`,
        `"${i.phone}"`,
        `"${(i.program_title || i.program_id).replace(/"/g, '""')}"`,
        `"${i.age || ''}"`,
        `"${(i.afdas_status || '').replace(/"/g, '""')}"`,
        `"${(i.sport_background || '').replace(/"/g, '""')}"`,
        `"${i.status}"`,
        `"${(i.admin_notes || '').replace(/"/g, '""')}"`,
        `"${i.message.replace(/"/g, '""')}"`,
    ]);

    return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

/** Télécharge un contenu texte via un lien temporaire (navigateur uniquement). */
export function downloadCsvFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/** Export complet : refuse une liste vide, sinon génère et télécharge. */
export function exportInquiriesToCsv(inquiries: SiteInquiry[]): boolean {
    if (inquiries.length === 0) return false;
    downloadCsvFile(
        `cuc-candidatures-${new Date().toISOString().split('T')[0]}.csv`,
        buildInquiriesCsv(inquiries)
    );
    return true;
}
