/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Warning: This disables ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This disables TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/predict',
        destination:
          process.env.NODE_ENV === 'production'
            ? 'http://backend:8000/predict'
            : 'http://127.0.0.1:8000/predict',
      },
    ];
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;