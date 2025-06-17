import { NextRequest, NextResponse } from 'next/server';
import extract from 'extract-zip';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { ProductionDevServerManager } from '@/lib/production-dev-server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const zipFile = formData.get('zipFile') as File;
        const projectId = formData.get('projectId') as string;
        const projectTitle = formData.get('projectTitle') as string;
        const quickMode = formData.get('quickMode') === 'true';

        if (!zipFile || !projectId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Create temp directory for ZIP file
        const baseDir = '/tmp';
        const zipPath = join(baseDir, `${projectId}.zip`);
        const projectDir = join(baseDir, 'voltaic-dev-servers', projectId);

        // Write ZIP file to disk
        const buffer = Buffer.from(await zipFile.arrayBuffer());
        await mkdir(join(baseDir, 'voltaic-dev-servers'), { recursive: true });
        await writeFile(zipPath, buffer);

        try {
            // Extract ZIP file
            await extract(zipPath, {
                dir: projectDir,
                onEntry: (entry) => {
                    // Skip __MACOSX and dot files
                    if (entry.fileName.startsWith('__MACOSX') || entry.fileName.startsWith('.')) {
                        return false;
                    }
                    return true;
                }
            });

            // Delete ZIP file after extraction
            await rm(zipPath);

            // Start dev server
            const manager = ProductionDevServerManager.getInstance();
            const result = await manager.createAndStartDevServer(
                projectId,
                '', // Empty reactComponent since we're using the ZIP file
                projectTitle,
                quickMode
            );

            if (!result.success) {
                return NextResponse.json({
                    success: false,
                    error: result.error || 'Failed to start dev server'
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                url: result.url,
                port: result.port,
                logs: result.logs
            });

        } catch (error) {
            // Clean up on error
            try {
                await rm(zipPath, { force: true });
                await rm(projectDir, { recursive: true, force: true });
            } catch { }

            throw error;
        }

    } catch (error) {
        console.error('Error handling ZIP upload:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 