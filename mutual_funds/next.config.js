/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: undefined,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  trailingSlash: false,
  output: 'standalone'
}

module.exports = nextConfig