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
  // Configuration pour Railway
  poweredByHeader: false,
  compress: true,
  // Port dynamique pour Railway
  env: {
    PORT: process.env.PORT || '3000',
  },
}

export default nextConfig
