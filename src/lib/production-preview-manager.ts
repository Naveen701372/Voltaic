/**
 * Production Preview Manager for Vercel Functions
 * 
 * Handles preview generation in production environments using:
 * - /tmp directory for ephemeral file operations
 * - Static HTML generation for immediate preview
 * - Template-based fallbacks for complex apps
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { ProductionFileManager, GeneratedFile } from './production-file-manager';
import { detectEnvironment } from './environment';

export interface PreviewResult {
    success: boolean;
    previewUrl?: string;
    previewHtml?: string;
    mode: 'live-build' | 'static-html' | 'template' | 'error';
    projectDir?: string;
    buildLogs: string[];
    isEphemeral: boolean;
    duration?: number;
    error?: string;
}

export interface PreviewOptions {
    mode?: 'auto' | 'static' | 'template' | 'build';
    timeout?: number;
    skipBuild?: boolean;
}

export class ProductionPreviewManager {
    private env = detectEnvironment();
    private fileManager = new ProductionFileManager();

    /**
     * Create a preview from generated files
     */
    async createPreview(
        projectId: string,
        title: string,
        files: GeneratedFile[],
        options: PreviewOptions = {}
    ): Promise<PreviewResult> {
        const startTime = Date.now();
        const buildLogs: string[] = [];

        buildLogs.push(`🎬 Starting preview creation for "${title}"`);
        buildLogs.push(`📁 Files to process: ${files.length}`);
        buildLogs.push(`🌍 Environment: ${this.env.platform} (production: ${this.env.isProduction})`);

        try {
            // Determine preview strategy
            const strategy = this.determinePreviewStrategy(files, options);
            buildLogs.push(`🎯 Strategy: ${strategy}`);

            switch (strategy) {
                case 'live-build':
                    return await this.createLiveBuildPreview(projectId, title, files, buildLogs, startTime);

                case 'static-html':
                    return await this.createStaticHtmlPreview(projectId, title, files, buildLogs, startTime);

                case 'template':
                default:
                    return await this.createTemplatePreview(projectId, title, files, buildLogs, startTime);
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            buildLogs.push(`❌ Preview creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

            return {
                success: false,
                mode: 'error',
                buildLogs,
                isEphemeral: this.env.isProduction,
                duration,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Determine the best preview strategy
     */
    private determinePreviewStrategy(files: GeneratedFile[], options: PreviewOptions): string {
        // Force specific mode if requested
        if (options.mode === 'static') return 'static-html';
        if (options.mode === 'template') return 'template';
        if (options.mode === 'build') return 'live-build';

        // In production, prefer static HTML for speed and reliability
        if (this.env.isProduction) {
            // Simple apps can be rendered as static HTML
            if (this.isSimpleApp(files)) {
                return 'static-html';
            }
            // Complex apps use template preview
            return 'template';
        }

        // Development: try live build first
        return 'live-build';
    }

    /**
     * Create a live build preview (works in both dev and production with /tmp)
     */
    private async createLiveBuildPreview(
        projectId: string,
        title: string,
        files: GeneratedFile[],
        buildLogs: string[],
        startTime: number
    ): Promise<PreviewResult> {
        buildLogs.push(`🔧 Creating live build preview...`);

        try {
            // Create project files using ProductionFileManager
            const result = await this.fileManager.createProject(projectId, title, files);

            if (!result.success) {
                throw new Error(`File creation failed: ${result.error}`);
            }

            buildLogs.push(`✅ Files created: ${result.filesWritten} files in ${result.mode} mode`);
            buildLogs.push(`📂 Project directory: ${result.projectDir}`);

            // For production, we can't actually start a Next.js server
            // Instead, generate static HTML from the React components
            if (this.env.isProduction) {
                buildLogs.push(`🌐 Production mode: Generating static HTML...`);
                const staticHtml = await this.generateStaticHtml(result.projectDir, title, files);

                return {
                    success: true,
                    previewHtml: staticHtml,
                    mode: 'static-html',
                    projectDir: result.projectDir,
                    buildLogs,
                    isEphemeral: result.isEphemeral,
                    duration: Date.now() - startTime
                };
            }

            // Development: could potentially start a real server (not implemented for simplicity)
            buildLogs.push(`🚀 Development mode: Generating static preview...`);
            const staticHtml = await this.generateStaticHtml(result.projectDir, title, files);

            return {
                success: true,
                previewHtml: staticHtml,
                mode: 'live-build',
                projectDir: result.projectDir,
                buildLogs,
                isEphemeral: result.isEphemeral,
                duration: Date.now() - startTime
            };

        } catch (error) {
            buildLogs.push(`❌ Live build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Create a static HTML preview
     */
    private async createStaticHtmlPreview(
        projectId: string,
        title: string,
        files: GeneratedFile[],
        buildLogs: string[],
        startTime: number
    ): Promise<PreviewResult> {
        buildLogs.push(`📄 Creating static HTML preview...`);

        try {
            // Generate HTML without creating actual files
            const staticHtml = await this.generateStaticHtmlFromFiles(title, files);

            buildLogs.push(`✅ Static HTML generated successfully`);

            return {
                success: true,
                previewHtml: staticHtml,
                mode: 'static-html',
                buildLogs,
                isEphemeral: this.env.isProduction,
                duration: Date.now() - startTime
            };

        } catch (error) {
            buildLogs.push(`❌ Static HTML generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Create a template preview (fallback)
     */
    private async createTemplatePreview(
        projectId: string,
        title: string,
        files: GeneratedFile[],
        buildLogs: string[],
        startTime: number
    ): Promise<PreviewResult> {
        buildLogs.push(`🎨 Creating template preview...`);

        const templateHtml = this.generateTemplateHtml(title, files, projectId);

        buildLogs.push(`✅ Template preview generated`);

        return {
            success: true,
            previewHtml: templateHtml,
            previewUrl: `/preview/template/${projectId}`,
            mode: 'template',
            buildLogs,
            isEphemeral: this.env.isProduction,
            duration: Date.now() - startTime
        };
    }

    /**
     * Generate static HTML from project files
     */
    private async generateStaticHtml(projectDir: string, title: string, files: GeneratedFile[]): Promise<string> {
        // Read the main page file
        const pageFile = files.find(f => f.path.includes('page.tsx') || f.path.includes('page.jsx'));

        if (!pageFile) {
            throw new Error('No page component found');
        }

        // Extract component content and render as static HTML
        return this.renderComponentAsHtml(pageFile.content, title, files);
    }

    /**
     * Generate static HTML directly from files without filesystem
     */
    private async generateStaticHtmlFromFiles(title: string, files: GeneratedFile[]): Promise<string> {
        const pageFile = files.find(f => f.path.includes('page.tsx') || f.path.includes('page.jsx'));

        if (!pageFile) {
            return this.generateTemplateHtml(title, files, 'static-preview');
        }

        return this.renderComponentAsHtml(pageFile.content, title, files);
    }

    /**
     * Render React component as static HTML
     */
    private renderComponentAsHtml(componentContent: string, title: string, files: GeneratedFile[]): string {
        // Extract JSX content from the component
        const jsxMatch = componentContent.match(/return\s*\(([\s\S]*?)\);?\s*}?\s*$/);
        const jsxContent = jsxMatch ? jsxMatch[1] : '<div>Generated Component</div>';

        // Convert JSX-like syntax to HTML
        const htmlContent = this.convertJsxToHtml(jsxContent);

        // Generate complete HTML document
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Glass effect styles */
        .glass-primary {
            backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
        }
        
        .glass-dark {
            backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(17, 25, 40, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.125);
            border-radius: 12px;
        }

        .glass-button {
            backdrop-filter: blur(10px);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .glass-button:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            transform: translateY(-1px);
        }

        /* Animation styles */
        @keyframes gradient-x {
            0%, 100% { background-position: left center; }
            50% { background-position: right center; }
        }

        @keyframes gradient-y {
            0%, 100% { background-position: center top; }
            50% { background-position: center bottom; }
        }

        .animate-gradient-x { animation: gradient-x 15s ease infinite; }
        .animate-gradient-y { animation: gradient-y 15s ease infinite; }
    </style>
    
    <!-- Production Preview Indicator -->
    <div style="position: fixed; top: 0; left: 0; right: 0; background: rgba(245, 158, 11, 0.9); color: white; text-align: center; padding: 8px; font-size: 14px; z-index: 1000;">
        🔄 Static Preview Mode - Generated with ${files.length} files
    </div>
</head>
<body style="margin-top: 40px;">
    ${htmlContent}
    
    <script>
        // Add basic interactivity
        document.addEventListener('click', function(e) {
            if (e.target.matches('button, .glass-button')) {
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        });
        
        // Add hover effects
        document.addEventListener('mouseover', function(e) {
            if (e.target.matches('.glass-button')) {
                e.target.style.transform = 'translateY(-2px)';
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            if (e.target.matches('.glass-button')) {
                e.target.style.transform = '';
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Convert JSX-like syntax to HTML
     */
    private convertJsxToHtml(jsxContent: string): string {
        return jsxContent
            // Convert className to class
            .replace(/className=/g, 'class=')
            // Convert self-closing tags
            .replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>')
            // Remove JSX expressions (basic)
            .replace(/\{[^}]*\}/g, '')
            // Clean up extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Generate template HTML (fallback)
     */
    private generateTemplateHtml(title: string, files: GeneratedFile[], projectId: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass-primary {
            backdrop-filter: blur(16px) saturate(180%);
            background-color: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- Template Preview Header -->
    <div class="bg-yellow-500/20 border-b border-yellow-500/30 p-3">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span class="text-yellow-200 text-sm font-medium">
                    Template Preview Mode
                </span>
            </div>
            <span class="text-yellow-200/80 text-xs">
                ${this.env.isProduction ? 'Production environment' : 'Development fallback'}
            </span>
        </div>
    </div>

    <!-- App Preview -->
    <div class="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
        <div class="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
            <h1 class="text-2xl font-bold text-white mb-4">${title}</h1>
            <p class="text-white/80 mb-6">
                Your application has been generated successfully!
            </p>
            <div class="space-y-3">
                <button class="glass-button w-full px-6 py-3 text-white font-medium rounded-lg hover:scale-105 transition-transform">
                    Get Started
                </button>
                <div class="text-white/60 text-sm">
                    <p>Generated with ${files.length} files</p>
                    <p class="mt-1">Project ID: ${projectId}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Check if the app is simple enough for static HTML generation
     */
    private isSimpleApp(files: GeneratedFile[]): boolean {
        // Simple heuristics
        const hasComplexLogic = files.some(file =>
            file.content.includes('useState') ||
            file.content.includes('useEffect') ||
            file.content.includes('fetch(') ||
            file.content.includes('API')
        );

        return !hasComplexLogic && files.length <= 5;
    }
} 