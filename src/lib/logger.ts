export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    component: string;
    message: string;
    data?: any;
    agentId?: string;
    workflowId?: string;
}

class Logger {
    private logLevel: LogLevel = LogLevel.INFO;
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    setLogLevel(level: LogLevel) {
        this.logLevel = level;
    }

    private log(level: LogLevel, component: string, message: string, data?: any, agentId?: string, workflowId?: string) {
        if (level < this.logLevel) return;

        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            component,
            message,
            data,
            agentId,
            workflowId
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with colors and emojis
        const timestamp = entry.timestamp.toISOString().substr(11, 12);
        const levelEmoji = this.getLevelEmoji(level);
        const componentTag = `[${component}]`;
        const agentTag = agentId ? `{${agentId}}` : '';
        const workflowTag = workflowId ? `<${workflowId.slice(-8)}>` : '';

        const logMessage = `${timestamp} ${levelEmoji} ${componentTag}${agentTag}${workflowTag} ${message}`;

        switch (level) {
            case LogLevel.DEBUG:
                console.log(`\x1b[36m${logMessage}\x1b[0m`, data ? data : '');
                break;
            case LogLevel.INFO:
                console.log(`\x1b[32m${logMessage}\x1b[0m`, data ? data : '');
                break;
            case LogLevel.WARN:
                console.warn(`\x1b[33m${logMessage}\x1b[0m`, data ? data : '');
                break;
            case LogLevel.ERROR:
                console.error(`\x1b[31m${logMessage}\x1b[0m`, data ? data : '');
                break;
        }
    }

    private getLevelEmoji(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return '🔍';
            case LogLevel.INFO: return '📘';
            case LogLevel.WARN: return '⚠️';
            case LogLevel.ERROR: return '❌';
            default: return '📝';
        }
    }

    debug(component: string, message: string, data?: any, agentId?: string, workflowId?: string) {
        this.log(LogLevel.DEBUG, component, message, data, agentId, workflowId);
    }

    info(component: string, message: string, data?: any, agentId?: string, workflowId?: string) {
        this.log(LogLevel.INFO, component, message, data, agentId, workflowId);
    }

    warn(component: string, message: string, data?: any, agentId?: string, workflowId?: string) {
        this.log(LogLevel.WARN, component, message, data, agentId, workflowId);
    }

    error(component: string, message: string, data?: any, agentId?: string, workflowId?: string) {
        this.log(LogLevel.ERROR, component, message, data, agentId, workflowId);
    }

    // Agent-specific logging methods
    agentStart(agentId: string, workflowId: string, description: string) {
        this.info('AGENT', `🚀 Starting: ${description}`, null, agentId, workflowId);
    }

    agentProgress(agentId: string, workflowId: string, step: string, progress?: number) {
        const progressBar = progress ? ` (${Math.round(progress)}%)` : '';
        this.info('AGENT', `⚡ ${step}${progressBar}`, null, agentId, workflowId);
    }

    agentComplete(agentId: string, workflowId: string, result: string) {
        this.info('AGENT', `✅ Complete: ${result}`, null, agentId, workflowId);
    }

    agentError(agentId: string, workflowId: string, error: string, details?: any) {
        this.error('AGENT', `❌ Error: ${error}`, details, agentId, workflowId);
    }

    // Preview and build logging
    buildStart(projectId: string, attempt: number, maxAttempts: number) {
        this.info('BUILD', `🔨 Build attempt ${attempt}/${maxAttempts} for ${projectId}`);
    }

    buildProgress(projectId: string, step: string) {
        this.info('BUILD', `⚡ ${step}`, null, undefined, projectId);
    }

    buildSuccess(projectId: string, port: number, duration: number) {
        this.info('BUILD', `✅ Build complete in ${duration}ms - Preview running on port ${port}`, null, undefined, projectId);
    }

    buildError(projectId: string, error: string, attempt: number) {
        this.error('BUILD', `❌ Build attempt ${attempt} failed: ${error}`, null, undefined, projectId);
    }

    buildRetry(projectId: string, fixes: string[], attempt: number) {
        this.warn('BUILD', `🔧 Applying fixes for attempt ${attempt}: ${fixes.join(', ')}`, null, undefined, projectId);
    }

    // Error recovery logging
    errorRecoveryStart(projectId: string, errorCount: number) {
        this.info('ERROR_RECOVERY', `🔍 Analyzing ${errorCount} errors for ${projectId}`);
    }

    errorRecoveryFix(projectId: string, fix: string) {
        this.info('ERROR_RECOVERY', `🔧 Applied fix: ${fix}`, null, undefined, projectId);
    }

    errorRecoveryComplete(projectId: string, fixesApplied: number, errorsRemaining: number) {
        this.info('ERROR_RECOVERY', `✅ Recovery complete: ${fixesApplied} fixes applied, ${errorsRemaining} errors remaining`, null, undefined, projectId);
    }

    // Port management logging
    portAllocated(projectId: string, port: number) {
        this.info('PORT_MANAGER', `🔌 Allocated port ${port} for ${projectId}`);
    }

    portReleased(projectId: string, port: number) {
        this.info('PORT_MANAGER', `🔌 Released port ${port} from ${projectId}`);
    }

    portConflict(port: number, action: string) {
        this.warn('PORT_MANAGER', `⚠️ Port ${port} conflict - ${action}`);
    }

    // Get logs for debugging
    getLogs(component?: string, level?: LogLevel): LogEntry[] {
        return this.logs.filter(log =>
            (!component || log.component === component) &&
            (!level || log.level >= level)
        );
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        this.info('LOGGER', '🧹 Logs cleared');
    }

    // Export logs for debugging
    exportLogs(): string {
        return this.logs.map(log => {
            const timestamp = log.timestamp.toISOString();
            const level = LogLevel[log.level];
            const tags = [log.component, log.agentId, log.workflowId].filter(Boolean).join('|');
            return `${timestamp} [${level}] [${tags}] ${log.message}`;
        }).join('\n');
    }
}

export const logger = new Logger();

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
    logger.setLogLevel(LogLevel.DEBUG);
} else {
    logger.setLogLevel(LogLevel.INFO);
} 