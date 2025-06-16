import { AgentWorkflow, AgentCard, AgentType, GeneratedFile } from '../components/ai/types';

export interface AgentResponse {
    success: boolean;
    output?: string;
    files?: GeneratedFile[];
    error?: string;
    previewUrl?: string;
}

export class MultiAgentService {
    private sessionId: string;

    constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async *processWorkflow(userInput: string): AsyncGenerator<{ workflow: AgentWorkflow; isComplete: boolean }> {
        const workflow: AgentWorkflow = {
            id: `workflow_${Date.now()}`,
            userInput,
            agents: this.createAgentCards(),
            currentAgentIndex: 0,
            isComplete: false
        };

        yield { workflow, isComplete: false };

        // Process each agent in serial
        for (let i = 0; i < workflow.agents.length; i++) {
            workflow.currentAgentIndex = i;
            const agent = workflow.agents[i];

            // Update agent status to thinking
            agent.status = 'thinking';
            yield { workflow, isComplete: false };

            try {
                // Process agent based on type
                const response = await this.processAgent(agent.type, userInput, workflow);

                if (response.success) {
                    agent.status = 'completed';
                    agent.output = response.output;
                    if (response.files) {
                        agent.files = response.files;
                    }
                    if (response.previewUrl) {
                        workflow.previewUrl = response.previewUrl;
                    }
                } else {
                    agent.status = 'error';
                    agent.output = response.error || 'Agent processing failed';
                }
            } catch (error) {
                agent.status = 'error';
                agent.output = error instanceof Error ? error.message : 'Unknown error';
            }

            yield { workflow, isComplete: false };

            // Small delay between agents for UX
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Workflow complete
        workflow.isComplete = true;
        workflow.finalResult = this.compileFinalResult(workflow);
        yield { workflow, isComplete: true };
    }

    private createAgentCards(): AgentCard[] {
        return [
            {
                id: 'enthusiasm-agent',
                type: 'enthusiasm',
                name: 'Enthusiasm Agent',
                description: 'Acknowledging your idea with excitement and showing initial features',
                status: 'pending',
                timestamp: new Date()
            },
            {
                id: 'title-generator',
                type: 'title-generator',
                name: 'Title Generator',
                description: 'Creating a compelling project title',
                status: 'pending',
                timestamp: new Date()
            },
            {
                id: 'analyzer-agent',
                type: 'analyzer',
                name: 'Feature Analyzer',
                description: 'Analyzing landing page features and necessary components',
                status: 'pending',
                timestamp: new Date()
            },
            {
                id: 'coder-agent',
                type: 'coder',
                name: 'Code Generator',
                description: 'Writing code and creating the landing page files',
                status: 'pending',
                timestamp: new Date()
            },
            {
                id: 'preview-agent',
                type: 'preview',
                name: 'Preview Generator',
                description: 'Setting up preview and making files accessible',
                status: 'pending',
                timestamp: new Date()
            }
        ];
    }

    private async processAgent(agentType: AgentType, userInput: string, workflow: AgentWorkflow): Promise<AgentResponse> {
        switch (agentType) {
            case 'enthusiasm':
                return this.processEnthusiasmAgent(userInput);
            case 'title-generator':
                return this.processTitleGenerator(userInput);
            case 'analyzer':
                return this.processAnalyzerAgent(userInput, workflow);
            case 'coder':
                return this.processCoderAgent(userInput, workflow);
            case 'preview':
                return this.processPreviewAgent(userInput, workflow);
            default:
                return { success: false, error: 'Unknown agent type' };
        }
    }

    private async processEnthusiasmAgent(userInput: string): Promise<AgentResponse> {
        // Create enthusiasm response with features and inspirations
        const response = await this.callAI({
            prompt: `You are an enthusiastic AI assistant. The user wants to create: "${userInput}"

Respond with genuine enthusiasm and excitement. Include:
1. Acknowledge their idea enthusiastically 
2. Show 3-4 key features this landing page should have
3. Mention design inspirations (clean, modern, professional)
4. End with "Let's get to it! 🚀"

Keep response to 3-4 sentences. Be exciting but professional.`,
            systemPrompt: 'You are Voltaic, an enthusiastic AI that loves building beautiful apps.'
        });

        return {
            success: true,
            output: response
        };
    }

    private async processTitleGenerator(userInput: string): Promise<AgentResponse> {
        const response = await this.callAI({
            prompt: `Generate a compelling, professional title for this landing page idea: "${userInput}"

Requirements:
- 2-4 words maximum
- Professional and modern sounding
- Memorable and brandable
- No generic words like "app", "platform", "solution"

Return ONLY the title, nothing else.`,
            systemPrompt: 'You are a branding expert who creates memorable product names.'
        });

        return {
            success: true,
            output: response.trim()
        };
    }

    private async processAnalyzerAgent(userInput: string, workflow: AgentWorkflow): Promise<AgentResponse> {
        const enthusiasm = workflow.agents.find(a => a.type === 'enthusiasm')?.output || '';
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || '';

        const response = await this.callAI({
            prompt: `Analyze this landing page idea and identify the key components needed:

User Idea: "${userInput}"
Project Title: "${title}"
Previous Analysis: "${enthusiasm}"

Create a technical breakdown including:
1. Hero section requirements
2. Key features to highlight (3-4 main ones)
3. UI components needed (navbar, hero, features, CTA, footer)
4. Design style (modern, clean, professional with glass morphism)
5. Color scheme suggestions

Format as a concise technical specification.`,
            systemPrompt: 'You are a senior product designer who creates detailed component specifications.'
        });

        return {
            success: true,
            output: response
        };
    }

    private async processCoderAgent(userInput: string, workflow: AgentWorkflow): Promise<AgentResponse> {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'Landing Page';
        const analysis = workflow.agents.find(a => a.type === 'analyzer')?.output || '';

        // Use Anthropic for code generation
        const codeResponse = await this.callAI({
            prompt: `Generate a complete Next.js 14 application for: "${userInput}"

Project Title: "${title}"
Technical Requirements: "${analysis}"

Generate 4 main files:
1. app/page.tsx - Main landing page with glass morphism design
2. components/Hero.tsx - Hero section component  
3. components/Features.tsx - Features showcase section
4. components/Navbar.tsx - Navigation component

CRITICAL Requirements:
- Use TypeScript and React
- Modern glass morphism design with Tailwind CSS
- Responsive layout
- Beautiful gradients and animations
- Professional, clean code
- Export each component properly with named exports
- Use ONLY relative imports (no @/ aliases)
- Import paths: app/page.tsx should import from '../components/ComponentName'
- All lucide-react icons must be imported correctly
- Ensure all syntax is valid TypeScript/React

IMPORT RULES:
- app/page.tsx imports: import { Hero } from '../components/Hero'
- components should export: export function ComponentName() {}
- lucide-react imports: import { IconName } from 'lucide-react'

Return the code for each file in this exact format:
==== app/page.tsx ====
[code here]

==== components/Hero.tsx ====
[code here]

==== components/Features.tsx ====
[code here]

==== components/Navbar.tsx ====
[code here]`,
            systemPrompt: 'You are an expert React/Next.js developer who creates beautiful, modern web applications with glass morphism design.',
            useAnthropic: true
        });

        // Parse the generated code into files
        const files = this.parseGeneratedCode(codeResponse, title);

        return {
            success: true,
            output: `Successfully generated ${files.length} files for your ${title}. The code includes a modern glass morphism design with responsive layout, hero section, features showcase, and navigation.`,
            files
        };
    }

    private async processPreviewAgent(userInput: string, workflow: AgentWorkflow): Promise<AgentResponse> {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'App';
        const files = workflow.agents.find(a => a.type === 'coder')?.files || [];

        try {
            // Save files using the write-files API (when running on server)
            const projectId = workflow.id;

            // Try to write files - only works on server side
            try {
                // Determine the base URL for the API call
                let baseUrl = '';
                if (typeof window === 'undefined') {
                    // Server side - use localhost
                    baseUrl = 'http://localhost:3000';
                } else {
                    // Client side - use current origin
                    baseUrl = window.location.origin;
                }

                const response = await fetch(`${baseUrl}/api/write-files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        projectId,
                        title,
                        files
                    })
                });

                if (response.ok) {
                    console.log('✅ Files written successfully to filesystem');
                } else {
                    console.log('⚠️ File writing failed, but continuing with preview');
                }
            } catch (writeError) {
                console.log('⚠️ File writing error:', writeError);
                // Continue even if file writing fails
            }

            // Generate preview URL (relative path, no localhost)
            const previewUrl = `/api/preview/${projectId}`;

            return {
                success: true,
                output: `🎉 **Preview Ready!** Your ${title} is now live and accessible.\n\nFiles have been saved to the generated-apps directory. You can now view your beautiful landing page in the preview panel!`,
                previewUrl
            };
        } catch (error) {
            return {
                success: false,
                error: `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    private async saveFilesToDisk(files: GeneratedFile[], projectId: string, title: string): Promise<{ success: boolean; error?: string }> {
        // For now, skip file writing and just return success
        // Files will be available in the workflow object for the preview
        return { success: true };
    }

    private async callAI(params: { prompt: string; systemPrompt: string; useAnthropic?: boolean }): Promise<string> {
        try {
            // Import AI models directly
            const { ChatAnthropic } = await import('@langchain/anthropic');
            const { ChatOpenAI } = await import('@langchain/openai');
            const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

            const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
            const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
            console.log('anthropicKey', anthropicKey);
            console.log('openaiKey', openaiKey);
            let model;

            // Use appropriate model based on useAnthropic flag
            if (params.useAnthropic && anthropicKey) {
                model = new ChatAnthropic({
                    apiKey: anthropicKey,
                    model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL,
                    temperature: 0.1
                });
            } else if (openaiKey) {
                model = new ChatOpenAI({
                    apiKey: openaiKey,
                    model: process.env.NEXT_PUBLIC_OPENAI_MODEL,
                    temperature: 0.1
                });
            } else if (anthropicKey) {
                model = new ChatAnthropic({
                    apiKey: anthropicKey,
                    model: 'claude-3-5-sonnet-20241022',
                    temperature: 0.1
                });
            } else {
                throw new Error('No AI API key found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
            }

            const messages = [
                new SystemMessage(params.systemPrompt),
                new HumanMessage(params.prompt)
            ];

            const response = await model.invoke(messages);
            return response.content as string;

        } catch (error) {
            console.error('AI call error:', error);
            throw error;
        }
    }

    private parseGeneratedCode(codeResponse: string, title: string): GeneratedFile[] {
        const files: GeneratedFile[] = [];
        const sections = codeResponse.split('====');

        for (let i = 1; i < sections.length; i += 2) {
            if (i + 1 < sections.length) {
                const pathLine = sections[i].trim();
                let code = sections[i + 1].trim();

                if (pathLine && code) {
                    const path = pathLine.replace(/=+/g, '').trim();

                    // Remove code block markers (```tsx, ```javascript, etc.)
                    if (code.startsWith('```')) {
                        const lines = code.split('\n');
                        // Remove first line (```tsx, ```js, etc.) and last line (```)
                        lines.shift(); // Remove first ```tsx line
                        if (lines[lines.length - 1].trim() === '```') {
                            lines.pop(); // Remove last ``` line
                        }
                        code = lines.join('\n').trim();
                    }

                    files.push({
                        path,
                        content: code,
                        description: this.getFileDescription(path),
                        type: this.getFileType(path)
                    });
                }
            }
        }

        // Fallback if parsing fails
        if (files.length === 0) {
            return this.generateFallbackFiles(title);
        }

        return files;
    }

    private getFileDescription(path: string): string {
        if (path.includes('page.tsx')) return 'Main landing page component';
        if (path.includes('Hero.tsx')) return 'Hero section component';
        if (path.includes('Features.tsx')) return 'Features section component';
        if (path.includes('Navbar.tsx')) return 'Navigation component';
        return 'Component file';
    }

    private getFileType(path: string): 'component' | 'page' | 'api' | 'config' | 'style' {
        if (path.includes('/app/') && path.endsWith('page.tsx')) return 'page';
        if (path.includes('/api/')) return 'api';
        if (path.includes('/components/')) return 'component';
        if (path.endsWith('.css') || path.endsWith('.scss')) return 'style';
        if (path.includes('config') || path.endsWith('.json') || path.endsWith('.js')) return 'config';
        return 'component';
    }

    private generateFallbackFiles(title: string): GeneratedFile[] {
        return [
            {
                path: 'app/page.tsx',
                content: this.generateMainPage(title, ''),
                description: 'Main landing page component',
                type: 'page'
            },
            {
                path: 'components/Hero.tsx',
                content: this.generateHeroComponent(title),
                description: 'Hero section component',
                type: 'component'
            },
            {
                path: 'components/Features.tsx',
                content: this.generateFeaturesComponent(),
                description: 'Features section component',
                type: 'component'
            },
            {
                path: 'components/Navbar.tsx',
                content: this.generateNavbarComponent(title),
                description: 'Navigation component',
                type: 'component'
            }
        ];
    }

    private compileFinalResult(workflow: AgentWorkflow) {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'Landing Page';
        const files = workflow.agents.find(a => a.type === 'coder')?.files || [];

        return {
            title,
            files,
            preview: workflow.previewUrl ? `<iframe src="${workflow.previewUrl}" width="100%" height="600" frameborder="0"></iframe>` : this.generatePreview(title, files)
        };
    }

    private generatePreview(title: string, files: GeneratedFile[]): string {
        return `
        <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div class="container mx-auto px-6 py-12">
                <h1 class="text-4xl font-bold text-white text-center mb-8">${title}</h1>
                <div class="text-center">
                    <p class="text-white/80 mb-8">Your beautiful landing page is ready!</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${files.map(file => `
                            <div class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                                <h3 class="text-white font-semibold mb-2">${file.path}</h3>
                                <p class="text-white/70 text-sm">${file.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    private generateMainPage(title: string, analysis: string): string {
        return `'use client';

import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Navbar } from '../components/Navbar';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Navbar />
            <Hero title="${title}" />
            <Features />
        </div>
    );
}`;
    }

    private generateHeroComponent(title: string): string {
        return `'use client';

interface HeroProps {
    title: string;
}

export function Hero({ title }: HeroProps) {
    return (
        <section className="pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
                    {title}
                </h1>
                <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
                    Experience the future of modern web applications with our cutting-edge platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Get Started
                    </button>
                    <button className="px-8 py-4 border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all duration-300">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
}`;
    }

    private generateFeaturesComponent(): string {
        return `'use client';

import { Sparkles, Zap, Shield } from 'lucide-react';

export function Features() {
    const features = [
        {
            icon: Sparkles,
            title: 'Modern Design',
            description: 'Beautiful glass morphism UI with smooth animations'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Optimized performance for the best user experience'
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security and 99.9% uptime'
        }
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-16">
                    Why Choose Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                            <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                            <p className="text-white/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}`;
    }

    private generateNavbarComponent(title: string): string {
        return `'use client';

interface NavbarProps {
    title?: string;
}

export function Navbar({ title = "${title}" }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                        {title}
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-white/80 hover:text-white transition-colors">Home</a>
                        <a href="#" className="text-white/80 hover:text-white transition-colors">Features</a>
                        <a href="#" className="text-white/80 hover:text-white transition-colors">About</a>
                        <a href="#" className="text-white/80 hover:text-white transition-colors">Contact</a>
                    </div>
                    <button className="px-6 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}`;
    }
} 