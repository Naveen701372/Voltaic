'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, FileText, Code, FolderOpen, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { StreamingTextEffect } from '../ui/streaming-text-effect';

interface AgentStep {
    id: string;
    name: string;
    icon: React.ReactNode;
    provider: string;
    status: 'waiting' | 'active' | 'completed' | 'error';
    output?: string;
    progress?: number;
    result?: any;
}

const AGENT_STEPS: AgentStep[] = [
    {
        id: 'idea-enhancer',
        name: 'Idea Enhancement',
        icon: <Brain className="w-6 h-6" />,
        provider: 'OpenAI GPT-4',
        status: 'waiting'
    },
    {
        id: 'wireframe-generator',
        name: 'Wireframe Generation',
        icon: <FileText className="w-6 h-6" />,
        provider: 'Claude Sonnet',
        status: 'waiting'
    },
    {
        id: 'code-generator',
        name: 'Code Generation',
        icon: <Code className="w-6 h-6" />,
        provider: 'Claude Sonnet',
        status: 'waiting'
    },
    {
        id: 'file-system',
        name: 'File Organization',
        icon: <FolderOpen className="w-6 h-6" />,
        provider: 'Custom Logic',
        status: 'waiting'
    },
    {
        id: 'preview-setup',
        name: 'Preview Setup',
        icon: <Eye className="w-6 h-6" />,
        provider: 'Custom Logic',
        status: 'waiting'
    }
];

const SUGGESTIONS = [
    "A task management app with team collaboration",
    "An e-commerce platform for handmade crafts",
    "A fitness tracking app with social features",
    "A recipe sharing platform with meal planning"
];

export function StreamingPromptInterface() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [agents, setAgents] = useState<AgentStep[]>(AGENT_STEPS);
    const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
    const [selectedAgentIndex, setSelectedAgentIndex] = useState(-1);
    const [streamingOutput, setStreamingOutput] = useState('');
    const [agentOutputs, setAgentOutputs] = useState<Record<string, string>>({});
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setActiveAgentIndex(-1);
        setSelectedAgentIndex(-1);
        setStreamingOutput('');
        setAgentOutputs({});

        // Reset all agents to waiting
        setAgents(prev => prev.map(agent => ({ ...agent, status: 'waiting' as const, output: '', progress: 0, result: undefined })));

        try {
            // Start the streaming generation with fetch
            const response = await fetch('/api/ai/stream-generation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdea: prompt })
            });

            if (!response.ok) {
                throw new Error('Failed to start generation');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        const eventType = line.substring(7);
                        console.log('📨 [UI] Event type:', eventType);
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            console.log('📨 [UI] Received data:', data);

                            // Handle different event types based on the data structure
                            if (data.agentId && data.name && !data.content) {
                                console.log('🚀 [UI] Agent start:', data);
                                handleAgentStart(data);
                            } else if (data.agentId && data.content) {
                                console.log('📤 [UI] Agent stream:', data.agentId, 'Content length:', data.fullContent?.length);
                                handleAgentStream(data);
                            } else if (data.agentId && data.result) {
                                console.log('✅ [UI] Agent complete:', data.agentId);
                                handleAgentComplete(data);
                            } else if (data.message && data.totalAgents) {
                                console.log('🎉 [UI] Generation complete');
                                handleGenerationComplete();
                            } else if (data.message && !data.totalAgents) {
                                console.log('❌ [UI] Error:', data.message);
                                handleError(data);
                            } else {
                                console.log('❓ [UI] Unknown data format:', data);
                            }
                        } catch (error) {
                            console.error('Failed to parse SSE data:', error, 'Line:', line);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Generation failed:', error);
            setIsGenerating(false);
        }
    };

    const handleStreamEvent = (type: string, data: any) => {
        console.log('Stream event:', type, data);
    };

    const handleAgentStart = (data: { agentId: string; name: string; provider: string }) => {
        console.log('🚀 [UI] handleAgentStart called with:', data);
        const agentIndex = agents.findIndex(agent => agent.id === data.agentId);
        console.log('🔍 [UI] Agent index found:', agentIndex);

        if (agentIndex !== -1) {
            setActiveAgentIndex(agentIndex);
            setSelectedAgentIndex(agentIndex);
            // Don't reset streamingOutput immediately - let it be set by the first stream event
            // setStreamingOutput('');

            setAgents(prev => prev.map((agent, index) => ({
                ...agent,
                status: index === agentIndex ? 'active' as const :
                    index < agentIndex ? 'completed' as const : 'waiting' as const,
                progress: index === agentIndex ? 0 : agent.progress
            })));

            console.log('✅ [UI] Agent started successfully:', data.agentId);
        } else {
            console.error('❌ [UI] Agent not found:', data.agentId);
        }
    };

    const handleAgentStream = (data: { agentId: string; content: string; fullContent: string }) => {
        console.log('📤 [UI] handleAgentStream called:', data.agentId, 'Full content length:', data.fullContent?.length);

        // Only update streamingOutput if this is the currently active agent
        const currentActiveAgent = agents[activeAgentIndex];
        if (currentActiveAgent && currentActiveAgent.id === data.agentId) {
            setStreamingOutput(data.fullContent);
        }

        // Store the output for this specific agent
        setAgentOutputs(prev => {
            const updated = {
                ...prev,
                [data.agentId]: data.fullContent
            };
            console.log('💾 [UI] Updated agentOutputs for', data.agentId, ':', updated[data.agentId]?.substring(0, 100) + '...');
            return updated;
        });

        // Update progress based on content length (rough estimate)
        const progress = Math.min(95, (data.fullContent.length / 1000) * 100);

        setAgents(prev => prev.map(agent =>
            agent.id === data.agentId ? { ...agent, progress } : agent
        ));
    };

    const handleAgentComplete = (data: { agentId: string; result: any }) => {
        console.log('✅ [UI] handleAgentComplete called:', data.agentId);

        // Use the callback form to get the current agentOutputs state
        setAgentOutputs(currentOutputs => {
            console.log('🔍 [UI] Current agentOutputs in callback:', Object.keys(currentOutputs));

            // Get the final output for this agent from current state
            const finalOutput = currentOutputs[data.agentId] || streamingOutput;
            console.log('📝 [UI] Final output for', data.agentId, ':', finalOutput?.substring(0, 100) + '...');

            setAgents(prev => prev.map(agent =>
                agent.id === data.agentId ? {
                    ...agent,
                    status: 'completed' as const,
                    progress: 100,
                    output: finalOutput,
                    result: data.result
                } : agent
            ));

            console.log('✅ [UI] Agent completed successfully:', data.agentId);

            // Return the current outputs unchanged
            return currentOutputs;
        });
    };

    const handleGenerationComplete = () => {
        setIsGenerating(false);
        setActiveAgentIndex(-1);
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    const handleError = (data: { message: string }) => {
        console.error('Generation error:', data.message);
        setIsGenerating(false);
        setActiveAgentIndex(-1);

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    const handleAgentClick = (index: number) => {
        const agent = agents[index];
        // Allow clicking on active or completed agents
        if (agent.status === 'active' || agent.status === 'completed') {
            setSelectedAgentIndex(index);
        }
    };

    const formatAgentOutput = (agent: AgentStep) => {
        console.log('🖼️ [UI] formatAgentOutput called for:', agent.id);
        console.log('🔍 [UI] Agent output:', agent.output?.substring(0, 100) + '...');
        console.log('🔍 [UI] Agent result:', agent.result ? 'Present' : 'Not present');
        console.log('🔍 [UI] Agent status:', agent.status);
        console.log('🔍 [UI] AgentOutputs for', agent.id, ':', agentOutputs[agent.id]?.substring(0, 100) + '...');

        // Check for live streaming data first (for active agents)
        const liveOutput = agentOutputs[agent.id];
        if (liveOutput) {
            console.log('✅ [UI] Showing live streaming output for:', agent.id);
            return liveOutput;
        }

        // Check for completed agent output
        if (agent.output) {
            console.log('✅ [UI] Showing agent output for:', agent.id);
            return agent.output;
        }

        // Show the raw result from the API
        if (agent.result) {
            console.log('✅ [UI] Showing agent result for:', agent.id);
            return `Raw API Result:
${JSON.stringify(agent.result, null, 2)}`;
        }

        console.log('❌ [UI] No data available for:', agent.id);
        return 'No output available';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const getStatusColor = (status: AgentStep['status']) => {
        switch (status) {
            case 'active': return 'border-blue-400 bg-blue-500/20';
            case 'completed': return 'border-green-400 bg-green-500/20';
            case 'error': return 'border-red-400 bg-red-500/20';
            default: return 'border-white/20 bg-white/5';
        }
    };

    const getStatusIcon = (status: AgentStep['status']) => {
        switch (status) {
            case 'active': return <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />;
            case 'completed': return <div className="w-4 h-4 rounded-full bg-green-400" />;
            case 'error': return <div className="w-4 h-4 rounded-full bg-red-400" />;
            default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
        }
    };

    const currentAgent = selectedAgentIndex >= 0 ? agents[selectedAgentIndex] : null;
    const showingActiveAgent = selectedAgentIndex === activeAgentIndex;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative">
            {/* Left Sidebar - Fixed */}
            <div className="w-80 p-6 border-r border-white/10 fixed left-0 top-0 h-full overflow-y-auto z-10">
                <h2 className="text-xl font-semibold text-white mb-6">AI Agents</h2>
                <div className="space-y-4">
                    {agents.map((agent, index) => {
                        const isClickable = agent.status === 'active' || agent.status === 'completed';
                        const isSelected = index === selectedAgentIndex;
                        const isActive = index === activeAgentIndex;

                        return (
                            <div
                                key={agent.id}
                                onClick={() => handleAgentClick(index)}
                                className={`p-4 rounded-xl border transition-all duration-500 ${getStatusColor(agent.status)} ${isActive ? 'scale-105 shadow-lg' : ''
                                    } ${isSelected ? 'ring-2 ring-blue-400' : ''
                                    } ${isClickable
                                        ? 'cursor-pointer hover:scale-102 hover:shadow-md hover:border-opacity-80'
                                        : 'cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        {agent.icon}
                                        <div>
                                            <h3 className="font-medium text-white">{agent.name}</h3>
                                            <p className="text-xs text-gray-400">{agent.provider}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(agent.status)}
                                        {isClickable && (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {agent.progress !== undefined && agent.progress > 0 && (
                                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${agent.progress}%` }}
                                        />
                                    </div>
                                )}

                                {agent.status === 'completed' && (agent.output || agentOutputs[agent.id]) && (
                                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300 max-h-20 overflow-hidden">
                                        {(agent.output || agentOutputs[agent.id] || '').substring(0, 100)}...
                                        <div className="text-blue-400 mt-1">Click to view full output →</div>
                                    </div>
                                )}

                                {agent.status === 'active' && (
                                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                                            <span>Currently working...</span>
                                        </div>
                                        <div className="text-blue-400 mt-1">Click to view live output →</div>
                                    </div>
                                )}

                                {agent.status === 'waiting' && (
                                    <div className="mt-2 p-2 bg-black/20 rounded text-xs text-gray-500">
                                        Waiting to start...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 ml-80 flex flex-col pb-32 relative">
                {/* Blur overlay for content behind floating input */}
                <div className="fixed bottom-0 left-80 right-0 h-32 bg-gradient-to-t from-slate-900/20 to-transparent backdrop-blur-sm pointer-events-none z-10"></div>
                {/* Header */}
                {!isGenerating && !currentAgent && (
                    <div className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto mb-8 text-center">
                            <h1 className="text-4xl font-bold text-white mb-4">What would you like to build?</h1>
                            <p className="text-gray-300 mb-8">Describe your app idea and watch our AI agents bring it to life</p>

                            <div className="flex flex-wrap justify-center gap-3 mb-8">
                                {SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all duration-200 border border-white/20 hover:border-white/30"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Agent Output Display - Scrollable */}
                {currentAgent && (
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    {currentAgent.icon}
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{currentAgent.name}</h2>
                                        <p className="text-gray-400">{currentAgent.provider}</p>
                                    </div>
                                    {showingActiveAgent && currentAgent.status === 'active' && (
                                        <Sparkles className="w-6 h-6 text-blue-400 animate-pulse ml-auto" />
                                    )}
                                    {currentAgent.status === 'completed' && (
                                        <div className="ml-auto flex items-center gap-2 text-green-400">
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                            <span className="text-sm">Completed</span>
                                        </div>
                                    )}
                                </div>

                                {currentAgent.progress !== undefined && showingActiveAgent && (
                                    <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                                        <div
                                            className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${currentAgent.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 min-h-[400px]">
                                <StreamingTextEffect
                                    text={formatAgentOutput(currentAgent)}
                                    isStreaming={showingActiveAgent && currentAgent.status === 'active'}
                                    className="text-gray-300 leading-relaxed"
                                    duration={0.2}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Generation in progress but no agent selected - Scrollable */}
                {isGenerating && !currentAgent && (
                    <div className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="mb-8">
                                <Sparkles className="w-16 h-16 text-blue-400 animate-pulse mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-4">AI Agents are Working</h2>
                                <p className="text-gray-300 mb-8">Click on any active or completed agent in the sidebar to view their output</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Input Area - Fixed at bottom */}
            <div className="fixed bottom-0 left-80 right-0 p-6 z-20">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden hover:shadow-purple-500/20 transition-all duration-300">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your app idea in detail..."
                                    className="w-full resize-none bg-transparent px-6 py-4 text-white placeholder-gray-400 focus:outline-none min-h-[60px] max-h-[120px] focus:placeholder-gray-300 transition-all duration-200"
                                    rows={2}
                                    disabled={isGenerating}
                                />
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className="absolute right-3 bottom-3 p-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 