/** @type {import('next').NextConfig} */
const nextConfig = {
    // Simplified configuration for Next.js 14
    reactStrictMode: true,

    // Disable SWC minification to prevent chunk issues
    swcMinify: false,

    // Webpack configuration
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Disable caching in development
            config.cache = false;
        }

        return config;
    },

    // Experimental features for Next.js 14
    experimental: {
        appDir: true,
    },

    // Development indicators
    devIndicators: {
        buildActivity: false,
    },

    // Disable source maps
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 