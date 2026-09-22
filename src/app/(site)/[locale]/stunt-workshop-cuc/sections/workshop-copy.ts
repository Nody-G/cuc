/**
 * Copie certifiée du bloc « workshop » de la page internationale.
 *
 * Elle sert de **repli** : chaque texte est éditable en place dans le Mode Studio
 * (`sections_data.workshop.*`), y compris les points de programme et les visuels
 * de la page. Aucune valeur vide n'est publiée — le repli reste la référence.
 */
export interface WorkshopHighlight {
    value?: string;
    label?: string;
}

export interface WorkshopCurriculumItem {
    title?: string;
    desc?: string;
}

/** Champs `sections_data.workshop.*` surchargeables en Studio. */
export interface WorkshopSectionData {
    breadcrumb_home?: string;
    breadcrumb_current?: string;
    highlights?: WorkshopHighlight[];
    program_badge?: string;
    program_tag?: string;
    program_title?: string;
    program_intro?: string;
    curriculum?: WorkshopCurriculumItem[];
    location_title?: string;
    location_body?: string;
    location_note?: string;
    housing_title?: string;
    housing_body?: string;
    housing_note?: string;
    certificate_title?: string;
    certificate_body?: string;
    certificate_note?: string;
    cta_title?: string;
    cta_body?: string;
    cta_primary?: string;
    cta_secondary?: string;
}

export const HIGHLIGHTS_DEFAULT: Required<WorkshopHighlight>[] = [
    { value: '14 DAYS', label: 'Intensive Training Camp' },
    { value: '21M', label: 'CUC Stunt High Fall Tower' },
    { value: '90 BEDS', label: 'On-Site Accommodation' },
    { value: '100%', label: 'Real Action Showreel Video' },
];

export const CURRICULUM_DEFAULT: Required<WorkshopCurriculumItem>[] = [
    {
        title: 'FIGHT CHOREOGRAPHY & HONG KONG ACTION DESIGN',
        desc: 'Camera angles, punch-selling techniques, multi-opponent combat drills, and weapons flow.',
    },
    {
        title: 'WIREWORK & 3D RIGGING',
        desc: 'Harness flights, deadman drops, air-ramps, and superhero wall-running stunts.',
    },
    {
        title: 'HIGH FALLS UP TO 21 METERS',
        desc: 'Defenestrations, backwards drops, and high-impact landing on giant calibrated airbags.',
    },
    {
        title: 'FULL BODY BURN (HUMAN TORCH)',
        desc: 'Pyro safety protocols, protective Nomex suits, fire retardant gels, and emergency procedures.',
    },
    {
        title: 'SHOWREEL ACTION PRODUCTION',
        desc: 'Professional cinematic camera crew shoots your dynamic action scene at the end of the camp.',
    },
];

/** Visuels de la page (Supabase Storage / assets locaux). */
export const WORKSHOP_MEDIA = {
    heroFallback:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.jpg',
    poster:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Stage-Workshop-2.png',
    bri: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-BRI.jpg',
    tower:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Dos-CUC-TOWER-scaled.jpeg',
    crowd:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-586.jpg',
} as const;
