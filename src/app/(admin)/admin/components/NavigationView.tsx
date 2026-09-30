'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { toPageKey } from '@/lib/data/site/page-options';
import { buildPageTree } from '@/lib/data/site/page-tree';
import { useNavigationEditor } from './navigation-view/useNavigationEditor';
import { NavigationHeader } from './navigation-view/NavigationHeader';
import { NavigationPublishToggle } from './navigation-view/NavigationPublishToggle';
import { NavigationItemsEditor } from './navigation-view/NavigationItemsEditor';
import { NavigationCtaCard } from './navigation-view/NavigationCtaCard';
import { StickySaveBar } from './ui/StickySaveBar';

interface NavigationViewProps {
    showToast: (msg: string) => void;
    /** Pages réellement en base : seules celles-là se relient à une entrée. */
    pages: readonly SitePageContent[];
    /** Page déposée ici par l'éditeur de pages, à retrouver dans l'arborescence. */
    focusSlug?: string | null;
    /** Ouvre une page dans l'éditeur de pages (interconnexion inverse). */
    onEditPage: (slug: string) => void;
}

/**
 * Éditeur de la navigation principale (Navbar).
 *
 * Permet de réordonner, renommer, masquer, ajouter et supprimer les entrées
 * de premier niveau ainsi que leurs sous-entrées (menus déroulants), et de
 * régler le CTA principal. Persistance dans `site_navigation` (id = 'main').
 *
 * Le menu cessait d'être un monde clos : chaque entrée nomme la **page** qu'elle
 * sert (nom canonique de `page-tree.ts`) et peut l'ouvrir dans l'éditeur de
 * pages ; l'éditeur de pages peut, en retour, déposer ici la page à retrouver.
 */
export const NavigationView: React.FC<NavigationViewProps> = ({
    showToast,
    pages,
    focusSlug,
    onEditPage,
}) => {
    const nav = useNavigationEditor({ showToast });

    /**
     * Arbre bâti sur le **brouillon** en cours, jamais sur la version publiée :
     * la puce doit suivre ce que l'on est en train d'éditer, pas ce qui est en
     * ligne.
     */
    const tree = useMemo(
        () =>
            buildPageTree({
                navigation: nav.structure,
                availableSlugs: pages.map((page) => page.slug),
            }),
        [nav.structure, pages]
    );

    const resolvePage = useMemo(
        () => (href: string | undefined) => {
            if (!href) return null;
            return tree.byKey[toPageKey(href)] ?? null;
        },
        [tree]
    );

    /** Une seule application par page ciblée : évite de re-défiler à chaque rendu. */
    const appliedFocus = useRef<string | null>(null);

    useEffect(() => {
        if (!focusSlug || nav.isLoading) return;
        if (appliedFocus.current === focusSlug) return;
        appliedFocus.current = focusSlug;

        const key = toPageKey(focusSlug);
        const target = nav.items.find((item) => {
            if (item.href && toPageKey(item.href) === key) return true;
            return (item.children ?? []).some((child) => toPageKey(child.href) === key);
        });
        if (!target) return;

        nav.expandItem(target.id);
        document
            .getElementById(`nav-entry-${target.id}`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [focusSlug, nav]);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <NavigationHeader
                isPending={nav.isPending}
                onReset={nav.handleReset}
                onSave={nav.handleSave}
            />

            <NavigationPublishToggle isPublished={nav.isPublished} onChange={nav.setPublished} />

            <NavigationItemsEditor
                isLoading={nav.isLoading}
                items={nav.items}
                expandedId={nav.expandedId}
                onMoveItem={nav.moveItem}
                onUpdateItem={nav.updateItem}
                onRemoveItem={nav.removeItem}
                onToggleExpanded={nav.toggleExpanded}
                onMoveChild={nav.moveChild}
                onUpdateChild={nav.updateChild}
                onRemoveChild={nav.removeChild}
                onAddChild={nav.addChild}
                onAddItem={nav.addItem}
                resolvePage={resolvePage}
                onEditPage={onEditPage}
            />

            <NavigationCtaCard cta={nav.structure.cta} onChange={nav.updateCta} />

            {/* Barre de sauvegarde flottante persistante */}
            <StickySaveBar
                isDirty={nav.isDirty}
                isPending={nav.isPending}
                onSave={nav.handleSave}
                label="Modifications de la navigation non enregistrées"
            />
        </div>
    );
};
