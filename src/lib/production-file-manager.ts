/**
 * Production File Manager for Vercel Functions
 * 
 * Handles file operations in production environments where:
 * - Main filesystem is read-only
 * - /tmp directory provides writable scratch space (500MB limit)
 * - Files are ephemeral (deleted after function execution)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { detectEnvironment } from './environment';

export interface FileOperationResult {
    success: boolean;
    mode: 'development' | 'production-tmp' | 'production-memory';
    projectDir: string;
    filesWritten: number;
    isEphemeral: boolean;
    message: string;
    error?: string;
    storageUsed?: string;
}

export interface GeneratedFile {
    path: string;
    content: string;
    type?: string;
    description?: string;
}

export class ProductionFileManager {
    private env = detectEnvironment();

    /**
     * Get the appropriate project directory based on environment
     */
    getProjectDirectory(projectId: string): {
        path: string;
        isWritable: boolean;
        isEphemeral: boolean;
        mode: 'development' | 'production-tmp' | 'production-memory';
    } {
        if (!this.env.isProduction) {
            // Development environment
            return {
                path: path.join(process.cwd(), 'generated-apps', projectId),
                isWritable: true,
                isEphemeral: false,
                mode: 'development'
            };
        }

        // Production environment - use /tmp
        return {
            path: path.join('/tmp', 'voltaic-apps', projectId),
            isWritable: true,
            isEphemeral: true,
            mode: 'production-tmp'
        };
    }

    /**
     * Create project structure and write files
     */
    async createProject(projectId: string, title: string, files: GeneratedFile[]): Promise<FileOperationResult> {
        const projectInfo = this.getProjectDirectory(projectId);

        try {
            // Create project directory structure
            await this.createProjectStructure(projectInfo.path);

            // Write all files
            let filesWritten = 0;
            for (const file of files) {
                await this.writeProjectFile(projectInfo.path, file);
                filesWritten++;
            }

            // Create package.json for the project
            await this.createPackageJson(projectInfo.path, projectId, title);
            filesWritten++;

            // Create additional config files
            await this.createConfigFiles(projectInfo.path);
            filesWritten += 3; // globals.css, tailwind.config.js, next.config.js

            // Calculate storage used
            const storageUsed = await this.calculateStorageUsed(projectInfo.path);

            return {
                success: true,
                mode: projectInfo.mode,
                projectDir: projectInfo.path,
                filesWritten,
                isEphemeral: projectInfo.isEphemeral,
                message: this.getSuccessMessage(projectInfo.mode, projectInfo.isEphemeral),
                storageUsed
            };

        } catch (error) {
            console.error('Project creation failed:', error);

            return {
                success: false,
                mode: projectInfo.mode,
                projectDir: projectInfo.path,
                filesWritten: 0,
                isEphemeral: projectInfo.isEphemeral,
                message: 'Failed to create project files',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Create the basic project directory structure
     */
    private async createProjectStructure(projectDir: string): Promise<void> {
        const directories = [
            projectDir,
            path.join(projectDir, 'src'),
            path.join(projectDir, 'src', 'app'),
            path.join(projectDir, 'src', 'components'),
            path.join(projectDir, 'public')
        ];

        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Write a single file to the project
     */
    private async writeProjectFile(projectDir: string, file: GeneratedFile): Promise<void> {
        // Determine the correct file path
        let filePath: string;

        if (file.path.startsWith('src/')) {
            // File already has src/ prefix
            filePath = path.join(projectDir, file.path);
        } else if (file.path.startsWith('public/')) {
            // Public file
            filePath = path.join(projectDir, file.path);
        } else if (file.path.includes('/')) {
            // File has directory structure but no src/ prefix
            filePath = path.join(projectDir, 'src', file.path);
        } else {
            // Root level file (like package.json)
            filePath = path.join(projectDir, file.path);
        }

        // Ensure directory exists
        const fileDir = path.dirname(filePath);
        await fs.mkdir(fileDir, { recursive: true });

        // Write file content
        await fs.writeFile(filePath, file.content, 'utf8');
    }

    /**
     * Create package.json for the project
     */
    private async createPackageJson(projectDir: string, projectId: string, title: string): Promise<void> {
        const packageJson = {
            name: this.sanitizePackageName(title) || projectId,
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
                '@types/node': '^20',
                '@types/react': '^18',
                '@types/react-dom': '^18',
                typescript: '^5',
                tailwindcss: '^3.3.0',
                autoprefixer: '^10.0.1',
                postcss: '^8'
            }
        };

        const packagePath = path.join(projectDir, 'package.json');
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
    }

    /**
     * Create configuration files (globals.css, tailwind.config.js, etc.)
     */
    private async createConfigFiles(projectDir: string): Promise<void> {
        // Create globals.css
        const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
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
}`;

        await fs.writeFile(path.join(projectDir, 'src', 'app', 'globals.css'), globalsCss, 'utf8');

        // Create tailwind.config.js
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right top'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        }
      }
    },
  },
  plugins: [],
}`;

        await fs.writeFile(path.join(projectDir, 'tailwind.config.js'), tailwindConfig, 'utf8');

        // Create next.config.js
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    domains: [],
    unoptimized: true
  }
}

module.exports = nextConfig`;

        await fs.writeFile(path.join(projectDir, 'next.config.js'), nextConfig, 'utf8');
    }

    /**
     * Calculate storage used by the project
     */
    private async calculateStorageUsed(projectDir: string): Promise<string> {
        try {
            const stats = await this.getDirectorySize(projectDir);
            return this.formatBytes(stats);
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Get directory size recursively
     */
    private async getDirectorySize(dirPath: string): Promise<number> {
        let totalSize = 0;

        try {
            const items = await fs.readdir(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);

                if (stats.isDirectory()) {
                    totalSize += await this.getDirectorySize(itemPath);
                } else {
                    totalSize += stats.size;
                }
            }
        } catch {
            // Directory might not exist or be accessible
        }

        return totalSize;
    }

    /**
     * Format bytes to human readable format
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Sanitize package name for package.json
     */
    private sanitizePackageName(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50) || 'generated-app';
    }

    /**
     * Get appropriate success message based on mode
     */
    private getSuccessMessage(mode: string, isEphemeral: boolean): string {
        switch (mode) {
            case 'development':
                return 'Project files created successfully in development environment';
            case 'production-tmp':
                return `Project files created in /tmp directory (ephemeral storage, available for this request only)`;
            default:
                return 'Project structure prepared (memory mode)';
        }
    }

    /**
     * Check if project exists and is accessible
     */
    async projectExists(projectId: string): Promise<boolean> {
        const projectInfo = this.getProjectDirectory(projectId);

        try {
            await fs.access(projectInfo.path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get project information
     */
    async getProjectInfo(projectId: string): Promise<{
        exists: boolean;
        path: string;
        mode: string;
        isEphemeral: boolean;
        storageUsed?: string;
    }> {
        const projectInfo = this.getProjectDirectory(projectId);
        const exists = await this.projectExists(projectId);

        let storageUsed;
        if (exists) {
            storageUsed = await this.calculateStorageUsed(projectInfo.path);
        }

        return {
            exists,
            path: projectInfo.path,
            mode: projectInfo.mode,
            isEphemeral: projectInfo.isEphemeral,
            storageUsed
        };
    }

    /**
     * Clean up project files (mainly for development)
     */
    async cleanupProject(projectId: string): Promise<boolean> {
        const projectInfo = this.getProjectDirectory(projectId);

        try {
            await fs.rm(projectInfo.path, { recursive: true, force: true });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * List all temporary projects (production only)
     */
    async listTempProjects(): Promise<string[]> {
        if (!this.env.isProduction) {
            return [];
        }

        try {
            const tempDir = '/tmp/voltaic-apps';
            const projects = await fs.readdir(tempDir);
            return projects;
        } catch {
            return [];
        }
    }
} 