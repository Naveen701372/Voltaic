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

        // Create project directory in /tmp/voltaic-dev-servers/{projectId}
        const baseDir = '/tmp';
        const projectDir = join(baseDir, 'voltaic-dev-servers', projectId);
        await mkdir(projectDir, { recursive: true });

        // Convert File to Buffer and save it temporarily
        const arrayBuffer = await zipFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempZipPath = join(baseDir, `${projectId}.zip`);
        await writeFile(tempZipPath, buffer);

        try {
            // Extract ZIP contents
            await extract(tempZipPath, {
                dir: projectDir,
                onEntry: (entry) => {
                    // Skip __MACOSX and hidden files
                    if (entry.fileName.startsWith('__MACOSX') || entry.fileName.startsWith('.')) {
                        return;
                    }

                    // Remove the root directory from the path if it exists
                    const parts = entry.fileName.split('/');
                    if (parts.length > 1) {
                        parts.shift(); // Remove the first directory
                    }
                }
            });

            // Clean up the temporary ZIP file
            await rm(tempZipPath);

            // Start the dev server using the manager directly
            const manager = ProductionDevServerManager.getInstance();
            const result = await manager.createAndStartDevServer(
                projectId,
                '', // Empty React component since we're using a full project
                projectTitle || 'Uploaded Project',
                quickMode
            );

            return NextResponse.json(result);

        } catch (error) {
            // Clean up on error
            await rm(projectDir, { recursive: true, force: true });
            await rm(tempZipPath, { force: true });
            throw error;
        }

    } catch (error) {
        console.error('Error handling ZIP upload:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
} 