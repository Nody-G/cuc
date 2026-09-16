import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /stunt-workshop-cuc.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "STUNT WORKSHOP CUC";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "STUNT WORKSHOP",
        title: "STUNT WORKSHOP CUC",
        subtitle: "Ateliers techniques encadrés par des professionnels",
        metrics: ["ATELIERS", "PROS", "TECHNIQUE", "IMMERSION"],
    });
}
