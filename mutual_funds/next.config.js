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
      { protocol: 'https', hostname: 'added-emerald-or0xddgpgb.edgeone.app' },
      { protocol: 'https', hostname: 'psychological-coral-jdlpbjflaf.edgeone.app' },
      { protocol: 'https', hostname: 'lottie.host' },
    ],
  },
  // Suppress service worker warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ignore service worker loader warnings
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /service-worker/,
        /Could not establish connection/,
      ];
    }
    return config;
  },
}

module.exports = nextConfig
