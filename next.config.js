/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages with Next.js runtime - no output needed
  // Cloudflare automatically detects Next.js and uses their runtime
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable webpack cache for Cloudflare Pages (prevents 25MB file size limit error)
  webpack: (config) => {
    // Disable cache for both client and server builds
    config.cache = false
    return config
  },
}

module.exports = nextConfig

