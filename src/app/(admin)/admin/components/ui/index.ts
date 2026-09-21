/**
 * Point d'entrée du design system du Cockpit CUC.
 *
 * Usage :
 *   import { CockpitCard, CockpitButton, CockpitInput } from '@/app/(admin)/admin/components/ui';
 */

export {
    cx,
    COCKPIT_INPUT_CLASS,
    COCKPIT_LABEL_CLASS,
    CockpitViewHeader,
    CockpitCard,
    CockpitButton,
    CockpitIconButton,
    CockpitField,
    CockpitInput,
    CockpitTextarea,
    CockpitSelect,
    CockpitToggle,
    CockpitBadge,
    CockpitEmptyState,
    CockpitSkeleton,
    CockpitSkeletonList,
    CockpitFormActions,
    CockpitLoadMore,
} from './primitives';

export { useFocusTrap } from './useFocusTrap';

export type {
    CockpitViewHeaderProps,
    CockpitCardProps,
    CockpitButtonProps,
    CockpitButtonVariant,
    CockpitButtonSize,
    CockpitIconButtonProps,
    CockpitFieldProps,
    CockpitToggleProps,
    CockpitBadgeProps,
    CockpitBadgeTone,
    CockpitEmptyStateProps,
    CockpitSkeletonProps,
    CockpitSkeletonListProps,
    CockpitFormActionsProps,
    CockpitLoadMoreProps,
} from './primitives';

export { ToastProvider, useToast } from './ToastProvider';
export type { Toast, ToastTone, ToastProviderProps } from './ToastProvider';

export { useProgressiveList } from './useProgressiveList';
export type { ProgressiveListOptions, ProgressiveListResult } from './useProgressiveList';
