import {
    Workflow,
    WorkflowStep,
    AgentContext,
    AgentResponse,
    AgentError,
    AgentEvent,
    DEFAULT_AGENTS
} from '@/types/agent';
import { BaseAgent } from './BaseAgent';
import { AgentRegistry } from './AgentRegistry';

export class AgentOrchestrator {
    private workflows: Map<string, Workflow> = new Map();
    private agentRegistry: AgentRegistry;
    private eventListeners: ((event: AgentEvent) => void)[] = [];

    constructor(agentRegistry?: AgentRegistry) {
        this.agentRegistry = agentRegistry || new AgentRegistry();
    }

    // Workflow management
    async executeWorkflow(workflow: Workflow, context: AgentContext): Promise<AgentResponse> {
        try {
            console.log('🎬 [AgentOrchestrator] Starting workflow execution:', workflow.name);
            console.log('📋 [AgentOrchestrator] Workflow steps:', workflow.steps.map(s => `${s.id}: ${s.name}`));

            this.workflows.set(workflow.id, { ...workflow, status: 'running' });
            this.emitEvent({ type: 'workflow.started', workflowId: workflow.id });

            // Sort steps by dependencies
            console.log('🔄 [AgentOrchestrator] Sorting steps by dependencies...');
            const sortedSteps = this.topologicalSort(workflow.steps);
            console.log('✅ [AgentOrchestrator] Steps sorted:', sortedSteps.map(s => s.id));

            // Execute steps in order
            for (const step of sortedSteps) {
                console.log(`🚀 [AgentOrchestrator] Executing step: ${step.id} (${step.name})`);
                const stepResult = await this.executeStep(step, context, workflow.id);

                if (!stepResult.success) {
                    console.error(`❌ [AgentOrchestrator] Step failed: ${step.id}`, stepResult.error);
                    await this.handleWorkflowFailure(workflow.id, stepResult.error!);
                    return stepResult;
                }

                console.log(`✅ [AgentOrchestrator] Step completed: ${step.id}`);

                // Update context with step outputs
                if (stepResult.artifacts) {
                    console.log(`📦 [AgentOrchestrator] Adding ${stepResult.artifacts.length} artifacts from step ${step.id}`);
                    context.artifacts.push(...stepResult.artifacts);
                }

                this.emitEvent({
                    type: 'workflow.step.completed',
                    workflowId: workflow.id,
                    stepId: step.id
                });
            }

            // Mark workflow as completed
            const completedWorkflow = { ...workflow, status: 'completed' as const };
            this.workflows.set(workflow.id, completedWorkflow);
            this.emitEvent({ type: 'workflow.completed', workflowId: workflow.id });

            console.log('🎉 [AgentOrchestrator] Workflow completed successfully');
            console.log('📊 [AgentOrchestrator] Total artifacts generated:', context.artifacts.length);

            return {
                success: true,
                content: 'Workflow completed successfully',
                artifacts: context.artifacts
            };

        } catch (error) {
            console.error('❌ [AgentOrchestrator] Workflow execution failed:', error);
            const agentError = this.createError(error);
            await this.handleWorkflowFailure(workflow.id, agentError);
            return {
                success: false,
                error: agentError
            };
        }
    }

    private async executeStep(
        step: WorkflowStep,
        context: AgentContext,
        workflowId: string
    ): Promise<AgentResponse> {
        try {
            console.log(`🔧 [AgentOrchestrator] Starting step execution: ${step.id}`);
            console.log(`🤖 [AgentOrchestrator] Looking for agent: ${step.agentId}`);

            // Update step status
            step.status = 'running';

            // Add a small delay to make the sequential execution visible
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get agent for this step
            const agent = this.agentRegistry.getAgent(step.agentId);
            if (!agent) {
                console.error(`❌ [AgentOrchestrator] Agent not found: ${step.agentId}`);
                throw new Error(`Agent not found: ${step.agentId}`);
            }

            console.log(`✅ [AgentOrchestrator] Agent found: ${step.agentId}`);
            console.log(`📝 [AgentOrchestrator] Step inputs:`, step.inputs);

            // Create step-specific context
            const stepContext: AgentContext = {
                ...context,
                state: { ...context.state, ...step.inputs }
            };

            console.log(`⚡ [AgentOrchestrator] Executing agent: ${step.agentId}`);
            // Execute agent
            const result = await agent.run(stepContext);
            console.log(`📊 [AgentOrchestrator] Agent result:`, result);

            if (result.success) {
                step.status = 'completed';
                step.outputs = result.metadata || {};
                console.log(`✅ [AgentOrchestrator] Step ${step.id} completed successfully`);
            } else {
                step.status = 'failed';
                console.error(`❌ [AgentOrchestrator] Step ${step.id} failed:`, result.error);

                // Check if we should retry
                if (this.shouldRetryStep(step, result.error)) {
                    console.log(`🔄 [AgentOrchestrator] Retrying step ${step.id}...`);
                    return await this.retryStep(step, context, workflowId);
                }
            }

            return result;

        } catch (error) {
            console.error(`❌ [AgentOrchestrator] Step execution failed: ${step.id}`, error);
            step.status = 'failed';
            return {
                success: false,
                error: this.createError(error)
            };
        }
    }

    private async retryStep(
        step: WorkflowStep,
        context: AgentContext,
        workflowId: string
    ): Promise<AgentResponse> {
        const maxRetries = step.maxRetries || 3;
        const currentRetries = step.retryCount || 0;

        if (currentRetries >= maxRetries) {
            return {
                success: false,
                error: {
                    code: 'MAX_RETRIES_EXCEEDED',
                    message: `Step ${step.id} failed after ${maxRetries} retries`,
                    recoverable: false
                }
            };
        }

        // Increment retry count
        step.retryCount = currentRetries + 1;

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, currentRetries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the step
        return await this.executeStep(step, context, workflowId);
    }

    private shouldRetryStep(step: WorkflowStep, error?: AgentError): boolean {
        if (!error || !error.recoverable) {
            return false;
        }

        const currentRetries = step.retryCount || 0;
        const maxRetries = step.maxRetries || 3;

        return currentRetries < maxRetries;
    }

    private async handleWorkflowFailure(workflowId: string, error: AgentError): Promise<void> {
        const workflow = this.workflows.get(workflowId);
        if (workflow) {
            workflow.status = 'failed';
            this.workflows.set(workflowId, workflow);
        }

        this.emitEvent({ type: 'workflow.failed', workflowId, error });
    }

    // Dependency resolution using topological sort
    private topologicalSort(steps: WorkflowStep[]): WorkflowStep[] {
        const visited = new Set<string>();
        const visiting = new Set<string>();
        const result: WorkflowStep[] = [];
        const stepMap = new Map(steps.map(step => [step.id, step]));

        const visit = (stepId: string) => {
            if (visiting.has(stepId)) {
                throw new Error(`Circular dependency detected involving step: ${stepId}`);
            }

            if (visited.has(stepId)) {
                return;
            }

            const step = stepMap.get(stepId);
            if (!step) {
                throw new Error(`Step not found: ${stepId}`);
            }

            visiting.add(stepId);

            // Visit dependencies first
            if (step.dependencies) {
                for (const depId of step.dependencies) {
                    visit(depId);
                }
            }

            visiting.delete(stepId);
            visited.add(stepId);
            result.push(step);
        };

        // Visit all steps
        for (const step of steps) {
            if (!visited.has(step.id)) {
                visit(step.id);
            }
        }

        return result;
    }

    // Workflow creation helpers
    createWorkflow(
        name: string,
        description: string,
        steps: Omit<WorkflowStep, 'status'>[]
    ): Workflow {
        return {
            id: this.generateId(),
            name,
            description,
            steps: steps.map(step => ({ ...step, status: 'pending' })),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    // Predefined workflows
    createMVPGenerationWorkflow(userIdea: string): Workflow {
        return this.createWorkflow(
            'MVP Generation',
            'Complete MVP generation from user idea to deployable code',
            [
                {
                    id: 'enhance-idea',
                    agentId: 'idea-enhancer',
                    name: 'Enhance Idea',
                    description: 'Enhance and refine the user idea',
                    inputs: { userIdea }
                },
                {
                    id: 'generate-wireframe',
                    agentId: 'wireframe-generator',
                    name: 'Generate Wireframe',
                    description: 'Create wireframes and architecture diagrams',
                    inputs: {},
                    dependencies: ['enhance-idea']
                },
                {
                    id: 'generate-code',
                    agentId: 'code-generator',
                    name: 'Generate Code',
                    description: 'Generate complete application code',
                    inputs: {},
                    dependencies: ['enhance-idea', 'generate-wireframe']
                },
                {
                    id: 'setup-files',
                    agentId: 'file-system',
                    name: 'Setup File Structure',
                    description: 'Organize files and create project structure',
                    inputs: {},
                    dependencies: ['generate-code']
                },
                {
                    id: 'setup-preview',
                    agentId: 'preview',
                    name: 'Setup Preview',
                    description: 'Initialize preview environment',
                    inputs: {},
                    dependencies: ['setup-files']
                }
            ]
        );
    }

    // Workflow queries
    getWorkflow(workflowId: string): Workflow | undefined {
        return this.workflows.get(workflowId);
    }

    getWorkflowStatus(workflowId: string): Workflow['status'] | undefined {
        return this.workflows.get(workflowId)?.status;
    }

    getAllWorkflows(): Workflow[] {
        return Array.from(this.workflows.values());
    }

    // Event system
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
                console.error('Error in orchestrator event listener:', error);
            }
        });
    }

    // Utility methods
    private createError(error: unknown): AgentError {
        if (error instanceof Error) {
            return {
                code: 'ORCHESTRATOR_ERROR',
                message: error.message,
                details: { stack: error.stack },
                recoverable: false
            };
        }

        return {
            code: 'UNKNOWN_ORCHESTRATOR_ERROR',
            message: 'An unknown error occurred in orchestrator',
            details: { error: String(error) },
            recoverable: false
        };
    }

    private generateId(): string {
        return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Cleanup
    destroy(): void {
        this.workflows.clear();
        this.eventListeners = [];
    }
} 