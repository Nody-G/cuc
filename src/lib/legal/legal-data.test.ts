import { describe, it, expect } from 'vitest';
import {
  CUC_LEGAL_ENTITY,
  CUC_TRAINING_ORG,
  CUC_CONSUMER_MEDIATION,
  CUC_HOSTING_PROVIDERS,
  REGULATORY_PAGES,
  isRegulatoryPage,
} from './legal-data';

describe('legal-data', () => {
  it('contient les informations d’identification légale obligatoires (LCEN)', () => {
    expect(CUC_LEGAL_ENTITY.legalName).toBe('CHALLENGE EUROPE PRODUCTIONS');
    expect(CUC_LEGAL_ENTITY.siren).toBe('504 228 990');
    expect(CUC_LEGAL_ENTITY.siret).toContain('504 228 990');
    expect(CUC_LEGAL_ENTITY.rna).toBe('W442000626');
    expect(CUC_LEGAL_ENTITY.headquartersAddress).toContain('Vauréal');
    expect(CUC_LEGAL_ENTITY.campusAddress).toContain('Le Cateau-Cambrésis');
    expect(CUC_LEGAL_ENTITY.parisStudioAddress).toBe('86 Avenue Louis Roche, 92230 Gennevilliers (Île-de-France)');
    expect(CUC_LEGAL_ENTITY.email).toBe('contact@campus-universcascades.com');
    expect(CUC_LEGAL_ENTITY.phone).toBe('01 30 32 38 03');
  });

  it('contient les mentions légales obligatoires d’organisme de formation', () => {
    expect(CUC_TRAINING_ORG.nda).toBe('11950513895');
    expect(CUC_TRAINING_ORG.legalDisclaimer).toContain('L.6352-12');
    expect(CUC_TRAINING_ORG.legalDisclaimer).toContain('ne vaut pas agrément');
    expect(CUC_TRAINING_ORG.qualiopiCategory).toContain('Actions de formation');
  });

  it('fournit les coordonnées du médiateur de la consommation (Art. L.612-1)', () => {
    expect(CUC_CONSUMER_MEDIATION.name).toBe('CNPM MÉDIATION CONSOMMATION');
    expect(CUC_CONSUMER_MEDIATION.website).toMatch(/^https:\/\//);
    expect(CUC_CONSUMER_MEDIATION.odrPlatform).toContain('europa.eu');
  });

  it('détaille les hébergeurs conformes RGPD et LCEN', () => {
    expect(CUC_HOSTING_PROVIDERS.applicationHost.name).toBe('Vercel Inc.');
    expect(CUC_HOSTING_PROVIDERS.databaseHost.region).toContain('Allemagne');
  });

  it('identifie correctement les pages réglementaires', () => {
    expect(REGULATORY_PAGES).toHaveLength(3);
    expect(isRegulatoryPage('/mentions-legales')).toBe(true);
    expect(isRegulatoryPage('/confidentialite')).toBe(true);
    expect(isRegulatoryPage('/reglement-interieur')).toBe(true);
    expect(isRegulatoryPage('mentions-legales')).toBe(true);
    expect(isRegulatoryPage('/formation-de-cascadeur')).toBe(false);
  });
});
