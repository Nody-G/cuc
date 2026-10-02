import { describe, expect, it } from 'vitest';
import {
    buildAdminLoginRedirect,
    isAdminLoginPath,
    isAdminPath,
    isAuthFlowPath,
    isProtectedAdminPath,
    normalizeCockpitLoginIdentifier,
} from './admin-guard';

describe('admin-guard', () => {
    it('détecte correctement les chemins du Cockpit avec isAdminPath', () => {
        expect(isAdminPath('/admin')).toBe(true);
        expect(isAdminPath('/admin/')).toBe(true);
        expect(isAdminPath('/admin/aide')).toBe(true);
        expect(isAdminPath('/admin/login')).toBe(true);
        expect(isAdminPath('/admin/reset-password')).toBe(true);
        expect(isAdminPath('/admin/users')).toBe(true);
        expect(isAdminPath('/')).toBe(false);
        expect(isAdminPath('/formation-de-cascadeur')).toBe(false);
        expect(isAdminPath('/administrateur')).toBe(false);
    });

    it('détecte les pages d’authentification avec isAuthFlowPath / isAdminLoginPath', () => {
        expect(isAuthFlowPath('/admin/login')).toBe(true);
        expect(isAuthFlowPath('/admin/login/')).toBe(true);
        expect(isAuthFlowPath('/admin/reset-password')).toBe(true);
        expect(isAuthFlowPath('/admin/reset-password?code=123')).toBe(true);
        expect(isAdminLoginPath('/admin/login')).toBe(true);
        expect(isAdminLoginPath('/admin/reset-password')).toBe(true);
        expect(isAuthFlowPath('/admin')).toBe(false);
        expect(isAuthFlowPath('/admin/aide')).toBe(false);
        expect(isAuthFlowPath('/login')).toBe(false);
    });

    it('identifie les routes administratives protégées avec isProtectedAdminPath', () => {
        expect(isProtectedAdminPath('/admin')).toBe(true);
        expect(isProtectedAdminPath('/admin/aide')).toBe(true);
        expect(isProtectedAdminPath('/admin/users')).toBe(true);
        expect(isProtectedAdminPath('/admin/login')).toBe(false);
        expect(isProtectedAdminPath('/admin/reset-password')).toBe(false);
        expect(isProtectedAdminPath('/')).toBe(false);
    });

    it('construit l’URL de redirection sans paramètre next pour la racine /admin', () => {
        const url = buildAdminLoginRedirect('https://cuc.fr', '/admin');
        expect(url.pathname).toBe('/admin/login');
        expect(url.searchParams.get('next')).toBeNull();
    });

    it('conserve le chemin et la query string dans le paramètre next pour les sous-pages', () => {
        const url = buildAdminLoginRedirect('https://cuc.fr', '/admin/aide', '?section=docs');
        expect(url.pathname).toBe('/admin/login');
        expect(url.searchParams.get('next')).toBe('/admin/aide?section=docs');
    });

    it('n’ajoute pas de paramètre next si la cible est une page d’authentification', () => {
        const url1 = buildAdminLoginRedirect('https://cuc.fr', '/admin/login');
        expect(url1.pathname).toBe('/admin/login');
        expect(url1.searchParams.get('next')).toBeNull();

        const url2 = buildAdminLoginRedirect('https://cuc.fr', '/admin/reset-password');
        expect(url2.pathname).toBe('/admin/login');
        expect(url2.searchParams.get('next')).toBeNull();
    });

    it('normalise les alias de connexion pour Lucas et Niels', () => {
        expect(normalizeCockpitLoginIdentifier('lucas')).toBe('campusucascades@gmail.com');
        expect(normalizeCockpitLoginIdentifier('lucas.d')).toBe('campusucascades@gmail.com');
        expect(normalizeCockpitLoginIdentifier('lucas.dollfus')).toBe('campusucascades@gmail.com');
        expect(normalizeCockpitLoginIdentifier('lucas.d@campus-universcascades.com')).toBe('campusucascades@gmail.com');
        expect(normalizeCockpitLoginIdentifier('niels')).toBe('niels.dalery@gmail.com');
        expect(normalizeCockpitLoginIdentifier('niels.dalery')).toBe('niels.dalery@gmail.com');
        expect(normalizeCockpitLoginIdentifier('custom@example.com')).toBe('custom@example.com');
    });
});
