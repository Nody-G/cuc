'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ParallaxHero } from '@/components/ui/ParallaxHero';
import { StudioGlobalAtmosphere } from '@/components/ui/parallax';
import dynamic from 'next/dynamic';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

/**
 * Frontière de chargement des sections sous la ligne de flottaison — WS-P0.2.
 *
 * Le hero ([`ParallaxHero`](src/components/ui/ParallaxHero.tsx:1)), la navigation
 * et le pied de page restent *eager* : seules les sections ci-dessous passent par
 * `next/dynamic`, pour que leur JavaScript soit découpé dans des chunks
 * asynchrones absents du graphe de premier chargement.
 *
 * `ssr: true` est **requis** : c'est la valeur qui conserve le HTML prérendu de
 * chaque section (SEO + LCP) — seul le JS est différé, jamais le markup. Vérifié
 * dans la doc Next 16.3.5
 * (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`) : `ssr: false`
 * supprime ce markup et n'est de toute façon pas autorisé dans un Server
 * Component. Les `import()` littéraux ciblent les modules réels (jamais le
 * barrel `./index`) afin que le découpage se fasse section par section. Les
 * déclarations sont au niveau module : `next/dynamic` ne peut pas être appelé
 * pendant le rendu.
 */
const HomeAboutSection = dynamic(
    () => import('@/components/sections/home/HomeAboutSection').then((m) => m.HomeAboutSection),
    { ssr: true },
);

const HomeTournagesSection = dynamic(
    () => import('@/components/sections/home/HomeTournagesSection').then((m) => m.HomeTournagesSection),
    { ssr: true },
);

const HomeVirtualTourSection = dynamic(
    () =>
        import('@/components/sections/home/HomeVirtualTourSection').then(
            (m) => m.HomeVirtualTourSection,
        ),
    { ssr: true },
);

const HomeQualiopiSection = dynamic(
    () => import('@/components/sections/home/HomeQualiopiSection').then((m) => m.HomeQualiopiSection),
    { ssr: true },
);

const HomeSocialSection = dynamic(
    () => import('@/components/sections/home/HomeSocialSection').then((m) => m.HomeSocialSection),
    { ssr: true },
);

/**
 * Vue cliente de l'accueil — îlot interactif.
 *
 * Le contenu éditorial (déjà localisé : FR + overlay EN fusionnés) arrive du
 * serveur via `SiteDataProvider` posé par la route : `usePageDynamicContent` le
 * consomme comme état initial, ce qui garantit un premier rendu correct en
 * anglais (plus de français fugace) tout en conservant la parallaxe, les
 * modales et le Realtime.
 */
export const HomeView: React.FC = () => {
    const { content } = usePageDynamicContent('/');

    // Tri et filtrage des sections selon l'agencement configuré dans le Cockpit
    const sortedSections = [...(content.layout_sections || [])]
        .filter((s) => s.is_visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Rendu modulaire de chaque bloc dynamique
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
            {/* Studio Animation Continuous Global Depth Atmosphere */}
            <StudioGlobalAtmosphere />

            <Navbar />

            <main id="contenu-principal" className="flex-grow pt-28 relative z-10">
                {sortedSections.length > 0 ? (
                    sortedSections.map((sec) => renderSection(sec.id))
                ) : (
                    /* Fallback résilient officiel si aucune section n'est configurée */
                    <>
                        <ParallaxHero heroData={content.hero} />
                        <HomeAboutSection aboutData={content.sections_data?.about} />
                        <HomeTournagesSection tournagesData={content.sections_data?.tournages} />
                        <HomeVirtualTourSection
                            virtualTourData={content.sections_data?.virtual_tour}
                        />
                        <HomeQualiopiSection qualiopiData={content.sections_data?.qualiopi} />
                        <HomeSocialSection socialData={content.sections_data?.social} />
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default HomeView;
