/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enhanced chunk loading configuration for better reliability
    webpack: (config, { dev, isServer }) => {
        // Exclude generated-apps from webpack processing
        config.watchOptions = {
            ...config.watchOptions,
            ignored: [
                '**/node_modules/**',
                '**/generated-apps/**',
                '**/.git/**',
                '**/.next/**'
            ]
        };

        // Add plugin to ignore generated-apps directory completely
        const path = require('path');
        config.plugins.push(
            new (require('webpack').IgnorePlugin)({
                resourceRegExp: /generated-apps/,
                contextRegExp: /./
            })
        );

        // Only apply optimizations in production
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                        },
                    },
                },
            };
        }

        return config;
    },

    // Disable source maps in production for smaller bundles
    productionBrowserSourceMaps: false,

    // Image optimization
    images: {
        domains: [],
        unoptimized: false,
    },
};

module.exports = nextConfig; 