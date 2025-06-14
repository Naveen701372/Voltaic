/** @type {import('next').NextConfig} */
const nextConfig = {
    // Clean webpack configuration to prevent module loading issues
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Ensure consistent module resolution
            config.resolve.alias = {
                ...config.resolve.alias,
            };

            // Force deterministic module IDs
            config.optimization = {
                ...config.optimization,
                moduleIds: 'deterministic',
                chunkIds: 'deterministic',
            };
        }

        return config;
    },

    // Use stable experimental features only
    experimental: {
        // Remove turbo option as it's causing warnings
    },

    // Enable source maps for better debugging
    productionBrowserSourceMaps: false,
};

module.exports = nextConfig; 