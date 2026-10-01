import type { BackupRow } from './contracts';
import { diffTable } from './diff';
import { BackupScopeError } from './whitelist';

describe('backup/diff — diff instantané ↔ base courante', () => {
    it('calcule une insertion : ligne du snapshot absente en base', () => {
        const snapshot: BackupRow[] = [{ id: 's1', title: 'A', cuc_sign_formation_id: null }];

        const result = diffTable({
            table: 'site_sessions',
            primaryKey: 'id',
            currentRows: [],
            snapshotRows: snapshot,
        });

        expect(result.toInsert).toEqual(snapshot);
        expect(result.toUpdate).toEqual([]);
        expect(result.toDelete).toEqual([]);
        expect(result.preservedBridgeRows).toEqual([]);
    });

    it('calcule une mise à jour : ligne présente des deux côtés et contenu différent', () => {
        const snapshotRow: BackupRow = { id: 's1', title: 'A', cuc_sign_formation_id: null };
        const result = diffTable({
            table: 'site_sessions',
            primaryKey: 'id',
            currentRows: [{ id: 's1', title: 'B', cuc_sign_formation_id: null }],
            snapshotRows: [snapshotRow],
        });

        expect(result.toUpdate).toEqual([snapshotRow]);
        expect(result.toInsert).toEqual([]);
        expect(result.toDelete).toEqual([]);
        expect(result.preservedBridgeRows).toEqual([]);
    });

    it('calcule une suppression : ligne en base absente du snapshot', () => {
        const currentRow: BackupRow = { id: 's1', title: 'B', cuc_sign_formation_id: null };
        const result = diffTable({
            table: 'site_sessions',
            primaryKey: 'id',
            currentRows: [currentRow],
            snapshotRows: [],
        });

        expect(result.toDelete).toEqual([currentRow]);
        expect(result.toInsert).toEqual([]);
        expect(result.toUpdate).toEqual([]);
        expect(result.preservedBridgeRows).toEqual([]);
    });

    it('préserve une ligne à appariement CUC Sign récent au lieu de la supprimer', () => {
        const currentRow: BackupRow = { id: 's1', cuc_sign_formation_id: '0f1e-formation', title: 'B' };

        const result = diffTable({
            table: 'site_sessions',
            primaryKey: 'id',
            currentRows: [currentRow],
            snapshotRows: [],
        });

        expect(result.preservedBridgeRows).toEqual([currentRow]);
        expect(result.toDelete).toEqual([]);
    });

    it('préserve une ligne dont la colonne de pont est renseignée en base et vide dans le snapshot', () => {
        const currentRow: BackupRow = { id: 's1', cuc_sign_formation_id: '0f1e-formation', title: 'B' };

        const result = diffTable({
            table: 'site_sessions',
            primaryKey: 'id',
            currentRows: [currentRow],
            snapshotRows: [{ id: 's1', cuc_sign_formation_id: null, title: 'A' }],
        });

        expect(result.preservedBridgeRows).toEqual([currentRow]);
        expect(result.toUpdate).toEqual([]);
        expect(result.toDelete).toEqual([]);
    });

    it('conserve les colonnes de pont des trois tables documentées', () => {
        const teamRow: BackupRow = { id: 'lucas-dollfus', profile_id: 'uuid-coach', role: 'Coach' };
        const poisRow: BackupRow = { id: 'cuc-tower', location_id: 'uuid-lieu', name: 'Tour' };

        const team = diffTable({
            table: 'site_team',
            primaryKey: 'id',
            currentRows: [teamRow],
            snapshotRows: [],
        });
        const pois = diffTable({
            table: 'site_campus_pois',
            primaryKey: 'id',
            currentRows: [poisRow],
            snapshotRows: [],
        });

        expect(team.preservedBridgeRows).toEqual([teamRow]);
        expect(pois.preservedBridgeRows).toEqual([poisRow]);
    });

    it('ne produit aucun faux toUpdate quand l’ordre des clés JSON diffère', () => {
        const result = diffTable({
            table: 'site_pages',
            primaryKey: 'slug',
            currentRows: [{ slug: '/', title: 'Accueil', is_published: true }],
            snapshotRows: [{ is_published: true, title: 'Accueil', slug: '/' }],
        });

        expect(result.toUpdate).toEqual([]);
        expect(result.toInsert).toEqual([]);
        expect(result.toDelete).toEqual([]);
        expect(result.preservedBridgeRows).toEqual([]);
    });

    it('accepte un jeu de colonnes de pont explicite', () => {
        const currentRow: BackupRow = { slug: '/', curator_id: 'uuid', title: 'Accueil' };
        const result = diffTable({
            table: 'site_pages',
            primaryKey: 'slug',
            currentRows: [currentRow],
            snapshotRows: [],
            bridgeColumns: ['curator_id'],
        });

        expect(result.preservedBridgeRows).toEqual([currentRow]);
        expect(result.toDelete).toEqual([]);
    });

    it('échoue explicitement sur une table hors liste blanche, jamais silencieusement', () => {
        expect(() =>
            diffTable({
                table: 'students',
                primaryKey: 'id',
                currentRows: [],
                snapshotRows: [],
            }),
        ).toThrow(BackupScopeError);

        expect(() =>
            diffTable({
                table: 'site_table_inconnue',
                primaryKey: 'id',
                currentRows: [],
                snapshotRows: [],
            }),
        ).toThrow(BackupScopeError);
    });
});
