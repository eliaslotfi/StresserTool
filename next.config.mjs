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
<<<<<<< Current (Your changes)
  // Optimisations pour Railway
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Configuration pour la production
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
=======
  // Configuration pour Railway
  poweredByHeader: false,
  compress: true,
  // Port dynamique pour Railway
  env: {
    PORT: process.env.PORT || '3000',
  },
>>>>>>> Incoming (Background Agent changes)
}

export default nextConfig
