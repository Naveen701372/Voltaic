import { NextRequest, NextResponse } from 'next/server';
import {
    detectEnvironment,
    getEnvironmentDebugInfo,
    getSafeProjectDirectory,
    createProductionSafeDirectory,
    vercelHelpers
} from '@/lib/environment';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId') || 'test-project-' + Date.now();
        const testMode = searchParams.get('mode') as 'memory' | 'tmp' | 'auto' | null;

        // Get comprehensive environment information
        const debugInfo = getEnvironmentDebugInfo();
        const safeDir = getSafeProjectDirectory(projectId);

        // Test directory creation
        const directoryTest = await createProductionSafeDirectory(
            projectId,
            testMode || 'auto'
        );

        // Vercel-specific detection
        const vercelInfo = {
            isLambda: vercelHelpers.isVercelLambda(),
            isEdge: vercelHelpers.isVercelEdge(),
            deployment: vercelHelpers.getDeploymentInfo()
        };

        // Current request information
        const requestInfo = {
            url: req.url,
            method: req.method,
            headers: {
                'x-forwarded-host': req.headers.get('x-forwarded-host'),
                'x-vercel-deployment-url': req.headers.get('x-vercel-deployment-url'),
                'user-agent': req.headers.get('user-agent')?.slice(0, 100) + '...'
            }
        };

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            projectId,
            testMode: testMode || 'auto',

            // Core environment detection
            environment: debugInfo.environment,

            // Process information
            process: debugInfo.process,

            // Capabilities
            capabilities: debugInfo.capabilities,

            // Safe directory paths
            paths: {
                recommended: safeDir,
                test: directoryTest
            },

            // Vercel-specific information
            vercel: vercelInfo,

            // Request context
            request: requestInfo,

            // Detection summary
            summary: {
                platform: debugInfo.environment.platform,
                isProduction: debugInfo.environment.isProduction,
                canWriteFiles: debugInfo.environment.canWriteFiles,
                workingDirectory: debugInfo.environment.workingDirectory,
                isVercelLambda: debugInfo.environment.workingDirectory.includes('/var/task'),
                detectionReasons: debugInfo.environment.detectionReasons,
                recommendedAction: debugInfo.environment.isProduction ?
                    'Use template previews or /tmp/ for ephemeral files' :
                    'Full file system operations available'
            }
        });

    } catch (error) {
        console.error('Environment test error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            fallbackInfo: {
                workingDirectory: process.cwd(),
                nodeEnv: process.env.NODE_ENV,
                vercel: process.env.VERCEL,
                platform: process.platform
            }
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { projectId, testDirectoryCreation, mode } = await req.json();

        if (!projectId) {
            return NextResponse.json({
                error: 'projectId is required'
            }, { status: 400 });
        }

        const result = await createProductionSafeDirectory(
            projectId,
            mode || 'auto'
        );

        // If directory creation was successful and we want to test file operations
        if (testDirectoryCreation && result.success && result.actuallyCreated) {
            try {
                const fs = require('fs').promises;
                const path = require('path');

                // Test file creation
                const testFilePath = path.join(result.path, 'test.txt');
                const testContent = `Test file created at ${new Date().toISOString()}\nMode: ${result.mode}\nProject: ${projectId}`;

                await fs.writeFile(testFilePath, testContent, 'utf8');

                // Verify file exists
                const fileExists = await fs.access(testFilePath).then(() => true).catch(() => false);
                const fileContent = fileExists ? await fs.readFile(testFilePath, 'utf8') : null;

                return NextResponse.json({
                    directoryTest: result,
                    fileTest: {
                        success: true,
                        filePath: testFilePath,
                        fileExists,
                        content: fileContent,
                        message: 'File operations successful'
                    }
                });
            } catch (fileError) {
                return NextResponse.json({
                    directoryTest: result,
                    fileTest: {
                        success: false,
                        error: fileError instanceof Error ? fileError.message : 'Unknown file error',
                        message: 'File operations failed'
                    }
                });
            }
        }

        return NextResponse.json({
            directoryTest: result,
            fileTest: {
                skipped: !testDirectoryCreation || !result.actuallyCreated,
                reason: !testDirectoryCreation ? 'Not requested' : 'Directory not actually created'
            }
        });

    } catch (error) {
        console.error('Environment POST test error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 