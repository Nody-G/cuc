'use client';

import React from 'react';
import { useFooterEditor } from './footer-view/useFooterEditor';
import { FooterHeader } from './footer-view/FooterHeader';
import { FooterPublishToggle } from './footer-view/FooterPublishToggle';
import { FooterBrandCard } from './footer-view/FooterBrandCard';
import { FooterColumnsEditor } from './footer-view/FooterColumnsEditor';
import { FooterLegalCard } from './footer-view/FooterLegalCard';

interface FooterViewProps {
    showToast: (msg: string) => void;
}

/**
 * Éditeur du pied de page.
 *
 * Gère les colonnes de liens, l'identité de marque (nom, accroche, description)
 * et la mention légale + liens légaux. Persistance dans `site_footer` (id = 'main').
 */
export const FooterView: React.FC<FooterViewProps> = ({ showToast }) => {
    const footer = useFooterEditor({ showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête */}
            <FooterHeader
                isPending={footer.isPending}
                onReset={footer.handleReset}
                onSave={footer.handleSave}
            />

            {/* Publication */}
            <FooterPublishToggle isPublished={footer.isPublished} onChange={footer.setPublished} />

            {/* Identité de marque */}
            <FooterBrandCard brand={footer.structure.brand} onChange={footer.updateBrand} />

            {/* Colonnes */}
            <FooterColumnsEditor
                isLoading={footer.isLoading}
                columns={footer.columns}
                expandedColumn={footer.expandedColumn}
                onMoveColumn={footer.moveColumn}
                onUpdateColumn={footer.updateColumn}
                onRemoveColumn={footer.removeColumn}
                onToggleColumnExpanded={footer.toggleColumnExpanded}
                onAddColumn={footer.addColumn}
                onMoveLink={footer.moveLink}
                onUpdateLink={footer.updateLink}
                onRemoveLink={footer.removeLink}
                onAddLink={footer.addLink}
            />

            {/* Mentions légales */}
            <FooterLegalCard
                legal={footer.structure.legal}
                links={footer.legalLinks}
                onUpdateCopyright={footer.updateCopyright}
                onUpdateLink={footer.updateLegalLink}
                onRemoveLink={footer.removeLegalLink}
                onAddLink={footer.addLegalLink}
            />
        </div>
    );
};
