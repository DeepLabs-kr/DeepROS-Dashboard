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
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  webpack: (config) => {
    config.externals.push({
      '@neondatabase/serverless': '@neondatabase/serverless'
    })
    return config
  }
}

export default nextConfig
