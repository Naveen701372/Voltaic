import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    try {
        const manager = ProductionDevServerManager.getInstance();

        if (projectId) {
            const serverInfo = manager.getServerInfo(projectId);

            if (!serverInfo) {
                return NextResponse.json({
                    success: false,
                    error: 'Server not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                logs: serverInfo.logs,
                status: serverInfo.status,
                buildProgress: serverInfo.buildProgress,
                uptime: Date.now() - serverInfo.startTime,
                projectId: serverInfo.projectId,
                port: serverInfo.port,
                url: serverInfo.url
            });
        }

        // Get logs from all servers
        const allServers = manager.getAllServers();
        const logsData = allServers.map(server => ({
            projectId: server.projectId,
            status: server.status,
            port: server.port,
            logs: server.logs.slice(-20), // Last 20 logs per server
            buildProgress: server.buildProgress,
            uptime: Date.now() - server.startTime
        }));

        return NextResponse.json({
            success: true,
            servers: logsData,
            totalServers: allServers.length
        });

    } catch (error) {
        console.error('Dev server logs error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}