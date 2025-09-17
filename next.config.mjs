/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimisations pour Railway
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Configuration pour la production
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
}

export default nextConfig
