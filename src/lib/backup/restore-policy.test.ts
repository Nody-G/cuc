import { APPEND_ONLY_TABLES, CONTENT_TABLES, isAppendOnly, isContentTable, resolveDeletePolicy } from './restore-policy';
import { BACKUP_TABLES, BackupScopeError } from './whitelist';

describe('backup/restore-policy — ce qu’une restauration a le droit de supprimer', () => {
    it('refuse la suppression par défaut sur les tables de vie réelle', () => {
        for (const table of ['site_inquiries', 'site_vitals', 'site_activity_logs', 'site_audit_logs']) {
            const decision = resolveDeletePolicy({ table });
            expect(decision.appendOnly).toBe(true);
            expect(decision.allowed).toBe(false);
            expect(decision.reason).toContain('refusée par défaut');
        }
    });

    it('autorise la suppression sur une table de contenu éditorial', () => {
        const decision = resolveDeletePolicy({ table: 'site_pages' });
        expect(decision.appendOnly).toBe(false);
        expect(decision.allowed).toBe(true);
    });

    it('lève la restriction append-only uniquement sur autorisation explicite', () => {
        expect(resolveDeletePolicy({ table: 'site_inquiries' }).allowed).toBe(false);
        expect(resolveDeletePolicy({ table: 'site_inquiries', allowDelete: false }).allowed).toBe(false);
        const lifted = resolveDeletePolicy({ table: 'site_inquiries', allowDelete: true });
        expect(lifted.allowed).toBe(true);
        expect(lifted.appendOnly).toBe(true);
        expect(lifted.reason).toContain('--allow-delete');
    });

    it('ne laisse pas --allow-delete changer la nature append-only de la table', () => {
        expect(isAppendOnly('site_vitals')).toBe(true);
        expect(isContentTable('site_vitals')).toBe(false);
    });

    it('refuse toute table hors liste blanche', () => {
        for (const table of ['students', 'formations', 'auth.users', 'site_table_inconnue', '']) {
            expect(() => resolveDeletePolicy({ table })).toThrow(BackupScopeError);
        }
    });

    it('classe chaque table du périmètre une fois et une seule', () => {
        expect(CONTENT_TABLES).toHaveLength(15);
        expect(APPEND_ONLY_TABLES).toHaveLength(5);
        expect([...CONTENT_TABLES, ...APPEND_ONLY_TABLES].sort()).toEqual([...BACKUP_TABLES].sort());
        for (const table of BACKUP_TABLES) {
            expect(isContentTable(table) !== isAppendOnly(table)).toBe(true);
        }
    });

    it('documente les classifications hésitantes sans les trancher au hasard', async () => {
        const { DELETE_POLICY_HESITATIONS } = await import('./restore-policy');
        expect(Object.keys(DELETE_POLICY_HESITATIONS)).toContain('site_page_revisions');
        expect(APPEND_ONLY_TABLES).toContain('site_page_revisions');
    });
});
