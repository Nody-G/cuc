import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /visite-virtuelle.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "EXPLOREZ EN 360°";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "VISITE VIRTUELLE 360°",
        title: "EXPLOREZ EN 360°",
        subtitle: "Visite immersive du domaine et du plan 3D",
        metrics: ["360°", "PLAN 3D", "IMMERSIF", "EN LIGNE"],
    });
}
