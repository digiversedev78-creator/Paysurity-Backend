/** @type {import('next').NextConfig} */
const nextConfig = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true },
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
