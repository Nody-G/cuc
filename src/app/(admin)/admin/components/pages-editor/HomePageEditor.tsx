'use client';

import React from 'react';
import { SitePageContent } from '@/lib/data/site-service';
import { HOME_BLOCKS } from './home-page/home-blocks';
import { HOME_LIST_BLOCKS } from './home-page/home-blocks-lists';
import { HomeEditorBlock } from './home-page/HomeEditorBlock';
import { HomeEditorListBlock } from './home-page/HomeEditorListBlock';
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
 * `about`, `tournages`, `virtual_tour`, `qualiopi`, `social`, plus les listes
 * éditoriales de `partners`. Chaque champ est persisté dans
 * `site_pages.sections_data` via le formulaire parent (`PagesEditorView`).
 *
 * Deux familles de contrôles : les champs **plats** (`HOME_BLOCKS`) et les items
 * de **listes fixes** (`HOME_LIST_BLOCKS`, déportées pour rester sous le plafond
 * de lignes et séparer les responsabilités).
 */
export const HomePageEditor: React.FC<HomePageEditorProps> = ({
    formData,
    setFormData,
    setMediaPickerTarget,
}) => {
    const { data, updateBlock, updateField } = useHomePageSections({ formData, setFormData });
    const sections = (formData.sections_data || {}) as Record<
        string,
        Record<string, unknown> | undefined
    >;

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

            {HOME_LIST_BLOCKS.map((block) => (
                <HomeEditorListBlock
                    key={`list-${block.id}`}
                    block={block}
                    blockData={sections[block.id]}
                    onItemChange={updateField}
                    onPickMedia={setMediaPickerTarget}
                />
            ))}
        </div>
    );
};
