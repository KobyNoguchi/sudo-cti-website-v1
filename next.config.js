/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility
  output: 'standalone',
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false, // Cloudflare handles optimization
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure static assets are served correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig

