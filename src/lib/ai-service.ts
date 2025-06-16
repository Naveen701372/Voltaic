export interface AIGenerationRequest {
    prompt: string;
    context?: string;
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface GeneratedApp {
    name: string;
    description: string;
    files: Array<{
        path: string;
        content: string;
        description: string;
        type: 'component' | 'page' | 'api' | 'config' | 'style';
    }>;
    preview: string;
    dependencies?: string[];
    instructions?: string;
}

export interface StreamingResponse {
    content: string;
    files: GeneratedApp['files'];
    dependencies: string[];
    sqlSchemas: string[];
    isComplete: boolean;
}

export class VoltaicAIService {
    private sessionId: string;

    constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Stream responses for real-time UI updates
    async *streamGeneration(request: AIGenerationRequest): AsyncGenerator<StreamingResponse> {
        try {
            // Prepare messages for the chat API
            const messages = [
                ...(request.previousMessages || []),
                { role: 'user' as const, content: request.prompt }
            ];

            // Call the LangChain-powered chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            // Parse the streaming response
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            let fullContent = '';
            const generatedFiles: GeneratedApp['files'] = [];
            const dependencies: string[] = [];
            const sqlSchemas: string[] = [];

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            yield {
                                content: fullContent,
                                files: generatedFiles,
                                dependencies,
                                sqlSchemas,
                                isComplete: true
                            };
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.type === 'content') {
                                fullContent = parsed.content;

                                // Yield intermediate updates
                                yield {
                                    content: fullContent,
                                    files: generatedFiles,
                                    dependencies,
                                    sqlSchemas,
                                    isComplete: parsed.done || false
                                };
                            } else if (parsed.type === 'tool_result') {
                                const result = parsed.result;

                                if (result.type === 'file_created') {
                                    generatedFiles.push({
                                        path: result.path,
                                        content: result.content,
                                        description: result.description,
                                        type: this.getFileType(result.path)
                                    });
                                } else if (result.type === 'dependencies_noted') {
                                    dependencies.push(...result.packages);
                                } else if (result.type === 'sql_generated') {
                                    sqlSchemas.push(result.sql);
                                }

                                // Yield updates when tools are executed
                                yield {
                                    content: fullContent,
                                    files: generatedFiles,
                                    dependencies,
                                    sqlSchemas,
                                    isComplete: false
                                };
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

        } catch (error) {
            console.error('AI Generation Error:', error);
            throw error;
        }
    }

    async generateApp(request: AIGenerationRequest): Promise<GeneratedApp> {
        try {
            let finalResponse: StreamingResponse | null = null;

            // Consume the stream to get the final result
            for await (const response of this.streamGeneration(request)) {
                finalResponse = response;
                if (response.isComplete) break;
            }

            if (!finalResponse) {
                throw new Error('No response received');
            }

            // Extract app name and description from the response
            const appName = this.extractAppName(request.prompt, finalResponse.content);
            const description = this.extractDescription(finalResponse.content);

            return {
                name: appName,
                description,
                files: finalResponse.files.length > 0 ? finalResponse.files : this.generateFallbackFiles(appName),
                preview: this.generatePreview(appName, finalResponse.files),
                dependencies: finalResponse.dependencies,
                instructions: finalResponse.content
            };

        } catch (error) {
            console.error('AI Generation Error:', error);
            // Fallback to mock response if API fails
            return this.generateFallbackApp(request.prompt);
        }
    }

    private getFileType(path: string): 'component' | 'page' | 'api' | 'config' | 'style' {
        if (path.includes('/app/') && path.endsWith('page.tsx')) return 'page';
        if (path.includes('/api/')) return 'api';
        if (path.includes('/components/')) return 'component';
        if (path.endsWith('.css') || path.endsWith('.scss')) return 'style';
        if (path.includes('config') || path.endsWith('.json') || path.endsWith('.js')) return 'config';
        return 'component';
    }

    private extractAppName(prompt: string, content: string): string {
        // Try to extract from content first
        const nameMatch = content.match(/(?:app|application|project)\s+(?:called|named|titled)\s+"([^"]+)"/i);
        if (nameMatch) return nameMatch[1];

        // Fallback to prompt analysis
        if (prompt.toLowerCase().includes('todo')) return 'Todo Master';
        if (prompt.toLowerCase().includes('recipe')) return 'Recipe Hub';
        if (prompt.toLowerCase().includes('fitness')) return 'Fitness Tracker';
        if (prompt.toLowerCase().includes('project')) return 'Project Manager';
        if (prompt.toLowerCase().includes('social')) return 'Social Dashboard';
        if (prompt.toLowerCase().includes('ecommerce') || prompt.toLowerCase().includes('store')) return 'E-Commerce Store';
        if (prompt.toLowerCase().includes('blog')) return 'Blog Platform';
        if (prompt.toLowerCase().includes('chat')) return 'Chat Application';
        if (prompt.toLowerCase().includes('dashboard')) return 'Analytics Dashboard';

        return 'Custom App';
    }

    private extractDescription(content: string): string {
        // Try to extract description from the AI response
        const descMatch = content.match(/(?:description|summary):\s*([^\n]+)/i);
        if (descMatch) return descMatch[1];

        return 'A modern web application built with Next.js, TypeScript, and beautiful glass morphism UI.';
    }

    private generatePreview(appName: string, files: GeneratedApp['files']): string {
        if (files.length === 0) {
            return `<div class="p-8 text-center">
                <h1 class="text-2xl font-bold mb-4">${appName}</h1>
                <p class="text-gray-600">Your application is being generated...</p>
            </div>`;
        }

        // Find the main page file
        const mainPage = files.find(f => f.path.includes('page.tsx'));
        if (mainPage) {
            // Extract JSX from the main page for preview
            const jsxMatch = mainPage.content.match(/return\s*\(([\s\S]*?)\);?\s*}/);
            if (jsxMatch) {
                return jsxMatch[1].trim();
            }
        }

        return `<div class="p-8">
            <h1 class="text-2xl font-bold mb-4">${appName}</h1>
            <p class="text-gray-600">Generated ${files.length} files successfully!</p>
        </div>`;
    }

    private generateFallbackApp(prompt: string): GeneratedApp {
        const appName = this.extractAppName(prompt, '');
        const features = this.extractFeatures(prompt);

        return {
            name: appName,
            description: `A modern ${appName.toLowerCase()} with ${features.join(', ')} built with Next.js, TypeScript, and glass morphism UI.`,
            files: this.generateFallbackFiles(appName),
            preview: this.generateBasicPreview(appName, features),
            dependencies: ['@supabase/supabase-js'],
            instructions: 'App generated successfully! You can customize it further by chatting with the AI.'
        };
    }

    private generateFallbackFiles(appName: string): GeneratedApp['files'] {
        return [
            {
                path: 'src/app/page.tsx',
                type: 'page' as const,
                description: 'Main application page',
                content: `'use client';

import { useState } from 'react';

export default function HomePage() {
    const [message, setMessage] = useState('Welcome to ${appName}!');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-white mb-4">${appName}</h1>
                <p className="text-white/80 mb-6">{message}</p>
                <button 
                    onClick={() => setMessage('Hello from Voltaic!')}
                    className="glass-button px-6 py-2 text-white font-medium rounded-lg hover:scale-105 transition-transform"
                >
                    Click Me
                </button>
            </div>
        </div>
    );
}`
            }
        ];
    }

    private extractFeatures(prompt: string): string[] {
        const features = [];
        if (prompt.toLowerCase().includes('auth')) features.push('authentication');
        if (prompt.toLowerCase().includes('real-time')) features.push('real-time updates');
        if (prompt.toLowerCase().includes('payment')) features.push('payment integration');
        if (prompt.toLowerCase().includes('chart') || prompt.toLowerCase().includes('analytics')) features.push('analytics dashboard');
        if (prompt.toLowerCase().includes('comment') || prompt.toLowerCase().includes('rating')) features.push('user interactions');
        if (prompt.toLowerCase().includes('search')) features.push('search functionality');
        if (prompt.toLowerCase().includes('notification')) features.push('notifications');
        if (features.length === 0) features.push('modern UI', 'responsive design');
        return features;
    }

    private generateBasicPreview(appName: string, features: string[]): string {
        return `<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-white mb-4">${appName}</h1>
                <p className="text-white/80 mb-6">Features: ${features.join(', ')}</p>
                <div className="glass-button px-6 py-2 text-white font-medium rounded-lg">
                    Get Started
                </div>
            </div>
        </div>`;
    }
}

export const aiService = new VoltaicAIService(); 