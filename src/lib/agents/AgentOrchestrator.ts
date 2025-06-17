import { AgentWorkflow, AgentCard, AgentType } from '../../components/ai/types';
import { BaseAgent } from './base-agent';
import { Workflow, AgentContext, AgentResponse, AgentEvent } from '../../types/agent';

export class AgentOrchestrator {
    private eventListeners: ((event: AgentEvent) => void)[] = [];
    private agents: Map<string, BaseAgent> = new Map();

    constructor() {
        // Initialize agents
        // Note: Actual agent initialization would happen here
    }

    addEventListener(listener: (event: AgentEvent) => void): void {
        this.eventListeners.push(listener);
    }

    removeEventListener(listener: (event: AgentEvent) => void): void {
        const index = this.eventListeners.indexOf(listener);
        if (index > -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    private emitEvent(event: AgentEvent): void {
        this.eventListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    createMVPGenerationWorkflow(userIdea: string): Workflow {
        const workflowId = `workflow-${Date.now()}`;
        return {
            id: workflowId,
            name: 'MVP Generation Workflow',
            description: `Generate MVP for: ${userIdea}`,
            steps: [
                {
                    id: 'step-1',
                    agentId: 'idea-enhancer',
                    name: 'Enhance Idea',
                    description: 'Enhance and refine the user idea',
                    inputs: { userIdea },
                    status: 'pending'
                },
                {
                    id: 'step-2',
                    agentId: 'wireframe-generator',
                    name: 'Generate Wireframes',
                    description: 'Create wireframes and architecture',
                    inputs: {},
                    status: 'pending',
                    dependencies: ['step-1']
                },
                {
                    id: 'step-3',
                    agentId: 'code-generator',
                    name: 'Generate Code',
                    description: 'Generate the application code',
                    inputs: {},
                    status: 'pending',
                    dependencies: ['step-2']
                }
            ],
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    async executeWorkflow(workflow: Workflow): Promise<AgentResponse> {
        this.emitEvent({
            type: 'workflow.started',
            workflowId: workflow.id
        });

        try {
            // Execute workflow steps
            for (const step of workflow.steps) {
                step.status = 'running';

                // Simulate step execution
                await new Promise(resolve => setTimeout(resolve, 100));

                step.status = 'completed';

                this.emitEvent({
                    type: 'workflow.step.completed',
                    workflowId: workflow.id,
                    stepId: step.id
                });
            }

            workflow.status = 'completed';
            workflow.updatedAt = new Date();

            this.emitEvent({
                type: 'workflow.completed',
                workflowId: workflow.id
            });

            return {
                success: true,
                content: 'Workflow completed successfully',
                artifacts: [],
                metadata: { workflowId: workflow.id }
            };
        } catch (error) {
            workflow.status = 'failed';
            const agentError = {
                code: 'WORKFLOW_EXECUTION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                recoverable: true
            };

            this.emitEvent({
                type: 'workflow.failed',
                workflowId: workflow.id,
                error: agentError
            });

            return {
                success: false,
                error: agentError
            };
        }
    }

    destroy(): void {
        this.eventListeners = [];
        this.agents.clear();
    }
} 