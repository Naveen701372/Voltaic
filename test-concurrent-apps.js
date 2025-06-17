// Test concurrent apps and port conflict resolution
const fetch = require('node-fetch');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestApp(appName, port = null) {
    const testFiles = [
        {
            path: 'src/app/page.tsx',
            content: `export default function Home() {
                return (
                    <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen">
                        <h1 className="text-4xl font-bold text-white mb-4">${appName}</h1>
                        <p className="text-white/80">Created at: ${new Date().toISOString()}</p>
                        <p className="text-white/80">Test ID: ${Date.now()}</p>
                        ${port ? `<p className="text-white/80">Expected Port: ${port}</p>` : ''}
                    </div>
                );
            }`,
            type: 'component',
            description: 'Main page component'
        }
    ];

    const response = await fetch('http://localhost:3000/api/preview/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            projectId: `test-${appName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            files: testFiles,
            title: appName,
            mode: 'build'
        })
    });

    return await response.json();
}

async function testConcurrentApps() {
    console.log('🚀 Testing Concurrent Apps & Port Conflict Resolution...\n');

    const apps = [];
    const appNames = [
        'E-commerce Store',
        'Blog Platform',
        'Task Manager',
        'Chat Application',
        'Portfolio Website'
    ];

    // Create multiple apps concurrently
    console.log('📱 Creating multiple apps simultaneously...');
    const promises = appNames.map(name => createTestApp(name));

    try {
        const results = await Promise.all(promises);

        console.log('\n📊 Results:');
        results.forEach((result, index) => {
            const appName = appNames[index];
            if (result.success) {
                console.log(`✅ ${appName}: Port ${result.port} - ${result.previewUrl}`);
                apps.push({ name: appName, port: result.port, url: result.previewUrl });
            } else {
                console.log(`❌ ${appName}: Failed - ${result.error}`);
            }
        });

        console.log(`\n🎯 Successfully created ${apps.length}/${appNames.length} apps`);

        // Test that each app is actually running
        console.log('\n🔍 Testing app accessibility...');
        for (const app of apps) {
            try {
                const response = await fetch(app.url, { timeout: 5000 });
                if (response.ok) {
                    console.log(`✅ ${app.name} (Port ${app.port}): Accessible`);
                } else {
                    console.log(`⚠️ ${app.name} (Port ${app.port}): HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${app.name} (Port ${app.port}): Not accessible - ${error.message}`);
            }
        }

        // Check running apps via API
        console.log('\n📋 Checking running apps via API...');
        const statusResponse = await fetch('http://localhost:3000/api/preview/build');
        const statusData = await statusResponse.json();

        if (statusData.success) {
            console.log(`📊 API reports ${statusData.count} running apps:`);
            statusData.runningApps.forEach(id => console.log(`   - ${id}`));
        }

        // Test port uniqueness
        const ports = apps.map(app => app.port);
        const uniquePorts = [...new Set(ports)];

        console.log(`\n🔌 Port allocation check:`);
        console.log(`   Total apps: ${apps.length}`);
        console.log(`   Unique ports: ${uniquePorts.length}`);
        console.log(`   Ports used: [${ports.join(', ')}]`);

        if (ports.length === uniquePorts.length) {
            console.log('✅ All apps got unique ports - No conflicts!');
        } else {
            console.log('❌ Port conflicts detected!');
        }

        // Test status checking for individual apps
        console.log('\n🔍 Testing individual app status...');
        for (const app of apps.slice(0, 2)) { // Test first 2 apps
            try {
                const appId = statusData.runningApps.find(id => id.includes(app.name.toLowerCase().replace(/\s+/g, '-')));
                if (appId) {
                    const statusResponse = await fetch(`http://localhost:3000/api/preview/manage?projectId=${appId}`);
                    const status = await statusResponse.json();

                    if (status.success && status.status) {
                        console.log(`✅ ${app.name}: Status=${status.status.status}, Uptime=${Math.round(status.status.uptime / 1000)}s`);
                    }
                }
            } catch (error) {
                console.log(`❌ ${app.name}: Status check failed`);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n🎉 Concurrent app test completed!');
    console.log('\n💡 Tips:');
    console.log('- Each app should get a unique port (3100, 3101, 3102, etc.)');
    console.log('- All apps should be accessible at their URLs');
    console.log('- Check the main server logs for port allocation messages');
    console.log('- Apps will auto-cleanup after 5 minutes of inactivity');
}

// Run the test
if (require.main === module) {
    testConcurrentApps().catch(console.error);
}

module.exports = { testConcurrentApps }; 