import { routeOgOptions } from "@/lib/og/route-og-copy";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

/**
 * Image Open Graph générée dynamiquement pour la route /equipe-cascadeurs-pro.
 * Rendu 1200×630 via la fabrique partagée (charte CUC) ; la copie bilingue vit
 * dans `route-og-copy.ts` — la même entrée sert de repli aux fiches coachs
 * (`coach-og.ts`), donc une seule formulation par carte.
 *
 * `alt` reste le nom de la marque (identique FR/EN) : une description localisée
 * demanderait `generateImageMetadata`, volontairement écarté ici.
 */
export const alt = "Campus Univers Cascades";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    return renderOgImage(routeOgOptions("equipe-cascadeurs-pro", locale));
}
