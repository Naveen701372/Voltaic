const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { ProductionDevServer } = require('../src/lib/production-dev-server');

const app = express();
const port = 3001;

// Create an instance of ProductionDevServer
const devServer = new ProductionDevServer();

app.use(express.json());

// Serve static files from test directories
app.use('/test-files', express.static(path.join(__dirname, '../test-files')));

// Endpoint to start dev server
app.post('/api/dev-server/start', async (req, res) => {
    try {
        const projectId = 'test-local-' + Date.now();
        const serverInfo = await devServer.startServer(projectId);
        res.json({ success: true, serverInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to upload and start
app.post('/api/dev-server/upload-and-start', async (req, res) => {
    try {
        const { projectPath, projectTitle } = req.body;
        const projectId = 'test-local-' + Date.now();
        const serverInfo = await devServer.startServerFromPath(projectId, projectPath, projectTitle);
        res.json({ success: true, serverInfo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to get preview
app.get('/api/dev-server/preview/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const serverInfo = devServer.getServer(projectId);
        if (!serverInfo || !serverInfo.previewContent) {
            return res.status(404).json({ error: 'Preview not found' });
        }
        res.send(serverInfo.previewContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get logs
app.get('/api/dev-server/logs/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const serverInfo = devServer.getServer(projectId);
        if (!serverInfo) {
            return res.status(404).json({ error: 'Server not found' });
        }
        res.json({ logs: serverInfo.logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the test UI
app.get('/', async (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dev Preview Tester</title>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
                .preview-frame {
                    width: 100%;
                    height: 600px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                }
                .log-container {
                    height: 200px;
                    overflow-y: auto;
                    background: #1a1a1a;
                    color: #fff;
                    padding: 1rem;
                    font-family: monospace;
                    font-size: 12px;
                }
            </style>
        </head>
        <body class="bg-gray-50 p-8">
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold mb-8">Dev Preview Tester</h1>
                
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-xl font-semibold mb-4">Test Directory</h2>
                        <input type="text" id="projectPath" 
                            class="w-full p-2 border rounded mb-4" 
                            placeholder="/path/to/test/directory"
                            value="${path.join(__dirname, '../test2')}">
                        
                        <input type="text" id="projectTitle" 
                            class="w-full p-2 border rounded mb-4" 
                            placeholder="Project Title"
                            value="Local Dev Test">
                        
                        <button onclick="startPreview()" 
                            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Start Preview
                        </button>
                    </div>
                    
                    <div>
                        <h2 class="text-xl font-semibold mb-4">Logs</h2>
                        <div id="logs" class="log-container"></div>
                    </div>
                </div>

                <div class="mt-8">
                    <h2 class="text-xl font-semibold mb-4">Preview</h2>
                    <iframe id="preview" class="preview-frame"></iframe>
                </div>
            </div>

            <script>
                let currentProjectId = null;
                let logsInterval = null;

                async function startPreview() {
                    const projectPath = document.getElementById('projectPath').value;
                    const projectTitle = document.getElementById('projectTitle').value;

                    try {
                        const response = await fetch('/api/dev-server/upload-and-start', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectPath, projectTitle })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            currentProjectId = data.serverInfo.projectId;
                            document.getElementById('preview').src = '/api/dev-server/preview/' + currentProjectId;
                            startLogging();
                        } else {
                            console.error('Failed to start preview:', data.error);
                        }
                    } catch (error) {
                        console.error('Error starting preview:', error);
                    }
                }

                async function updateLogs() {
                    if (!currentProjectId) return;
                    
                    try {
                        const response = await fetch('/api/dev-server/logs/' + currentProjectId);
                        const data = await response.json();
                        
                        const logsElement = document.getElementById('logs');
                        logsElement.innerHTML = data.logs.join('<br>');
                        logsElement.scrollTop = logsElement.scrollHeight;
                    } catch (error) {
                        console.error('Error fetching logs:', error);
                    }
                }

                function startLogging() {
                    if (logsInterval) clearInterval(logsInterval);
                    logsInterval = setInterval(updateLogs, 1000);
                    updateLogs();
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Dev preview server running at http://localhost:${port}`);
}); 