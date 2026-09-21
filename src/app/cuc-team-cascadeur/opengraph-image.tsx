import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /cuc-team-cascadeur.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "TOURNAGE — CUC STUNT TEAM";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "PRESTATIONS & TOURNAGES",
        title: "TOURNAGE",
        subtitle: "Coordination de cascades et CUC Stunt Team pour le cinéma",
        metrics: ["CINÉMA", "SÉRIES", "PUBLICITÉ", "LIVE"],
    });
}
