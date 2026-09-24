/**
 * ==============================================================================
 * CUC — Intention de contact portée par un lien
 * ==============================================================================
 * Une URL de contact doit toujours dire **pourquoi** le visiteur arrive : le
 * formulaire de la page contact pré-remplit « Votre Demande Concerne » à partir
 * du paramètre `?demande=…` (voir `ContactForm`).
 *
 * Un lien peut être configuré dans le Cockpit comme un simple `/contact-cuc` :
 * on y ajoute alors l'intention de la surface qui le porte — sans jamais écraser
 * une intention déjà posée par l'éditeur, ni une ancre choisie.
 *
 * Module pur (aucun JSX) — `AGENTS.md` § 1.
 */

/** Chemin canonique de la page contact. */
const CONTACT_PATH = '/contact-cuc';

/** Ancre du formulaire « Votre Demande Concerne ». */
const CONTACT_FORM_ANCHOR = 'contact-form';

/**
 * Garantit qu'un lien de contact porte une intention.
 *
 * - un lien hors `/contact-cuc` est rendu inchangé ;
 * - un lien portant déjà `?demande=…` est rendu inchangé (choix éditorial) ;
 * - sinon l'intention est ajoutée et la vue est calée sur le formulaire, en
 *   conservant une ancre explicite si l'éditeur en a posé une.
 */
export function withContactIntent(href: string, intent: string): string {
    if (!href.startsWith(CONTACT_PATH)) return href;

    const [pathAndQuery, hash] = href.split('#');
    const [path, query = ''] = pathAndQuery.split('?');
    const params = new URLSearchParams(query);

    if (params.has('demande')) return href;

    params.set('demande', intent);
    const anchor = hash ?? CONTACT_FORM_ANCHOR;
    return `${path}?${params.toString()}#${anchor}`;
}
