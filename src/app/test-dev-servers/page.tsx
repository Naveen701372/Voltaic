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

const EXAMPLE_REACT_COMPONENTS = {
    todoApp: `function App() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false }
  ]);
  const [newTodo, setNewTodo] = React.useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Todo App</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center p-2 rounded bg-gray-50">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-3"
            />
            <span className="flex-1">{todo.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        Total: {todos.length} | Completed: {todos.filter(t => t.completed).length}
      </div>
    </div>
  );
}`,

    calculator: `function App() {
  const [display, setDisplay] = React.useState('0');
  const [operation, setOperation] = React.useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = React.useState(false);

  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const calculate = (prevOperation, inputValue, currentValue) => {
    switch (prevOperation) {
      case '+': return inputValue + currentValue;
      case '-': return inputValue - currentValue;
      case '×': return inputValue * currentValue;
      case '÷': return inputValue / currentValue;
      default: return currentValue;
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-4 p-4 bg-gray-100 rounded-lg text-right">
        <div className="text-3xl font-mono">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <button onClick={clearAll} className="col-span-2 bg-red-500 text-white hover:bg-red-600 h-16 rounded-lg">
          Clear
        </button>
        <button onClick={() => inputNumber(7)} className="bg-gray-200 hover:bg-gray-300 h-16 rounded-lg">7</button>
        <button onClick={() => inputNumber(8)} className="bg-gray-200 hover:bg-gray-300 h-16 rounded-lg">8</button>
      </div>
    </div>
  );
}`,

    dashboard: `function App() {
  const [stats, setStats] = React.useState({
    users: 1250,
    revenue: 45780,
    orders: 892,
    growth: 23.5
  });
  
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.users.toLocaleString()}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</div>
          <div className="text-gray-600">Revenue</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.orders}</div>
          <div className="text-gray-600">Orders</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600">+{stats.growth}%</div>
          <div className="text-gray-600">Growth</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'analytics', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`py-4 px-1 border-b-2 font-medium text-sm capitalize \${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }\`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <p className="text-gray-600 mb-4">Welcome to your dashboard! Here's a quick overview of your key metrics.</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium text-blue-800">💡 Pro Tip</div>
                <div className="text-blue-700">Your user growth is up {stats.growth}% this month!</div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">User Engagement</h4>
                  <div className="text-3xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Average session time: 4m 32s</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Conversion Rate</h4>
                  <div className="text-3xl font-bold text-blue-600">12.4%</div>
                  <div className="text-sm text-gray-600">Up 2.1% from last month</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Reports</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Monthly Revenue Report</div>
                    <div className="text-sm text-gray-600">Generated today</div>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Download
                  </button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">User Activity Report</div>
                    <div className="text-sm text-gray-600">Generated yesterday</div>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`
};

export default function TestDevServersPage() {
    const [environment, setEnvironment] = useState<any>(null);
    const [devServers, setDevServers] = useState<DevServerInfo[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<string>('todoApp');
    const [customProjectId, setCustomProjectId] = useState('');
    const [customProjectTitle, setCustomProjectTitle] = useState('');
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [quickMode, setQuickMode] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const [logStatus, setLogStatus] = useState<string>('');
    const [buildProgress, setBuildProgress] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');

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
        setIsLoading(true);

        try {
            const projectId = customProjectId || 'test-' + Date.now().toString().slice(-5);
            const projectTitle = customProjectTitle || 'Development Server Test';
            const reactComponent = EXAMPLE_REACT_COMPONENTS[selectedComponent as keyof typeof EXAMPLE_REACT_COMPONENTS];

            const response = await fetch('/api/dev-server/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    reactComponent,
                    projectTitle,
                    quickMode
                })
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
                                        React Component
                                    </label>
                                    <select
                                        value={selectedComponent}
                                        onChange={(e) => setSelectedComponent(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
                                    >
                                        <option value="todoApp">📝 Todo App (Interactive)</option>
                                        <option value="calculator">🧮 Calculator (Math)</option>
                                        <option value="dashboard">📊 Dashboard (Complex UI)</option>
                                    </select>
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