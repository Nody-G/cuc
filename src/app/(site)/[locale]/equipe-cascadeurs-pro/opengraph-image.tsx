import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /equipe-cascadeurs-pro.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "L'ÉQUIPE DU CAMPUS";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "L'ÉQUIPE",
        title: "L'ÉQUIPE DU CAMPUS",
        subtitle: "Formateurs, cascadeurs et encadrement technique",
        metrics: ["FORMATEURS", "CASCADEURS", "TECHNIQUE", "SÉCURITÉ"],
    });
}
