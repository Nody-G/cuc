import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Fichier robots.txt généré dynamiquement.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // `/admin/` couvre tout le Cockpit (éditeur de pages, médias,
                // sauvegardes) : espace interne, jamais destiné à l'indexation.
                disallow: ["/api/", "/_next/", "/admin/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
