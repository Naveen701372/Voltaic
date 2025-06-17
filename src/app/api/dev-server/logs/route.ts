import { NextRequest, NextResponse } from 'next/server';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function GET(request: NextRequest) {
    try {
        // Get projectId from query params
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({
                success: false,
                error: 'Project ID is required'
            }, { status: 400 });
        }

        // Get the manager instance
        const manager = ProductionDevServerManager.getInstance();
        const serverInfo = manager.getServerInfo(projectId);

        if (!serverInfo) {
            return NextResponse.json({
                success: false,
                error: 'Server not found'
            }, { status: 404 });
        }

        // Return the logs
        return NextResponse.json({
            success: true,
            logs: serverInfo.logs,
            status: serverInfo.status,
            buildProgress: serverInfo.buildProgress
        });

    } catch (error) {
        console.error('Logs error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}