'use client';

/**
 * Design system du Cockpit CUC.
 *
 * Ces primitives encapsulent les motifs Tailwind répétés dans les vues admin
 * (champs, boutons, interrupteurs, en-têtes de section, états vides, squelettes)
 * afin de garantir une cohérence visuelle stricte et de réduire la duplication.
 *
 * Palette : accent #FFE500, fonds #060608 / #070709 / #0D0D12.
 *
 * Baril de ré-export : l'implémentation vit dans `./design-system/`.
 */

export { cx, COCKPIT_INPUT_CLASS, COCKPIT_LABEL_CLASS } from './design-system/cockpit-classes';

export { CockpitViewHeader } from './design-system/CockpitViewHeader';
export type { CockpitViewHeaderProps } from './design-system/CockpitViewHeader';

export { CockpitCard } from './design-system/CockpitCard';
export type { CockpitCardProps } from './design-system/CockpitCard';

export { CockpitButton, CockpitIconButton } from './design-system/CockpitButton';
export type {
    CockpitButtonProps,
    CockpitButtonVariant,
    CockpitButtonSize,
    CockpitIconButtonProps,
} from './design-system/CockpitButton';

export {
    CockpitField,
    CockpitInput,
    CockpitTextarea,
    CockpitSelect,
} from './design-system/CockpitFields';
export type { CockpitFieldProps } from './design-system/CockpitFields';

export { CockpitToggle } from './design-system/CockpitToggle';
export type { CockpitToggleProps } from './design-system/CockpitToggle';

export { CockpitBadge } from './design-system/CockpitBadge';
export type { CockpitBadgeProps, CockpitBadgeTone } from './design-system/CockpitBadge';

export { CockpitEmptyState } from './design-system/CockpitEmptyState';
export type { CockpitEmptyStateProps } from './design-system/CockpitEmptyState';

export { CockpitSkeleton, CockpitSkeletonList } from './design-system/CockpitSkeleton';
export type {
    CockpitSkeletonProps,
    CockpitSkeletonListProps,
} from './design-system/CockpitSkeleton';

export { CockpitFormActions } from './design-system/CockpitFormActions';
export type { CockpitFormActionsProps } from './design-system/CockpitFormActions';

export { CockpitLoadMore } from './design-system/CockpitLoadMore';
export type { CockpitLoadMoreProps } from './design-system/CockpitLoadMore';
