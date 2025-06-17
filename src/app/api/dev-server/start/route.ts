import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';
import { detectEnvironment } from '@/lib/environment';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectId, reactComponent, projectTitle } = body;

        if (!projectId || !reactComponent) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: projectId, reactComponent'
            }, { status: 400 });
        }

        const manager = ProductionDevServerManager.getInstance();
        const result = await manager.createAndStartDevServer(
            projectId,
            reactComponent,
            projectTitle || 'Voltaic Generated App'
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error('Dev server start error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        }, { status: 500 });
    }
}

export async function GET() {
    const environment = detectEnvironment();
    const manager = ProductionDevServerManager.getInstance();

    return NextResponse.json({
        success: true,
        message: 'Production Dev Server API',
        environment: {
            isProduction: environment.isProduction,
            platform: environment.platform,
            canRunDevServers: environment.platform === 'vercel' || !environment.isProduction,
            writableDirectory: environment.writableDirectory
        },
        runningServers: manager.getAllServers().map(server => ({
            projectId: server.projectId,
            port: server.port,
            status: server.status,
            url: server.url,
            startTime: server.startTime,
            uptime: Date.now() - server.startTime
        })),
        capabilities: [
            'Create complete Next.js projects in /tmp',
            'Install npm dependencies',
            'Start dev servers with port management',
            'Live React component rendering',
            'Automatic cleanup and process management'
        ]
    });
} 