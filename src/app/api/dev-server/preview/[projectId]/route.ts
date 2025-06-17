import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { projectId } = params;

        if (!projectId) {
            return new NextResponse('Project ID is required', { status: 400 });
        }

        // Get the manager instance
        const manager = ProductionDevServerManager.getInstance();

        // Get the preview content
        const content = manager.getPreviewContent(projectId);

        if (!content) {
            return new NextResponse('Preview content not found', { status: 404 });
        }

        // Return the HTML content
        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (error) {
        console.error('Preview error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
} 