'use client';

import React, { useState, useEffect } from 'react';
import { Send, Brain, Sparkles, FileText, Code, Folder, Eye } from 'lucide-react';
import { useAgentStore } from '@/lib/stores/agentStore';
import { logger } from '@/lib/utils/logger';

interface AgentStep {
    id: string;
    name: string;
    icon: React.ReactNode;
    status: 'pending' | 'thinking' | 'completed' | 'error';
    output?: string;
    artifacts?: any[];
    provider: string;
}

export const CleanPromptInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
    const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);

    // Store selectors
    const generateMVP = useAgentStore((state) => state.generateMVP);
    const workflows = useAgentStore((state) => state.workflows);
    const activeWorkflowId = useAgentStore((state) => state.activeWorkflowId);

    // Initialize agent steps
    const initializeAgentSteps = () => {
        const steps: AgentStep[] = [
            {
                id: 'idea-enhancer',
                name: 'Idea Enhancement',
                icon: <Brain className="w-5 h-5" />,
                status: 'pending',
                provider: 'OpenAI GPT-4'
            },
            {
                id: 'wireframe-generator',
                name: 'Wireframe Generation',
                icon: <FileText className="w-5 h-5" />,
                status: 'pending',
                provider: 'Claude Sonnet'
            },
            {
                id: 'code-generator',
                name: 'Code Generation',
                icon: <Code className="w-5 h-5" />,
                status: 'pending',
                provider: 'Claude Sonnet'
            },
            {
                id: 'file-system',
                name: 'File Organization',
                icon: <Folder className="w-5 h-5" />,
                status: 'pending',
                provider: 'Custom Logic'
            },
            {
                id: 'preview',
                name: 'Preview Setup',
                icon: <Eye className="w-5 h-5" />,
                status: 'pending',
                provider: 'Custom Logic'
            }
        ];
        setAgentSteps(steps);
        setCurrentAgentIndex(-1);
    };

    // Monitor workflow progress and capture outputs
    useEffect(() => {
        if (activeWorkflowId && workflows[activeWorkflowId]) {
            const workflow = workflows[activeWorkflowId];

            // Update agent steps based on workflow step status
            setAgentSteps(prevSteps =>
                prevSteps.map((step, index) => {
                    const workflowStep = workflow.steps.find(ws => ws.agentId === step.id);
                    if (workflowStep) {
                        let status: AgentStep['status'] = 'pending';
                        let output = step.output; // Keep existing output

                        switch (workflowStep.status) {
                            case 'running':
                                status = 'thinking';
                                setCurrentAgentIndex(index);
                                output = `${step.name} is analyzing and processing...`;
                                break;
                            case 'completed':
                                status = 'completed';
                                // Generate output summary based on agent type
                                output = generateOutputSummary(step.id, workflowStep);
                                // Move to next agent
                                if (index < prevSteps.length - 1) {
                                    setTimeout(() => setCurrentAgentIndex(index + 1), 1000);
                                }
                                break;
                            case 'failed':
                                status = 'error';
                                output = 'Failed to complete this step. Please try again.';
                                break;
                        }

                        return { ...step, status, output };
                    }
                    return step;
                })
            );
        }
    }, [workflows, activeWorkflowId]);

    // Generate output summary for each agent
    const generateOutputSummary = (agentId: string, workflowStep: any): string => {
        switch (agentId) {
            case 'idea-enhancer':
                return '🎯 Analyzed your idea and created a comprehensive specification with features, user stories, tech stack recommendations, and database schema. Ready for wireframe generation.';
            case 'wireframe-generator':
                return '📐 Generated detailed Mermaid diagrams including user flow, system architecture, database relationships, and component hierarchy. Visual blueprints are ready for development.';
            case 'code-generator':
                return '💻 Created complete React/Next.js application with components, pages, API routes, and styling. All code follows modern best practices and is production-ready.';
            case 'file-system':
                return '📁 Organized all generated files into proper project structure with appropriate directories, naming conventions, and file relationships.';
            case 'preview':
                return '👀 Configured preview environment with hot reload, development server settings, and real-time update capabilities for immediate testing.';
            default:
                return '✅ Task completed successfully and ready for the next step.';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim() || isGenerating) return;

        logger.info('CleanPromptInterface', `Starting MVP generation: ${prompt.trim()}`);

        setIsGenerating(true);
        initializeAgentSteps();

        try {
            await generateMVP(prompt.trim());
            logger.info('CleanPromptInterface', 'MVP generation completed');
        } catch (error) {
            logger.error('CleanPromptInterface', 'MVP generation failed', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const suggestions = [
        "A task management app with team collaboration",
        "An e-commerce platform for handmade crafts",
        "A fitness tracking app with social features",
        "A recipe sharing platform with meal planning"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Suggestions at top */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8">
                {!isGenerating && agentSteps.length === 0 && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-4xl font-bold text-white text-center mb-4">
                            What would you like to build?
                        </h1>
                        <p className="text-gray-300 text-center mb-8">
                            Describe your app idea and watch our AI agents bring it to life
                        </p>

                        {/* Suggestion Pills */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPrompt(suggestion)}
                                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 
                           text-white text-sm transition-all duration-200
                           border border-white/20 hover:border-white/30"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agent Progress Display */}
                {agentSteps.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="space-y-4">
                            {agentSteps.map((step, index) => (
                                <AgentStepCard
                                    key={step.id}
                                    step={step}
                                    isActive={index === currentAgentIndex}
                                    isCompleted={step.status === 'completed'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Input at bottom */}
            <div className="sticky bottom-0 p-6">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            {/* Glass Input Box */}
                            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 
                            rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your app idea in detail..."
                                    disabled={isGenerating}
                                    className="w-full resize-none bg-transparent px-6 py-4 text-white 
                           placeholder-gray-400 focus:outline-none min-h-[60px] max-h-[120px]"
                                    rows={2}
                                />

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className="absolute right-3 bottom-3 p-2 rounded-xl
                           bg-gradient-to-r from-purple-600 to-blue-600
                           text-white hover:from-purple-700 hover:to-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 hover:scale-105"
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
};

// Agent Step Card Component
interface AgentStepCardProps {
    step: AgentStep;
    isActive: boolean;
    isCompleted: boolean;
}

const AgentStepCard: React.FC<AgentStepCardProps> = ({ step, isActive, isCompleted }) => {
    return (
        <div className={`
      relative backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500
      ${isActive
                ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20'
                : isCompleted
                    ? 'bg-green-500/10 border-green-400/30'
                    : 'bg-white/5 border-white/10'
            }
    `}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
          p-3 rounded-xl transition-all duration-300
          ${isActive
                        ? 'bg-purple-500 text-white animate-pulse'
                        : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-gray-400'
                    }
        `}>
                    {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold ${isActive || isCompleted ? 'text-white' : 'text-gray-300'}`}>
                            {step.name}
                        </h3>

                        {/* Provider Badge */}
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${step.provider.includes('OpenAI')
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : step.provider.includes('Claude')
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }
                        `}>
                            {step.provider}
                        </span>

                        {/* Status Indicator */}
                        {step.status === 'thinking' && (
                            <div className="flex items-center gap-2 text-purple-400">
                                <Sparkles className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                            </div>
                        )}

                        {step.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Completed</span>
                            </div>
                        )}
                    </div>

                    {/* Output Preview */}
                    {step.output && (
                        <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/10">
                            <p className="text-gray-300 text-sm">{step.output}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 