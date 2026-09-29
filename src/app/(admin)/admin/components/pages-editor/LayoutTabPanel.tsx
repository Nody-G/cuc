'use client';

import React from 'react';
import { Sliders, TriangleAlert } from 'lucide-react';
import type { LayoutSection } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { PageLayoutManager } from '../PageLayoutManager';

export interface LayoutTabPanelProps {
    editorLocale: EditorLocaleOption;
    layoutSections: LayoutSection[];
    onChange: (sections: LayoutSection[]) => void;
    onReset: () => void;
    /**
     * `false` lorsque la vitrine n'applique pas `layout_sections` sur cette
     * page : on l'annonce franchement plutôt que d'afficher un réglage inerte.
     */
    structureSupported: boolean;
    /** Catalogue des blocs de la page (pour réintégrer un bloc retiré). */
    availableSections?: LayoutSection[];
}

/**
 * Onglet mise en page : structure des blocs, commune aux deux langues.
 *
 * Le gestionnaire n'est proposé que sur les pages dont le rendu public lit
 * réellement `layout_sections` (cf. `BLOCK_STRUCTURE_PAGES`) ; ailleurs, un
 * message explique pourquoi l'agencement n'a pas d'effet.
 */
export const LayoutTabPanel: React.FC<LayoutTabPanelProps> = ({
    editorLocale,
    layoutSections,
    onChange,
    onReset,
    structureSupported,
    availableSections,
}) => {
    if (!structureSupported) {
        return (
            <div className="animate-in fade-in duration-150">
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 text-xs text-amber-200">
                    <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <div className="font-bold uppercase tracking-wider">
                            Cette page n'applique pas la structure des blocs
                        </div>
                        <p className="text-amber-200/80 leading-relaxed">
                            Le rendu public de cette page enchaîne ses sections dans un ordre fixe :
                            réordonner, masquer ou ajouter des blocs ici n'aurait aucun effet.
                            Les textes et les contenus de ces sections restent éditables depuis
                            l'onglet <strong>Contenu</strong>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-150 space-y-4">
            {editorLocale === 'en' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
                    <Sliders className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <span>
                        La structure des blocs est <strong>commune aux deux langues</strong> : elle se
                        règle en français. Ces libellés d'administration ne sont jamais publiés
                        sur la vitrine, ils ne se traduisent donc pas.
                    </span>
                </div>
            )}
            <PageLayoutManager
                layoutSections={layoutSections}
                onChange={onChange}
                onReset={onReset}
                availableSections={availableSections}
            />
        </div>
    );
};
