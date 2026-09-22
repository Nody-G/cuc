/**
 * Domaine du formulaire de candidature : profils, titres de programmes
 * envoyés en base et état initial du formulaire.
 */

export type ProfileType = 'pro' | 'discovery' | 'weekend' | 'afdas' | 'prod';

export const resolveProfileType = (progId: string): ProfileType => {
    if (progId === 'weekend-immersion') return 'weekend';
    if (progId.includes('afdas')) return 'afdas';
    if (progId.includes('decouverte') || progId.includes('discovery')) return 'discovery';
    if (progId.includes('prod') || progId.includes('tournage')) return 'prod';
    return 'pro';
};

/**
 * Titres de programmes ENVOYÉS EN BASE (`site_inquiries.program_title`).
 * Ce sont des références de cockpit (français = langue de travail interne), pas
 * de la copie d'interface : la fenêtre n'affiche que des libellés du catalogue.
 */
export const PROGRAM_TITLES: Record<ProfileType, string> = {
    pro: 'Formation Professionnelle Longue Durée 2 ans',
    discovery: 'Stage Découverte & Sélection (12 jours)',
    weekend: 'Week-end Immersion Cascade',
    afdas: 'Stage AFDAS Artistes-Interprètes (Paris Gennevilliers)',
    prod: 'Coordination Cascade & Tournage Production',
};

/** Valeurs AFDAS envoyées en base (références) — l'affichage vient du catalogue. */
export const AFDAS_VALUES = ['Intermittent du spectacle', 'Cascadeur pro en activité', 'Autre ayant droit AFDAS'];

export interface ApplicationFormData {
    fullName: string;
    email: string;
    phone: string;
    age: string;
    sportBackground: string;
    sessionDate: string;
    afdasStatus: string;
    message: string;
}

export function createApplicationFormData(): ApplicationFormData {
    return {
        fullName: '',
        email: '',
        phone: '',
        age: '',
        sportBackground: '',
        sessionDate: '',
        afdasStatus: AFDAS_VALUES[0],
        message: '',
    };
}
