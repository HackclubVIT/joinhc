/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    swcTraceProfiling: true,
  },
  serverExternalPackages: ['@supabase/ssr'],
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      fileName: true,
      minify: true,
      transpileTemplateLiterals: false,
      pure: true,
      cssProp: true,
    },
    reactRemoveProperties: {
      properties: ['^data-test$', '^data-custom$'],
    },
  },
  transpilePackages: ['@acme/ui', 'lodash-es'],
};

export default nextConfig;
