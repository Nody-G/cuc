import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /spectacles-cascades-yamakasi.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "SPECTACLES & YAMAKASI";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "SPECTACLES",
        title: "SPECTACLES & YAMAKASI",
        subtitle: "Shows de cascades et démonstrations live",
        metrics: ["LIVE", "YAMAKASI", "PARKOUR", "ÉVÉNEMENTS"],
    });
}
