import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { SITE_URL } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { CUC_TEAM } from "@/data/team";

/**
 * Slugs réellement publiés (`site_pages.is_published`), lus une fois et mis en
 * cache sous le tag `site_pages` — la publication depuis le Cockpit rafraîchit
 * donc le sitemap sans redéploiement.
 *
 * `null` en cas d'échec de lecture : on n'ampute alors **rien** du sitemap
 * (mieux vaut une URL en trop qu'un site amputé sur une panne passagère).
 */
async function getPublishedSlugs(): Promise<Set<string> | null> {
    'use cache';
    cacheLife('max');
    cacheTag('site_pages');

    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('site_pages')
            .select('slug')
            .eq('is_published', true);

        if (error || !data) return null;
        return new Set(data.map((row) => String((row as { slug: string }).slug)));
    } catch {
        return null;
    }
}

/**
 * Sitemap XML généré dynamiquement.
 * Toutes les routes publiques du site CUC avec priorités et fréquences de mise à jour.
 *
 * Une page repassée en brouillon dans le Cockpit disparaît d'ici : c'est la seule
 * garde de diffusion disponible aujourd'hui (la garde serveur complète — 404
 * public + route d'aperçu admin — est décrite dans `plans/revue-diffusion-brouillons.md`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const publishedSlugs = await getPublishedSlugs();

    const routes: Array<{
        path: string;
        priority: number;
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    }> = [
            { path: "/", priority: 1.0, changeFrequency: "weekly" },
            { path: "/formation-de-cascadeur", priority: 0.9, changeFrequency: "monthly" },
            { path: "/stages-cascades-parkour-2", priority: 0.9, changeFrequency: "monthly" },
            { path: "/visite-guidee", priority: 0.8, changeFrequency: "monthly" },
            { path: "/visite-virtuelle", priority: 0.8, changeFrequency: "monthly" },
            { path: "/equipe-cascadeurs-pro", priority: 0.8, changeFrequency: "monthly" },
            ...CUC_TEAM.map((coach) => ({
                path: `/equipe-cascadeurs-pro/${coach.id}`,
                priority: 0.75,
                changeFrequency: "monthly" as const,
            })),
            { path: "/cuc-team-cascadeur", priority: 0.8, changeFrequency: "weekly" },
            { path: "/videos-cascadeur", priority: 0.7, changeFrequency: "weekly" },
            { path: "/spectacles-cascadeurs-yamakasi", priority: 0.7, changeFrequency: "monthly" },
            { path: "/animations-airbag-parkour", priority: 0.7, changeFrequency: "monthly" },
            { path: "/team-building-cascades", priority: 0.7, changeFrequency: "monthly" },
            { path: "/cuc-events-agence", priority: 0.7, changeFrequency: "monthly" },
            { path: "/stunt-workshop-cuc", priority: 0.7, changeFrequency: "monthly" },
            { path: "/partenaires", priority: 0.6, changeFrequency: "monthly" },
            { path: "/contact-cuc", priority: 0.6, changeFrequency: "yearly" },
        ];

    const frUrl = (p: string) => (p === "/" ? SITE_URL : `${SITE_URL}${p}`);
    const enUrl = (p: string) => (p === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${p}`);

    /** Slug tel que stocké en base : la racine est `'/'`, le reste sans barre oblique. */
    const dbSlug = (path: string) => (path === "/" ? "/" : path.replace(/^\//, ""));

    // Seules les pages éditoriales (`site_pages`) sont filtrées : les fiches coach
    // dépendent de `site_team` et gardent leur propre état de publication.
    const visibleRoutes = routes.filter(({ path }) => {
        if (!publishedSlugs) return true;
        if (path.startsWith("/equipe-cascadeurs-pro/")) return true;
        return publishedSlugs.has(dbSlug(path));
    });

    // Chaque page est déclarée en FR ET en EN, avec les alternances `hreflang`.
    return visibleRoutes.flatMap(({ path, priority, changeFrequency }) => {
        const languages = { fr: frUrl(path), en: enUrl(path) };
        return [
            {
                url: frUrl(path),
                lastModified: now,
                changeFrequency,
                priority,
                alternates: { languages },
            },
            {
                url: enUrl(path),
                lastModified: now,
                changeFrequency,
                priority: Math.max(0.1, Number((priority - 0.1).toFixed(2))),
                alternates: { languages },
            },
        ];
    });
}
