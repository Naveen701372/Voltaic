import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
    timestamp?: string;
}

export async function POST(request: NextRequest) {
    try {
        const logEntry: LogEntry = await request.json();

        // Add timestamp if not provided
        if (!logEntry.timestamp) {
            logEntry.timestamp = new Date().toISOString();
        }

        // Format log message with emoji based on level
        const emoji = {
            info: '📝',
            warn: '⚠️',
            error: '❌',
            debug: '🔍'
        }[logEntry.level] || '📝';

        const formattedMessage = `${emoji} [SERVER] ${logEntry.message}`;

        // Log to server console based on level
        switch (logEntry.level) {
            case 'error':
                console.error(formattedMessage, logEntry.data || '');
                break;
            case 'warn':
                console.warn(formattedMessage, logEntry.data || '');
                break;
            case 'debug':
                console.debug(formattedMessage, logEntry.data || '');
                break;
            default:
                console.log(formattedMessage, logEntry.data || '');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ [SERVER] Failed to process log entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process log entry' },
            { status: 500 }
        );
    }
} 