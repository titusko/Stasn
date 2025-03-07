
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/')
    };
    return config;
  },
  swcMinify: true,
  compiler: {
    styledComponents: true,
  }
};

module.exports = nextConfig;
