/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Ignore scrypt native module compilation issues
    config.externals = config.externals || [];
    config.externals.push({
      'scrypt': 'scrypt',
    });

    return config;
  },
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;