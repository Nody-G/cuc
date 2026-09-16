import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /stages-cascades-parkour-2.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "STAGES CASCADES & PARKOUR";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "STAGES & PARKOUR",
        title: "STAGES CASCADES & PARKOUR",
        subtitle: "Week-ends intensifs et stages thématiques ouverts à tous",
        metrics: ["WEEK-ENDS", "TOUS NIVEAUX", "PARKOUR", "CASCADES"],
    });
}
