import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CUC_TEAM } from "@/data/team";

/**
 * Sitemap XML généré dynamiquement.
 * Toutes les routes publiques du site CUC avec priorités et fréquences de mise à jour.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

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

    // Chaque page est déclarée en FR ET en EN, avec les alternances `hreflang`.
    return routes.flatMap(({ path, priority, changeFrequency }) => {
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
