import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

const execAsync = promisify(exec);

export interface RunningProcess {
    projectId: string;
    pid: number;
    port: number;
    startTime: number;
    lastAccess: number;
    status: 'starting' | 'running' | 'failed' | 'stopped';
    buildLogs?: string[];
}

export class PortManager {
    private static instance: PortManager;
    private runningProcesses: Map<string, RunningProcess> = new Map();
    private allocatedPorts: Set<number> = new Set(); // Track allocated ports
    private portAllocationLock: Map<number, Promise<boolean>> = new Map(); // Lock for port allocation
    private portRange = {
        min: parseInt(process.env.PREVIEW_PORT_RANGE_MIN || '3100'),
        max: parseInt(process.env.PREVIEW_PORT_RANGE_MAX || '3200')
    };
    private inactivityTimeout = parseInt(process.env.PREVIEW_INACTIVITY_TIMEOUT || '300000'); // 5 minutes in production
    private cleanupInterval: NodeJS.Timeout | null = null;
    private maxConcurrentApps = parseInt(process.env.PREVIEW_MAX_CONCURRENT_APPS || '100');

    private constructor() {
        this.startCleanupService();
    }

    static getInstance(): PortManager {
        if (!PortManager.instance) {
            PortManager.instance = new PortManager();
        }
        return PortManager.instance;
    }

    /**
     * Find an available port in the specified range with proper locking
     */
    async findAvailablePort(): Promise<number> {
        // Check if we're at max capacity
        if (this.runningProcesses.size >= this.maxConcurrentApps) {
            throw new Error(`Maximum concurrent apps (${this.maxConcurrentApps}) reached. Please wait for inactive apps to cleanup.`);
        }

        for (let port = this.portRange.min; port <= this.portRange.max; port++) {
            // Skip if already allocated
            if (this.allocatedPorts.has(port)) {
                continue;
            }

            // Check if port allocation is in progress
            if (this.portAllocationLock.has(port)) {
                continue;
            }

            // Create allocation lock for this port
            const allocationPromise = this.tryAllocatePort(port);
            this.portAllocationLock.set(port, allocationPromise);

            try {
                const allocated = await allocationPromise;
                if (allocated) {
                    this.allocatedPorts.add(port);
                    return port;
                }
            } finally {
                this.portAllocationLock.delete(port);
            }
        }

        throw new Error(`No available ports in range ${this.portRange.min}-${this.portRange.max}`);
    }

    /**
     * Try to allocate a specific port
     */
    private async tryAllocatePort(port: number): Promise<boolean> {
        return await this.isPortAvailable(port);
    }

    /**
     * Check if a specific port is available
     */
    private async isPortAvailable(port: number): Promise<boolean> {
        try {
            const { stdout } = await execAsync(`lsof -i :${port}`);
            return !stdout.trim(); // Empty output means port is free
        } catch (error) {
            return true; // Command failed means port is likely free
        }
    }

    /**
     * Start a new preview app process
     */
    async startPreviewApp(projectId: string, projectPath: string): Promise<{ port: number; url: string }> {
        // Kill existing process if any
        await this.stopPreviewApp(projectId);

        const port = await this.findAvailablePort();
        logger.portAllocated(projectId, port);
        const now = Date.now();

        // Create process entry
        const processInfo: RunningProcess = {
            projectId,
            pid: 0, // Will be set when process starts
            port,
            startTime: now,
            lastAccess: now,
            status: 'starting',
            buildLogs: []
        };

        this.runningProcesses.set(projectId, processInfo);

        try {
            // Check if project directory exists
            if (!require('fs').existsSync(projectPath)) {
                throw new Error(`Project directory does not exist: ${projectPath}`);
            }

            // Check if package.json exists
            const packageJsonPath = require('path').join(projectPath, 'package.json');
            if (!require('fs').existsSync(packageJsonPath)) {
                throw new Error(`package.json not found in: ${projectPath}`);
            }

            // Use full npm path to avoid ENOENT errors
            let npmCommand = 'npm';
            if (process.platform === 'win32') {
                npmCommand = 'npm.cmd';
            }

            // Start the Next.js development server
            const child = spawn(npmCommand, ['run', 'dev'], {
                cwd: projectPath,
                env: {
                    ...process.env,
                    PORT: port.toString(),
                    NEXT_DEV_PORT: port.toString(),
                    NODE_ENV: 'development'
                },
                detached: false,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true // Use shell to ensure npm is found
            });

            processInfo.pid = child.pid!;
            processInfo.status = 'running';

            // Handle process events
            child.stdout?.on('data', (data) => {
                const log = data.toString();
                processInfo.buildLogs?.push(log);
                console.log(`[${projectId}:${port}] ${log}`);
            });

            child.stderr?.on('data', (data) => {
                const log = data.toString();
                processInfo.buildLogs?.push(`ERROR: ${log}`);
                console.error(`[${projectId}:${port}] ERROR: ${log}`);

                // Check for critical build errors that indicate the project won't start
                if (log.includes('Syntax Error') ||
                    log.includes('SyntaxError') ||
                    log.includes('Unexpected token') ||
                    log.includes('Cannot resolve module') ||
                    log.includes('Module not found')) {
                    processInfo.status = 'failed';
                    processInfo.buildLogs?.push('CRITICAL: Build failed due to syntax errors');
                }
            });

            child.on('error', (error) => {
                console.error(`[${projectId}:${port}] Process error:`, error);
                processInfo.status = 'failed';
                processInfo.buildLogs?.push(`FATAL ERROR: ${error.message}`);
            });

            child.on('exit', (code, signal) => {
                console.log(`[${projectId}:${port}] Process exited with code ${code}, signal ${signal}`);
                processInfo.status = 'stopped';
                this.runningProcesses.delete(projectId);
                this.allocatedPorts.delete(port); // Release the port
            });

            // Wait for server to be ready (check if port responds)
            await this.waitForServerReady(port, 45000, projectId); // 45 second timeout

            return {
                port,
                url: `http://localhost:${port}`
            };

        } catch (error) {
            processInfo.status = 'failed';
            this.runningProcesses.delete(projectId);
            this.allocatedPorts.delete(port); // Release the port
            throw error;
        }
    }

    /**
     * Stop a preview app process
     */
    async stopPreviewApp(projectId: string): Promise<boolean> {
        const processInfo = this.runningProcesses.get(projectId);
        if (!processInfo) {
            return false;
        }

        try {
            // Kill the process and its children
            process.kill(processInfo.pid, 'SIGTERM');

            // Give it a moment to terminate gracefully
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Force kill if still running
            try {
                process.kill(processInfo.pid, 'SIGKILL');
            } catch (e) {
                // Process already dead
            }

            this.runningProcesses.delete(projectId);
            this.allocatedPorts.delete(processInfo.port); // Release the port
            console.log(`✅ Stopped preview app ${projectId} (PID: ${processInfo.pid}, Port: ${processInfo.port})`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to stop preview app ${projectId}:`, error);
            // Remove from tracking anyway
            this.runningProcesses.delete(projectId);
            if (processInfo) {
                this.allocatedPorts.delete(processInfo.port); // Release the port
            }
            return false;
        }
    }

    /**
     * Update last access time for a preview app
     */
    updateLastAccess(projectId: string): void {
        const processInfo = this.runningProcesses.get(projectId);
        if (processInfo) {
            processInfo.lastAccess = Date.now();
        }
    }

    /**
     * Get status of a preview app
     */
    getAppStatus(projectId: string): RunningProcess | null {
        return this.runningProcesses.get(projectId) || null;
    }

    /**
     * Get all running processes
     */
    getAllRunningProcesses(): RunningProcess[] {
        return Array.from(this.runningProcesses.values());
    }

    /**
     * Wait for server to be ready
     */
    private async waitForServerReady(port: number, timeout: number, projectId?: string): Promise<void> {
        const startTime = Date.now();
        let lastError: any = null;

        while (Date.now() - startTime < timeout) {
            // Check if the build has failed (if projectId is provided)
            if (projectId) {
                const processInfo = this.runningProcesses.get(projectId);
                if (processInfo && processInfo.status === 'failed') {
                    const buildLogs = processInfo.buildLogs?.join('\n') || '';
                    throw new Error(`Build failed for project ${projectId}. Build logs: ${buildLogs.slice(-1000)}`);
                }
            }

            try {
                const response = await fetch(`http://localhost:${port}`, {
                    signal: AbortSignal.timeout(2000)
                });

                // Accept any response that isn't a connection error
                if (response.status < 600) {
                    console.log(`✅ Server on port ${port} is responding with status ${response.status}`);
                    return;
                }
            } catch (error: any) {
                lastError = error;

                // If it's a fetch error but the server is responding, that's okay
                if (error.message && error.message.includes('fetch')) {
                    try {
                        // Try a simple TCP connection to see if the port is open
                        const net = require('net');
                        const socket = new net.Socket();

                        await new Promise((resolve, reject) => {
                            socket.setTimeout(1000);
                            socket.on('connect', () => {
                                socket.destroy();
                                resolve(true);
                            });
                            socket.on('timeout', () => {
                                socket.destroy();
                                reject(new Error('Connection timeout'));
                            });
                            socket.on('error', reject);
                            socket.connect(port, 'localhost');
                        });

                        console.log(`✅ Server on port ${port} is accepting connections`);
                        return;
                    } catch (netError) {
                        // Port not open yet, continue waiting
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error(`Server on port ${port} did not become ready within ${timeout}ms. Last error: ${lastError?.message || 'Unknown'}`);
    }

    /**
     * Start the cleanup service to remove inactive processes
     */
    private startCleanupService(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(async () => {
            const now = Date.now();
            const toCleanup: string[] = [];

            for (const [projectId, processInfo] of this.runningProcesses.entries()) {
                const inactiveTime = now - processInfo.lastAccess;

                if (inactiveTime > this.inactivityTimeout && processInfo.status === 'running') {
                    console.log(`🧹 Cleaning up inactive preview app ${projectId} (inactive for ${Math.round(inactiveTime / 1000)}s)`);
                    toCleanup.push(projectId);
                }
            }

            // Clean up inactive processes
            for (const projectId of toCleanup) {
                await this.stopPreviewApp(projectId);
            }

        }, 30000); // Check every 30 seconds
    }

    /**
     * Stop the cleanup service
     */
    stopCleanupService(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * Cleanup all processes (for shutdown)
     */
    async cleanupAll(): Promise<void> {
        console.log('🧹 Cleaning up all preview processes...');

        const projectIds = Array.from(this.runningProcesses.keys());
        await Promise.all(projectIds.map(id => this.stopPreviewApp(id)));

        this.stopCleanupService();
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await PortManager.getInstance().cleanupAll();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await PortManager.getInstance().cleanupAll();
    process.exit(0);
}); 