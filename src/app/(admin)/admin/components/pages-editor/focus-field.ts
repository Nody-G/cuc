/**
 * Édition en place : lorsqu'un champ est cliqué dans l'aperçu, on retrouve
 * l'input correspondant (marqué `data-cuc-field="<clé>"`) dans l'éditeur,
 * on le fait défiler en vue et on lui donne le focus.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : effet DOM isolé, sans état.
 */
export function focusCucField(field: string): void {
    if (typeof document === 'undefined') return;
    const selector = `[data-cuc-field="${CSS.escape(field)}"]`;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.focus({ preventScroll: true });
        el.select();
    } else if (el instanceof HTMLSelectElement) {
        el.focus({ preventScroll: true });
    } else {
        el.focus?.({ preventScroll: true });
    }
    el.setAttribute('data-cuc-field-active', '');
    window.setTimeout(() => el.removeAttribute('data-cuc-field-active'), 1600);
}
