/**
 * Données et informations juridiques du Campus Univers Cascades (CUC).
 *
 * Module pur (aucun JSX, aucune dépendance réseau) — conforme AGENTS.md § 1.
 * Source de vérité unique pour les obligations légales françaises :
 * - Loi LCEN n° 2004-575 du 21 juin 2004 (art. 6-III-1)
 * - Code du travail (art. L.6352-12 déclaration d'activité & L.6352-3 règlement intérieur)
 * - Certification Qualiopi (Référentiel National Qualité)
 * - Code de la consommation (art. L.612-1 médiateur de la consommation & L.221-18 rétractation)
 * - RGPD n° 2016/679 & Loi Informatique et Libertés
 */

export interface LegalEntityInfo {
  tradeName: string;
  legalName: string;
  legalForm: string;
  siren: string;
  siret: string;
  rna: string;
  apeNaf: string;
  headquartersAddress: string;
  campusAddress: string;
  parisStudioAddress: string;
  phone: string;
  email: string;
  publicationDirector: string;
  vatStatus: string;
}

export interface TrainingOrgInfo {
  nda: string;
  ndaPrefecture: string;
  legalDisclaimer: string;
  qualiopiCategory: string;
  disabilityContact: string;
}

export interface ConsumerMediationInfo {
  name: string;
  address: string;
  website: string;
  odrPlatform: string;
}

export interface HostingProviderInfo {
  applicationHost: {
    name: string;
    address: string;
    url: string;
  };
  databaseHost: {
    name: string;
    address: string;
    region: string;
    url: string;
  };
}

export const CUC_LEGAL_ENTITY: Readonly<LegalEntityInfo> = {
  tradeName: 'Campus Univers Cascades (CUC)',
  legalName: 'CHALLENGE EUROPE PRODUCTIONS',
  legalForm: 'Association déclarée (Loi du 1er juillet 1901)',
  siren: '504 228 990',
  siret: '504 228 990 00041',
  rna: 'W442000626',
  apeNaf: '9499Z (Autres organisations fonctionnant par adhésion volontaire)',
  headquartersAddress: '13 Rue du Chat Noir, 95490 Vauréal, France',
  campusAddress: 'Domaine CUC, 59360 Le Cateau-Cambrésis (Hauts-de-France)',
  parisStudioAddress: '86 Avenue Louis Roche, 92230 Gennevilliers (Île-de-France)',
  phone: '01 30 32 38 03',
  email: 'contact@campus-universcascades.com',
  publicationDirector: 'Direction Générale du Campus Univers Cascades',
  vatStatus:
    'Exonération de TVA en application de l’article 261-4-4°a du Code Général des Impôts (actions de formation professionnelle continue).',
};

export const CUC_TRAINING_ORG: Readonly<TrainingOrgInfo> = {
  nda: '11950513895',
  ndaPrefecture: 'Préfet de région Hauts-de-France',
  legalDisclaimer:
    '« Déclaration d’activité de formation professionnelle enregistrée sous le numéro 11950513895 auprès du Préfet de région Hauts-de-France. Cet enregistrement ne vaut pas agrément de l’État. » (Article L.6352-12 du Code du travail).',
  qualiopiCategory: 'Actions de formation (L.6313-1 - 1°)',
  disabilityContact: 'contact@campus-universcascades.com',
};

export const CUC_CONSUMER_MEDIATION: Readonly<ConsumerMediationInfo> = {
  name: 'CNPM MÉDIATION CONSOMMATION',
  address: '27 avenue de la Libération, 42400 Saint-Chamond',
  website: 'https://cnpm-mediation-consommation.eu',
  odrPlatform: 'https://ec.europa.eu/consumers/odr',
};

export const CUC_HOSTING_PROVIDERS: Readonly<HostingProviderInfo> = {
  applicationHost: {
    name: 'Vercel Inc.',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, USA',
    url: 'https://vercel.com',
  },
  databaseHost: {
    name: 'Supabase Inc.',
    address: '970 Toa Payoh North #07-04, Singapour 318992',
    region: 'Francfort, Allemagne (Union Européenne)',
    url: 'https://supabase.com',
  },
};

/**
 * Pages réglementaires du site CUC.
 * Utilisées par les sélecteurs de liens pour garantir qu'elles restent
 * référencées et directement sélectionnables par les éditeurs.
 */
export const REGULATORY_PAGES = [
  { value: '/mentions-legales', label: 'Mentions Légales & Agréments' },
  { value: '/confidentialite', label: 'Politique de Confidentialité & RGPD' },
  { value: '/reglement-interieur', label: 'Règlement Intérieur & Sécurité' },
] as const;

export type RegulatoryPagePath = (typeof REGULATORY_PAGES)[number]['value'];

export function isRegulatoryPage(path: string): boolean {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return REGULATORY_PAGES.some((p) => p.value.replace(/^\/+|\/+$/g, '') === clean);
}
