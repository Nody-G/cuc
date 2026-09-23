import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import fr from '../../../../messages/fr.json';
import en from '../../../../messages/en.json';
import { CampusViewerHUD } from './CampusViewerHUD';

// `@/i18n/navigation` charge le routeur client de next-intl, non résolu hors
// serveur Next : même neutralisation que les autres audits de composants.
vi.mock('@/i18n/navigation', async () => {
    const { createElement } = await import('react');
    return {
        Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
            createElement('a', { href, ...rest }, children),
    };
});

/**
 * Garde-fou de copie du HUD public du plan 3D.
 *
 * Constat corrigé le 2026-09-23 : la barre de contrôle du plan (publique, servie
 * sur `/en/…`) était écrite en français en dur — un visiteur anglais lisait
 * « Plan 3D du domaine », « Recentrer la vue », l'aide aux gestes, etc.
 * La copie vit désormais dans le catalogue `campus3dViewer` ; ce test prouve que
 * la locale change réellement ce qui est rendu.
 */

const baseProps = {
    onReset: () => undefined,
    isFullscreen: false,
    onToggleFullscreen: () => undefined,
    bearing: 42,
    cameraDistance: 180,
    activeFacility: null,
    isCardVisible: false,
    onCloseCard: () => undefined,
};

function renderHud(locale: 'fr' | 'en', messages: Record<string, unknown>) {
    return render(
        <NextIntlClientProvider locale={locale} messages={messages}>
            <CampusViewerHUD {...baseProps} />
        </NextIntlClientProvider>
    );
}

describe('CampusViewerHUD — copie localisée', () => {
    it('sert la copie anglaise sur une page EN', () => {
        renderHud('en', en);

        expect(screen.getByText('3D map of the estate')).toBeTruthy();
        expect(screen.getByLabelText('Recentre the view')).toBeTruthy();
        expect(screen.queryByText('Plan 3D du domaine')).toBeNull();
        expect(screen.queryByLabelText('Recentrer la vue')).toBeNull();
    });

    it('sert la copie française par défaut', () => {
        renderHud('fr', fr);

        expect(screen.getByText('Plan 3D du domaine')).toBeTruthy();
        expect(screen.getByLabelText('Recentrer la vue')).toBeTruthy();
        expect(screen.queryByText('3D map of the estate')).toBeNull();
    });
});
