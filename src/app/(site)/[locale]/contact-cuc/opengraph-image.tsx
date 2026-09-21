import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /contact-cuc.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "CONTACTEZ LE CUC";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "CONTACT",
        title: "CONTACTEZ LE CUC",
        subtitle: "Inscriptions, stages et renseignements",
        metrics: ["INSCRIPTIONS", "STAGES", "DEVIS", "RÉPONSE RAPIDE"],
    });
}
