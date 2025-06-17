'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

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
        if (!result) return <Clock className="w-4 h-4 text-gray-400" />;
        if (result.success) return <CheckCircle className="w-4 h-4 text-green-500" />;
        return <XCircle className="w-4 h-4 text-red-500" />;
    };

    const getStatusBadge = (result?: TestResult) => {
        if (!result) return <Badge variant="secondary">Not Run</Badge>;
        if (result.success) return <Badge variant="default" className="bg-green-500">Success</Badge>;
        return <Badge variant="destructive">Failed</Badge>;
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
                <Card className="mb-6 bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Environment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Tabs defaultValue="configuration" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
                        <TabsTrigger value="configuration" className="text-white data-[state=active]:bg-white/20">
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="text-white data-[state=active]:bg-white/20">
                            Tests
                        </TabsTrigger>
                        <TabsTrigger value="results" className="text-white data-[state=active]:bg-white/20">
                            Results
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-white data-[state=active]:bg-white/20">
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    {/* Configuration Tab */}
                    <TabsContent value="configuration">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="text-white">Test Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">Project ID</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={projectId}
                                                onChange={(e) => setProjectId(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white"
                                                placeholder="Enter project ID"
                                            />
                                            <Button
                                                onClick={generateNewProjectId}
                                                variant="outline"
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/80 text-sm mb-2 block">App Title</label>
                                        <Input
                                            value={appTitle}
                                            onChange={(e) => setAppTitle(e.target.value)}
                                            className="bg-white/10 border-white/20 text-white"
                                            placeholder="Enter app title"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-white/80 text-sm mb-2 block">Sample Component Code</label>
                                    <Textarea
                                        value={sampleCode}
                                        onChange={(e) => setSampleCode(e.target.value)}
                                        className="bg-white/10 border-white/20 text-white font-mono text-sm min-h-[200px]"
                                        placeholder="Enter React component code"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tests Tab */}
                    <TabsContent value="tests">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                        {getStatusIcon(testResults.writeFiles)}
                                        Write Files Test
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm mb-4">
                                        Test writing files using ProductionFileManager to /tmp directory
                                    </p>
                                    <Button
                                        onClick={() => runTest('writeFiles', testWriteFiles)}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? 'Running...' : 'Test Write Files'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                        {getStatusIcon(testResults.productionPreview)}
                                        Production Preview Test
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm mb-4">
                                        Test generating static HTML previews from React components
                                    </p>
                                    <Button
                                        onClick={() => runTest('productionPreview', testProductionPreview)}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? 'Running...' : 'Test Preview Generation'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                        {getStatusIcon(testResults.htmlPreview)}
                                        HTML Preview Test
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm mb-4">
                                        Test HTML caching and serving functionality
                                    </p>
                                    <Button
                                        onClick={() => runTest('htmlPreview', testHtmlPreview)}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? 'Running...' : 'Test HTML Preview'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                        {getStatusIcon(testResults.environment)}
                                        Environment Test
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm mb-4">
                                        Reload and test environment detection
                                    </p>
                                    <Button
                                        onClick={loadEnvironmentInfo}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? 'Running...' : 'Reload Environment'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/10 backdrop-blur-md border-white/20">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg">
                                        Run All Tests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-white/80 text-sm mb-4">
                                        Execute all tests in sequence
                                    </p>
                                    <Button
                                        onClick={async () => {
                                            await runTest('writeFiles', testWriteFiles);
                                            await runTest('productionPreview', testProductionPreview);
                                            await runTest('htmlPreview', testHtmlPreview);
                                        }}
                                        disabled={loading}
                                        className="w-full"
                                        variant="secondary"
                                    >
                                        {loading ? 'Running All Tests...' : 'Run All Tests'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Results Tab */}
                    <TabsContent value="results">
                        <div className="space-y-4">
                            {Object.entries(testResults).map(([testName, result]) => (
                                <Card key={testName} className="bg-white/10 backdrop-blur-md border-white/20">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                {getStatusIcon(result)}
                                                {testName}
                                            </span>
                                            {getStatusBadge(result)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Preview Tab */}
                    <TabsContent value="preview">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    Generated Preview
                                    {testResults.htmlPreview?.success && (
                                        <Button
                                            onClick={() => window.open(`/api/preview/html/${projectId}`, '_blank')}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open Preview
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 