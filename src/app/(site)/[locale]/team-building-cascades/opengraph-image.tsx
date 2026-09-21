import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /team-building-cascades.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "TEAM BUILDING CASCADES";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "TEAM BUILDING",
        title: "TEAM BUILDING CASCADES",
        subtitle: "Cohésion d'équipe par l'action et le dépassement",
        metrics: ["ENTREPRISES", "COHÉSION", "SUR-MESURE", "DEPUIS 2008"],
    });
}
