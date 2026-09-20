'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import {
    HomeAboutSection,
    HomeTournagesSection,
    HomeVirtualTourSection,
    HomeQualiopiSection,
    HomePartnersSection,
    HomeSocialSection,
} from '@/components/sections/home';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

/**
 * Rendu de l'aperçu live (même origine que le Cockpit).
 *
 * Le slug est lu depuis `?slug=` (défaut `/`). Le contenu provient de
 * `usePageDynamicContent`, qui :
 *  1. charge la version publiée depuis Supabase (rendu initial fidèle) ;
 *  2. s'abonne au store d'aperçu, alimenté par `PreviewBridgeClient` via
 *     `postMessage` — chaque modification du formulaire est donc reflétée
 *     instantanément, sans écriture en base ni rechargement.
 *
 * Les sections sont rendues dans l'ordre défini par `layout_sections`, avec un
 * repli résilient sur l'ensemble des sections si l'agencement est vide.
 */
export const PreviewRenderer: React.FC = () => {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug') || '/';
    const { content } = usePageDynamicContent(slug);

    const sortedSections = [...(content.layout_sections || [])]
        .filter((s) => s.is_visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const renderSection = (id: string) => {
        switch (id) {
            case 'hero':
                return <ParallaxHero key="hero" heroData={content.hero} />;
            case 'about':
                return <HomeAboutSection key="about" aboutData={content.sections_data?.about} />;
            case 'tournages':
                return (
                    <HomeTournagesSection
                        key="tournages"
                        tournagesData={content.sections_data?.tournages}
                    />
                );
            case 'virtual_tour':
                return (
                    <HomeVirtualTourSection
                        key="virtual_tour"
                        virtualTourData={content.sections_data?.virtual_tour}
                    />
                );
            case 'qualiopi':
                return (
                    <HomeQualiopiSection
                        key="qualiopi"
                        qualiopiData={content.sections_data?.qualiopi}
                    />
                );
            case 'partners':
                return (
                    <HomePartnersSection
                        key="partners"
                        partnersData={content.sections_data?.partners}
                    />
                );
            case 'social':
                return (
                    <HomeSocialSection key="social" socialData={content.sections_data?.social} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
            <main id="contenu-principal" className="flex-grow relative z-10">
                {sortedSections.length > 0 ? (
                    sortedSections.map((sec) => renderSection(sec.id))
                ) : (
                    <>
                        <ParallaxHero heroData={content.hero} />
                        <HomeAboutSection aboutData={content.sections_data?.about} />
                        <HomeTournagesSection tournagesData={content.sections_data?.tournages} />
                        <HomeVirtualTourSection
                            virtualTourData={content.sections_data?.virtual_tour}
                        />
                        <HomeQualiopiSection qualiopiData={content.sections_data?.qualiopi} />
                        <HomePartnersSection partnersData={content.sections_data?.partners} />
                        <HomeSocialSection socialData={content.sections_data?.social} />
                    </>
                )}
            </main>
        </div>
    );
};
