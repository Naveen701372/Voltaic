'use client';

import React from 'react';
import { Loader2, CheckCircle, XCircle, Sparkles, Search, Type, Code, Eye } from 'lucide-react';
import { AgentCard as AgentCardType, AgentType, AgentStatus } from './types';

interface AgentCardProps {
    agent: AgentCardType;
}

const getAgentIcon = (type: AgentType) => {
    switch (type) {
        case 'enthusiasm':
            return Sparkles;
        case 'title-generator':
            return Type;
        case 'analyzer':
            return Search;
        case 'coder':
            return Code;
        case 'preview':
            return Eye;
        default:
            return Sparkles;
    }
};

const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
        case 'thinking':
        case 'working':
            return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4 text-green-400" />;
        case 'error':
            return <XCircle className="w-4 h-4 text-red-400" />;
        default:
            return <div className="w-4 h-4 rounded-full bg-white/20" />;
    }
};

const getStatusColor = (status: AgentStatus) => {
    switch (status) {
        case 'thinking':
        case 'working':
            return 'text-blue-400';
        case 'completed':
            return 'text-green-400';
        case 'error':
            return 'text-red-400';
        default:
            return 'text-white/40';
    }
};

export function AgentCard({ agent }: AgentCardProps) {
    const AgentIcon = getAgentIcon(agent.type);
    const statusIcon = getStatusIcon(agent.status);
    const statusColor = getStatusColor(agent.status);

    return (
        <div className="flex justify-start mb-4">
            <div className={`group relative max-w-[80%] bg-white/10 border-white/20 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 ${agent.status === 'completed' ? 'bg-green-500/10 border-green-400/30' :
                agent.status === 'error' ? 'bg-red-500/10 border-red-400/30' :
                    agent.status === 'thinking' || agent.status === 'working' ? 'bg-blue-500/10 border-blue-400/30' :
                        'bg-white/10 border-white/20'
                }`}>
                {/* Agent header */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/10 border border-white/20`}>
                        <AgentIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {statusIcon}
                            <span className={`font-medium text-sm ${statusColor}`}>
                                {agent.name}
                            </span>
                        </div>
                        <p className="text-white/60 text-xs">{agent.description}</p>
                    </div>
                </div>

                {/* Agent output */}
                {agent.output && (
                    <div className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                        {agent.output}
                    </div>
                )}

                {/* Loading state for thinking/working */}
                {(agent.status === 'thinking' || agent.status === 'working') && !agent.output && (
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex space-x-1 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 text-sm">
                            {agent.status === 'thinking' ? 'Thinking...' : 'Working...'}
                        </span>
                    </div>
                )}

                {/* Files generated (for coder agent) */}
                {agent.files && agent.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/70 text-sm mb-2">Generated {agent.files.length} files:</p>
                        <div className="space-y-1">
                            {agent.files.map((file, index) => (
                                <div key={index} className="text-xs text-white/60 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="font-mono">{file.path}</span>
                                    <span className="text-white/40">- {file.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 