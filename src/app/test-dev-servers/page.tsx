'use client';

import { useState, useEffect, useRef } from 'react';

interface DevServerInfo {
    projectId: string;
    port: number;
    status: string;
    url: string;
    startTime: number;
    uptime: number;
    projectPath?: string;
    buildProgress?: string;
    logs?: string[];
}

interface TestResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    timestamp: number;
}

interface LogData {
    logs: string[];
    status: string;
    buildProgress?: string;
    uptime: number;
    projectId: string;
    port: number;
    url: string;
}

export default function TestDevServersPage() {
    const [environment, setEnvironment] = useState<any>(null);
    const [devServers, setDevServers] = useState<DevServerInfo[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [customProjectId, setCustomProjectId] = useState('');
    const [customProjectTitle, setCustomProjectTitle] = useState('');
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [quickMode, setQuickMode] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const [logStatus, setLogStatus] = useState<string>('');
    const [buildProgress, setBuildProgress] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadEnvironmentInfo();
        loadDevServers();

        const interval = setInterval(loadDevServers, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedServer) {
            loadServerLogs(selectedServer);
            const interval = setInterval(() => loadServerLogs(selectedServer), 2000);
            return () => clearInterval(interval);
        }
    }, [selectedServer]);

    useEffect(() => {
        // Auto-scroll logs to bottom
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const addTestResult = (result: TestResult) => {
        setTestResults(prev => [result, ...prev.slice(0, 9)]);
    };

    const loadEnvironmentInfo = async () => {
        try {
            const response = await fetch('/api/dev-server/start');
            const data = await response.json();
            setEnvironment(data);
        } catch (error) {
            console.error('Failed to load environment info:', error);
        }
    };

    const loadDevServers = async () => {
        try {
            const response = await fetch('/api/dev-server/manage');
            const data = await response.json();

            if (data.success) {
                setDevServers(data.servers || []);
            }
        } catch (error) {
            console.error('Failed to load dev servers:', error);
        }
    };

    const loadServerLogs = async (projectId: string) => {
        try {
            const response = await fetch('/api/dev-server/logs?projectId=' + projectId);
            const data = await response.json();

            if (data.success) {
                setLogs(data.logs || []);
                setLogStatus(data.status || '');
                setBuildProgress(data.buildProgress || '');

                // Update preview URL if server is running
                if (data.status === 'running' && data.url) {
                    setPreviewUrl(data.url);
                }
            }
        } catch (error) {
            console.error('Failed to load server logs:', error);
        }
    };

    const startDevServer = async () => {
        if (!selectedFile) {
            addTestResult({
                success: false,
                message: 'Please select a ZIP file to upload',
                timestamp: Date.now()
            });
            return;
        }

        setIsLoading(true);

        try {
            const projectId = customProjectId || 'test-' + Date.now().toString().slice(-5);
            const projectTitle = customProjectTitle || 'Development Server Test';

            const formData = new FormData();
            formData.append('zipFile', selectedFile);
            formData.append('projectId', projectId);
            formData.append('projectTitle', projectTitle);
            formData.append('quickMode', quickMode.toString());

            const response = await fetch('/api/dev-server/upload-and-start', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                addTestResult({
                    success: true,
                    message: 'Dev server started successfully! Port: ' + result.port + ', URL: ' + result.url,
                    data: result,
                    timestamp: Date.now()
                });

                // Auto-select the new server for log monitoring
                setSelectedServer(projectId);
                setLogs([]);
                setShowPreview(false);
                setSelectedFile(null);

                setTimeout(loadDevServers, 1000);
                setCustomProjectId('');
                setCustomProjectTitle('');
            } else {
                addTestResult({
                    success: false,
                    message: 'Failed to start dev server: ' + result.error,
                    error: result.error,
                    data: result,
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            addTestResult({
                success: false,
                message: 'Network error: ' + (error instanceof Error ? error.message : String(error)),
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const stopDevServer = async (projectId: string) => {
        try {
            const response = await fetch('/api/dev-server/manage?projectId=' + projectId, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                addTestResult({
                    success: true,
                    message: 'Server ' + projectId + ' stopped successfully',
                    data: result,
                    timestamp: Date.now()
                });

                if (selectedServer === projectId) {
                    setSelectedServer(null);
                    setLogs([]);
                    setShowPreview(false);
                }

                loadDevServers();
            } else {
                addTestResult({
                    success: false,
                    message: 'Failed to stop server: ' + result.error,
                    error: result.error,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            addTestResult({
                success: false,
                message: 'Network error: ' + (error instanceof Error ? error.message : String(error)),
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now()
            });
        }
    };

    const cleanupAllServers = async () => {
        try {
            const response = await fetch('/api/dev-server/manage?action=cleanup', {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                addTestResult({
                    success: true,
                    message: 'All servers cleaned up successfully',
                    data: result,
                    timestamp: Date.now()
                });
                setSelectedServer(null);
                setLogs([]);
                setShowPreview(false);
                loadDevServers();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    };

    const formatUptime = (uptime: number) => {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm';
        if (minutes > 0) return minutes + 'm ' + (seconds % 60) + 's';
        return seconds + 's';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-50';
            case 'starting': return 'text-yellow-600 bg-yellow-50';
            case 'installing': return 'text-blue-600 bg-blue-50';
            case 'building': return 'text-purple-600 bg-purple-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'stopped': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getLogTypeColor = (log: string) => {
        if (log.includes('[ERROR]') || log.includes('ERROR:')) return 'text-red-600';
        if (log.includes('[INSTALL ERROR]')) return 'text-red-500';
        if (log.includes('[DEV ERROR]')) return 'text-orange-600';
        if (log.includes('[INSTALL]')) return 'text-blue-600';
        if (log.includes('[DEV]')) return 'text-green-600';
        if (log.includes('Ready') || log.includes('compiled')) return 'text-green-700 font-semibold';
        if (log.includes('Compiling')) return 'text-yellow-600';
        return 'text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🚀 Production Dev Server Testing
                    </h1>
                    <p className="text-gray-600">
                        Test live Next.js development servers with real-time log monitoring
                    </p>
                </div>

                {/* Two-column layout for larger screens */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Left Column - Controls and Servers */}
                    <div className="space-y-6">

                        {/* Environment Info */}
                        {environment && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    🌍 Environment
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-sm font-medium text-blue-600">Platform</div>
                                        <div className="text-lg font-bold text-blue-800">
                                            {environment.environment?.platform || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="text-sm font-medium text-green-600">Can Run Dev</div>
                                        <div className="text-lg font-bold text-green-800">
                                            {environment.environment?.canRunDevServers ? '✅ Yes' : '❌ No'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Server Creation */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                🛠️ Create Dev Server
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📦 Upload Project ZIP
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept=".zip"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setSelectedFile(e.target.files[0]);
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                                        />
                                        {selectedFile && (
                                            <div className="text-sm text-green-600">
                                                Selected: {selectedFile.name}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            Upload a ZIP file containing your Next.js project. The contents will be extracted directly into the server directory.
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={customProjectId}
                                        onChange={(e) => setCustomProjectId(e.target.value)}
                                        placeholder="Project ID (optional)"
                                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                                    />
                                    <input
                                        type="text"
                                        value={customProjectTitle}
                                        onChange={(e) => setCustomProjectTitle(e.target.value)}
                                        placeholder="Project Title (optional)"
                                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                                    />
                                </div>

                                {/* Quick Mode Toggle */}
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-800">
                                            ⚡ Quick Preview Mode
                                        </label>
                                        <p className="text-xs text-blue-600 mt-1">
                                            {quickMode
                                                ? 'Fast HTML preview (< 10s) - Recommended for production testing'
                                                : 'Full Next.js build (60s+ timeout risk) - Use for local testing'
                                            }
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={quickMode}
                                            onChange={(e) => setQuickMode(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <button
                                    onClick={startDevServer}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                >
                                    {isLoading ? '🔄 Creating...' : '🚀 Start Dev Server'}
                                </button>
                            </div>
                        </div>

                        {/* Running Servers */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    🖥️ Servers ({devServers.length})
                                </h2>
                                {devServers.length > 0 && (
                                    <button
                                        onClick={cleanupAllServers}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                                    >
                                        🧹 Cleanup
                                    </button>
                                )}
                            </div>

                            {devServers.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    No servers running
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {devServers.map((server) => (
                                        <div key={server.projectId} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-800">{server.projectId}</h3>
                                                    <div className="text-sm text-gray-600">
                                                        Port {server.port} • {formatUptime(server.uptime)}
                                                    </div>
                                                </div>
                                                <div className={'px-2 py-1 rounded-full text-xs font-medium ' + getStatusColor(server.status)}>
                                                    {server.status.toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedServer(server.projectId)}
                                                    className={'px-3 py-1 rounded text-sm font-medium transition-colors ' +
                                                        (selectedServer === server.projectId
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
                                                >
                                                    📊 Logs
                                                </button>

                                                {server.status === 'running' && (
                                                    <button
                                                        onClick={() => {
                                                            setPreviewUrl(`/api/dev-server/preview/${server.projectId}`);
                                                            setShowPreview(true);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                                    >
                                                        🌐 Preview
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => stopDevServer(server.projectId)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                                >
                                                    🛑 Stop
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Logs and Preview */}
                    <div className="space-y-6">

                        {/* Live Logs */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    📋 Live Logs
                                </h2>
                                {selectedServer && (
                                    <div className="flex items-center gap-3">
                                        {buildProgress && (
                                            <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {buildProgress}
                                            </div>
                                        )}
                                        {logStatus && (
                                            <div className={'px-2 py-1 rounded text-xs font-medium ' + getStatusColor(logStatus)}>
                                                {logStatus.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!selectedServer ? (
                                <div className="text-center py-8 text-gray-500">
                                    Select a server to view logs
                                </div>
                            ) : (
                                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                                    {logs.length === 0 ? (
                                        <div className="text-gray-500">Loading logs...</div>
                                    ) : (
                                        <>
                                            {logs.map((log, index) => (
                                                <div key={index} className={getLogTypeColor(log) + ' mb-1'}>
                                                    {log}
                                                </div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Live Preview */}
                        {showPreview && previewUrl && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        🌐 Live Preview
                                    </h2>
                                    <div className="flex gap-2">
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                        >
                                            🔗 Open in New Tab
                                        </a>
                                        <button
                                            onClick={() => setShowPreview(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-96"
                                        title="Live Preview"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Test Results */}
                        {testResults.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">
                                    📊 Recent Results
                                </h2>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={'p-3 rounded-lg border-l-4 ' + (result.success
                                                ? 'bg-green-50 border-green-500'
                                                : 'bg-red-50 border-red-500')}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-gray-800 text-sm">
                                                    {result.message}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(result.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 