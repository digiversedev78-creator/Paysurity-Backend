
const path = require('path');
/** @type {import('next').NextConfig} */

// CI=true is set in Dockerfile (apps/public-website/Dockerfile line 16)
// This activates standalone output which is required for the Docker runner stage
const isCI = process.env.CI === 'true';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@paysurity/ui', '@paysurity/database'],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },

  // Explicitly expose NEXT_PUBLIC_ vars to the browser bundle.
  // These are baked in at build time from Docker ARG → ENV.
  // At runtime (Cloud Run) these are the values from cloudbuild.yaml --build-arg.
  env: {
    NEXT_PUBLIC_API_URL:       process.env.NEXT_PUBLIC_API_URL       || 'http://localhost:4000',
    NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.cookwithmanali.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.slurrp.com', pathname: '/**' },
      { protocol: 'https', hostname: '4.bp.blogspot.com', pathname: '/**' },
      { protocol: 'https', hostname: 'choice-paan.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      // Grubhub / Cloudinary CDN for HOB menu item images
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media-cdn.grubhub.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.grubhub.com', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/DEMOAPRIL2026',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
