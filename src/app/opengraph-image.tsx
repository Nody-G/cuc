import { ImageResponse } from "next/og";

/**
 * Image Open Graph générée dynamiquement pour la page d'accueil.
 * Rendu 1200×630 conforme aux spécifications des réseaux sociaux.
 */
export const alt = "Campus Univers Cascades — École Professionnelle de Cascadeurs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
                    <div
                        style={{
                            width: 14,
                            height: 56,
                            background: "#FFE500",
                        }}
                    />
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
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div
                        style={{
                            color: "#ffffff",
                            fontSize: 76,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: -1,
                        }}
                    >
                        LA PLUS GRANDE ÉCOLE
                    </div>
                    <div
                        style={{
                            color: "#FFE500",
                            fontSize: 76,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: -1,
                        }}
                    >
                        DE CASCADEURS AU MONDE
                    </div>
                </div>

                {/* Bandeau inférieur — chiffres clés */}
                <div
                    style={{
                        display: "flex",
                        gap: 48,
                        borderTop: "2px solid #27272a",
                        paddingTop: 28,
                        color: "#d4d4d8",
                        fontSize: 24,
                    }}
                >
                    <span>6 HECTARES</span>
                    <span style={{ color: "#FFE500" }}>•</span>
                    <span>CUC TOWER 21 M</span>
                    <span style={{ color: "#FFE500" }}>•</span>
                    <span>AGRÉMENT QUALIOPI</span>
                    <span style={{ color: "#FFE500" }}>•</span>
                    <span>DEPUIS 2008</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
