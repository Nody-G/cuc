import { ImageResponse } from 'next/og';

/**
 * Favicon du site — jaune signalétique CUC, monogramme noir.
 *
 * Le logo complet (anneau + lettrage orné) devient illisible à 16 px : l'ongle
 * du navigateur reçoit donc un monogramme plat, lisible à toute taille, et le
 * logotype complet reste porté par `apple-icon` et l'image Open Graph.
 *
 * Convention Next (docs `app-icons`) : `icon` peut être généré ; `favicon.ico`
 * ne le peut pas — l'ancien fichier statique est retiré pour que cette icône
 * soit celle réellement servie aux navigateurs.
 */
export const size = {
    width: 96,
    height: 96,
};

export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFE500',
                    color: '#0A0A0A',
                    fontSize: 40,
                    fontWeight: 900,
                    letterSpacing: -3,
                    boxShadow: 'inset 0 0 0 8px #0A0A0A',
                }}
            >
                CUC
            </div>
        ),
        { ...size }
    );
}
