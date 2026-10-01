import {
    BACKUP_TABLES,
    BRIDGE_COLUMNS,
    CUC_SIGN_TABLES,
    FORBIDDEN_SCHEMAS,
    LEGACY_EXPORTED_TABLES,
    BackupScopeError,
    assertBackupScope,
    assertNoFkToCucSign,
    getBridgeColumns,
    isBackupTable,
} from './whitelist';

describe('backup/whitelist — périmètre de sauvegarde', () => {
    it('refuse une table CUC Sign et nomme la cause (students)', () => {
        expect(() => assertBackupScope('students')).toThrow(BackupScopeError);
        expect(() => assertBackupScope('students')).toThrow(/CUC Sign/);
    });

    it('refuse un nom schéma-qualifié (auth.users)', () => {
        expect(() => assertBackupScope('auth.users')).toThrow(/schéma-qualifié/);
    });

    it('refuse un nom hors périmètre', () => {
        expect(() => assertBackupScope('site_table_inconnue')).toThrow(/liste blanche/);
        expect(isBackupTable('site_table_inconnue')).toBe(false);
    });

    it('accepte chacune des tables de BACKUP_TABLES', () => {
        for (const table of BACKUP_TABLES) {
            expect(() => assertBackupScope(table)).not.toThrow();
            expect(isBackupTable(table)).toBe(true);
        }
    });

    it('ne contient aucun doublon dans la liste blanche ni dans la liste noire', () => {
        expect(new Set(BACKUP_TABLES).size).toBe(BACKUP_TABLES.length);
        expect(new Set(CUC_SIGN_TABLES).size).toBe(CUC_SIGN_TABLES.length);
    });

    it('test de non-recouvrement : aucune table CUC Sign ne peut être sauvegardée', () => {
        const overlap = BACKUP_TABLES.filter((table) => CUC_SIGN_TABLES.includes(table));
        expect(overlap).toEqual([]);
        // La preuve par la garde : chacune des 10 tables CUC Sign est refusée.
        for (const table of CUC_SIGN_TABLES) {
            expect(() => assertBackupScope(table)).toThrow(BackupScopeError);
        }
    });

    it('les 14 tables historiques forment un préfixe strict de la liste blanche', () => {
        expect(BACKUP_TABLES.slice(0, LEGACY_EXPORTED_TABLES.length)).toEqual([
            ...LEGACY_EXPORTED_TABLES,
        ]);
        expect(BACKUP_TABLES.length).toBeGreaterThan(LEGACY_EXPORTED_TABLES.length);
    });

    it('épingle le contenu réel de public : 20 tables site_*, sans table fantôme', () => {
        expect(BACKUP_TABLES).toHaveLength(20);
        expect(BACKUP_TABLES.every((table) => table.startsWith('site_'))).toBe(true);
        // Défaut critique corrigé : cette table n'existe pas en base.
        expect(BACKUP_TABLES).not.toContain('site_campus_facilities');
        // Candidats confirmés absents par l'inventaire réel : jamais devinés.
        expect(BACKUP_TABLES).not.toContain('site_media');
        expect(BACKUP_TABLES).not.toContain('site_videos');
        expect(BACKUP_TABLES).not.toContain('site_identity');
    });

    it('déclare les trois colonnes de pont documentées, et rien de plus', () => {
        expect(BRIDGE_COLUMNS).toEqual({
            site_sessions: ['cuc_sign_formation_id'],
            site_team: ['profile_id'],
            site_campus_pois: ['location_id'],
        });
        expect(getBridgeColumns('site_pages')).toEqual([]);
    });

    it('interdit toute FK vers une table CUC Sign ou evaluation_disciplines', () => {
        expect(() => assertNoFkToCucSign(['evaluation_disciplines'])).toThrow(BackupScopeError);
        expect(() => assertNoFkToCucSign(['students'])).toThrow(BackupScopeError);
        expect(() => assertNoFkToCucSign(['auth.users'])).toThrow(BackupScopeError);
        expect(() => assertNoFkToCucSign(['site_programs'])).not.toThrow();
    });

    it('déclare les schémas interdits', () => {
        expect(FORBIDDEN_SCHEMAS).toEqual(expect.arrayContaining(['auth', 'storage', 'extensions']));
    });
});
