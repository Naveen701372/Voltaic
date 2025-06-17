/**
 * Configuration utilities for Voltaic platform
 */

export interface VoltaicConfig {
    preview: {
        forceBuildMode: boolean;
        maxConcurrentApps: number;
        basePort: number;
        buildTimeout: number;
    };
    ai: {
        hasAnthropicKey: boolean;
        hasOpenAIKey: boolean;
    };
}

/**
 * Get the current Voltaic configuration
 */
export function getVoltaicConfig(): VoltaicConfig {
    return {
        preview: {
            forceBuildMode: process.env.VOLTAIC_FORCE_BUILD_PREVIEW === 'true',
            maxConcurrentApps: parseInt(process.env.VOLTAIC_MAX_PREVIEW_APPS || '10'),
            basePort: parseInt(process.env.VOLTAIC_PREVIEW_BASE_PORT || '3100'),
            buildTimeout: parseInt(process.env.VOLTAIC_BUILD_TIMEOUT || '60000')
        },
        ai: {
            hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY
        }
    };
}

/**
 * Check if force build preview is enabled
 */
export function isForceBuildPreviewEnabled(): boolean {
    return process.env.VOLTAIC_FORCE_BUILD_PREVIEW === 'true';
}

/**
 * Get preview configuration
 */
export function getPreviewConfig() {
    return {
        forceBuildMode: isForceBuildPreviewEnabled(),
        maxConcurrentApps: parseInt(process.env.VOLTAIC_MAX_PREVIEW_APPS || '10'),
        basePort: parseInt(process.env.VOLTAIC_PREVIEW_BASE_PORT || '3100'),
        buildTimeout: parseInt(process.env.VOLTAIC_BUILD_TIMEOUT || '60000')
    };
} 