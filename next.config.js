/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enhanced chunk loading configuration for better reliability
    webpack: (config, { dev, isServer }) => {
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