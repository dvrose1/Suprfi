/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Skip problematic global-error prerender
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
