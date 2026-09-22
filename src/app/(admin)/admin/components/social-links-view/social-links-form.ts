/**
 * Domaine de l'éditeur de réseaux sociaux : plateformes supportées, classes
 * de champs communes et opérations pures sur la liste.
 */

import type { SiteSocialLink, SocialPlatform } from '@/data/navigation';

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; defaultColor: string }[] = [
    { id: 'instagram', label: 'Instagram', defaultColor: '#E1306C' },
    { id: 'youtube', label: 'YouTube', defaultColor: '#FF0000' },
    { id: 'tiktok', label: 'TikTok', defaultColor: '#25F4EE' },
    { id: 'facebook', label: 'Facebook', defaultColor: '#1877F2' },
    { id: 'whatsapp', label: 'WhatsApp', defaultColor: '#25D366' },
    { id: 'linkedin', label: 'LinkedIn', defaultColor: '#0A66C2' },
];

export const SOCIAL_INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

/** Réattribue un `order_index` séquentiel (1..n) après un déplacement ou une suppression. */
export function reindexSocialLinks(items: SiteSocialLink[]): SiteSocialLink[] {
    return items.map((item, idx) => ({ ...item, order_index: idx + 1 }));
}

/**
 * Fabrique une nouvelle entrée pour la première plateforme libre (en fin de
 * liste), activée partout par défaut.
 */
export function createSocialLink(links: SiteSocialLink[]): SiteSocialLink {
    const used = new Set(links.map((l) => l.platform));
    const available = SOCIAL_PLATFORMS.find((p) => !used.has(p.id)) || SOCIAL_PLATFORMS[0];
    return {
        id: `${available.id}-${Date.now()}`,
        platform: available.id,
        label: available.label,
        handle: '',
        url: '',
        display_hint: '',
        brand_color: available.defaultColor,
        order_index: links.length + 1,
        is_active: true,
        show_in_navbar: true,
        show_in_footer: true,
        show_in_drawer: true,
    };
}
