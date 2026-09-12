/** @type {import('next').NextConfig} */

// Use standalone output only in CI (Cloud Build / Linux).
// On Windows, pnpm symlinks hit EPERM when Next.js writes the standalone dir.
const isCI = process.env.CI === 'true' || process.platform !== 'win32';

const nextConfig = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  transpilePackages: ['@paysurity/shared-types'],
  ...(isCI ? { output: 'standalone' } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://paysurity-api-44gyeebm6a-uc.a.run.app';
    return [
      {
        source: '/api/v1/:path*',
        destination: apiUrl + '/v1/:path*'
      },
      {
        source: '/api/:path*',
        destination: apiUrl + '/api/:path*'
      }
    ];
  },
  images: {
    domains: [
      'storage.googleapis.com',
      'paysurity.com',
      'paysurity-api-44gyeebm6a-uc.a.run.app'
    ]
  },
  experimental: {
    serverComponentsExternalPackages: []
  }
};

module.exports = nextConfig;
