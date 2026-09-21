import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Racine Turbopack explicite : évite que Next.js remonte au-delà du dépôt
  // (ex. `package-lock.json` dans le dossier parent) et fige la résolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
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
      // Médias rapatriés sur Supabase Storage (bucket `cuc-vitrine-assets`).
      // Sans cette entrée, TOUTE requête `/_next/image?url=...supabase.co/...`
      // renvoie 400 Bad Request (erreur constatée en production sur les
      // slides du hero : slider-5/6/7/8-scaled.jpg).
      {
        protocol: "https",
        hostname: "xkbkcsypftvspmkfnrfm.supabase.co",
      },
      // Filet de sécurité : tout projet Supabase (sous-domaines Storage/CDN).
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      // Affiches officielles IMDb (Amazon Media Group).
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "media-amazon.com",
      },
      // Affiches officielles TMDB : source retenue pour les films dont le
      // visuel historique (ancien site) a été supprimé — aucune copie stockée.
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "ia.media-imdb.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
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
          // NOTE : `SAMEORIGIN` (et non `DENY`) est indispensable : l'aperçu
          // live du Cockpit encadre une page same-origin dans une iframe.
          // `DENY` bloquait cet encadrement (« This page couldn't load »).
          // `SAMEORIGIN` conserve la protection anti-clickjacking tout en
          // autorisant l'aperçu. Redondant avec `frame-ancestors 'self'` (CSP).
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
          {
            // `same-origin-allow-popups` (et non `same-origin`) : `same-origin`
            // isole totalement le contexte de navigation et empêchait l'aperçu
            // live (iframe same-origin) de se charger sur Vercel. Cette valeur
            // conserve l'isolation tout en autorisant les popups/iframes
            // légitimes du Cockpit.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            // CSP : autorise les scripts inline de Next.js (hydratation + JSON-LD
            // + Speculation Rules), les images distantes (Unsplash, campus) et
            // les iframes de la visite virtuelle 360°. `frame-ancestors` et
            // `object-src` verrouillent le clickjacking et les plugins.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // `wss:` est INDISPENSABLE : sans lui, le WebSocket Realtime de
              // Supabase est bloqué par le navigateur (« violates the following
              // Content Security Policy directive: connect-src 'self' https: »)
              // et la synchronisation Cockpit ↔ Vitrine ne fonctionne plus.
              "connect-src 'self' https: wss: wss://*.supabase.co",
              "frame-src 'self' https:",
              "media-src 'self' https: blob:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
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

export default withNextIntl(nextConfig);

