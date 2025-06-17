import { NextRequest, NextResponse } from 'next/server';
import { join, basename } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import extract from 'extract-zip';
import { randomUUID } from 'crypto';

const TMP_DIR = '/tmp';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const projectId = formData.get('projectId') as string;
        const projectTitle = formData.get('projectTitle') as string;
        const quickMode = formData.get('quickMode') === 'true';

        if (!file || !(file instanceof File)) {
            return NextResponse.json({
                success: false,
                error: 'No file uploaded'
            }, { status: 400 });
        }

        // Create unique project directory
        const projectDir = join(TMP_DIR, projectId);
        const zipPath = join(TMP_DIR, `${projectId}.zip`);

        try {
            // Create project directory
            await mkdir(projectDir, { recursive: true });

            // Write the uploaded zip file
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(zipPath, buffer);

            // Extract the zip file
            await extract(zipPath, { dir: projectDir });

            // Start the dev server
            const port = 3000 + Math.floor(Math.random() * 1000); // Random port between 3000-3999

            // Here you would typically start your Next.js dev server
            // This is a placeholder for your existing server start logic
            const serverProcess = await startDevServer(projectDir, port);

            return NextResponse.json({
                success: true,
                projectId,
                port,
                url: `http://localhost:${port}`,
                message: 'Server started successfully'
            });

        } catch (error) {
            console.error('Server start error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to start server: ' + (error instanceof Error ? error.message : String(error))
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            success: false,
            error: 'Upload failed: ' + (error instanceof Error ? error.message : String(error))
        }, { status: 500 });
    }
}

async function startDevServer(projectDir: string, port: number) {
    // This function should contain your existing logic for starting the dev server
    // You'll want to move your server start logic from the existing endpoint here
    // and modify it to work with the extracted project files

    // Example implementation:
    // 1. Verify project structure
    // 2. Install dependencies if needed
    // 3. Start the dev server process
    // 4. Return server info

    // This is where you'll integrate with your existing server management code
    return {
        projectId: basename(projectDir),
        port,
        status: 'starting',
        url: `http://localhost:${port}`
    };
} 