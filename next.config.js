const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig

