import { NextRequest, NextResponse } from 'next/server';
import { ProductionPreviewManager } from '@/lib/production-preview-manager';
import { getEnvironmentDebugInfo } from '@/lib/environment';

export async function POST(req: NextRequest) {
    try {
        const { projectId, title, files, options = {} } = await req.json();

        if (!projectId || !title || !files || !Array.isArray(files)) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters: projectId, title, files'
            }, { status: 400 });
        }

        console.log(`🎬 Production preview request for "${title}" (${projectId})`);
        console.log(`📁 Files: ${files.length}`);

        // Get environment information
        const debugInfo = getEnvironmentDebugInfo();
        console.log(`🌍 Environment: ${debugInfo.environment.platform} (production: ${debugInfo.environment.isProduction})`);

        // Create preview using ProductionPreviewManager
        const previewManager = new ProductionPreviewManager();
        const result = await previewManager.createPreview(projectId, title, files, options);

        // Log result
        if (result.success) {
            console.log(`✅ Preview created successfully:`, {
                mode: result.mode,
                duration: result.duration,
                isEphemeral: result.isEphemeral
            });
        } else {
            console.error(`❌ Preview creation failed:`, {
                mode: result.mode,
                error: result.error
            });
        }

        // Return the preview result
        return NextResponse.json({
            success: result.success,
            mode: result.mode,
            previewUrl: result.previewUrl,
            previewHtml: result.previewHtml,
            projectDir: result.projectDir,
            buildLogs: result.buildLogs,
            isEphemeral: result.isEphemeral,
            duration: result.duration,
            error: result.error,
            debug: {
                projectId,
                title,
                filesCount: files.length,
                environment: debugInfo.environment,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Production preview API error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            mode: 'error',
            buildLogs: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            isEphemeral: true,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        // Get environment information for debugging
        const debugInfo = getEnvironmentDebugInfo();

        const response = {
            endpoint: '/api/preview/production',
            environment: debugInfo.environment,
            capabilities: debugInfo.capabilities,
            message: 'Production preview endpoint ready',
            usage: {
                'POST /api/preview/production': 'Create a new preview',
                'GET /api/preview/production': 'Get endpoint information',
                'GET /api/preview/production?projectId=<id>': 'Get preview information for specific project'
            },
            requiredFields: {
                projectId: 'string',
                title: 'string',
                files: 'array of { path: string, content: string, type?: string }',
                options: 'object (optional) - { mode?: "auto" | "static" | "template" | "build" }'
            },
            example: {
                projectId: 'my-preview-app',
                title: 'My Preview Application',
                files: [
                    {
                        path: 'src/app/page.tsx',
                        content: 'export default function HomePage() { return <div>Preview App</div>; }',
                        type: 'page'
                    }
                ],
                options: { mode: 'auto' }
            },
            timestamp: new Date().toISOString()
        };

        // If projectId is provided, add specific project information
        if (projectId) {
            (response as any).projectId = projectId;
            (response as any).projectInfo = {
                id: projectId,
                message: 'Project-specific preview information would be shown here'
            };
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Production preview GET error:', error);

        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 