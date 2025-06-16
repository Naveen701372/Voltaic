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

        // Simplified steps for analysis phase only
        const steps: GenerationStep[] = [
            { id: 'analyze', name: 'Analyzing Requirements', status: 'generating', description: 'Understanding your app requirements and features' },
            { id: 'planning', name: 'Planning Architecture', status: 'pending', description: 'Designing the app structure and approach' }
        ];
        setGenerationSteps(steps);

        try {
            // Start AI analysis (not full generation)
            const { aiService } = await import('@/lib/ai-service');

            const assistantMessageId = (Date.now() + 1).toString();
            let currentContent = '';
            let hasStartedStreaming = false;
            let analysisComplete = false;

            // Initialize streaming message
            const initialStreamingMessage: Message = {
                id: assistantMessageId,
                type: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };
            setStreamingMessage(initialStreamingMessage);

            // Create analysis-focused prompt
            const analysisPrompt = `Analyze this app idea and provide a detailed breakdown: "${userPrompt}"

Please provide:
1. **App Analysis** - What type of app this is and key features identified
2. **Technical Architecture** - Recommended tech stack and structure  
3. **Key Components** - Main components and pages needed
4. **Database Schema** - If data storage is needed
5. **Next Steps** - What we'll build together

Keep this as an analysis only - don't generate actual code yet. We'll build it together in the next step.`;

            // Stream the analysis response
            for await (const response of aiService.streamGeneration({
                prompt: analysisPrompt,
                previousMessages: []
            })) {
                currentContent = response.content;

                // Update streaming message
                setStreamingMessage(prev => prev ? {
                    ...prev,
                    content: currentContent
                } : null);

                // Update progress steps based on content
                if (!hasStartedStreaming && currentContent.length > 0) {
                    hasStartedStreaming = true;
                    updateGenerationStep('analyze', 'completed');
                    updateGenerationStep('planning', 'generating');
                }

                // Check if analysis is complete (look for key indicators)
                if (response.isComplete || (currentContent.length > 200 && currentContent.includes('Next Steps'))) {
                    analysisComplete = true;
                    updateGenerationStep('planning', 'completed');

                    // Finalize the analysis message
                    const finalMessage: Message = {
                        id: assistantMessageId,
                        type: 'assistant',
                        content: currentContent + `\n\n✅ **Analysis Complete!**\n\nI've analyzed your idea and created a plan. Ready to start building? Let's continue in the workspace where I can generate the actual code and show you live previews.`,
                        timestamp: new Date(),
                        isStreaming: false
                    };
                    setMessages(prev => [...prev, finalMessage]);
                    setStreamingMessage(null);

                    // Switch to split view after analysis
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setIsTransitioning(true);

                    // Create initial project state for split view
                    const project: AppProject = {
                        id: Date.now().toString(),
                        name: aiService['extractAppName'](userPrompt, currentContent) || 'New Project',
                        description: 'Ready to start building based on the analysis above',
                        files: [], // No files yet - will be generated in chat
                        preview: '<div class="p-8 text-center"><h1 class="text-2xl font-bold mb-4">Ready to Build</h1><p class="text-gray-600">Your project analysis is complete. Let\'s start coding!</p></div>',
                        status: 'ready'
                    };

                    setCurrentProject(project);
                    setPreviewReady(true);
                    setActiveTab('code'); // Start with code tab since no preview yet
                    break;
                }
            }

        } catch (error) {
            console.error('Analysis error:', error);

            // Update steps to show error
            updateGenerationStep('analyze', 'error');

            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: `I encountered an error while analyzing your app idea: ${error instanceof Error ? error.message : 'Unknown error'}. 

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
            // Use real AI streaming for continued conversation
            const { aiService } = await import('@/lib/ai-service');

            const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            let currentContent = '';

            // Initialize streaming message
            const initialStreamingMessage: Message = {
                id: assistantMessageId,
                type: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };
            setStreamingMessage(initialStreamingMessage);

            // Stream the real AI response for continued conversation
            for await (const response of aiService.streamGeneration({
                prompt: userPrompt,
                previousMessages: messages.map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                }))
            })) {
                currentContent = response.content;

                // Update streaming message
                setStreamingMessage(prev => prev ? {
                    ...prev,
                    content: currentContent
                } : null);

                // If files are generated, update the current project
                if (response.files.length > 0 && currentProject) {
                    const updatedProject: AppProject = {
                        ...currentProject,
                        files: [...currentProject.files, ...response.files],
                        preview: response.files.length > 0 ?
                            aiService['generatePreview'](currentProject.name, [...currentProject.files, ...response.files]) :
                            currentProject.preview
                    };
                    setCurrentProject(updatedProject);
                }

                if (response.isComplete) {
                    // Finalize the streaming message
                    const finalMessage: Message = {
                        id: assistantMessageId,
                        type: 'assistant',
                        content: currentContent,
                        timestamp: new Date(),
                        isStreaming: false,
                        files: response.files.length > 0 ? response.files : undefined,
                        preview: response.files.length > 0 ?
                            aiService['generatePreview'](currentProject?.name || 'App', response.files) :
                            undefined
                    };
                    setMessages(prev => [...prev, finalMessage]);
                    setStreamingMessage(null);

                    // Switch to preview tab if files were generated
                    if (response.files.length > 0) {
                        setActiveTab('preview');
                    }
                    break;
                }
            }

        } catch (error) {
            console.error('Error in conversation:', error);
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'assistant',
                content: `I apologize, but I encountered an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setStreamingMessage(null);
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