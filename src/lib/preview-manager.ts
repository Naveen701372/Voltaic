import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { GeneratedFile } from '@/components/ai/types';
import { PortManager } from './port-manager';
import { logger } from './logger';
import { CSSGenerator } from './templates/css-generator';

export type PreviewMode = 'template' | 'build';

export interface PreviewOptions {
    mode: PreviewMode;
    port?: number;
    timeout?: number;
}

export interface PreviewResult {
    success: boolean;
    previewUrl: string;
    mode: PreviewMode;
    port?: number;
    error?: string;
    buildLogs?: string[];
}

class PreviewManager {
    private portManager: PortManager;
    private maxRetries = 3;

    constructor() {
        this.portManager = PortManager.getInstance();
    }

    async createPreview(projectId: string, files: GeneratedFile[], title: string, options: PreviewOptions): Promise<PreviewResult> {
        console.log(`🎬 Creating preview for project: ${projectId}`);
        console.log(`📁 Files to process: ${files.length}`);
        console.log(`🎯 Title: ${title}`);
        console.log(`⚙️ Options:`, options);

        // Check if we're in production environment (multiple checks for different platforms)
        const isProduction =
            process.env.NODE_ENV === 'production' ||
            process.env.VERCEL === '1' ||
            process.env.VERCEL_ENV === 'production' ||
            process.env.NETLIFY === 'true' ||
            process.env.AWS_LAMBDA_FUNCTION_NAME || // AWS Lambda
            process.cwd().includes('/var/task') || // Vercel Lambda working directory
            process.cwd().includes('/.vercel/') || // Vercel local development
            !process.env.NODE_ENV; // Default to production if NODE_ENV is not set

        if (isProduction) {
            // In production, return a template-based preview since we can't build actual apps
            console.log(`🚀 Production environment detected - returning template preview for ${projectId}`);

            return {
                success: true,
                previewUrl: `/preview/template/${projectId}`,
                mode: 'template',
                buildLogs: ['Production environment: Using template preview instead of live build']
            };
        }

        // Development environment - continue with normal preview logic
        try {
            if (options.mode === 'template') {
                return this.createTemplatePreview(projectId, files, title);
            } else {
                return await this.createBuildPreview(projectId, files, title, options);
            }
        } catch (error) {
            console.error(`❌ Preview creation failed for ${projectId}:`, error);

            return {
                success: false,
                previewUrl: '',
                mode: options.mode,
                error: error instanceof Error ? error.message : 'Unknown error',
                buildLogs: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
            };
        }
    }

    private createTemplatePreview(projectId: string, files: GeneratedFile[], title: string): PreviewResult {
        // Use existing template approach
        return {
            success: true,
            previewUrl: `/api/preview/${projectId}`,
            mode: 'template'
        };
    }

    private async createBuildPreview(projectId: string, files: GeneratedFile[], title: string, options: PreviewOptions): Promise<PreviewResult> {
        const projectDir = path.join(process.cwd(), 'generated-apps', projectId);
        let currentFiles = [...files];
        let buildLogs: string[] = [];

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            logger.buildStart(projectId, attempt, this.maxRetries);

            try {
                // Ensure project directory and files exist
                logger.buildProgress(projectId, 'Setting up project structure');
                await this.ensureProjectStructure(projectDir, currentFiles, title);

                // Install dependencies
                logger.buildProgress(projectId, 'Installing dependencies');
                await this.runCommand('npm', ['install'], projectDir);

                // Try to start the app
                logger.buildProgress(projectId, 'Starting app with dynamic port allocation');
                const startTime = Date.now();
                const { port, url } = await this.portManager.startPreviewApp(projectId, projectDir);
                const buildDuration = Date.now() - startTime;

                logger.buildSuccess(projectId, port, buildDuration);

                return {
                    success: true,
                    previewUrl: url,
                    mode: 'build',
                    port,
                    buildLogs
                };

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Build failed';
                logger.buildError(projectId, errorMessage, attempt);
                buildLogs.push(`Attempt ${attempt}: ${errorMessage}`);

                // Don't retry on the last attempt
                if (attempt === this.maxRetries) {
                    return {
                        success: false,
                        previewUrl: '',
                        mode: 'build',
                        error: `Build failed after ${this.maxRetries} attempts: ${errorMessage}`,
                        buildLogs
                    };
                }

                // Log error and continue to next attempt
                logger.warn('BUILD', `Build attempt ${attempt} failed: ${errorMessage}`, null, undefined, projectId);
                buildLogs.push(`Attempt ${attempt} failed: ${errorMessage}`);

                // Simple retry without error recovery for now
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
        }

        // This should never be reached due to the return in the last attempt
        return {
            success: false,
            previewUrl: '',
            mode: 'build',
            error: 'Unexpected error in build process',
            buildLogs
        };
    }

    private async ensureProjectStructure(projectDir: string, files: GeneratedFile[], title: string): Promise<void> {
        // Ensure project directory exists
        await fs.mkdir(projectDir, { recursive: true });

        // Determine CSS theme based on title and file contents
        const userInput = files.find(f => f.path.includes('page.tsx'))?.content || title;
        const selectedTheme = CSSGenerator.selectThemeBasedOnInput(userInput, title);

        // Generate custom CSS for this project
        const customCSS = CSSGenerator.generateCustomCSS(selectedTheme, title);
        const customTailwindConfig = CSSGenerator.generateTailwindConfig(selectedTheme);

        // Create all directories needed for the files
        for (const file of files) {
            const filePath = path.join(projectDir, file.path);
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            // Write the actual file content
            await fs.writeFile(filePath, file.content);
        }

        // Create custom globals.css with theme-specific styles
        const srcAppDir = path.join(projectDir, 'src', 'app');
        await fs.mkdir(srcAppDir, { recursive: true });
        await fs.writeFile(path.join(srcAppDir, 'globals.css'), customCSS);

        // Create enhanced package.json with all necessary dependencies
        // Use the provided title instead of the directory name (workflow ID)
        const packageName = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/--+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            || path.basename(projectDir); // Fallback to directory name if title processing fails

        const packageJson = {
            name: packageName,
            version: '0.1.0',
            private: true,
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint'
            },
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                next: '14.2.30',
                'lucide-react': '^0.263.1',
                clsx: '^2.0.0',
                'tailwind-merge': '^2.0.0'
            },
            devDependencies: {
                typescript: '^5.2.2',
                '@types/node': '^20.8.0',
                '@types/react': '^18.2.25',
                '@types/react-dom': '^18.2.11',
                autoprefixer: '^10.4.16',
                postcss: '^8.4.31',
                tailwindcss: '^3.3.5',
                eslint: '^8.51.0',
                'eslint-config-next': '14.2.30'
            }
        };

        await fs.writeFile(
            path.join(projectDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Create Next.js config
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig`;

        await fs.writeFile(path.join(projectDir, 'next.config.js'), nextConfig);

        // Create custom Tailwind config with theme-specific settings
        await fs.writeFile(path.join(projectDir, 'tailwind.config.js'), customTailwindConfig);

        // Create PostCSS config
        const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

        await fs.writeFile(path.join(projectDir, 'postcss.config.js'), postcssConfig);

        // Create TypeScript config
        const tsConfig = {
            compilerOptions: {
                target: 'es5',
                lib: ['dom', 'dom.iterable', 'es6'],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                module: 'esnext',
                moduleResolution: 'bundler',
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: 'preserve',
                incremental: true,
                plugins: [{ name: 'next' }],
                baseUrl: '.',
                paths: { '@/*': ['./src/*'] }
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules']
        };

        await fs.writeFile(
            path.join(projectDir, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2)
        );

        // Create public folder with basic structure (prevents 404s for any accidentally referenced images)
        await fs.mkdir(path.join(projectDir, 'public'), { recursive: true });

        // Create a simple robots.txt to prevent indexing of generated apps
        await fs.writeFile(
            path.join(projectDir, 'public', 'robots.txt'),
            'User-agent: *\nDisallow: /'
        );
    }

    private async runCommand(command: string, args: string[], cwd: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { cwd, stdio: 'pipe' });
            let output = '';

            process.stdout?.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log(text.trim());
            });

            process.stderr?.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.error(`Error: ${text.trim()}`);
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with code ${code}: ${output}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    async stopPreview(projectId: string): Promise<boolean> {
        return await this.portManager.stopPreviewApp(projectId);
    }

    async stopAllPreviews(): Promise<void> {
        const runningApps = this.portManager.getAllRunningProcesses();
        const promises = runningApps.map(app => this.portManager.stopPreviewApp(app.projectId));
        await Promise.all(promises);
    }

    getRunningApps(): string[] {
        return this.portManager.getAllRunningProcesses().map(app => app.projectId);
    }

    getAppStatus(projectId: string) {
        return this.portManager.getAppStatus(projectId);
    }

    updateLastAccess(projectId: string): void {
        this.portManager.updateLastAccess(projectId);
    }

    // Decision logic for choosing preview mode
    static determinePreviewMode(files: GeneratedFile[], complexity: 'simple' | 'medium' | 'complex'): PreviewMode {
        // Simple heuristics - you can make this more sophisticated
        if (complexity === 'complex' || files.length > 8) {
            return 'build';
        }

        // Check for complex patterns that might need real building
        const hasApiRoutes = files.some(f => f.type === 'api');
        const hasComplexComponents = files.some(f =>
            f.content.includes('useState') ||
            f.content.includes('useEffect') ||
            f.content.includes('async/await')
        );

        if (hasApiRoutes || hasComplexComponents) {
            return 'build';
        }

        return 'template';
    }
}

export const previewManager = new PreviewManager();
export { PreviewManager }; 