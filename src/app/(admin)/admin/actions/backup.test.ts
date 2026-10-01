/**
 * Garde de rôle du circuit d'import historique (`restoreFullSiteBackup`).
 *
 * L'ancien modal utilisait un client service-role **sans vérification de rôle
 * côté serveur**. Ce test prouve qu'un compte non autorisé est refusé **avant
 * toute écriture** : aucun `upsert` n'est déclenché.
 *
 * Doubles injectés (`createAdminClient`, `getCurrentUserProfile`) : aucun réseau,
 * aucune base, aucune restauration réelle. Convention du dépôt : aucun import de
 * `vitest` (`globals: true`).
 */

const adminSpies = vi.hoisted(() => {
    const upsert = vi.fn(async () => ({ error: null }));
    const from = vi.fn(() => ({ upsert }));
    return { upsert, from };
});

const actor = vi.hoisted(() => ({ profile: null as { role: string } | null }));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: () => ({ from: adminSpies.from }),
}));

vi.mock('./auth', () => ({
    getCurrentUserProfile: async () => actor.profile,
}));

vi.mock('./revalidate', () => ({
    revalidateSite: async () => ({ success: true }),
}));

import { restoreFullSiteBackup } from './backup';

/** Instantané minimal valide : une table (`site_pages`) réellement alimentée. */
const BACKUP_JSON = JSON.stringify({ data: { pages: [{ id: 'p1', slug: 'accueil', title: 'Accueil' }] } });

beforeEach(() => {
    adminSpies.from.mockClear();
    adminSpies.upsert.mockClear();
    actor.profile = null;
});

describe('restoreFullSiteBackup — garde de rôle serveur', () => {
    it('refuse un rôle insuffisant (secretaire) sans le moindre upsert', async () => {
        actor.profile = { role: 'secretaire' };

        const result = await restoreFullSiteBackup(BACKUP_JSON);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Accès refusé');
        expect(adminSpies.from).not.toHaveBeenCalled();
        expect(adminSpies.upsert).not.toHaveBeenCalled();
    });

    it('refuse un compte absent sans le moindre upsert', async () => {
        actor.profile = null;

        const result = await restoreFullSiteBackup(BACKUP_JSON);

        expect(result.success).toBe(false);
        expect(adminSpies.upsert).not.toHaveBeenCalled();
    });

    it('laisse un administrateur restaurer : comportement métier inchangé', async () => {
        actor.profile = { role: 'admin' };

        const result = await restoreFullSiteBackup(BACKUP_JSON);

        expect(result.success).toBe(true);
        expect(adminSpies.upsert).toHaveBeenCalledTimes(1);
    });

    it('autorise aussi un directeur', async () => {
        actor.profile = { role: 'directeur' };

        const result = await restoreFullSiteBackup(BACKUP_JSON);

        expect(result.success).toBe(true);
        expect(adminSpies.upsert).toHaveBeenCalledTimes(1);
    });
});
