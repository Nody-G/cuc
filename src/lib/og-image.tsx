import { ImageResponse } from "next/og";

/**
 * Fabrique d'images Open Graph dynamiques pour le CUC.
 *
 * Génère un visuel 1200×630 cohérent (charte noir / jaune #FFE500) à partir
 * d'un titre, d'un sur-titre et d'une liste de métriques. Utilisée par les
 * fichiers `opengraph-image.tsx` de chaque route pour éviter la duplication.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

export interface OgImageOptions {
    /** Sur-titre affiché en haut (ex. « FORMATION PROFESSIONNELLE »). */
    eyebrow: string;
    /** Titre principal, sur une ou deux lignes. */
    title: string;
    /** Ligne d'accroche optionnelle sous le titre. */
    subtitle?: string;
    /** Métriques affichées dans le bandeau inférieur. */
    metrics?: string[];
}

export function renderOgImage({
    eyebrow,
    title,
    subtitle,
    metrics = ["6 HECTARES", "CUC TOWER 21 M", "AGRÉMENT QUALIOPI", "DEPUIS 2008"],
}: OgImageOptions): ImageResponse {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "linear-gradient(135deg, #060608 0%, #12121a 55%, #1a1a08 100%)",
                    padding: "64px 72px",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Bandeau supérieur */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 14, height: 56, background: "#FFE500" }} />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            color: "#FFE500",
                            fontSize: 26,
                            letterSpacing: 6,
                            fontWeight: 700,
                        }}
                    >
                        <span>CAMPUS UNIVERS CASCADES</span>
                        <span style={{ color: "#a1a1aa", fontSize: 18, letterSpacing: 4 }}>
                            LE CATEAU-CAMBRÉSIS • 59
                        </span>
                    </div>
                </div>

                {/* Titre principal */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div
                        style={{
                            color: "#FFE500",
                            fontSize: 28,
                            fontWeight: 700,
                            letterSpacing: 4,
                        }}
                    >
                        {eyebrow}
                    </div>
                    <div
                        style={{
                            color: "#ffffff",
                            fontSize: 68,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: -1,
                            maxWidth: 1000,
                        }}
                    >
                        {title}
                    </div>
                    {subtitle ? (
                        <div style={{ color: "#a1a1aa", fontSize: 26, maxWidth: 980 }}>
                            {subtitle}
                        </div>
                    ) : null}
                </div>

                {/* Bandeau inférieur — chiffres clés */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 24,
                        borderTop: "2px solid #27272a",
                        paddingTop: 28,
                        color: "#d4d4d8",
                        fontSize: 22,
                    }}
                >
                    {metrics.map((metric, idx) => (
                        <div key={metric} style={{ display: "flex", gap: 24 }}>
                            {idx > 0 ? <span style={{ color: "#FFE500" }}>•</span> : null}
                            <span>{metric}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        { ...OG_SIZE }
    );
}
