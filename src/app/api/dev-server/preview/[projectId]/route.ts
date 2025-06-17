import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const projectId = params.projectId;

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const manager = ProductionDevServerManager.getInstance();
        const serverInfo = manager.getServerInfo(projectId);

        if (!serverInfo) {
            return NextResponse.json(
                { success: false, error: 'Server not found' },
                { status: 404 }
            );
        }

        // Get the HTML content from the quick preview server
        const htmlContent = await manager.getPreviewContent(projectId);

        if (!htmlContent) {
            return NextResponse.json(
                { success: false, error: 'Preview content not available' },
                { status: 404 }
            );
        }

        // Serve the HTML directly
        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Voltaic-Project': projectId,
                'X-Voltaic-Mode': 'quick-preview'
            }
        });

    } catch (error) {
        console.error('Preview serve error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 