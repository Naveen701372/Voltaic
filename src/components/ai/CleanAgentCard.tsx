'use client';

import { AgentCard } from './types';
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';

interface CleanAgentCardProps {
    agent: AgentCard;
    isActive: boolean;
    showLoadingIcon?: boolean;
}

export function CleanAgentCard({ agent, isActive, showLoadingIcon = false }: CleanAgentCardProps) {
    const getStatusIcon = () => {
        // Show loading icon when explicitly requested or when working/thinking
        if (showLoadingIcon || agent.status === 'working' || agent.status === 'thinking') {
            return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
        }

        switch (agent.status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-purple-400" />;
            case 'pending':
                return <Circle className="w-4 h-4 text-yellow-400" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Circle className="w-4 h-4 text-white/40" />;
        }
    };

    const getStatusColor = () => {
        switch (agent.status) {
            case 'completed':
                return 'border-purple-400/30 bg-purple-400/10';
            case 'working':
            case 'thinking':
                return 'border-blue-400/30 bg-blue-400/10';
            case 'pending':
                return 'border-yellow-400/30 bg-yellow-400/10';
            case 'error':
                return 'border-red-400/30 bg-red-400/10';
            default:
                return 'border-white/20 bg-white/5';
        }
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return '';
        if (ms < 1000) return `${ms}ms`;
        const seconds = (ms / 1000).toFixed(1);
        return `${seconds}s`;
    };

    const getDisplayText = () => {
        if (agent.status === 'completed' && agent.duration) {
            return `Completed in ${formatDuration(agent.duration)}`;
        }
        if (agent.currentStep && (agent.status === 'working' || agent.status === 'thinking')) {
            return agent.currentStep;
        }
        if (agent.status === 'error' && agent.output) {
            return agent.output;
        }
        if (agent.status === 'pending') {
            return 'Waiting to start...';
        }
        return agent.description;
    };

    // Show outputs for agents that generate visible content
    const shouldShowOutput = agent.type === 'title-generator' || agent.type === 'analyzer';

    return (
        <div className={`
            relative p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 w-full max-w-full overflow-hidden
            ${getStatusColor()}
            ${isActive ? 'ring-1 ring-white/20 shadow-lg' : ''}
        `}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0">
                    {getStatusIcon()}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                    <span className="text-white font-medium text-sm truncate block">
                        {agent.name}
                    </span>
                    <p className="text-white/60 text-xs break-words line-clamp-2 leading-tight">
                        {getDisplayText()}
                    </p>
                </div>
                {agent.progress !== undefined && agent.status === 'working' && (
                    <div className="text-xs text-blue-400 font-mono">
                        {agent.progress}%
                    </div>
                )}
            </div>

            {/* Progress bar for working agents */}
            {agent.status === 'working' && agent.progress !== undefined && (
                <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                    <div
                        className="bg-blue-400 h-1 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${agent.progress}%` }}
                    />
                </div>
            )}

            {/* Streaming indicator */}
            {agent.streaming && shouldShowOutput && (
                <div className="mt-2 flex items-center text-xs text-blue-400">
                    <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="ml-2">Generating response...</span>
                </div>
            )}

            {/* Show streaming output for applicable agents */}
            {shouldShowOutput && agent.streaming && agent.output && (
                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-400/20 rounded-lg text-xs text-blue-200 animate-pulse overflow-hidden">
                    <div className="font-mono break-words line-clamp-3 leading-tight">
                        {agent.output.length > 120 ? `${agent.output.substring(0, 120)}...` : agent.output}
                        <span className="inline-block w-1 h-3 bg-blue-400 ml-1 animate-pulse"></span>
                    </div>
                </div>
            )}

            {/* Show final output for completed agents */}
            {shouldShowOutput && agent.status === 'completed' && agent.output && !agent.streaming && (
                <div className="mt-2 p-2 bg-purple-500/10 border border-purple-400/20 rounded-lg text-xs text-purple-200 overflow-hidden">
                    <div className="font-mono break-words line-clamp-3 leading-tight">
                        {agent.output.length > 120 ? `${agent.output.substring(0, 120)}...` : agent.output}
                    </div>
                </div>
            )}

            {/* Error display */}
            {agent.status === 'error' && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-400/20 rounded-lg text-xs text-red-200 overflow-hidden">
                    <div className="break-words line-clamp-2 leading-tight">
                        {agent.output || 'An error occurred'}
                    </div>
                </div>
            )}

            {/* File count for coder agent */}
            {agent.type === 'coder' && agent.files && agent.files.length > 0 && agent.status === 'completed' && (
                <div className="mt-2 text-xs text-green-400">
                    ✅ Generated {agent.files.length} files
                </div>
            )}
        </div>
    );
} 