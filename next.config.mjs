/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
