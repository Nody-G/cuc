/**
 * Tests du formatage du panneau « Versions & restauration » — logique pure,
 * aucun réseau, aucune base.
 */

import {
    formatAgeHours,
    formatBytes,
    formatDateTime,
    isRestorePhraseValid,
    isStale,
    restoreConfirmationPhrase,
    severityLabel,
    severityRank,
    statusLabel,
} from './backup-format';

describe('phrase de confirmation', () => {
    it('compose exactement « RESTAURER <identifiant> »', () => {
        expect(restoreConfirmationPhrase('snapshot-2026')).toBe('RESTAURER snapshot-2026');
    });

    it('refuse une casse ou un identifiant différents', () => {
        expect(isRestorePhraseValid('snapshot-2026', 'RESTAURER snapshot-2026')).toBe(true);
        expect(isRestorePhraseValid('snapshot-2026', 'restaurer snapshot-2026')).toBe(false);
        expect(isRestorePhraseValid('snapshot-2026', 'RESTAURER snapshot-2025')).toBe(false);
        expect(isRestorePhraseValid('snapshot-2026', ' RESTAURER snapshot-2026')).toBe(false);
    });
});

describe('formatBytes', () => {
    it('formate octets, kilo-octets et méga-octets', () => {
        expect(formatBytes(512)).toBe('512 o');
        expect(formatBytes(2048)).toBe('2.0 Ko');
        expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 Mo');
    });

    it('affiche « — » pour une valeur absente ou incohérente', () => {
        expect(formatBytes(null)).toBe('—');
        expect(formatBytes(-1)).toBe('—');
    });
});

describe('formatAgeHours', () => {
    it('exprime les heures sous 48 h et les jours au-delà', () => {
        expect(formatAgeHours(3.25)).toBe('3.3 h');
        expect(formatAgeHours(72)).toBe('3.0 j');
    });

    it('annonce un âge inconnu plutôt que zéro', () => {
        expect(formatAgeHours(null)).toBe('âge inconnu');
    });
});

describe('isStale', () => {
    it('bascule en alerte au-delà du seuil ou quand l’âge est inconnu', () => {
        expect(isStale(10)).toBe(false);
        expect(isStale(49)).toBe(true);
        expect(isStale(null)).toBe(true);
    });
});

describe('formatDateTime / libellés', () => {
    it('rend une date française et « — » pour une date illisible', () => {
        expect(formatDateTime(null)).toBe('—');
        expect(formatDateTime('pas-une-date')).toBe('—');
        expect(formatDateTime('2026-10-01T02:30:00.000Z')).toContain('2026');
    });

    it('nomme les statuts sans euphémisme', () => {
        expect(statusLabel('complete')).toBe('Complet');
        expect(statusLabel('degraded')).toBe('Dégradé');
        expect(statusLabel('incomplete')).toContain('Incomplet');
    });

    it('ordonne les gravités et les nomme', () => {
        expect(severityRank('critical')).toBeGreaterThan(severityRank('warning'));
        expect(severityRank('warning')).toBeGreaterThan(severityRank('ok'));
        expect(severityLabel('critical')).toBe('Critique');
        expect(severityLabel('ok')).toBe('OK');
    });
});
