/**
 * Suivi opérationnel candidat : étapes du parcours et sérialisation dans
 * `admin_notes` sous forme de commentaire HTML `<!-- CUC_CHECKLIST:... -->`.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonctions pures, déterministes.
 */

export const CHECKLIST_STEPS = [
    { id: 'contact', label: '1. Premier contact téléphonique effectué' },
    { id: 'dossier', label: '2. Dossier & certificat médical reçus' },
    { id: 'financement', label: '3. Financement validé (AFDAS / Personnel)' },
    { id: 'convocation', label: '4. Convocation / Contrat officiel envoyé' },
];

export function parseNotesAndChecklist(raw: string): { checklist: Record<string, boolean>; notes: string } {
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

export function serializeNotesAndChecklist(checklist: Record<string, boolean>, notes: string): string {
    const completed = Object.entries(checklist)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(',');
    if (!completed) return notes;
    return `<!-- CUC_CHECKLIST:${completed} -->\n${notes}`;
}
