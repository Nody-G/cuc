/**
 * ==============================================================================
 * CUC — Atteignabilité au clic des champs éditables (Mode Studio, vitrine)
 * ==============================================================================
 * Annoncer un champ ne suffit pas : il doit **recevoir** le geste. Cette sonde
 * rejoue, pour chaque champ annoté, exactement ce que fera le clic d'édition :
 *
 *  1. `pointer-events` **calculé** — un conteneur décoratif en `none` jamais
 *     réactivé rend le texte inerte, même si l'annotation est présente ;
 *  2. recouvrement par `elementFromPoint` au centre de la boîte — un frère plein
 *     cadre (lien de carte, plan focal du hero) peut masquer le champ sans
 *     qu'aucun style du champ ne le laisse deviner ;
 *  3. hors de la fenêtre, aucun verdict : le champ n'est pas mesuré (compté à
 *     part). On n'invente jamais un diagnostic.
 *
 * Les entrées sont injectées (`ReachabilityView`) : la sonde reste une fonction
 * pure du DOM observé, donc testable sans navigateur et sans CSS.
 */

import { CUC_INDEX_ATTRIBUTE, resolveFieldKind, type CucFieldKind } from './preview-protocol';
import { CUC_FIELD_SELECTOR, resolveFieldTarget } from './field-hit';
import { INLINE_NAVIGABLE_KINDS } from './field-navigation';

/**
 * Natures jugées : celles dont un **clic ouvre un outil** sur l'élément —
 * saisie en place (texte, zone de texte, lien) et remplacement de média (image).
 * Les items de liste en sont exclus : leur annotation désigne le chemin du
 * tableau, leur outil est une barre de commandes, et l'index se lit sur
 * l'attribut `data-cuc-index` — un autre contrat, mesuré ailleurs.
 */
const PROBED_KINDS: readonly CucFieldKind[] = [...INLINE_NAVIGABLE_KINDS, 'image'];

export type ReachabilityReason =
    /** Le geste n'atteint pas le champ : `pointer-events` calculé à `none`. */
    | 'pointer-events'
    /** Un autre élément occupe la place du champ au moment du clic. */
    | 'covered';

export interface FieldReachabilityIssue {
    /** Chemin canonique tel qu'il serait envoyé au Cockpit. */
    path: string;
    kind: CucFieldKind;
    reason: ReachabilityReason;
}

export interface FieldReachabilityReport {
    issues: FieldReachabilityIssue[];
    /** Nombre de champs réellement mesurés (dans la fenêtre). */
    probed: number;
    /** Champs hors fenêtre : ni valides, ni fautifs — simplement non mesurés. */
    skipped: number;
}

/** Ce que la sonde observe du navigateur (injectable pour les tests). */
export interface ReachabilityView {
    readonly innerWidth: number;
    readonly innerHeight: number;
    /** Valeur **calculée** de `pointer-events` (le navigateur résout la cascade). */
    pointerEventsOf: (element: Element) => string;
    /** Élément réellement touché au point donné (`document.elementFromPoint`). */
    hitTest: (x: number, y: number) => Element | null;
}

/** Vue réelle : lue à l'appel, jamais figée à l'import. */
export const browserReachabilityView: ReachabilityView = {
    get innerWidth() {
        return window.innerWidth;
    },
    get innerHeight() {
        return window.innerHeight;
    },
    pointerEventsOf: (element) => window.getComputedStyle(element).pointerEvents,
    hitTest: (x, y) => document.elementFromPoint(x, y),
};

/** Le geste atteint-il bien ce champ ? (l'ancêtre désigné reste valide) */
function isHitTarget(field: Element, hit: Element | null): boolean {
    if (!hit) return false;
    return hit === field || field.contains(hit) || hit.contains(field);
}

function detectReason(
    element: HTMLElement,
    rect: DOMRect,
    view: ReachabilityView
): ReachabilityReason | null {
    if (view.pointerEventsOf(element) === 'none') return 'pointer-events';

    let hit: Element | null;
    try {
        hit = view.hitTest(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } catch {
        // Environnement sans test de collision (navigateur ancien, test sans DOM
        // de rendu) : aucun verdict n'est inventé, le champ n'est pas signalé.
        return null;
    }

    return isHitTarget(element, hit) ? null : 'covered';
}

/**
 * Mesure l'atteignabilité des champs à saisie en place, dans l'ordre du
 * document. Les images, les items de liste et les champs sans boîte visible sont
 * hors sonde : leur outil d'édition n'est pas le clic de saisie.
 */
export function probeFieldReachability(
    root: ParentNode,
    view: ReachabilityView = browserReachabilityView
): FieldReachabilityReport {
    const issues: FieldReachabilityIssue[] = [];
    const reportedPaths = new Set<string>();
    let probed = 0;
    let skipped = 0;

    for (const element of root.querySelectorAll<HTMLElement>(CUC_FIELD_SELECTOR)) {
        const target = resolveFieldTarget(element);
        if (!target) continue;
        if (element.getAttribute(CUC_INDEX_ATTRIBUTE) !== null) continue;

        const kind = resolveFieldKind(element.getAttribute('data-cuc-kind'));
        if (!PROBED_KINDS.includes(kind)) continue;

        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if (y < 0 || y > view.innerHeight || x < 0 || x > view.innerWidth) {
            skipped += 1;
            continue;
        }

        probed += 1;
        const reason = detectReason(element, rect, view);
        if (!reason) continue;

        // Un même chemin rendu deux fois ne produit qu'un seul diagnostic.
        if (reportedPaths.has(target.field)) continue;
        reportedPaths.add(target.field);
        issues.push({ path: target.field, kind, reason });
    }

    return { issues, probed, skipped };
}
