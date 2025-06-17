// Test script for Preview System
const fetch = require('node-fetch');

async function testPreviewSystem() {
    console.log('🧪 Testing Preview System...\n');

    const baseUrl = 'http://localhost:3000';

    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
        const response = await fetch(baseUrl);
        console.log('✅ Server is running on port 3000\n');
    } catch (error) {
        console.log('❌ Server not running. Please start with: npm run dev\n');
        return;
    }

    // Test 2: Test preview management API endpoints
    console.log('2️⃣ Testing Preview Management API...');

    // Test status check for non-existent project
    try {
        const statusResponse = await fetch(`${baseUrl}/api/preview/manage?projectId=test123`);
        const statusData = await statusResponse.json();
        console.log('📊 Status check response:', statusData);

        if (statusData.success && statusData.status === null) {
            console.log('✅ Status API working - no app running\n');
        }
    } catch (error) {
        console.log('❌ Status API error:', error.message, '\n');
    }

    // Test 3: Test port allocation by creating a simple test project
    console.log('3️⃣ Testing port allocation...');

    const testFiles = [
        {
            path: 'src/app/page.tsx',
            content: `export default function Home() {
                return (
                    <div className="p-8">
                        <h1 className="text-2xl font-bold">Test App</h1>
                        <p>Port allocation test - ${Date.now()}</p>
                    </div>
                );
            }`,
            type: 'component',
            description: 'Main page component'
        },
        {
            path: 'package.json',
            content: JSON.stringify({
                name: 'test-preview-app',
                version: '0.1.0',
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start'
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                    next: '14.2.30'
                }
            }, null, 2),
            type: 'config',
            description: 'Package configuration'
        }
    ];

    try {
        const buildResponse = await fetch(`${baseUrl}/api/preview/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: 'test-preview-' + Date.now(),
                files: testFiles,
                title: 'Port Allocation Test',
                mode: 'build'
            })
        });

        const buildData = await buildResponse.json();
        console.log('🔧 Build response:', buildData);

        if (buildData.success) {
            console.log('✅ Build initiated successfully');
            console.log(`🌐 Preview URL: ${buildData.previewUrl}`);
            console.log(`🔌 Port: ${buildData.port || 'Not specified'}\n`);
        } else {
            console.log('⚠️ Build failed:', buildData.error, '\n');
        }
    } catch (error) {
        console.log('❌ Build API error:', error.message, '\n');
    }

    // Test 4: List running apps
    console.log('4️⃣ Checking running apps...');
    try {
        const runningResponse = await fetch(`${baseUrl}/api/preview/build`);
        const runningData = await runningResponse.json();
        console.log('📱 Running apps:', runningData);

        if (runningData.success) {
            console.log(`✅ Found ${runningData.count} running apps\n`);
        }
    } catch (error) {
        console.log('❌ Running apps API error:', error.message, '\n');
    }

    console.log('🎉 Preview system test completed!');
    console.log('\n📝 Next steps:');
    console.log('- Check the browser at http://localhost:3000');
    console.log('- Generate an app through the UI');
    console.log('- Watch the console for port allocation logs');
}

// Run the test
if (require.main === module) {
    testPreviewSystem().catch(console.error);
}

module.exports = { testPreviewSystem }; 