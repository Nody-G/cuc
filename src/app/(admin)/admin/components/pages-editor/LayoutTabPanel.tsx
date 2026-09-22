'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import type { LayoutSection } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { PageLayoutManager } from '../PageLayoutManager';

export interface LayoutTabPanelProps {
    editorLocale: EditorLocaleOption;
    layoutSections: LayoutSection[];
    onChange: (sections: LayoutSection[]) => void;
    onReset: () => void;
}

/** Onglet mise en page : structure des blocs, commune aux deux langues. */
export const LayoutTabPanel: React.FC<LayoutTabPanelProps> = ({
    editorLocale,
    layoutSections,
    onChange,
    onReset,
}) => (
    <div className="animate-in fade-in duration-150 space-y-4">
        {editorLocale === 'en' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
                <Sliders className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span>
                    La structure des blocs est <strong>commune aux deux langues</strong> : elle se règle en
                    français. Ces libellés d'administration ne sont jamais publiés sur la vitrine, ils ne
                    se traduisent donc pas.
                </span>
            </div>
        )}
        <PageLayoutManager
            layoutSections={layoutSections}
            onChange={onChange}
            onReset={onReset}
        />
    </div>
);
