import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /formation-de-cascadeur.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "DEVENIR CASCADEUR DE CINÉMA";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "FORMATION PROFESSIONNELLE",
        title: "DEVENIR CASCADEUR DE CINÉMA",
        subtitle: "Cursus 2 ans / 720 h + Formule Découverte 12 jours",
        metrics: ["720 HEURES", "2 ANS", "AFDAS", "QUALIOPI"],
    });
}
