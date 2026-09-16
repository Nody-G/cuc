import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
  async redirects() {
    return [
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
        source: '/stages-cascades-parkour-2-2',
        destination: '/stages-cascades-parkour-2',
        permanent: true,
      },
      {
        source: '/visite-virtuelle-360',
        destination: '/visite-virtuelle',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

