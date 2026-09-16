import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /animations-airbag-parkour.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "AIRBAG & PARKOUR";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "ANIMATIONS",
        title: "AIRBAG & PARKOUR",
        subtitle: "Animations grand public et airbag de réception",
        metrics: ["AIRBAG", "PARKOUR", "FAMILLE", "SÉCURISÉ"],
    });
}
