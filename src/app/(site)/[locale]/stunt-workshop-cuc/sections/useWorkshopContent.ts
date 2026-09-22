'use client';

import { useTranslations } from 'next-intl';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';
import {
    CURRICULUM_DEFAULT,
    HIGHLIGHTS_DEFAULT,
    WORKSHOP_MEDIA,
    type WorkshopCurriculumItem,
    type WorkshopHighlight,
    type WorkshopSectionData,
} from './workshop-copy';

export interface WorkshopHeroCopy {
    badge: string;
    meta: string;
    title: string;
    subtitle: string;
    bg: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
}

export interface WorkshopProgramCopy {
    badge: string;
    tag: string;
    title: string;
    intro: string;
    briAlt: string;
}

export interface WorkshopInfoCopy {
    title: string;
    body: string;
    note: string;
}

export interface WorkshopCtaCopy {
    title: string;
    body: string;
    primary: string;
    secondary: string;
}

export interface UseWorkshopContentResult {
    hero: WorkshopHeroCopy;
    breadcrumbs: { home: string; current: string };
    program: WorkshopProgramCopy;
    highlights: Required<WorkshopHighlight>[];
    curriculum: Required<WorkshopCurriculumItem>[];
    location: WorkshopInfoCopy;
    housing: WorkshopInfoCopy;
    certificate: WorkshopInfoCopy;
    cta: WorkshopCtaCopy;
}

/** Résout la copie hero + sections (Studio prioritaire, replis certifiés sinon). */
export function useWorkshopContent(): UseWorkshopContentResult {
    const t = useTranslations('stuntWorkshop');
    const { content } = usePageDynamicContent('stunt-workshop-cuc');

    const workshop = usePageSectionData<WorkshopSectionData>('workshop');

    const highlights = mergeSectionItems(
        HIGHLIGHTS_DEFAULT,
        workshop?.highlights ? { items: workshop.highlights } : null
    );
    const curriculum = mergeSectionItems(
        CURRICULUM_DEFAULT,
        workshop?.curriculum ? { items: workshop.curriculum } : null
    );

    const breadcrumbHome = workshop?.breadcrumb_home || 'HOME / ACCUEIL';
    const breadcrumbCurrent = workshop?.breadcrumb_current || 'INTERNATIONAL STUNT WORKSHOP';
    const programBadge = workshop?.program_badge || 'PROGRAMME INTENSIF';
    const programTag = workshop?.program_tag || 'CURRICULUM INTERNATIONAL';
    const programTitle = workshop?.program_title || 'INTERNATIONAL STUNT PERFORMER TRAINING';
    const programIntro =
        workshop?.program_intro ||
        'The CUC International Stunt Workshop is designed for physical actors, martial artists, gymnasts, parkour athletes and professional stuntmen seeking world-class certification. Taught in both English and French by high-profile action coordinators with credits on John Wick 4, Fast & Furious, and James Bond.';
    const locationTitle = workshop?.location_title || 'LOCATION & ACCESS';
    const locationBody =
        workshop?.location_body ||
        'Campus Univers Cascades is located in Le Cateau-Cambrésis (59360), Northern France. Just 2 hours drive from Paris CDG International Airport, and 1 hour from Lille or Brussels (Belgium).';
    const locationNote =
        workshop?.location_note ||
        'Airport shuttles and train station pickups available upon booking.';
    const housingTitle = workshop?.housing_title || 'FULL BOARD HOUSING';
    const housingBody =
        workshop?.housing_body ||
        'Stay on-site in student housing facilities (90 beds total). All three meals (breakfast, lunch, dinner) are served daily by our professional catering staff, specifically calibrated for high athletic performance.';
    const housingNote =
        workshop?.housing_note ||
        'Single or shared rooms with high-speed Wi-Fi and laundry facilities.';
    const certificateTitle = workshop?.certificate_title || 'OFFICIAL CERTIFICATE';
    const certificateBody =
        workshop?.certificate_body ||
        'Graduates receive the official CUC Workshop Certificate detailing all hours and disciplines completed during the session.';
    const certificateNote =
        workshop?.certificate_note || 'Includes raw 4K footage of your choreographed action scenes.';
    const ctaTitle = workshop?.cta_title || 'READY TO ELEVATE YOUR ACTION CAREER?';
    const ctaBody =
        workshop?.cta_body ||
        'Spaces are limited to ensure maximum individual camera time and safety coaching. Apply today to secure your spot for the upcoming international session.';
    const ctaPrimary = workshop?.cta_primary || 'Apply for International Workshop';
    const ctaSecondary = workshop?.cta_secondary || 'Contact Admissions';

    const heroBadge = content.hero?.badge || 'STAGE INTERNATIONAL';
    const heroTitle = content.hero?.title || 'INTERNATIONAL STUNT WORKSHOP';
    const heroSubtitle =
        content.hero?.subtitle ||
        "Join performers and stuntmen from across the globe (USA, UK, Europe, Australia, Asia) at the world's premier stunt training facility. 2 weeks of full immersion, 10 physical disciplines, full board on our 6-hectare private estate in France.";
    const heroBg = content.hero?.bg_image || WORKSHOP_MEDIA.heroFallback;
    const ctaPrimaryText = content.hero?.cta_primary_text || 'Apply for Next Session';
    const ctaSecondaryText = content.hero?.cta_secondary_text || 'Inquire & Information';
    const ctaSecondaryLink = content.hero?.cta_secondary_link || '/contact-cuc';

    return {
        hero: {
            badge: heroBadge,
            meta: content.hero?.meta || t('heroMeta'),
            title: heroTitle,
            subtitle: heroSubtitle,
            bg: heroBg,
            ctaPrimaryText,
            ctaSecondaryText,
            ctaSecondaryLink,
        },
        breadcrumbs: { home: breadcrumbHome, current: breadcrumbCurrent },
        program: {
            badge: programBadge,
            tag: programTag,
            title: programTitle,
            intro: programIntro,
            briAlt: t('briAlt'),
        },
        highlights,
        curriculum,
        location: { title: locationTitle, body: locationBody, note: locationNote },
        housing: { title: housingTitle, body: housingBody, note: housingNote },
        certificate: { title: certificateTitle, body: certificateBody, note: certificateNote },
        cta: { title: ctaTitle, body: ctaBody, primary: ctaPrimary, secondary: ctaSecondary },
    };
}
