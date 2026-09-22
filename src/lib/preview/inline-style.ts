/**
 * ==============================================================================
 * CUC — Typographie de la saisie en place (Mode Studio)
 * ==============================================================================
 * Standard des éditeurs visuels actuels : quand on écrit dans la page, la saisie
 * **reprend exactement la typographie de l'élément édité**. Un champ posé en
 * `font-size: 12px` alors que le titre fait 56 px se voit immédiatement — c'est
 * le défaut qui trahit un outil bricolé.
 *
 * Ce module ne lit rien du DOM et n'écrit rien : il transforme un instantané de
 * style calculé en style de saisie. Toute la logique est donc testable sans
 * navigateur, et la couche d'édition ne fait que l'appeler.
 */

export interface EditorTypographySource {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
    textAlign?: string;
    color?: string;
    padding?: string;
}

export interface InlineEditorTypography {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    lineHeight: string;
    letterSpacing: string;
    textTransform: string;
    textAlign: string;
    color: string;
    padding: string;
    margin: number;
    border: number;
    background: string;
    boxSizing: 'border-box';
    width: string;
    height: string;
    resize: 'none';
    outline: string;
}

/** Valeurs de repli : une saisie lisible même si le style calculé est vide. */
const FALLBACKS = {
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: 'inherit',
    fontStyle: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'normal',
    textTransform: 'none',
    textAlign: 'inherit',
    color: 'inherit',
    padding: '2px 4px',
} as const;

function pick(value: string | undefined, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Style de la saisie superposée : typographie héritée de l'élément, fond
 * translucide (on doit voir le rendu réel derrière), aucune bordure parasite
 * (l'encadré est dessiné par la couche, jamais par le champ).
 */
export function buildInlineEditorTypography(
    source: EditorTypographySource
): InlineEditorTypography {
    return {
        fontFamily: pick(source.fontFamily, FALLBACKS.fontFamily),
        fontSize: pick(source.fontSize, FALLBACKS.fontSize),
        fontWeight: pick(source.fontWeight, FALLBACKS.fontWeight),
        fontStyle: pick(source.fontStyle, FALLBACKS.fontStyle),
        lineHeight: pick(source.lineHeight, FALLBACKS.lineHeight),
        letterSpacing: pick(source.letterSpacing, FALLBACKS.letterSpacing),
        textTransform: pick(source.textTransform, FALLBACKS.textTransform),
        textAlign: pick(source.textAlign, FALLBACKS.textAlign),
        color: pick(source.color, FALLBACKS.color),
        padding: pick(source.padding, FALLBACKS.padding),
        margin: 0,
        border: 0,
        // Fond très légèrement teinté : la sélection se lit sans masquer la page.
        background: 'rgba(255, 229, 0, 0.08)',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        resize: 'none',
        outline: 'none',
    };
}

/** Instantané de typographie d'un élément (lecture DOM isolée, non testée). */
export function readEditorTypography(element: HTMLElement): EditorTypographySource {
    const computed = window.getComputedStyle(element);
    return {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        fontStyle: computed.fontStyle,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textTransform: computed.textTransform as EditorTypographySource['textTransform'],
        textAlign: computed.textAlign,
        color: computed.color,
        padding: computed.padding,
    };
}

/**
 * Libellé court d'un champ pour l'étiquette de la saisie : les deux derniers
 * segments suffisent à identifier ce qu'on édite (`about.title`).
 */
export function fieldChipLabel(path: string): string {
    const segments = path.split('.').filter((segment) => segment.length > 0);
    if (segments.length === 0) return path;
    return segments.slice(-2).join('.');
}
