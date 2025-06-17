import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { detectEnvironment } from './environment';
import { logger } from './logger';

export interface DevServerInfo {
    projectId: string;
    pid: number | null;
    port: number;
    projectPath: string;
    startTime: number;
    status: 'starting' | 'installing' | 'building' | 'running' | 'failed' | 'stopped';
    logs: string[];
    process?: ChildProcess;
    buildProgress?: string;
    url?: string;
}

export interface DevServerResult {
    success: boolean;
    port?: number;
    url?: string;
    projectPath?: string;
    error?: string;
    logs?: string[];
    serverInfo?: DevServerInfo;
}

export class ProductionDevServerManager {
    private static instance: ProductionDevServerManager;
    private runningServers: Map<string, DevServerInfo> = new Map();
    private allocatedPorts: Set<number> = new Set();
    private environment = detectEnvironment();

    // Port range for production (avoid conflicts with main app)
    private portRange = {
        min: parseInt(process.env.VOLTAIC_DEV_SERVER_PORT_MIN || '4000'),
        max: parseInt(process.env.VOLTAIC_DEV_SERVER_PORT_MAX || '4100')
    };

    private constructor() {
        this.setupCleanup();
    }

    static getInstance(): ProductionDevServerManager {
        if (!ProductionDevServerManager.instance) {
            ProductionDevServerManager.instance = new ProductionDevServerManager();
        }
        return ProductionDevServerManager.instance;
    }

    /**
     * Create a complete Next.js project and start dev server
     */
    async createAndStartDevServer(
        projectId: string,
        reactComponent: string,
        projectTitle: string = 'Voltaic Generated App'
    ): Promise<DevServerResult> {
        const startTime = Date.now();
        let port: number | undefined;

        try {
            logger.info('production-dev', `Starting dev server creation for ${projectId}`, { projectId });

            // Step 1: Create project structure
            const projectPath = await this.createProjectStructure(projectId, reactComponent, projectTitle);

            // Step 2: Find available port
            port = await this.findAvailablePort();

            // Create server info
            const serverInfo: DevServerInfo = {
                projectId,
                pid: null,
                port,
                projectPath,
                startTime,
                status: 'starting',
                logs: [`[${new Date().toISOString()}] Starting project creation...`],
                url: `http://localhost:${port}`
            };

            this.runningServers.set(projectId, serverInfo);
            this.allocatedPorts.add(port);

            // Step 3: Install dependencies
            await this.installDependencies(serverInfo);

            // Step 4: Start dev server
            await this.startDevServer(serverInfo);

            // Step 5: Wait for server to be ready
            await this.waitForServerReady(serverInfo);

            logger.info('production-dev', `Dev server started successfully`, {
                projectId,
                port,
                url: serverInfo.url,
                duration: Date.now() - startTime
            });

            return {
                success: true,
                port,
                url: serverInfo.url,
                projectPath,
                serverInfo,
                logs: serverInfo.logs
            };

        } catch (error) {
            logger.error('production-dev', `Failed to create dev server for ${projectId}`, error);

            // Cleanup on failure
            this.runningServers.delete(projectId);
            if (this.allocatedPorts.has(port!)) {
                this.allocatedPorts.delete(port!);
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                logs: this.runningServers.get(projectId)?.logs || []
            };
        }
    }

    /**
     * Create complete Next.js project structure in /tmp
     */
    private async createProjectStructure(
        projectId: string,
        reactComponent: string,
        projectTitle: string
    ): Promise<string> {
        const baseDir = this.environment.writableDirectory || '/tmp';
        const projectPath = path.join(baseDir, 'voltaic-dev-servers', projectId);

        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, 'src', 'app'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'src', 'components'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'public'), { recursive: true });

        // Create package.json
        const packageJson = {
            name: `voltaic-${projectId}`,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint"
            },
            dependencies: {
                next: "^14.0.0",
                react: "^18.0.0",
                "react-dom": "^18.0.0",
                "@types/node": "^20.0.0",
                "@types/react": "^18.0.0",
                "@types/react-dom": "^18.0.0",
                autoprefixer: "^10.0.0",
                postcss: "^8.0.0",
                tailwindcss: "^3.3.0",
                typescript: "^5.0.0"
            }
        };

        await fs.writeFile(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Create Next.js config
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
`;

        await fs.writeFile(path.join(projectPath, 'next.config.js'), nextConfig);

        // Create TypeScript config
        const tsConfig = {
            "compilerOptions": {
                "target": "es5",
                "lib": ["dom", "dom.iterable", "es6"],
                "allowJs": true,
                "skipLibCheck": true,
                "strict": true,
                "noEmit": true,
                "esModuleInterop": true,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": true,
                "isolatedModules": true,
                "jsx": "preserve",
                "incremental": true,
                "plugins": [
                    {
                        "name": "next"
                    }
                ],
                "paths": {
                    "@/*": ["./src/*"]
                }
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"]
        };

        await fs.writeFile(
            path.join(projectPath, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2)
        );

        // Create Tailwind config
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
`;

        await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);

        // Create PostCSS config
        const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

        await fs.writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig);

        // Create globals.css
        const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

        await fs.writeFile(path.join(projectPath, 'src/app/globals.css'), globalsCss);

        // Create layout.tsx
        const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${projectTitle}',
  description: 'Generated by Voltaic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`;

        await fs.writeFile(path.join(projectPath, 'src/app/layout.tsx'), layout);

        // Create page.tsx with the provided React component
        const page = `import React from 'react';

${reactComponent}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            ${projectTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generated by Voltaic • Running in Production Dev Server
          </p>
        </div>
        <App />
      </div>
    </div>
  );
}
`;

        await fs.writeFile(path.join(projectPath, 'src/app/page.tsx'), page);

        return projectPath;
    }

    /**
     * Install npm dependencies
     */
    private async installDependencies(serverInfo: DevServerInfo): Promise<void> {
        return new Promise((resolve, reject) => {
            serverInfo.status = 'installing';
            serverInfo.logs.push(`[${new Date().toISOString()}] Installing dependencies...`);

            const npmProcess = spawn('npm', ['install'], {
                cwd: serverInfo.projectPath,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'development',
                    NPM_CONFIG_AUDIT: 'false',
                    NPM_CONFIG_FUND: 'false'
                }
            });

            let installOutput = '';

            npmProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                installOutput += output;
                serverInfo.logs.push(`[INSTALL] ${output.trim()}`);
            });

            npmProcess.stderr?.on('data', (data) => {
                const error = data.toString();
                installOutput += error;
                serverInfo.logs.push(`[INSTALL ERROR] ${error.trim()}`);
            });

            npmProcess.on('close', (code) => {
                if (code === 0) {
                    serverInfo.logs.push(`[${new Date().toISOString()}] Dependencies installed successfully`);
                    resolve();
                } else {
                    const error = `npm install failed with code ${code}. Output: ${installOutput}`;
                    serverInfo.logs.push(`[ERROR] ${error}`);
                    serverInfo.status = 'failed';
                    reject(new Error(error));
                }
            });

            npmProcess.on('error', (error) => {
                const errorMsg = `Failed to start npm install: ${error.message}`;
                serverInfo.logs.push(`[ERROR] ${errorMsg}`);
                serverInfo.status = 'failed';
                reject(new Error(errorMsg));
            });
        });
    }

    /**
     * Start the Next.js dev server
     */
    private async startDevServer(serverInfo: DevServerInfo): Promise<void> {
        return new Promise((resolve, reject) => {
            serverInfo.status = 'building';
            serverInfo.logs.push(`[${new Date().toISOString()}] Starting dev server on port ${serverInfo.port}...`);

            const devProcess = spawn('npm', ['run', 'dev'], {
                cwd: serverInfo.projectPath,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PORT: serverInfo.port.toString(),
                    NODE_ENV: 'development'
                }
            });

            serverInfo.process = devProcess;
            serverInfo.pid = devProcess.pid || null;

            let hasStarted = false;

            devProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                serverInfo.logs.push(`[DEV] ${output.trim()}`);

                // Check for server ready indicators
                if (output.includes('Ready') || output.includes(`localhost:${serverInfo.port}`)) {
                    if (!hasStarted) {
                        hasStarted = true;
                        serverInfo.status = 'running';
                        resolve();
                    }
                }

                // Check for build progress
                if (output.includes('Compiling') || output.includes('Compiled')) {
                    serverInfo.buildProgress = output.trim();
                }
            });

            devProcess.stderr?.on('data', (data) => {
                const error = data.toString();
                serverInfo.logs.push(`[DEV ERROR] ${error.trim()}`);

                // Check for critical errors
                if (error.includes('Error:') || error.includes('SyntaxError') || error.includes('Cannot resolve')) {
                    if (!hasStarted) {
                        serverInfo.status = 'failed';
                        reject(new Error(`Dev server failed to start: ${error}`));
                    }
                }
            });

            devProcess.on('close', (code) => {
                serverInfo.logs.push(`[${new Date().toISOString()}] Dev server exited with code ${code}`);
                serverInfo.status = 'stopped';
                this.runningServers.delete(serverInfo.projectId);
                this.allocatedPorts.delete(serverInfo.port);
            });

            devProcess.on('error', (error) => {
                const errorMsg = `Failed to start dev server: ${error.message}`;
                serverInfo.logs.push(`[ERROR] ${errorMsg}`);
                serverInfo.status = 'failed';
                if (!hasStarted) {
                    reject(new Error(errorMsg));
                }
            });

            // Timeout for server startup
            setTimeout(() => {
                if (!hasStarted) {
                    serverInfo.status = 'failed';
                    reject(new Error('Dev server startup timeout (60s)'));
                }
            }, 60000);
        });
    }

    /**
     * Wait for server to be ready and responding
     */
    private async waitForServerReady(serverInfo: DevServerInfo): Promise<void> {
        const maxAttempts = 30;
        const delayMs = 2000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                serverInfo.logs.push(`[${new Date().toISOString()}] Health check ${attempt}/${maxAttempts}...`);

                const response = await fetch(`http://localhost:${serverInfo.port}`, {
                    signal: AbortSignal.timeout(5000)
                });

                if (response.status < 500) {
                    serverInfo.logs.push(`[${new Date().toISOString()}] Server is ready! Status: ${response.status}`);
                    return;
                }
            } catch (error) {
                serverInfo.logs.push(`[HEALTH CHECK] Attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`);
            }

            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        throw new Error(`Server failed to become ready after ${maxAttempts} attempts`);
    }

    /**
     * Find an available port
     */
    private async findAvailablePort(): Promise<number> {
        for (let port = this.portRange.min; port <= this.portRange.max; port++) {
            if (!this.allocatedPorts.has(port) && await this.isPortAvailable(port)) {
                return port;
            }
        }
        throw new Error(`No available ports in range ${this.portRange.min}-${this.portRange.max}`);
    }

    /**
     * Check if port is available
     */
    private async isPortAvailable(port: number): Promise<boolean> {
        try {
            const response = await fetch(`http://localhost:${port}`, {
                signal: AbortSignal.timeout(1000)
            });
            return false; // Port is in use
        } catch (error) {
            return true; // Port is free
        }
    }

    /**
     * Get server info
     */
    getServerInfo(projectId: string): DevServerInfo | null {
        return this.runningServers.get(projectId) || null;
    }

    /**
     * Get all running servers
     */
    getAllServers(): DevServerInfo[] {
        return Array.from(this.runningServers.values());
    }

    /**
     * Stop a dev server
     */
    async stopServer(projectId: string): Promise<boolean> {
        const serverInfo = this.runningServers.get(projectId);
        if (!serverInfo) {
            return false;
        }

        try {
            if (serverInfo.process && serverInfo.pid) {
                serverInfo.process.kill('SIGTERM');

                // Wait for graceful shutdown
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Force kill if still running
                try {
                    if (serverInfo.pid) {
                        process.kill(serverInfo.pid, 'SIGKILL');
                    }
                } catch (e) {
                    // Process already dead
                }
            }

            this.runningServers.delete(projectId);
            this.allocatedPorts.delete(serverInfo.port);

            serverInfo.logs.push(`[${new Date().toISOString()}] Server stopped`);

            return true;
        } catch (error) {
            logger.error('production-dev', `Failed to stop server ${projectId}`, error);
            return false;
        }
    }

    /**
     * Cleanup all servers
     */
    async cleanup(): Promise<void> {
        const projectIds = Array.from(this.runningServers.keys());
        await Promise.all(projectIds.map(id => this.stopServer(id)));
    }

    /**
     * Setup cleanup on process exit
     */
    private setupCleanup(): void {
        const cleanup = () => {
            this.cleanup();
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }
} 