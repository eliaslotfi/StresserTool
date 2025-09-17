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
  // Configuration pour déploiement statique sur Infomaniak
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  // Configuration pour la production
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  // Exclure les routes API du build statique
  async generateBuildId() {
    return 'infomaniak-static-build'
  }
}

export default nextConfig