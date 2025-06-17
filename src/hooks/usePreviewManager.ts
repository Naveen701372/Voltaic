import { useState, useEffect, useCallback, useRef } from 'react';
import { GeneratedFile } from '@/components/ai/types';

export interface PreviewAppStatus {
    projectId: string;
    pid: number;
    port: number;
    startTime: number;
    lastAccess: number;
    status: 'starting' | 'running' | 'failed' | 'stopped';
    uptime?: number;
    lastActivity?: number;
    url?: string;
}

export interface PreviewManagerState {
    status: PreviewAppStatus | null;
    isLoading: boolean;
    error: string | null;
    needsRelaunch: boolean;
}

export function usePreviewManager(projectId?: string) {
    const [state, setState] = useState<PreviewManagerState>({
        status: null,
        isLoading: false,
        error: null,
        needsRelaunch: false
    });

    const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
    const activityPingInterval = useRef<NodeJS.Timeout | null>(null);

    // Check app status
    const checkStatus = useCallback(async () => {
        if (!projectId) return null;

        try {
            const response = await fetch(`/api/preview/manage?projectId=${projectId}`);
            const data = await response.json();

            if (data.success && data.status) {
                setState(prev => ({
                    ...prev,
                    status: data.status,
                    needsRelaunch: false,
                    error: null
                }));
                return data.status;
            } else {
                setState(prev => ({
                    ...prev,
                    status: null,
                    needsRelaunch: prev.status !== null, // Need relaunch if previously had status
                    error: null
                }));
                return null;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Status check failed'
            }));
            return null;
        }
    }, [projectId]);

    // Start or restart preview app
    const startPreview = useCallback(async (projectPath: string, isRestart = false) => {
        if (!projectId) return false;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/preview/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    projectPath,
                    action: isRestart ? 'restart' : 'start'
                })
            });

            const data = await response.json();

            if (data.success) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsRelaunch: false,
                    error: null
                }));

                // Check status after starting
                setTimeout(checkStatus, 1000);
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: data.error || 'Failed to start preview'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to start preview'
            }));
            return false;
        }
    }, [projectId, checkStatus]);

    // Stop preview app
    const stopPreview = useCallback(async () => {
        if (!projectId) return false;

        try {
            const response = await fetch(`/api/preview/manage?projectId=${projectId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setState(prev => ({
                    ...prev,
                    status: null,
                    needsRelaunch: false,
                    error: null
                }));
                return true;
            } else {
                setState(prev => ({
                    ...prev,
                    error: data.error || 'Failed to stop preview'
                }));
                return false;
            }
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to stop preview'
            }));
            return false;
        }
    }, [projectId]);

    // Build and start preview
    const buildAndStart = useCallback(async (
        files: GeneratedFile[],
        title: string,
        mode: 'template' | 'build' = 'build'
    ) => {
        if (!projectId) return false;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/preview/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    files,
                    title,
                    mode
                })
            });

            const data = await response.json();

            if (data.success) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsRelaunch: false,
                    error: null
                }));

                // Check status after building
                setTimeout(checkStatus, 2000);
                return { success: true, url: data.previewUrl, port: data.port };
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: data.error || 'Build failed'
                }));
                return { success: false, error: data.error };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Build failed';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));
            return { success: false, error: errorMessage };
        }
    }, [projectId, checkStatus]);

    // Keep app alive by pinging access endpoint
    const keepAlive = useCallback(async () => {
        if (!projectId || !state.status) return;

        try {
            await fetch('/api/preview/manage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });
        } catch (error) {
            console.warn('Failed to keep preview alive:', error);
        }
    }, [projectId, state.status]);

    // Setup monitoring intervals
    useEffect(() => {
        if (!projectId) return;

        // Check status every 30 seconds
        statusCheckInterval.current = setInterval(checkStatus, 30000);

        // Keep alive every 2 minutes (app timeout is 3 minutes)
        activityPingInterval.current = setInterval(keepAlive, 120000);

        // Initial status check
        checkStatus();

        return () => {
            if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current);
            }
            if (activityPingInterval.current) {
                clearInterval(activityPingInterval.current);
            }
        };
    }, [projectId, checkStatus, keepAlive]);

    // Clear intervals when component unmounts
    useEffect(() => {
        return () => {
            if (statusCheckInterval.current) {
                clearInterval(statusCheckInterval.current);
            }
            if (activityPingInterval.current) {
                clearInterval(activityPingInterval.current);
            }
        };
    }, []);

    return {
        ...state,
        checkStatus,
        startPreview,
        stopPreview,
        buildAndStart,
        keepAlive,
        isRunning: state.status?.status === 'running',
        isStarting: state.status?.status === 'starting' || state.isLoading,
        previewUrl: state.status?.url
    };
} 