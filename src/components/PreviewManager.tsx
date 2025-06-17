'use client';

import { useState, useEffect } from 'react';

interface RunningApp {
    projectId: string;
    port: number;
    mode: 'template' | 'build';
    url: string;
    title?: string;
}

interface PreviewManagerProps {
    className?: string;
}

export function PreviewManager({ className }: PreviewManagerProps) {
    const [runningApps, setRunningApps] = useState<RunningApp[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRunningApps = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/preview/build');
            const data = await response.json();

            if (data.success) {
                // Transform the data to include more details
                const apps = data.runningApps.map((id: string) => ({
                    projectId: id,
                    port: 0, // Will be updated with actual port info
                    mode: 'build' as const,
                    url: `/api/preview/${id}`,
                    title: `Generated App ${id.slice(-6)}`
                }));
                setRunningApps(apps);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch running apps');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const stopApp = async (projectId: string) => {
        try {
            const response = await fetch(`/api/preview/build?projectId=${projectId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                setRunningApps(apps => apps.filter(app => app.projectId !== projectId));
            } else {
                setError(data.error || 'Failed to stop app');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop app');
        }
    };

    useEffect(() => {
        fetchRunningApps();
        // Refresh every 30 seconds
        const interval = setInterval(fetchRunningApps, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`p-6 border rounded-lg bg-white shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🖥️</span>
                    <h3 className="text-lg font-semibold">Preview Manager</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {runningApps.length} running
                    </span>
                </div>
                <button
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    onClick={fetchRunningApps}
                    disabled={loading}
                >
                    {loading ? '🔄' : '↻'} Refresh
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-red-600 bg-red-50 rounded-lg">
                    <span>⚠️</span>
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <div className="space-y-3">
                {runningApps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🖥️</div>
                        <p>No running preview apps</p>
                        <p className="text-sm">Generate an app to see previews here</p>
                    </div>
                ) : (
                    runningApps.map((app) => (
                        <div
                            key={app.projectId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-green-500">✅</span>
                                    <span className="text-sm font-medium">
                                        {app.title}
                                    </span>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${app.mode === 'build'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {app.mode === 'build' ? '⚡ Live Build' : '📄 Template'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {app.projectId.slice(-8)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                                    onClick={() => window.open(app.url, '_blank')}
                                    title="Open Preview"
                                >
                                    🔗
                                </button>
                                <button
                                    className="px-2 py-1 border rounded text-sm hover:bg-gray-50 text-red-600"
                                    onClick={() => stopApp(app.projectId)}
                                    title="Stop App"
                                >
                                    ⏹️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>📄 Template Mode:</strong> Fast static preview using HTML templates</p>
                    <p><strong>⚡ Live Build Mode:</strong> Full Next.js app with React functionality</p>
                    <p>💡 The system automatically chooses the best mode based on app complexity.</p>
                </div>
            </div>
        </div>
    );
} 