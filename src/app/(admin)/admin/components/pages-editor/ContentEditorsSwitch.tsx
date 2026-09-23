'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { HeroSeoEditor } from './HeroSeoEditor';
import { HomePageEditor } from './HomePageEditor';
import { TeamBuildingPageEditor } from './TeamBuildingPageEditor';
import { FormationPageEditor } from './FormationPageEditor';
import { StagesPageEditor } from './StagesPageEditor';
import { ContactPageEditor } from './ContactPageEditor';
import { VideosPageEditor } from './VideosPageEditor';
import { KeyStatsEditor } from './KeyStatsEditor';
import type { SectionHandlers } from './useSectionHandlers';

export interface ContentEditorsSwitchProps {
    /** Slug de la structure éditée (source française). */
    slug: string;
    activeData: SitePageContent;
    setActiveData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    isTranslationLoading: boolean;
    editorLocale: EditorLocaleOption;
    /** Champs non traduits (avis EN). */
    coverageMissing: string[];
    /** Listes désalignées depuis la traduction (avis EN). */
    coverageStale: string[];
    onMediaRequest: (target: string) => void;
    handlers: SectionHandlers;
}

/**
 * Éditeurs de contenu de la page courante. Rendu soit seul (onglet
 * « Contenu »), soit côte à côte avec l'aperçu live (vue partagée).
 */
export const ContentEditorsSwitch: React.FC<ContentEditorsSwitchProps> = ({
    slug,
    activeData,
    setActiveData,
    isTranslationLoading,
    editorLocale,
    coverageMissing,
    coverageStale,
    onMediaRequest,
    handlers,
}) => {
    // En anglais, on n'affiche jamais la traduction d'une autre page : le temps du
    // chargement, on montre un état explicite plutôt qu'un formulaire trompeur.
    if (isTranslationLoading) {
        return (
            <div className="flex items-center justify-center gap-3 p-10 rounded-xl bg-[#0D0D12] border border-white/10 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#FFE500]" />
                <span>Chargement de la traduction anglaise…</span>
            </div>
        );
    }

    // Les mêmes éditeurs qu'en français : seule la source des valeurs change.
    // La structure affichée reste celle du français.
    return (
        <div className="space-y-6 animate-in fade-in duration-150">
            {editorLocale === 'en' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 space-y-1.5">
                    <div>
                        Vous éditez la version anglaise. Les champs encore en français sont hérités : remplacez-les
                        pour les traduire.
                    </div>
                    {coverageMissing.length > 0 && (
                        <div className="text-gray-400 font-mono">
                            Restent à traduire : {coverageMissing.slice(0, 6).join(' · ')}
                            {coverageMissing.length > 6 ? ' …' : ''}
                        </div>
                    )}
                    {coverageStale.length > 0 && (
                        <div className="text-amber-300">
                            Structure modifiée depuis la traduction (
                            {coverageStale.join(', ')}) : la liste anglaise
                            correspondante n'est plus enregistrée tant qu'elle n'est pas réalignée.
                        </div>
                    )}
                </div>
            )}

            {/* Bloc A & B1 : Hero & Référencement */}
            <HeroSeoEditor
                formData={activeData}
                setFormData={setActiveData}
                setMediaPickerTarget={onMediaRequest}
            />

            {/* Bloc B1 : Accueil (6 blocs de contenu) */}
            {slug === '/' && (
                <HomePageEditor
                    formData={activeData}
                    setFormData={setActiveData}
                    setMediaPickerTarget={onMediaRequest}
                />
            )}

            {/* Bloc B2 : Team Building */}
            {slug === 'team-building-cascades' && (
                <TeamBuildingPageEditor
                    formData={activeData}
                    setFormData={setActiveData}
                    setMediaPickerTarget={onMediaRequest}
                    handleUpdateWorkshop={handlers.handleUpdateWorkshop}
                    handleAddWorkshop={handlers.handleAddWorkshop}
                    handleRemoveWorkshop={handlers.handleRemoveWorkshop}
                />
            )}

            {/* Bloc B3 : Formation Pro 2 Ans */}
            {slug === 'formation-de-cascadeur' && (
                <FormationPageEditor
                    formData={activeData}
                    setFormData={setActiveData}
                    handleUpdateFormule={handlers.handleUpdateFormule}
                />
            )}

            {/* Bloc B4 : Stages & Parkour */}
            {slug === 'stages-cascades-parkour-2' && (
                <StagesPageEditor
                    formData={activeData}
                    handleUpdateStageItem={handlers.handleUpdateStageItem}
                    handleAddStageItem={handlers.handleAddStageItem}
                    handleRemoveStageItem={handlers.handleRemoveStageItem}
                />
            )}

            {/* Bloc B5 : Contact & Accès */}
            {slug === 'contact-cuc' && (
                <ContactPageEditor formData={activeData} setFormData={setActiveData} />
            )}

            {/* Bloc B6 : Vidéos & Reels Instagram */}
            {slug === 'videos-cascadeur' && (
                <VideosPageEditor
                    formData={activeData}
                    setFormData={setActiveData}
                    setMediaPickerTarget={onMediaRequest}
                />
            )}

            {/* Bloc C : Chiffres Clés & Statistiques */}
            <KeyStatsEditor
                formData={activeData}
                handleAddKeyStat={handlers.handleAddKeyStat}
                handleRemoveKeyStat={handlers.handleRemoveKeyStat}
                handleUpdateKeyStat={handlers.handleUpdateKeyStat}
            />
        </div>
    );
};
