'use client';

import { AgentWorkflow } from './types';
import { CleanAgentCard } from './CleanAgentCard';
import { CheckCircle2, Clock } from 'lucide-react';

interface WorkflowVisualizationProps {
    workflow: AgentWorkflow;
}

export function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
    // Filter out enthusiasm agent for counts (it's shown as chat message)
    const visibleAgents = workflow.agents.filter(a => a.type !== 'enthusiasm' && a.status !== 'hidden');
    const completedAgents = visibleAgents.filter(a => a.status === 'completed').length;
    const totalVisibleAgents = visibleAgents.length;
    const currentActiveAgent = workflow.agents.find(a => a.status === 'working' || a.status === 'thinking');

    return (
        <div className="space-y-4 w-full max-w-full overflow-hidden">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-white/70">
                    {workflow.isComplete ? (
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-medium">Workflow Complete!</span>
                        </div>
                    ) : currentActiveAgent ? (
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                            <span className="text-blue-400 font-medium">
                                {Boolean(currentActiveAgent.streaming) ? 'Streaming response...' : 'Building your app step by step...'}
                            </span>
                        </div>
                    ) : totalVisibleAgents > 0 ? (
                        'Building your app step by step...'
                    ) : (
                        <span className="text-white/50">Preparing agents...</span>
                    )}
                </div>
                <div className="text-xs text-white/50 font-mono">
                    {completedAgents}/{workflow.agents.filter(a => a.type !== 'enthusiasm').length} completed
                </div>
            </div>

            {/* Agent Pipeline - Using predefined stable order */}
            <div className="space-y-3 w-full max-w-full">
                {/* Define stable agent order to prevent React reordering */}
                {['title-generator', 'analyzer', 'coder', 'error-recovery', 'preview'].map((agentType, stableIndex) => {
                    const agent = workflow.agents.find(a => a.type === agentType);

                    // If agent doesn't exist for this type, don't render anything
                    if (!agent) return null;

                    // Get original index for workflow logic compatibility
                    const originalIndex = workflow.agents.indexOf(agent);

                    const isActive = !workflow.isComplete &&
                        (workflow.currentAgentIndex === originalIndex ||
                            agent.status === 'working' ||
                            agent.status === 'thinking' ||
                            Boolean(agent.streaming));

                    const isWaiting = agent.status === 'pending' ||
                        agent.status === 'thinking' ||
                        (agent.status === 'working' && !agent.streaming);

                    // Use visibility instead of conditional rendering to maintain DOM order
                    const isVisible = agent.status !== 'hidden';

                    return (
                        <div
                            key={`stable-${agentType}-${stableIndex}`} // Completely stable key based on type
                            data-agent-type={agentType}
                            data-stable-index={stableIndex}
                            data-original-index={originalIndex}
                            className={`transition-all duration-500 ease-out ${isVisible
                                ? 'opacity-100 transform translate-x-0 scale-100 max-h-32'
                                : 'opacity-0 transform translate-x-8 scale-95 max-h-0 overflow-hidden'
                                }`}
                            style={{
                                transitionDelay: isVisible ? `${stableIndex * 150}ms` : '0ms'
                            }}
                        >
                            <CleanAgentCard
                                agent={agent}
                                isActive={isActive}
                                showLoadingIcon={isWaiting && isActive}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Final Completion Status */}
            {workflow.isComplete && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-xl animate-fadeInUp">
                    <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        <div>
                            <h4 className="text-white font-medium text-sm">Your app is ready!</h4>
                            <p className="text-white/60 text-xs">
                                All agents have completed their tasks successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 