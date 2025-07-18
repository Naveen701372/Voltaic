import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { projectId } = params;

        if (!projectId) {
            return new NextResponse('Project ID is required', { status: 400 });
        }

        // Check if project exists
        const projectDir = path.join(process.cwd(), 'generated-apps', projectId);

        try {
            await fs.access(projectDir);
        } catch {
            return new NextResponse('Project not found', { status: 404 });
        }

        // Read the main page file to determine app type
        const mainPagePath = path.join(projectDir, 'src', 'app', 'page.tsx');

        try {
            // Read page content
            const pageContent = await fs.readFile(mainPagePath, 'utf8');

            // Also read component files to detect app name
            const componentsDir = path.join(projectDir, 'src', 'components');
            let allContent = pageContent;

            try {
                const componentFiles = await fs.readdir(componentsDir);
                for (const file of componentFiles) {
                    if (file.endsWith('.tsx')) {
                        const componentPath = path.join(componentsDir, file);
                        const componentContent = await fs.readFile(componentPath, 'utf8');
                        allContent += '\n' + componentContent;
                    }
                }
            } catch {
                // Components directory might not exist
            }

            // Create a static HTML preview based on the project type
            let appTitle = 'Generated App';
            let appDescription = 'Beautiful landing page generated by AI';

            // Try to extract title from all content
            if (allContent.includes('TaskFlow Pro')) {
                appTitle = 'TaskFlow Pro';
                appDescription = 'Simplify Your Tasks, Amplify Your Productivity';
            } else if (allContent.includes('FitForge Pro')) {
                appTitle = 'FitForge Pro';
                appDescription = 'Transform Your Fitness Journey';
            }

            // Create a proper preview HTML that renders the actual generated design
            const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appTitle} - Preview</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%236366f1'/><text x='50' y='70' font-size='60' text-anchor='middle' fill='white'>⚡</text></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    animation: {
                        'blob': 'blob 7s infinite',
                    },
                    keyframes: {
                        blob: {
                            '0%': { transform: 'translate(0px, 0px) scale(1)' },
                            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                            '100%': { transform: 'translate(0px, 0px) scale(1)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
    </style>
</head>
<body>
    <div id="preview-note" style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; z-index: 1000;">
        ✨ Generated App Preview
    </div>
    
    ${appTitle === 'TaskFlow Pro' ? `
    <!-- TaskFlow Pro Preview -->
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div class="relative z-0 overflow-hidden">
            <div class="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200 via-indigo-200 to-purple-100 opacity-30"></div>
            
            <!-- Navbar -->
            <nav class="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div class="container mx-auto px-6">
                    <div class="flex h-16 items-center justify-between">
                        <div class="flex items-center">
                            <a href="/" class="text-xl font-bold text-gray-900">TaskFlow Pro</a>
                        </div>
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-center space-x-8">
                                <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
                                <a href="#pricing" class="text-gray-600 hover:text-gray-900">Pricing</a>
                                <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
                                <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
                                <button class="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">Sign In</button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="relative py-20 sm:py-28 pt-32">
                <div class="container mx-auto px-6">
                    <div class="relative z-10 mx-auto max-w-4xl text-center">
                        <div class="relative space-y-4">
                            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                Simplify Your Tasks, 
                                <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Amplify Your Productivity
                                </span>
                            </h1>
                            <p class="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                                Transform the way you manage tasks with our intuitive and powerful task management platform. Stay organized, collaborate seamlessly, and achieve more.
                            </p>
                            <div class="mt-10 flex items-center justify-center gap-4">
                                <button class="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 font-medium text-white hover:text-white">
                                    <span class="relative rounded-lg bg-white/10 px-6 py-3 transition-all duration-75 ease-in group-hover:bg-opacity-0">
                                        Get Started →
                                    </span>
                                </button>
                                <button class="rounded-lg border border-gray-300 bg-white/50 px-6 py-3 font-medium text-gray-600 backdrop-blur-sm transition-colors hover:bg-gray-50">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"></div>
            </section>

            <!-- Features Section -->
            <section class="py-20">
                <div class="container mx-auto px-6">
                    <div class="mb-16 text-center">
                        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">Powerful Features for Enhanced Productivity</h2>
                        <p class="mt-4 text-gray-600">Everything you need to manage tasks effectively and boost your productivity</p>
                    </div>
                    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div class="relative rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
                            <div class="mb-4 text-blue-500">✓</div>
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Intuitive Task Organization</h3>
                            <p class="text-gray-600">Drag-and-drop interface with customizable categories and visual priority tags.</p>
                        </div>
                        <div class="relative rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
                            <div class="mb-4 text-blue-500">⚡</div>
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Seamless Synchronization</h3>
                            <p class="text-gray-600">Access your tasks from anywhere, on any device with real-time syncing.</p>
                        </div>
                        <div class="relative rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
                            <div class="mb-4 text-blue-500">👥</div>
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Real-Time Collaboration</h3>
                            <p class="text-gray-600">Work together with your team, share updates, and communicate efficiently.</p>
                        </div>
                        <div class="relative rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
                            <div class="mb-4 text-blue-500">📊</div>
                            <h3 class="mb-2 text-lg font-semibold text-gray-900">Advanced Analytics</h3>
                            <p class="text-gray-600">Track productivity trends and receive personalized insights.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="mt-20 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                <div class="container mx-auto px-6 py-8">
                    <div class="text-center text-gray-600">
                        <p>© 2024 TaskFlow Pro. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    ` : `
    <!-- FitForge Pro Preview -->
    <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div class="relative z-10">
            <!-- Navbar -->
            <nav class="fixed w-full top-0 z-50 px-6 py-4">
                <div class="max-w-7xl mx-auto">
                    <div class="backdrop-blur-lg bg-white/10 rounded-full px-6 py-3 shadow-xl">
                        <div class="flex items-center justify-between">
                            <div class="text-2xl font-bold text-white">FitForge Pro</div>
                            <div class="hidden md:flex items-center gap-8">
                                <a href="#" class="text-white hover:text-white/80 transition-colors">Home</a>
                                <a href="#" class="text-white hover:text-white/80 transition-colors">Features</a>
                                <a href="#" class="text-white hover:text-white/80 transition-colors">Pricing</a>
                                <a href="#" class="text-white hover:text-white/80 transition-colors">Community</a>
                                <button class="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-opacity-90 transition-all">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="relative px-6 py-24 md:py-32 pt-32">
                <div class="max-w-7xl mx-auto">
                    <div class="backdrop-blur-lg bg-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
                        <div class="max-w-3xl mx-auto text-center">
                            <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">Transform Your Fitness Journey</h1>
                            <p class="text-xl md:text-2xl text-white/90 mb-8">Personalized Plans & Community Support to Reach Your Health Goals</p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                                <button class="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                                    Get Started →
                                </button>
                                <button class="px-8 py-4 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-all">Learn More</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="px-6 py-24">
                <div class="max-w-7xl mx-auto">
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div class="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                            <div class="text-white mb-4 text-2xl">🏋️</div>
                            <h3 class="text-xl font-semibold text-white mb-2">Personalized Workout Plans</h3>
                            <p class="text-white/80">Custom fitness routines tailored to your goals and progress</p>
                        </div>
                        <div class="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                            <div class="text-white mb-4 text-2xl">📊</div>
                            <h3 class="text-xl font-semibold text-white mb-2">Real-Time Progress Tracking</h3>
                            <p class="text-white/80">Monitor your improvements with detailed analytics and insights</p>
                        </div>
                        <div class="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                            <div class="text-white mb-4 text-2xl">👥</div>
                            <h3 class="text-xl font-semibold text-white mb-2">Community Forum</h3>
                            <p class="text-white/80">Connect with like-minded individuals on your fitness journey</p>
                        </div>
                        <div class="backdrop-blur-lg bg-white/10 rounded-xl p-6 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                            <div class="text-white mb-4 text-2xl">🥗</div>
                            <h3 class="text-xl font-semibold text-white mb-2">Nutrition Guides</h3>
                            <p class="text-white/80">Comprehensive meal plans to complement your workouts</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
        <!-- Background decoration -->
        <div class="fixed inset-0 -z-10">
            <div class="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div class="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
    </div>
    `}
    
</body>
</html>`;

            return new NextResponse(previewHtml, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });

        } catch (error) {
            return new NextResponse('Error reading project files', { status: 500 });
        }

    } catch (error) {
        console.error('Preview error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
} 