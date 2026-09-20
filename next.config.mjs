/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF first: typically 30-50% smaller than WebP at the same quality.
    formats: ["image/avif", "image/webp"],
    // The layout never needs a 3840px derivative; capping the ladder stops
    // a retina laptop pulling a poster-sized file for a hero.
    deviceSizes: [420, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
    qualities: [60, 70, 80],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/work', destination: '/customer-stories', permanent: true },
      { source: '/what-we-do/assessments-and-audits', destination: '/what-we-do/assessments', permanent: true },
    ];
  },
};
export default nextConfig;
