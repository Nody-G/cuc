'use client';

import React from 'react';
import { useFooterEditor } from './footer-view/useFooterEditor';
import { FooterHeader } from './footer-view/FooterHeader';
import { FooterPublishToggle } from './footer-view/FooterPublishToggle';
import { FooterBrandCard } from './footer-view/FooterBrandCard';
import { FooterCertificationCard } from './footer-view/FooterCertificationCard';
import { FooterColumnsEditor } from './footer-view/FooterColumnsEditor';
import { FooterLegalCard } from './footer-view/FooterLegalCard';
import { StickySaveBar } from './ui/StickySaveBar';

interface FooterViewProps {
    showToast: (msg: string) => void;
}

/**
 * Éditeur du pied de page.
 *
 * Gère les colonnes de liens, l'identité de marque (nom, accroche, description),
 * la certification Qualiopi, et la mention légale + liens légaux.
 */
export const FooterView: React.FC<FooterViewProps> = ({ showToast }) => {
    const footer = useFooterEditor({ showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200 pb-16">
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

            {/* Certification Qualiopi (Nouveau) */}
            <FooterCertificationCard
                certification={footer.structure.certification}
                onChange={footer.updateCertification}
            />

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

            {/* Barre de sauvegarde flottante persistante */}
            <StickySaveBar
                isDirty={footer.isDirty}
                isPending={footer.isPending}
                onSave={footer.handleSave}
                label="Modifications du pied de page non enregistrées"
            />
        </div>
    );
};
