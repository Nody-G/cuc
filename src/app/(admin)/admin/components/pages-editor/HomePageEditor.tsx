'use client';

import React from 'react';
import { SitePageContent } from '@/lib/data/site-service';
import { HOME_BLOCKS } from './home-page/home-blocks';
import { HomeEditorBlock } from './home-page/HomeEditorBlock';
import { useHomePageSections } from './home-page/useHomePageSections';

interface HomePageEditorProps {
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    setMediaPickerTarget: (target: string) => void;
}

/**
 * Éditeur des blocs de contenu de la page d'accueil.
 *
 * Couvre les six blocs `sections_data` historiquement codés en dur :
 * `about`, `tournages`, `virtual_tour`, `qualiopi`, `partners`, `social`.
 * Chaque champ est persisté dans `site_pages.sections_data` via le
 * formulaire parent (`PagesEditorView`).
 */
export const HomePageEditor: React.FC<HomePageEditorProps> = ({
    formData,
    setFormData,
    setMediaPickerTarget,
}) => {
    const { data, updateBlock } = useHomePageSections({ formData, setFormData });

    return (
        <div className="space-y-6">
            {HOME_BLOCKS.map((block) => (
                <HomeEditorBlock
                    key={block.id}
                    block={block}
                    data={data[block.id]}
                    onChange={(key, value) => updateBlock(block.id, key, value)}
                    onPickMedia={setMediaPickerTarget}
                />
            ))}
        </div>
    );
};
