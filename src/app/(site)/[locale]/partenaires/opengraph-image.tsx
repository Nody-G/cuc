import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /partenaires.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "NOS PARTENAIRES";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "PARTENAIRES",
        title: "NOS PARTENAIRES",
        subtitle: "Les marques et fabricants qui accompagnent le Campus",
        metrics: ["NIKE", "RXR", "C17", "KILOUTOU"],
    });
}
