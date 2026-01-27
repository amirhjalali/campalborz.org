/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@camp-platform/shared"],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/ALBORZ.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/ART.html',
        destination: '/art',
        permanent: true,
      },
      {
        source: '/HOMA.html',
        destination: '/art/homa',
        permanent: true,
      },
      {
        source: '/DAMAVAND.html',
        destination: '/art/damavand',
        permanent: true,
      },
      {
        source: '/EVENTS.html',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/DONATE.html',
        destination: '/donate',
        permanent: true,
      },
      {
        source: '/APPLY.html',
        destination: '/apply',
        permanent: true,
      },
      {
        source: '/MEMBERS.html',
        destination: '/members',
        permanent: true,
      },
      {
        source: '/THANKS.html',
        destination: '/donate/success',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: 'http://localhost:3005/api/trpc/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;