import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /cuc-events-agence.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "CUC EVENTS — AGENCE";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "AGENCE ÉVÉNEMENTIELLE",
        title: "CUC EVENTS — AGENCE",
        subtitle: "Production d'événements et de cascades sur mesure",
        metrics: ["PRODUCTION", "SUR-MESURE", "CINÉMA", "LIVE"],
    });
}
