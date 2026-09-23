import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { checkIsAdmin } from '@/app/(admin)/admin/actions/auth';

/**
 * ==============================================================================
 * CUC — Aperçu éditeur : route dédiée, accès Cockpit uniquement
 * ==============================================================================
 * L'aperçu vit ici, PAS sur la vitrine publique : c'est ce qui permet à la
 * page publique de répondre un vrai **404** pour un brouillon
 * (`getPublicPageContent`) sans casser l'édition.
 *
 *  - accès : session admin obligatoire (`checkIsAdmin()` — mêmes rôles que le
 *    Cockpit) ; un visiteur non connecté reçoit un 404 discret, jamais un avis
 *    « page non publiée » qui révélerait l'existence du brouillon ;
 *  - indexation : `noindex, nofollow` — un aperçu n'a rien à faire dans Google ;
 *  - les écrans rendus sont les **mêmes** que la vitrine (`preview/screens.ts`
 *    importe les composants réels des 15 pages).
 */
export const metadata: Metadata = {
    title: 'Aperçu',
    robots: { index: false, follow: false },
};

/**
 * Segment volontairement « bloquant » : la garde lit la session (cookies) à
 * chaque requête — un aperçu ne se prérend jamais. Opt-out explicite de la
 * validation d'instantanéité (cf. route-segment-config/instant).
 */
export const instant = false;

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) notFound();

    return <>{children}</>;
}
