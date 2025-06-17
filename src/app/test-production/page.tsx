'use client';

import React, { useState, useEffect } from 'react';

interface EnvironmentInfo {
    isProduction: boolean;
    platform: string;
    workingDirectory: string;
    canWriteFiles: boolean;
    writableDirectory?: string;
    detectionReasons: string[];
}

interface TestResult {
    success: boolean;
    timestamp: string;
    duration?: number;
    data?: any;
    error?: string;
}

export default function TestProductionPage() {
    const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [projectId, setProjectId] = useState(`test-${Date.now()}`);
    const [appTitle, setAppTitle] = useState('Test Production App');
    const [activeTab, setActiveTab] = useState('configuration');
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

    // Sample React component for testing
    const [sampleCode, setSampleCode] = useState(`export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">${appTitle}</h1>
        <p className="text-white/80 mb-6">
          This app was created using the production file system!
        </p>
        <button className="glass-button px-6 py-3 text-white font-medium rounded-lg hover:scale-105 transition-transform">
          It Works! 🎉
        </button>
        <div className="mt-4 text-white/60 text-sm">
          <p>Project ID: ${projectId}</p>
          <p>Environment: Production (/tmp)</p>
        </div>
      </div>
    </div>
  );
}`);

    // Load environment info on component mount
    useEffect(() => {
        loadEnvironmentInfo();
    }, []);

    const loadEnvironmentInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/test-environment');
            const data = await response.json();
            setEnvInfo(data.environment);
            setTestResults(prev => ({
                ...prev,
                environment: {
                    success: true,
                    timestamp: new Date().toISOString(),
                    data
                }
            }));
        } catch (error) {
            console.error('Failed to load environment info:', error);
            setTestResults(prev => ({
                ...prev,
                environment: {
                    success: false,
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    const runTest = async (testName: string, testFn: () => Promise<any>) => {
        try {
            setLoading(true);
            const startTime = Date.now();
            const result = await testFn();
            const duration = Date.now() - startTime;

            setTestResults(prev => ({
                ...prev,
                [testName]: {
                    success: true,
                    timestamp: new Date().toISOString(),
                    duration,
                    data: result
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [testName]: {
                    success: false,
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    const testWriteFiles = async () => {
        const files = [
            {
                path: 'src/app/page.tsx',
                content: sampleCode,
                type: 'page'
            }
        ];

        const response = await fetch('/api/write-files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                title: appTitle,
                files
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    };

    const testProductionPreview = async () => {
        const files = [
            {
                path: 'src/app/page.tsx',
                content: sampleCode,
                type: 'page'
            }
        ];

        const response = await fetch('/api/preview/production', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId,
                title: appTitle,
                files,
                options: { mode: 'auto' }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    };

    const testHtmlPreview = async () => {
        // First create a preview
        const previewResult = await testProductionPreview();

        if (!previewResult.success || !previewResult.previewHtml) {
            throw new Error('Failed to generate preview HTML');
        }

        // Cache the HTML
        const cacheResponse = await fetch(`/api/preview/html/${projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: previewResult.previewHtml,
                expirationMinutes: 30
            })
        });

        if (!cacheResponse.ok) {
            throw new Error(`Failed to cache HTML: ${cacheResponse.status}`);
        }

        const cacheResult = await cacheResponse.json();

        // Test retrieving the cached HTML
        const retrieveResponse = await fetch(`/api/preview/html/${projectId}`);

        if (!retrieveResponse.ok) {
            throw new Error(`Failed to retrieve cached HTML: ${retrieveResponse.status}`);
        }

        return {
            cached: cacheResult,
            preview: previewResult,
            previewUrl: `/api/preview/html/${projectId}`
        };
    };

    const generateNewProjectId = () => {
        setProjectId(`test-${Date.now()}`);
    };

    const getStatusIcon = (result?: TestResult) => {
        if (!result) return '⏳';
        if (result.success) return '✅';
        return '❌';
    };

    const getStatusBadge = (result?: TestResult) => {
        if (!result) return <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">Not Run</span>;
        if (result.success) return <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">Success</span>;
        return <span className="px-2 py-1 bg-red-500 text-white rounded text-xs">Failed</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Production File System Test Suite
                    </h1>
                    <p className="text-white/80 text-lg">
                        Test Vercel /tmp directory operations and preview generation
                    </p>
                </div>

                {/* Environment Info */}
                <div className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                    <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                        ⚠️ Environment Information
                    </h2>
                    {envInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <div className="text-white/60 text-sm">Platform</div>
                                <div className="text-white font-medium">{envInfo.platform}</div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm">Production</div>
                                <div className="text-white font-medium">
                                    {envInfo.isProduction ? '✅ Yes' : '❌ No'}
                                </div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm">Working Directory</div>
                                <div className="text-white font-medium font-mono text-sm">
                                    {envInfo.workingDirectory}
                                </div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm">Can Write Files</div>
                                <div className="text-white font-medium">
                                    {envInfo.canWriteFiles ? '✅ Yes' : '❌ No'}
                                </div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm">Writable Directory</div>
                                <div className="text-white font-medium font-mono text-sm">
                                    {envInfo.writableDirectory || 'None'}
                                </div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm">Detection Reasons</div>
                                <div className="text-white text-sm">
                                    {envInfo.detectionReasons.join(', ')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-white/60">Loading environment information...</div>
                    )}
                </div>

                {/* Tabs */}
                <div className="space-y-6">
                    <div className="flex border-b border-white/20">
                        {['configuration', 'tests', 'results', 'preview'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 font-medium capitalize ${activeTab === tab
                                    ? 'text-white border-b-2 border-blue-400'
                                    : 'text-white/60 hover:text-white/80'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Configuration Tab */}
                    {activeTab === 'configuration' && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                            <h2 className="text-white text-xl font-semibold mb-4">Test Configuration</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Project ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={projectId}
                                                onChange={(e) => setProjectId(e.target.value)}
                                                className="flex-1 bg-white/10 border border-white/20 text-white rounded px-3 py-2 placeholder-white/40"
                                                placeholder="Enter project ID"
                                            />
                                            <button
                                                onClick={generateNewProjectId}
                                                className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">App Title</label>
                                        <input
                                            value={appTitle}
                                            onChange={(e) => setAppTitle(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 placeholder-white/40"
                                            placeholder="Enter app title"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-white/80 text-sm mb-2 block">Sample Component Code</label>
                                    <textarea
                                        value={sampleCode}
                                        onChange={(e) => setSampleCode(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 text-white font-mono text-sm rounded px-3 py-2 placeholder-white/40 min-h-[200px]"
                                        placeholder="Enter React component code"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tests Tab */}
                    {activeTab === 'tests' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                                    {getStatusIcon(testResults.writeFiles)} Write Files Test
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Test writing files using ProductionFileManager to /tmp directory
                                </p>
                                <button
                                    onClick={() => runTest('writeFiles', testWriteFiles)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium"
                                >
                                    {loading ? 'Running...' : 'Test Write Files'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                                    {getStatusIcon(testResults.productionPreview)} Production Preview Test
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Test generating static HTML previews from React components
                                </p>
                                <button
                                    onClick={() => runTest('productionPreview', testProductionPreview)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium"
                                >
                                    {loading ? 'Running...' : 'Test Preview Generation'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                                    {getStatusIcon(testResults.htmlPreview)} HTML Preview Test
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Test HTML caching and serving functionality
                                </p>
                                <button
                                    onClick={() => runTest('htmlPreview', testHtmlPreview)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium"
                                >
                                    {loading ? 'Running...' : 'Test HTML Preview'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                                    {getStatusIcon(testResults.environment)} Environment Test
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Reload and test environment detection
                                </p>
                                <button
                                    onClick={loadEnvironmentInfo}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium"
                                >
                                    {loading ? 'Running...' : 'Reload Environment'}
                                </button>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                <h3 className="text-white text-lg font-semibold mb-2">
                                    Run All Tests
                                </h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Execute all tests in sequence
                                </p>
                                <button
                                    onClick={async () => {
                                        await runTest('writeFiles', testWriteFiles);
                                        await runTest('productionPreview', testProductionPreview);
                                        await runTest('htmlPreview', testHtmlPreview);
                                    }}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded font-medium"
                                >
                                    {loading ? 'Running All Tests...' : 'Run All Tests'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab === 'results' && (
                        <div className="space-y-4">
                            {Object.entries(testResults).map(([testName, result]) => (
                                <div key={testName} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                                            {getStatusIcon(result)} {testName}
                                        </h3>
                                        {getStatusBadge(result)}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-white/60 text-sm">
                                            Timestamp: {new Date(result.timestamp).toLocaleString()}
                                        </div>
                                        {result.duration && (
                                            <div className="text-white/60 text-sm">
                                                Duration: {result.duration}ms
                                            </div>
                                        )}
                                        {result.error && (
                                            <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
                                                Error: {result.error}
                                            </div>
                                        )}
                                        {result.data && (
                                            <details className="text-white/80 text-sm">
                                                <summary className="cursor-pointer text-white/60 mb-2">
                                                    View Response Data
                                                </summary>
                                                <pre className="bg-black/20 p-3 rounded overflow-auto text-xs">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white text-xl font-semibold">Generated Preview</h2>
                                {testResults.htmlPreview?.success && (
                                    <button
                                        onClick={() => window.open(`/api/preview/html/${projectId}`, '_blank')}
                                        className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded flex items-center gap-2"
                                    >
                                        🔗 Open Preview
                                    </button>
                                )}
                            </div>
                            {testResults.htmlPreview?.success ? (
                                <div className="space-y-4">
                                    <div className="text-white/80 text-sm">
                                        Preview URL: <code className="bg-black/20 px-2 py-1 rounded">/api/preview/html/{projectId}</code>
                                    </div>
                                    <iframe
                                        src={`/api/preview/html/${projectId}`}
                                        className="w-full h-96 rounded border border-white/20"
                                        title="Generated Preview"
                                    />
                                </div>
                            ) : (
                                <div className="text-white/60 text-center py-8">
                                    Run the HTML Preview test to see the generated preview here
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 