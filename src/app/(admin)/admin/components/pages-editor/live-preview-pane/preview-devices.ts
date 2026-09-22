/**
 * Domaine de l'aperçu live : appareils simulés, icônes et langues d'édition.
 */

import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type PreviewLocale = 'fr' | 'en';

export const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '834px',
    mobile: '390px',
};

export const DEVICE_ICONS: Record<PreviewDevice, React.ComponentType<{ className?: string }>> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
};

export const DEVICE_LABELS: Record<PreviewDevice, string> = {
    desktop: 'Ordinateur',
    tablet: 'Tablette',
    mobile: 'Mobile',
};

export const LOCALES: PreviewLocale[] = ['fr', 'en'];
