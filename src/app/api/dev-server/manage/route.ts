import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    try {
        const manager = ProductionDevServerManager.getInstance();

        if (projectId) {
            // Get specific server info
            const serverInfo = manager.getServerInfo(projectId);

            if (!serverInfo) {
                return NextResponse.json({
                    success: false,
                    error: 'Server not found',
                    projectId
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                server: {
                    projectId: serverInfo.projectId,
                    port: serverInfo.port,
                    status: serverInfo.status,
                    url: serverInfo.url,
                    startTime: serverInfo.startTime,
                    uptime: Date.now() - serverInfo.startTime,
                    projectPath: serverInfo.projectPath,
                    buildProgress: serverInfo.buildProgress,
                    logs: serverInfo.logs.slice(-20) // Last 20 log entries
                }
            });
        } else {
            // Get all servers
            const allServers = manager.getAllServers();

            return NextResponse.json({
                success: true,
                count: allServers.length,
                servers: allServers.map(server => ({
                    projectId: server.projectId,
                    port: server.port,
                    status: server.status,
                    url: server.url,
                    startTime: server.startTime,
                    uptime: Date.now() - server.startTime,
                    buildProgress: server.buildProgress
                }))
            });
        }

    } catch (error) {
        console.error('Dev server manage error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({
            success: false,
            error: 'Missing projectId parameter'
        }, { status: 400 });
    }

    try {
        const manager = ProductionDevServerManager.getInstance();
        const stopped = await manager.stopServer(projectId);

        if (stopped) {
            return NextResponse.json({
                success: true,
                message: `Server ${projectId} stopped successfully`
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Server not found or already stopped'
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Dev server stop error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        const manager = ProductionDevServerManager.getInstance();

        switch (action) {
            case 'cleanup':
                await manager.cleanup();
                return NextResponse.json({
                    success: true,
                    message: 'All servers cleaned up successfully'
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Supported actions: cleanup'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Dev server action error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 