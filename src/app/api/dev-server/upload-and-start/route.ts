import { NextRequest, NextResponse } from 'next/server';
import extract from 'extract-zip';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

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

        // Create project directory in /tmp
        const projectDir = join('/tmp', `app-${projectId}`);
        await mkdir(projectDir, { recursive: true });

        // Convert File to Buffer and save it temporarily
        const arrayBuffer = await zipFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempZipPath = join('/tmp', `${projectId}.zip`);
        await writeFile(tempZipPath, buffer);

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

        // Start the dev server
        const response = await fetch('http://localhost:3000/api/dev-server/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                projectTitle,
                quickMode,
                projectPath: projectDir
            })
        });

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error handling ZIP upload:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
} 