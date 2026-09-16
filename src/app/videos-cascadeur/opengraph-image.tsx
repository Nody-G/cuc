import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /videos-cascadeur.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "LE CUC À L'ÉCRAN";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "VIDÉOS & REPORTAGES",
        title: "LE CUC À L'ÉCRAN",
        subtitle: "Séries TV, reportages et coulisses du Campus",
        metrics: ["FRANCE 2", "BFM TV", "DAILYMOTION", "COULISSES"],
    });
}
