'use client';

import React from 'react';
import type { SitePartner } from '@/lib/data/site-service';
import { MediaPickerModal } from './MediaPickerModal';
import { PartnerCategoryFilter } from './partners-view/PartnerCategoryFilter';
import { PartnerEditorModal } from './partners-view/PartnerEditorModal';
import { PartnersGrid } from './partners-view/PartnersGrid';
import { PartnersHeader } from './partners-view/PartnersHeader';
import { usePartnersEditor } from './partners-view/usePartnersEditor';

interface PartnersViewProps {
  partners: SitePartner[];
  onPartnerSaved: (partner: SitePartner) => void;
  onPartnerDeleted: (id: string) => void;
  showToast: (msg: string) => void;
}

/**
 * Onglet « Partenaires & Marques » — **façade de composition**.
 *
 * Toute la logique vit dans `partners-view/` : domaine (`partners-model.ts`),
 * orchestration (`usePartnersEditor`) et présentation (`PartnersHeader`,
 * `PartnerCategoryFilter`, `PartnersGrid` → `PartnerCard`, `PartnerEditorModal`).
 */
export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  onPartnerSaved,
  onPartnerDeleted,
  showToast,
}) => {
  const editor = usePartnersEditor({
    partners,
    onPartnerSaved,
    onPartnerDeleted,
    showToast,
  });

  return (
    <div className="space-y-6">
      <PartnersHeader onCreate={editor.startCreate} />

      <PartnerCategoryFilter active={editor.filterCategory} onChange={editor.setFilterCategory} />

      <PartnersGrid
        partners={editor.filteredPartners}
        onEdit={editor.startEdit}
        onDelete={editor.remove}
      />

      {editor.editingPartner && (
        <PartnerEditorModal
          partner={editor.editingPartner}
          onChange={editor.updateDraft}
          onClose={editor.closeEditor}
          onSubmit={editor.submit}
          onOpenMediaPicker={editor.openMediaPicker}
        />
      )}

      {editor.showMediaPicker && (
        <MediaPickerModal
          isOpen={true}
          onClose={editor.closeMediaPicker}
          onSelectUrl={editor.applyLogo}
          title="Sélectionner le logo du partenaire"
        />
      )}
    </div>
  );
};
