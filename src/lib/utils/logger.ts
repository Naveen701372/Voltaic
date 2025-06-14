type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: any;
    component?: string;
}

class Logger {
    private isClient = typeof window !== 'undefined';

    private async sendToServer(entry: LogEntry) {
        if (!this.isClient) return;

        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
        } catch (error) {
            // Silent fail - don't break the app if logging fails
        }
    }

    private formatMessage(level: LogLevel, component: string, message: string): string {
        const emoji = {
            info: '📝',
            warn: '⚠️',
            error: '❌',
            debug: '🔍'
        }[level];

        return `${emoji} [${component}] ${message}`;
    }

    async log(level: LogLevel, component: string, message: string, data?: any) {
        const formattedMessage = this.formatMessage(level, component, message);

        // Log to browser console
        switch (level) {
            case 'error':
                console.error(formattedMessage, data || '');
                break;
            case 'warn':
                console.warn(formattedMessage, data || '');
                break;
            case 'debug':
                console.debug(formattedMessage, data || '');
                break;
            default:
                console.log(formattedMessage, data || '');
        }

        // Send to server for terminal logging
        await this.sendToServer({
            level,
            message: `[${component}] ${message}`,
            data,
            component
        });
    }

    async info(component: string, message: string, data?: any) {
        await this.log('info', component, message, data);
    }

    async warn(component: string, message: string, data?: any) {
        await this.log('warn', component, message, data);
    }

    async error(component: string, message: string, data?: any) {
        await this.log('error', component, message, data);
    }

    async debug(component: string, message: string, data?: any) {
        await this.log('debug', component, message, data);
    }
}

export const logger = new Logger(); 