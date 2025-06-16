'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
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
            content: "Hey there! 👋 I'm Voltaic, and I'm super excited to help you bring your app idea to life! \n\nJust tell me what you have in mind?",
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
    const [previewReady, setPreviewReady] = useState(true);
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

        // Immediately hide suggestions with animation
        setShowSuggestions(false);

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: userPrompt,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            // Start AI analysis immediately - no delay, no generation steps
            const { aiService } = await import('@/lib/ai-service');

            const assistantMessageId = (Date.now() + 1).toString();
            let currentContent = '';

            // Initialize streaming message immediately
            const initialStreamingMessage: Message = {
                id: assistantMessageId,
                type: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };
            setStreamingMessage(initialStreamingMessage);

            // Create analysis-focused prompt
            const analysisPrompt = `I love this idea! "${userPrompt}" has so much potential - let me break down why I'm excited about it and what we can build together.

## 🎯 Why This Idea is Brilliant

This type of application addresses a real need and has huge market potential. I can already envision how users will interact with it and the value it'll provide. The timing is perfect for something like this!

## ✨ What We'll Build Together

I'm thinking we create something that feels powerful and professional. Here's what I have in mind:

• **Beautiful Landing Experience** - A stunning header that immediately communicates what your app does
• **Engaging Hero Section** - Compelling messaging with a clear call-to-action that converts visitors
• **Smart Dashboard Layout** - Information-dense cards that give users everything they need at a glance
• **Mobile-Perfect Design** - Responsive layouts that work flawlessly on every device
• **Premium Interactions** - Smooth animations and micro-interactions that feel expensive

## 🎨 The Visual Direction

I'm envisioning something with:

• **Modern Typography** - Large, readable fonts with tech-forward gradients
• **Glass Morphism Cards** - Sleek, translucent cards with subtle color accents
• **Professional Color Palette** - Deep blues and energetic purples with strategic accent colors
• **Dashboard-Style Layout** - Wide, organized sections that maximize screen real estate
• **Subtle Motion** - Hover effects and transitions that feel natural and engaging

## 🚀 Technical Foundation

Behind the scenes, I'll use modern web technologies to ensure everything runs smoothly. If you need user accounts, data storage, or integrations with other services, I'll handle all that technical complexity for you.

The best part? You don't need to worry about any of the technical details - I'll take care of everything from design to deployment.`;

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

                // Check if analysis is complete
                if (response.isComplete || currentContent.length > 300) {
                    // Finalize the analysis message
                    const finalMessage: Message = {
                        id: assistantMessageId,
                        type: 'assistant',
                        content: currentContent + `\n\n🎉 **I'm Ready to Start Building!**\n\nI'm genuinely excited about this project! Just say "let's build it" or tell me what specific part you'd like to see first, and I'll start creating your application right away.\n\nWhat should we tackle first?`,
                        timestamp: new Date(),
                        isStreaming: false
                    };
                    setMessages(prev => [...prev, finalMessage]);
                    setStreamingMessage(null);

                    // Create initial project state
                    const project: AppProject = {
                        id: Date.now().toString(),
                        name: aiService['extractAppName'](userPrompt, currentContent) || 'New Project',
                        description: 'Ready to start building based on the analysis above',
                        files: [], // No files yet - will be generated in chat
                        preview: '<div class="p-8 text-center"><h1 class="text-2xl font-bold mb-4">Ready to Build</h1><p class="text-gray-600">Your project analysis is complete. Ask me to generate the code!</p></div>',
                        status: 'ready'
                    };

                    setCurrentProject(project);
                    setActiveTab('code'); // Start with code tab since no preview yet
                    break;
                }
            }

        } catch (error) {
            console.error('Analysis error:', error);

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
            setShowSuggestions(true); // Show suggestions again on error
        } finally {
            setIsGenerating(false);
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

        // Check if this looks like an app building request that should use multi-agent system
        const isMultiAgentRequest = /landing page|website|homepage|site|app|platform|dashboard|management|tracker|tool/i.test(userPrompt);

        try {
            if (isMultiAgentRequest) {
                // Use multi-agent system for landing pages
                const { MultiAgentService } = await import('@/lib/multi-agent-service');
                const multiAgentService = new MultiAgentService();

                // Process workflow with multiple agents
                for await (const { workflow, isComplete } of multiAgentService.processWorkflow(userPrompt)) {
                    // Update or add agent messages
                    setMessages(prev => {
                        const newMessages = [...prev];

                        // Remove existing agent messages for this workflow
                        const filteredMessages = newMessages.filter(m =>
                            !(m.type === 'agent' && m.id.startsWith(workflow.id))
                        );

                        // Add current agent messages
                        const agentMessages: Message[] = workflow.agents.map(agent => ({
                            id: `${workflow.id}_${agent.id}`,
                            type: 'agent' as const,
                            content: agent.output || '',
                            timestamp: agent.timestamp,
                            agentType: agent.type,
                            agentStatus: agent.status,
                            files: agent.files
                        }));

                        return [...filteredMessages, ...agentMessages];
                    });

                    if (isComplete && workflow.finalResult) {
                        // Create and set the project
                        const project: AppProject = {
                            id: workflow.id,
                            name: workflow.finalResult.title,
                            description: `Landing page generated from: ${userPrompt}`,
                            files: workflow.finalResult.files,
                            preview: workflow.finalResult.preview,
                            status: 'ready'
                        };
                        setCurrentProject(project);
                        setActiveTab('preview');
                    }
                }
            } else {
                // Use regular AI service for other requests
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

        // Always use continueConversation which now has multi-agent logic
        await continueConversation(userPrompt);
    };

    // Always show split layout
    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden transition-all duration-700 ease-in-out">
            {/* Fixed Header */}
            <div className="flex-none w-full p-3 border-b border-white/10 bg-white/5 backdrop-blur-xl z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-white">Voltaic</h1>
                            <span className="text-white/60 text-xs">AI App Generator</span>
                        </div>
                    </div>

                    {/* Code/Preview Toggle - Only show when project exists */}
                    {currentProject && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${activeTab === 'code'
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                Code
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-2 py-1 text-xs rounded-md transition-colors ${activeTab === 'preview'
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                Preview
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area - Fixed Height */}
            <div className="flex flex-1 min-h-0 relative">
                {/* Chat Panel Container - Fixed Width and Height */}
                <div className="w-[28%] flex flex-col bg-white/2 rounded-br-2xl relative overflow-hidden">
                    <div className="flex-1 min-h-0">
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
                    </div>

                    {/* Fixed Floating Input */}
                    <div className="absolute bottom-0 left-0 right-0 z-10">
                        <FloatingInput
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onSubmit={handleSubmit}
                            isGenerating={isGenerating}
                            placeholder={currentProject ? "Tell me what you'd like to add or change..." : "What amazing app would you like me to build for you?"}
                            currentProject={currentProject}
                        />
                    </div>
                </div>

                {/* Vertical Separator */}
                <div className="absolute left-[28%] top-0 bottom-0 w-px bg-white/10 z-20">
                </div>

                {/* Preview Panel Container - Fixed Width and Height */}
                <div className="w-[72%] flex flex-col min-h-0 overflow-hidden">
                    <PreviewPanel
                        previewLoading={previewLoading}
                        previewReady={previewReady}
                        currentProject={currentProject}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        showSuggestions={showSuggestions}
                        onSuggestionClick={handleSuggestionClick}
                    />
                </div>
            </div>
        </div>
    );
} 