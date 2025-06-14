/** @type {import('next').NextConfig} */
const nextConfig = {
    // Force specific configuration for port 3000 stability
    reactStrictMode: false, // Disable strict mode to prevent double rendering issues

    // Disable SWC minification completely
    swcMinify: false,

    // Aggressive webpack configuration for port 3000
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Completely disable all caching
            config.cache = false;

            // Force specific module resolution
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };

            // Disable hot reloading optimizations that might cause issues
            config.optimization = {
                ...config.optimization,
                removeAvailableModules: false,
                removeEmptyChunks: false,
                splitChunks: false, // Disable chunk splitting completely
            };
        }

        return config;
    },

    // Remove all experimental features
    experimental: {},

    // Disable all development indicators
    devIndicators: {
        buildActivity: false,
    },

    // Force specific server configuration
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},

    // Disable source maps completely
    productionBrowserSourceMaps: false,

    // Force specific asset configuration
    assetPrefix: '',

    // Disable image optimization that might interfere
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig; 