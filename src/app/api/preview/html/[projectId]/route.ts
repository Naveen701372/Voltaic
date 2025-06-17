import { NextRequest, NextResponse } from 'next/server';
import { ProductionPreviewManager } from '@/lib/production-preview-manager';

// Store preview HTML in memory (for demonstration)
// In production, you'd want to use a database or cache
const previewCache = new Map<string, {
    html: string;
    timestamp: number;
    expiresAt: number;
}>();

export async function GET(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { projectId } = params;

        if (!projectId) {
            return new NextResponse('Project ID is required', { status: 400 });
        }

        // Check if we have cached HTML for this project
        const cached = previewCache.get(projectId);
        if (cached && Date.now() < cached.expiresAt) {
            console.log(`📄 Serving cached HTML preview for ${projectId}`);

            return new NextResponse(cached.html, {
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'public, max-age=300', // 5 minutes
                    'X-Preview-Mode': 'cached',
                    'X-Generated-At': new Date(cached.timestamp).toISOString()
                }
            });
        }

        // If no cached version, return a placeholder
        const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Loading...</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass-primary {
            backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .spinner {
            animation: spin 1s linear infinite;
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Loading Header -->
    <div class="bg-blue-500/20 border-b border-blue-500/30 p-3">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full spinner"></div>
                <span class="text-blue-200 text-sm font-medium">
                    Loading Preview...
                </span>
            </div>
            <span class="text-blue-200/80 text-xs">
                Project: ${projectId}
            </span>
        </div>
    </div>

    <!-- Loading Content -->
    <div class="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
        <div class="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
            <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full spinner mx-auto mb-4"></div>
            <h1 class="text-2xl font-bold text-white mb-4">Generating Preview...</h1>
            <p class="text-white/80 mb-6">
                Your application preview is being generated. This may take a moment.
            </p>
            <div class="text-white/60 text-sm">
                <p>Project ID: ${projectId}</p>
                <p class="mt-2">
                    <button onclick="window.location.reload()" class="text-blue-400 hover:text-blue-300 underline">
                        Refresh to check status
                    </button>
                </p>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh after 5 seconds
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    </script>
</body>
</html>`;

        console.log(`📄 No cached preview found for ${projectId}, serving placeholder`);

        return new NextResponse(placeholderHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache',
                'X-Preview-Mode': 'placeholder',
                'X-Project-Id': projectId
            }
        });

    } catch (error) {
        console.error('❌ HTML preview error:', error);

        const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
    <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
        <div class="text-red-400 text-4xl mb-4">⚠️</div>
        <h1 class="text-2xl font-bold text-white mb-4">Preview Error</h1>
        <p class="text-red-200 mb-6">
            Unable to load preview for this project.
        </p>
        <p class="text-red-300/80 text-sm">
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-red-500/20 text-red-200 rounded hover:bg-red-500/30">
            Try Again
        </button>
    </div>
</body>
</html>`;

        return new NextResponse(errorHtml, {
            status: 500,
            headers: {
                'Content-Type': 'text/html',
                'X-Preview-Mode': 'error'
            }
        });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { projectId } = params;
        const { html, expirationMinutes = 30 } = await req.json();

        if (!projectId || !html) {
            return NextResponse.json({
                error: 'Project ID and HTML content are required'
            }, { status: 400 });
        }

        // Store the HTML in cache
        const timestamp = Date.now();
        const expiresAt = timestamp + (expirationMinutes * 60 * 1000);

        previewCache.set(projectId, {
            html,
            timestamp,
            expiresAt
        });

        console.log(`💾 Cached HTML preview for ${projectId} (expires in ${expirationMinutes} minutes)`);

        return NextResponse.json({
            success: true,
            projectId,
            cached: true,
            expiresAt: new Date(expiresAt).toISOString(),
            previewUrl: `/api/preview/html/${projectId}`,
            message: 'HTML preview cached successfully'
        });

    } catch (error) {
        console.error('❌ HTML preview cache error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}

// Clean up expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [projectId, cache] of previewCache.entries()) {
        if (now > cache.expiresAt) {
            previewCache.delete(projectId);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired preview cache entries`);
    }
}, 5 * 60 * 1000); // Clean every 5 minutes 