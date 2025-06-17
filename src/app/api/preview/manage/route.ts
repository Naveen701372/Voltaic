import { NextRequest, NextResponse } from 'next/server';
import { PortManager } from '@/lib/port-manager';

const portManager = PortManager.getInstance();

// GET: Check status of a preview app
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        const status = portManager.getAppStatus(projectId);

        if (status) {
            // Update last access time
            portManager.updateLastAccess(projectId);

            return NextResponse.json({
                success: true,
                status: {
                    ...status,
                    uptime: Date.now() - status.startTime,
                    lastActivity: Date.now() - status.lastAccess,
                    url: `http://localhost:${status.port}`
                }
            });
        } else {
            return NextResponse.json({
                success: true,
                status: null,
                message: 'App not running'
            });
        }

    } catch (error) {
        console.error('Preview status error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST: Start or restart a preview app
export async function POST(req: NextRequest) {
    try {
        const { projectId, projectPath, action } = await req.json();

        if (!projectId || !projectPath) {
            return NextResponse.json({
                error: 'Project ID and project path required'
            }, { status: 400 });
        }

        if (action === 'restart') {
            // Stop existing app first
            await portManager.stopPreviewApp(projectId);
        }

        // Convert relative path to absolute path
        const absoluteProjectPath = projectPath.startsWith('./')
            ? require('path').join(process.cwd(), projectPath.slice(2))
            : projectPath;

        // Start the app
        const { port, url } = await portManager.startPreviewApp(projectId, absoluteProjectPath);

        return NextResponse.json({
            success: true,
            port,
            url,
            message: action === 'restart' ? 'App restarted successfully' : 'App started successfully'
        });

    } catch (error) {
        console.error('Preview start error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to start app'
        }, { status: 500 });
    }
}

// DELETE: Stop a preview app
export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({
                error: 'Project ID required'
            }, { status: 400 });
        }

        const stopped = await portManager.stopPreviewApp(projectId);

        return NextResponse.json({
            success: true,
            stopped,
            message: stopped ? 'App stopped successfully' : 'App was not running'
        });

    } catch (error) {
        console.error('Preview stop error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to stop app'
        }, { status: 500 });
    }
}

// PATCH: Update last access time (for keeping apps alive)
export async function PATCH(req: NextRequest) {
    try {
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json({
                error: 'Project ID required'
            }, { status: 400 });
        }

        portManager.updateLastAccess(projectId);

        return NextResponse.json({
            success: true,
            message: 'Last access updated'
        });

    } catch (error) {
        console.error('Update access error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update access'
        }, { status: 500 });
    }
} 