import { NextRequest, NextResponse } from 'next/server';
import { ProductionFileManager } from '@/lib/production-file-manager';
import { getEnvironmentDebugInfo } from '@/lib/environment';

export async function GET(req: NextRequest) {
  try {
    const debugInfo = getEnvironmentDebugInfo();

    return NextResponse.json({
      endpoint: '/api/write-files',
      method: 'GET',
      environment: debugInfo.environment,
      capabilities: debugInfo.capabilities,
      usage: {
        'POST /api/write-files': 'Write files using ProductionFileManager',
        'GET /api/write-files': 'Get endpoint information and debug data'
      },
      requiredFields: {
        projectId: 'string',
        title: 'string (optional)',
        files: 'array of { path: string, content: string, type?: string }'
      },
      example: {
        projectId: 'my-test-app',
        title: 'My Test Application',
        files: [
          {
            path: 'src/app/page.tsx',
            content: 'export default function HomePage() { return <div>Hello World</div>; }',
            type: 'page'
          }
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, title, files } = await req.json();

    if (!projectId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Get comprehensive environment information for debugging
    const debugInfo = getEnvironmentDebugInfo();
    console.log('🔍 Environment Debug:', {
      platform: debugInfo.environment.platform,
      isProduction: debugInfo.environment.isProduction,
      workingDirectory: debugInfo.environment.workingDirectory,
      canWriteFiles: debugInfo.environment.canWriteFiles,
      detectionReasons: debugInfo.environment.detectionReasons
    });

    // Debug request data
    console.log('📨 Request Debug:', {
      projectId,
      projectIdType: typeof projectId,
      projectIdLength: projectId?.length,
      title,
      filesCount: files?.length,
      timestamp: new Date().toISOString()
    });

    // Use ProductionFileManager for all file operations
    const fileManager = new ProductionFileManager();
    const result = await fileManager.createProject(projectId, title, files);

    // Enhanced logging based on mode
    if (result.success) {
      console.log(`✅ Project created successfully:`, {
        mode: result.mode,
        projectDir: result.projectDir,
        filesWritten: result.filesWritten,
        isEphemeral: result.isEphemeral,
        storageUsed: result.storageUsed
      });
    } else {
      console.error(`❌ Project creation failed:`, {
        mode: result.mode,
        error: result.error,
        projectDir: result.projectDir
      });
    }

    // Return comprehensive response
    return NextResponse.json({
      success: result.success,
      projectDir: result.projectDir,
      filesWritten: result.filesWritten,
      filesList: files.map(f => f.path),
      mode: result.mode,
      isEphemeral: result.isEphemeral,
      message: result.message,
      storageUsed: result.storageUsed,
      debug: {
        projectId,
        title,
        environment: {
          platform: debugInfo.environment.platform,
          isProduction: debugInfo.environment.isProduction,
          workingDirectory: debugInfo.environment.workingDirectory,
          detectionReasons: debugInfo.environment.detectionReasons
        },
        capabilities: debugInfo.capabilities,
        timestamp: new Date().toISOString()
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Write-files API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to process file writing request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 