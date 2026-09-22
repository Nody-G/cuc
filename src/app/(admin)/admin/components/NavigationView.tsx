'use client';

import React from 'react';
import { useNavigationEditor } from './navigation-view/useNavigationEditor';
import { NavigationHeader } from './navigation-view/NavigationHeader';
import { NavigationPublishToggle } from './navigation-view/NavigationPublishToggle';
import { NavigationItemsEditor } from './navigation-view/NavigationItemsEditor';
import { NavigationCtaCard } from './navigation-view/NavigationCtaCard';

interface NavigationViewProps {
    showToast: (msg: string) => void;
}

/**
 * Éditeur de la navigation principale (Navbar).
 *
 * Permet de réordonner, renommer, masquer, ajouter et supprimer les entrées
 * de premier niveau ainsi que leurs sous-entrées (menus déroulants), et de
 * régler le CTA principal. Persistance dans `site_navigation` (id = 'main').
 */
export const NavigationView: React.FC<NavigationViewProps> = ({ showToast }) => {
    const nav = useNavigationEditor({ showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête */}
            <NavigationHeader
                isPending={nav.isPending}
                onReset={nav.handleReset}
                onSave={nav.handleSave}
            />

            {/* Publication */}
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
            />

            {/* CTA principal */}
            <NavigationCtaCard cta={nav.structure.cta} onChange={nav.updateCta} />
        </div>
    );
};
