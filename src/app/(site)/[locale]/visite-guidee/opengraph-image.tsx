import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /visite-guidee.
 * Rendu 1200×630 via la fabrique partagée (charte CUC).
 */
export const alt = "VISITEZ LE CAMPUS";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
    return renderOgImage({
        eyebrow: "VISITE GUIDÉE",
        title: "VISITEZ LE CAMPUS",
        subtitle: "Découvrez des installations uniques",
        metrics: ["11 000 M²", "CUC TOWER", "SUR RDV", "GRATUIT"],
    });
}
