/**
 * Environment Detection and Production-Safe Operations for Voltaic
 * 
 * This module handles the complexities of detecting different hosting environments
 * and provides safe alternatives for file operations in production.
 */

export interface EnvironmentInfo {
    isProduction: boolean;
    platform: 'vercel' | 'netlify' | 'aws-lambda' | 'local' | 'unknown';
    workingDirectory: string;
    canWriteFiles: boolean;
    writableDirectory: string | null;
    detectionReasons: string[];
}

/**
 * Comprehensive environment detection for different hosting platforms
 */
export function detectEnvironment(): EnvironmentInfo {
    const detectionReasons: string[] = [];
    let platform: EnvironmentInfo['platform'] = 'unknown';
    let isProduction = false;

    // Check Node.js environment
    if (process.env.NODE_ENV === 'production') {
        isProduction = true;
        detectionReasons.push('NODE_ENV=production');
    }

    // Vercel detection
    if (process.env.VERCEL === '1') {
        platform = 'vercel';
        isProduction = true;
        detectionReasons.push('VERCEL=1');
    }

    if (process.env.VERCEL_ENV === 'production') {
        platform = 'vercel';
        isProduction = true;
        detectionReasons.push('VERCEL_ENV=production');
    }

    // Working directory detection (primary indicator for Vercel Lambda)
    if (process.cwd().includes('/var/task')) {
        platform = 'vercel';
        isProduction = true;
        detectionReasons.push('Working directory contains /var/task (Vercel Lambda)');
    }

    if (process.cwd().includes('/.vercel/')) {
        platform = 'vercel';
        detectionReasons.push('Working directory contains /.vercel/ (Vercel local development)');
    }

    // Netlify detection
    if (process.env.NETLIFY === 'true') {
        platform = 'netlify';
        isProduction = true;
        detectionReasons.push('NETLIFY=true');
    }

    // AWS Lambda detection
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        platform = 'aws-lambda';
        isProduction = true;
        detectionReasons.push('AWS_LAMBDA_FUNCTION_NAME detected');
    }

    // Default to production if NODE_ENV is not set (common in serverless)
    if (!process.env.NODE_ENV) {
        isProduction = true;
        detectionReasons.push('NODE_ENV not set (defaulting to production)');
    }

    // Determine if we're in local development
    if (!isProduction && !detectionReasons.length) {
        platform = 'local';
        detectionReasons.push('Local development environment detected');
    }

    // Determine file write capabilities
    const canWriteFiles = !isProduction || platform === 'local';
    let writableDirectory: string | null = null;

    if (canWriteFiles) {
        writableDirectory = process.cwd();
    } else if (isProduction) {
        // In production, only /tmp/ is writable (ephemeral)
        writableDirectory = '/tmp';
    }

    return {
        isProduction,
        platform,
        workingDirectory: process.cwd(),
        canWriteFiles,
        writableDirectory,
        detectionReasons
    };
}

/**
 * Get a safe directory path for file operations based on environment
 */
export function getSafeProjectDirectory(projectId: string): {
    path: string;
    isEphemeral: boolean;
    mode: 'development' | 'production-tmp' | 'production-memory';
} {
    const env = detectEnvironment();

    if (!env.isProduction) {
        // Development environment - use generated-apps folder
        return {
            path: `${env.workingDirectory}/generated-apps/${projectId}`,
            isEphemeral: false,
            mode: 'development'
        };
    }

    // Production environment
    if (env.writableDirectory === '/tmp') {
        // Use /tmp/ for ephemeral file operations
        return {
            path: `/tmp/generated-apps/${projectId}`,
            isEphemeral: true,
            mode: 'production-tmp'
        };
    }

    // Memory-only mode (no file operations)
    return {
        path: `/var/task/generated-apps/${projectId}`, // Virtual path
        isEphemeral: true,
        mode: 'production-memory'
    };
}

/**
 * Check if the current environment can perform file operations
 */
export function canPerformFileOperations(): boolean {
    const env = detectEnvironment();
    return env.canWriteFiles || env.writableDirectory === '/tmp';
}

/**
 * Get environment debug information for troubleshooting
 */
export function getEnvironmentDebugInfo() {
    const env = detectEnvironment();

    return {
        environment: env,
        process: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV,
            VERCEL_URL: process.env.VERCEL_URL,
            NETLIFY: process.env.NETLIFY,
            AWS_LAMBDA_FUNCTION_NAME: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
            workingDirectory: process.cwd(),
            platform: process.platform,
            nodeVersion: process.version
        },
        capabilities: {
            canWriteToWorkingDir: !env.isProduction,
            canWriteToTmp: true,
            recommendedMode: env.isProduction ? 'template-preview' : 'live-build'
        }
    };
}

/**
 * Vercel-specific detection helpers
 */
export const vercelHelpers = {
    /**
     * Check if running in Vercel Lambda environment
     */
    isVercelLambda(): boolean {
        return process.cwd().includes('/var/task');
    },

    /**
     * Check if running in Vercel Edge Runtime
     */
    isVercelEdge(): boolean {
        return process.env.NEXT_RUNTIME === 'edge';
    },

    /**
     * Get Vercel deployment information
     */
    getDeploymentInfo() {
        return {
            url: process.env.VERCEL_URL,
            env: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
            isVercel: process.env.VERCEL === '1'
        };
    }
};

/**
 * Production-safe directory creation
 * Returns information about what was actually created vs what would be created
 */
export async function createProductionSafeDirectory(
    projectId: string,
    forceMode?: 'memory' | 'tmp' | 'auto'
): Promise<{
    success: boolean;
    mode: 'development' | 'production-memory' | 'production-tmp';
    path: string;
    actuallyCreated: boolean;
    message: string;
    error?: string;
}> {
    const env = detectEnvironment();
    const safeDir = getSafeProjectDirectory(projectId);

    // Override mode if specified
    let targetMode = safeDir.mode;
    if (forceMode === 'memory' && env.isProduction) {
        targetMode = 'production-memory';
    } else if (forceMode === 'tmp' && env.isProduction) {
        targetMode = 'production-tmp';
    }

    switch (targetMode) {
        case 'development':
            try {
                const fs = require('fs').promises;
                await fs.mkdir(safeDir.path, { recursive: true });
                return {
                    success: true,
                    mode: 'development',
                    path: safeDir.path,
                    actuallyCreated: true,
                    message: 'Directory created in development environment'
                };
            } catch (error) {
                return {
                    success: false,
                    mode: 'development',
                    path: safeDir.path,
                    actuallyCreated: false,
                    message: 'Failed to create directory in development',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }

        case 'production-tmp':
            try {
                const fs = require('fs').promises;
                await fs.mkdir(safeDir.path, { recursive: true });
                return {
                    success: true,
                    mode: 'production-tmp',
                    path: safeDir.path,
                    actuallyCreated: true,
                    message: 'Ephemeral directory created in /tmp/ (available for this request only)'
                };
            } catch (error) {
                return {
                    success: false,
                    mode: 'production-tmp',
                    path: safeDir.path,
                    actuallyCreated: false,
                    message: 'Failed to create directory in /tmp/',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }

        case 'production-memory':
        default:
            return {
                success: true,
                mode: 'production-memory',
                path: safeDir.path,
                actuallyCreated: false,
                message: 'Virtual directory path returned (memory-only mode, no file system operations)'
            };
    }
} 