/**
 * Suivi opérationnel d'un dossier Contact : sérialisation dans `admin_notes`
 * sous forme de commentaire HTML `<!-- CUC_CHECKLIST:... -->`.
 *
 * Les **étapes** ne sont plus figées ici : elles vivent dans le catalogue des
 * pipelines (`@/lib/inquiries/pipelines`), une seule source par sujet. Ce module
 * ne porte plus que la (dé)sérialisation, et ré-exporte la checklist du pipeline
 * Formation pour les lectures historiques.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, déterministes.
 */

import { getPipeline } from '@/lib/inquiries/pipelines';

/** Étapes du parcours Formation (compatibilité des lectures existantes). */
export const CHECKLIST_STEPS = getPipeline('formation').checklist;

export function parseNotesAndChecklist(raw: string): {
    checklist: Record<string, boolean>;
    notes: string;
} {
    const match = raw.match(/<!-- CUC_CHECKLIST:([a-z,]+) -->/);
    if (!match) {
        return { checklist: {}, notes: raw };
    }
    const completedKeys = match[1].split(',').filter(Boolean);
    const checklist: Record<string, boolean> = {};
    completedKeys.forEach((k) => {
        checklist[k] = true;
    });
    const notes = raw.replace(/<!-- CUC_CHECKLIST:[a-z,]+ -->\n?/, '').trim();
    return { checklist, notes };
}

export function serializeNotesAndChecklist(
    checklist: Record<string, boolean>,
    notes: string
): string {
    const completed = Object.entries(checklist)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(',');
    if (!completed) return notes;
    return `<!-- CUC_CHECKLIST:${completed} -->\n${notes}`;
}
