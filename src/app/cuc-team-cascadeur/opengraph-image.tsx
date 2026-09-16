import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /cuc-team-cascadeur.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "CUC TEAM CASCADEURS";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "ÉQUIPE PROFESSIONNELLE",
        title: "CUC TEAM CASCADEURS",
        subtitle: "La troupe de cascadeurs professionnels du Campus",
        metrics: ["SPECTACLES", "CINÉMA", "ÉVÉNEMENTIEL", "LIVE"],
    });
}
