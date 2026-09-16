import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- Performance (2026) ---
  // React Compiler : mémoïsation automatique des composants (plus besoin de
  // useMemo/useCallback manuels dans la majorité des cas).
  reactCompiler: true,
  // Partial Prerendering (PPR) : coquille statique servie instantanément +
  // zones dynamiques streamées via Suspense. (renommé cacheComponents en Next.js 16)
  cacheComponents: true,
  images: {
    // Formats modernes servis en priorité (gain ~30-50 % vs JPEG/PNG).
    formats: ["image/avif", "image/webp"],
    // Tailles de srcset adaptées aux breakpoints réels du site.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.campus-universcascades.com",
      },
      {
        protocol: "https",
        hostname: "campus-universcascades.com",
      },
      {
        protocol: "http",
        hostname: "campus-universcascades.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // --- Sécurité ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // --- Anciennes URL du site historique (campus-universcascades.com) ---
      {
        source: '/formations',
        destination: '/formation-de-cascadeur',
        permanent: true,
      },
      {
        source: '/disciplines',
        destination: '/formation-de-cascadeur',
        permanent: true,
      },
      {
        source: '/campus',
        destination: '/visite-guidee',
        permanent: true,
      },
      {
        source: '/filmographie',
        destination: '/cuc-team-cascadeur',
        permanent: true,
      },
      {
        source: '/equipe',
        destination: '/equipe-cascadeurs-pro',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/contact-cuc',
        permanent: true,
      },
      {
        source: '/visite-virtuelle-360',
        destination: '/visite-virtuelle',
        permanent: true,
      },
      // --- Variantes de slugs historiques (évite les 404 sur liens indexés) ---
      {
        source: '/stages-cascades-parkour',
        destination: '/stages-cascades-parkour-2',
        permanent: true,
      },
      {
        source: '/stages-cascades-parkour-2-2',
        destination: '/stages-cascades-parkour-2',
        permanent: true,
      },
      {
        source: '/stages-cascades-parkour-3',
        destination: '/stages-cascades-parkour-2',
        permanent: true,
      },
      {
        source: '/cuc-team-cascadeurs',
        destination: '/cuc-team-cascadeur',
        permanent: true,
      },
      {
        source: '/equipe-cascadeurs',
        destination: '/equipe-cascadeurs-pro',
        permanent: true,
      },
      {
        source: '/videos-cascadeurs',
        destination: '/videos-cascadeur',
        permanent: true,
      },
      {
        source: '/spectacles-cascadeurs',
        destination: '/spectacles-cascadeurs-yamakasi',
        permanent: true,
      },
      {
        source: '/team-building',
        destination: '/team-building-cascades',
        permanent: true,
      },
      {
        source: '/animations-airbag',
        destination: '/animations-airbag-parkour',
        permanent: true,
      },
      {
        source: '/stunt-workshop',
        destination: '/stunt-workshop-cuc',
        permanent: true,
      },
      {
        source: '/cuc-events',
        destination: '/cuc-events-agence',
        permanent: true,
      },
      {
        source: '/partenaires-cuc',
        destination: '/partenaires',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

