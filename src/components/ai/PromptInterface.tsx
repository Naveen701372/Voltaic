'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { GenerationSteps } from './GenerationSteps';
import { ChatPanel } from './ChatPanel';
import { PreviewPanel } from './PreviewPanel';
import { FloatingInput } from './FloatingInput';
import { Message, GeneratedFile, AppProject, GenerationStep } from './types';
import { injectStyles } from './styles';

export default function PromptInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'system',
            content: "Hi! I'm Voltaic, your AI app generator. Describe any app idea and I'll build it for you with beautiful glass morphism UI. What would you like to create today?",
            timestamp: new Date()
        }
    ]);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentProject, setCurrentProject] = useState<AppProject | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview'>('preview');
    const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showGenerationSteps, setShowGenerationSteps] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Inject styles on component mount
    useEffect(() => {
        injectStyles();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage, previewLoading]);

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const copyToClipboard = async (text: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedMessageId(messageId);
                setTimeout(() => setCopiedMessageId(null), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    const simulateStreaming = async (content: string, messageId: string) => {
        const words = content.split(' ');
        let currentContent = '';

        for (let i = 0; i < words.length; i++) {
            currentContent += (i > 0 ? ' ' : '') + words[i];

            setStreamingMessage({
                id: messageId,
                type: 'assistant',
                content: currentContent,
                timestamp: new Date(),
                isStreaming: true
            });

            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        }

        return currentContent;
    };

    const updateGenerationStep = (stepId: string, status: GenerationStep['status']) => {
        setGenerationSteps(prev => prev.map(step =>
            step.id === stepId ? { ...step, status } : step
        ));
    };

    const generateApp = async (userPrompt: string) => {
        setIsGenerating(true);
        setShowSuggestions(false);

        await new Promise(resolve => setTimeout(resolve, 800));

        setShowGenerationSteps(true);
        setPreviewReady(false);
        setPreviewLoading(false);

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: userPrompt,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        const steps: GenerationStep[] = [
            { id: 'analyze', name: 'Analyzing Requirements', status: 'generating', description: 'Understanding your app requirements and features' },
            { id: 'architecture', name: 'Planning Architecture', status: 'pending', description: 'Designing the app structure and components' },
            { id: 'components', name: 'Generating Components', status: 'pending', description: 'Creating React components with TypeScript' },
            { id: 'styling', name: 'Applying Glass Morphism', status: 'pending', description: 'Adding beautiful glass morphism styling' },
            { id: 'preview', name: 'Building Preview', status: 'pending', description: 'Generating live preview of your app' }
        ];
        setGenerationSteps(steps);

        try {
            // Start real AI generation
            const { aiService } = await import('@/lib/ai-service');

            const assistantMessageId = (Date.now() + 1).toString();
            let currentContent = '';
            let generatedFiles: any[] = [];
            let hasStartedStreaming = false;

            // Initialize streaming message
            const initialStreamingMessage: Message = {
                id: assistantMessageId,
                type: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };
            setStreamingMessage(initialStreamingMessage);

            // Stream the real AI response
            for await (const response of aiService.streamGeneration({
                prompt: userPrompt,
                previousMessages: messages.slice(1).map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            })) {
                currentContent = response.content;
                generatedFiles = response.files;

                // Update streaming message
                setStreamingMessage(prev => prev ? {
                    ...prev,
                    content: currentContent
                } : null);

                // Update progress steps based on content and files
                if (!hasStartedStreaming && currentContent.length > 0) {
                    hasStartedStreaming = true;
                    updateGenerationStep('analyze', 'completed');
                    updateGenerationStep('architecture', 'generating');
                }

                if (currentContent.length > 100) {
                    updateGenerationStep('architecture', 'completed');
                    updateGenerationStep('components', 'generating');
                }

                if (response.files.length > 0) {
                    updateGenerationStep('components', 'completed');
                    updateGenerationStep('styling', 'generating');
                }

                if (response.isComplete) {
                    updateGenerationStep('styling', 'completed');
                    updateGenerationStep('preview', 'generating');

                    setPreviewLoading(true);
                    setIsTransitioning(true);

                    // Create the project from the generated response
                    const project: AppProject = {
                        id: Date.now().toString(),
                        name: aiService['extractAppName'](userPrompt, currentContent) || 'Generated App',
                        description: aiService['extractDescription'](currentContent) || 'A modern web application built with Next.js and TypeScript',
                        files: response.files.length > 0 ? response.files : [{
                            path: 'src/app/page.tsx',
                            type: 'page' as const,
                            description: 'Main application page',
                            content: `'use client';\n\nexport default function HomePage() {\n    return (\n        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">\n            <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">\n                <h1 className="text-2xl font-bold text-white mb-4">Generated App</h1>\n                <p className="text-white/80 mb-6">Your application is ready!</p>\n            </div>\n        </div>\n    );\n}`
                        }],
                        preview: response.files.length > 0 ?
                            aiService['generatePreview']('Generated App', response.files) :
                            '<div class="p-8 text-center"><h1 class="text-2xl font-bold mb-4">Generated App</h1><p class="text-gray-600">Your application is ready!</p></div>',
                        status: 'ready'
                    };

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    updateGenerationStep('preview', 'completed');

                    setPreviewReady(true);
                    setPreviewLoading(false);
                    setCurrentProject(project);

                    // Finalize the streaming message
                    const finalMessage: Message = {
                        id: assistantMessageId,
                        type: 'assistant',
                        content: currentContent + `\n\n✅ **"${project.name}" is ready!**\n\nI've generated ${project.files.length} files with complete functionality. You can view the code and preview on the right. Would you like me to modify anything?`,
                        timestamp: new Date(),
                        isStreaming: false,
                        files: project.files,
                        preview: project.preview
                    };
                    setMessages(prev => [...prev, finalMessage]);
                    setStreamingMessage(null);
                    setActiveTab('preview');
                    break;
                }
            }

        } catch (error) {
            console.error('Generation error:', error);

            // Update steps to show error
            updateGenerationStep('analyze', 'completed');
            updateGenerationStep('architecture', 'completed');
            updateGenerationStep('components', 'error');

            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: `I encountered an error while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. 

This might be due to:
• Missing API keys (ANTHROPIC_API_KEY or OPENAI_API_KEY)
• Network connectivity issues
• API rate limits

Please check your environment variables and try again. You can test the connection at /test-langchain.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setStreamingMessage(null);
            setShowSuggestions(true);
            setShowGenerationSteps(false);
            setPreviewLoading(false);
        } finally {
            setIsGenerating(false);
            setIsTransitioning(false);
            setGenerationSteps([]);
            setShowGenerationSteps(false);
        }
    };

    const continueConversation = async (userPrompt: string) => {
        setIsGenerating(true);

        if (streamingMessage) {
            const finalizedMessage: Message = {
                ...streamingMessage,
                isStreaming: false
            };
            setMessages(prev => [...prev, finalizedMessage]);
        }

        setStreamingMessage(null);

        const userMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'user',
            content: userPrompt,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const responseContent = `I understand you'd like to modify the app. Let me analyze your request and make the necessary changes.

**Your Request:** ${userPrompt}

I'll update the components and regenerate the preview with your requested changes. This might take a moment...`;

            const finalContent = await simulateStreaming(responseContent, assistantMessageId);

            const assistantMessage: Message = {
                id: assistantMessageId,
                type: 'assistant',
                content: finalContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingMessage(null);

        } catch (error) {
            console.error('Error in conversation:', error);
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: "I apologize, but I encountered an error processing your request. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        const userPrompt = prompt;
        setPrompt('');

        if (currentProject) {
            await continueConversation(userPrompt);
        } else {
            await generateApp(userPrompt);
        }
    };

    // Centered layout when no project exists
    if (!currentProject) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
                <div className="flex-1 flex flex-col pb-20 relative">
                    <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/20 to-transparent backdrop-blur-sm pointer-events-none z-10"></div>

                    <WelcomeScreen
                        showSuggestions={showSuggestions}
                        onSuggestionClick={handleSuggestionClick}
                    />

                    {showGenerationSteps && isGenerating && (
                        <GenerationSteps
                            generationSteps={generationSteps}
                            streamingMessage={streamingMessage}
                            showGenerationSteps={showGenerationSteps}
                            previewLoading={previewLoading}
                        />
                    )}
                </div>

                <FloatingInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSubmit={handleSubmit}
                    isGenerating={isGenerating}
                    isBottom={true}
                    currentProject={currentProject}
                />
            </div>
        );
    }

    // Split layout when preview is loading or ready
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex transition-all duration-700 ease-in-out">
            <ChatPanel
                messages={messages}
                streamingMessage={streamingMessage}
                copiedMessageId={copiedMessageId}
                onCopy={copyToClipboard}
                previewLoading={previewLoading}
                showGenerationSteps={showGenerationSteps}
                generationSteps={generationSteps}
                isGenerating={isGenerating}
                currentProject={currentProject}
                messagesEndRef={messagesEndRef}
            />

            <PreviewPanel
                previewLoading={previewLoading}
                previewReady={previewReady}
                currentProject={currentProject}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <FloatingInput
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleSubmit}
                isGenerating={isGenerating}
                placeholder="Ask me to modify the app or create something new..."
                currentProject={currentProject}
            />
        </div>
    );
} 