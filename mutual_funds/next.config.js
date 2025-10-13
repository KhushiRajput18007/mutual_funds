/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  trailingSlash: false,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'reasonable-harlequin-ex4bber2my.edgeone.app' },
    ],
  },
}

module.exports = nextConfig