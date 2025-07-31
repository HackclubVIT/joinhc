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
  experimental: {
    swcTraceProfiling: true,
  },
  transpilePackages: ['@acme/ui', 'lodash-es'],
};

export default nextConfig;
