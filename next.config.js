/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // optimizeCss: true, // Tạm thời tắt để tránh lỗi với critters
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Tối ưu navigation
    scrollRestoration: true,
  },
  
  // Tối ưu prefetch cho navigation
  reactStrictMode: true,

  // Tắt Next.js development indicator overlay
  devIndicators: {
    position: 'bottom-right',
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
      {
        protocol: "http",
        hostname: "103.90.225.90",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "103.90.225.90",
        port: "8084",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
