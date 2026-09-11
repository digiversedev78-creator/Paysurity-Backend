
/** @type {import('next').NextConfig} */
const isCI = process.env.CI === 'true' || process.env.GOOGLE_CLOUD_BUILD === 'true';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@paysurity/ui', '@paysurity/database'],
  ...(isCI ? { output: 'standalone' } : {}),
};

module.exports = nextConfig;
