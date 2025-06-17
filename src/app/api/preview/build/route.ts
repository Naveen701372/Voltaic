import { NextRequest, NextResponse } from 'next/server';
import { previewManager, PreviewManager } from '@/lib/preview-manager';
import { GeneratedFile } from '@/components/ai/types';

export async function POST(req: NextRequest) {
    try {
        const { projectId, files, title, mode = 'auto' } = await req.json();

        if (!projectId || !files || !Array.isArray(files)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request parameters' },
                { status: 400 }
            );
        }

        // Determine preview mode
        let previewMode = mode;
        if (mode === 'auto') {
            // Let the agent decide based on complexity
            const complexity = determineComplexity(files);
            previewMode = PreviewManager.determinePreviewMode(files, complexity);
        }

        // Create the preview
        const result = await previewManager.createPreview(
            projectId,
            files,
            title || 'Generated App',
            { mode: previewMode, timeout: 60000 }
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error('Build preview error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const stopped = await previewManager.stopPreview(projectId);

        return NextResponse.json({
            success: stopped,
            message: stopped ? 'Preview stopped' : 'Preview not found or already stopped'
        });

    } catch (error) {
        console.error('Stop preview error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const runningApps = previewManager.getRunningApps();

        return NextResponse.json({
            success: true,
            runningApps,
            count: runningApps.length
        });

    } catch (error) {
        console.error('Get running apps error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

function determineComplexity(files: GeneratedFile[]): 'simple' | 'medium' | 'complex' {
    const fileCount = files.length;
    const hasApiRoutes = files.some(f => f.type === 'api');
    const hasComplexLogic = files.some(f =>
        f.content.includes('useState') ||
        f.content.includes('useEffect') ||
        f.content.includes('fetch(') ||
        f.content.includes('async') ||
        f.content.includes('localStorage') ||
        f.content.includes('useRouter')
    );

    if (hasApiRoutes || hasComplexLogic || fileCount > 10) {
        return 'complex';
    } else if (fileCount > 5 || files.some(f => f.content.length > 2000)) {
        return 'medium';
    } else {
        return 'simple';
    }
} 