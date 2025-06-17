import { NextRequest, NextResponse } from 'next/server';
import extract from 'extract-zip';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { ProductionDevServerManager } from '@/lib/production-dev-server';
import { logger } from '@/lib/logger';

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

        logger.info('zip-upload', `Starting ZIP upload process for ${projectId}`, {
            zipSize: zipFile.size,
            projectDir
        });

        // Write ZIP file to disk
        const buffer = Buffer.from(await zipFile.arrayBuffer());
        await mkdir(join(baseDir, 'voltaic-dev-servers'), { recursive: true });
        await writeFile(zipPath, buffer);
        logger.info('zip-upload', `ZIP file written to ${zipPath}`);

        try {
            // Extract ZIP file
            const extractedFiles: string[] = [];
            await extract(zipPath, {
                dir: projectDir,
                onEntry: (entry) => {
                    // Skip __MACOSX and dot files
                    if (entry.fileName.startsWith('__MACOSX') || entry.fileName.startsWith('.')) {
                        logger.info('zip-upload', `Skipping file: ${entry.fileName}`);
                        return false;
                    }
                    extractedFiles.push(entry.fileName);
                    logger.info('zip-upload', `Extracting: ${entry.fileName}`);
                    return true;
                }
            });

            logger.info('zip-upload', `Extracted ${extractedFiles.length} files`, {
                files: extractedFiles
            });

            // Delete ZIP file after extraction
            await rm(zipPath);
            logger.info('zip-upload', `Cleaned up temporary ZIP file`);

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
                logs: result.logs,
                extractedFiles // Include the list of extracted files in the response
            });

        } catch (error) {
            // Clean up on error
            try {
                await rm(zipPath, { force: true });
                await rm(projectDir, { recursive: true, force: true });
                logger.error('zip-upload', `Cleaned up files after error`, { error });
            } catch (cleanupError) {
                logger.error('zip-upload', `Failed to clean up after error`, { cleanupError });
            }

            throw error;
        }

    } catch (error) {
        logger.error('zip-upload', `Error handling ZIP upload:`, error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 