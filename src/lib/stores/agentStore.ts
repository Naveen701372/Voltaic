import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
    AgentState,
    AgentEvent,
    Workflow,
    AgentContext,
    AgentResponse,
    AgentArtifact
} from '@/types/agent';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { AgentRegistry } from '../agents/AgentRegistry';
import { logger } from '../utils/logger';

interface AgentStoreState {
    // Agent states
    agents: Record<string, AgentState>;

    // Workflow states
    workflows: Record<string, Workflow>;
    activeWorkflowId: string | null;

    // Context and artifacts
    currentContext: AgentContext | null;
    artifacts: AgentArtifact[];

    // UI states
    isGenerating: boolean;
    currentStep: string | null;
    progress: number;
    error: string | null;

    // Event history
    events: AgentEvent[];

    // Services
    orchestrator: AgentOrchestrator;
    registry: AgentRegistry;
}

interface AgentStoreActions {
    // Agent management
    updateAgentState: (agentId: string, state: Partial<AgentState>) => void;
    getAgentState: (agentId: string) => AgentState | undefined;

    // Workflow management
    createWorkflow: (userIdea: string) => Promise<string>;
    executeWorkflow: (workflowId: string) => Promise<AgentResponse>;
    getWorkflow: (workflowId: string) => Workflow | undefined;

    // Context management
    setContext: (context: AgentContext) => void;
    updateContext: (updates: Partial<AgentContext>) => void;
    addArtifact: (artifact: AgentArtifact) => void;
    removeArtifact: (artifactId: string) => void;

    // UI state management
    setGenerating: (generating: boolean) => void;
    setCurrentStep: (step: string | null) => void;
    setProgress: (progress: number) => void;
    setError: (error: string | null) => void;

    // Event management
    addEvent: (event: AgentEvent) => void;
    clearEvents: () => void;

    // Actions
    generateMVP: (userIdea: string) => Promise<AgentResponse>;
    modifyComponent: (componentName: string, request: string) => Promise<AgentResponse>;

    // Cleanup
    reset: () => void;
}

type AgentStore = AgentStoreState & AgentStoreActions;

const initialState: AgentStoreState = {
    agents: {},
    workflows: {},
    activeWorkflowId: null,
    currentContext: null,
    artifacts: [],
    isGenerating: false,
    currentStep: null,
    progress: 0,
    error: null,
    events: [],
    orchestrator: new AgentOrchestrator(),
    registry: new AgentRegistry()
};

export const useAgentStore = create<AgentStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        // Agent management
        updateAgentState: (agentId: string, state: Partial<AgentState>) => {
            set((prev) => ({
                agents: {
                    ...prev.agents,
                    [agentId]: { ...prev.agents[agentId], ...state }
                }
            }));
        },

        getAgentState: (agentId: string) => {
            return get().agents[agentId];
        },

        // Workflow management
        createWorkflow: async (userIdea: string) => {
            logger.info('AgentStore', `Creating workflow for idea: ${userIdea}`);
            const { orchestrator } = get();
            const workflow = orchestrator.createMVPGenerationWorkflow(userIdea);
            logger.info('AgentStore', `Workflow steps: ${workflow.steps.map(s => s.name).join(', ')}`);

            set((prev) => ({
                workflows: {
                    ...prev.workflows,
                    [workflow.id]: workflow
                },
                activeWorkflowId: workflow.id
            }));

            logger.info('AgentStore', `Workflow stored with ID: ${workflow.id}`);
            return workflow.id;
        },

        executeWorkflow: async (workflowId: string) => {
            logger.info('AgentStore', `Executing workflow: ${workflowId}`);
            const { orchestrator, currentContext, workflows } = get();
            const workflow = workflows[workflowId];

            if (!workflow) {
                logger.error('AgentStore', `Workflow not found: ${workflowId}`);
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            if (!currentContext) {
                logger.error('AgentStore', 'No context available for workflow execution');
                throw new Error('No context available for workflow execution');
            }

            logger.info('AgentStore', `Starting workflow execution with context: ${currentContext.sessionId}`);
            set({ isGenerating: true, error: null, progress: 0 });

            try {
                logger.info('AgentStore', 'Calling orchestrator.executeWorkflow...');
                const result = await orchestrator.executeWorkflow(workflow, currentContext);
                logger.info('AgentStore', 'Orchestrator result received', { success: result.success, artifactCount: result.artifacts?.length || 0 });

                if (result.success && result.artifacts) {
                    logger.info('AgentStore', `Adding artifacts to store: ${result.artifacts.length}`);
                    set((prev) => ({
                        artifacts: [...prev.artifacts, ...result.artifacts!],
                        isGenerating: false,
                        progress: 100
                    }));
                } else {
                    logger.warn('AgentStore', 'Workflow completed but no artifacts or failed');
                    set({ isGenerating: false });
                }

                return result;
            } catch (error) {
                logger.error('AgentStore', 'Workflow execution failed', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                set({
                    isGenerating: false,
                    error: errorMessage,
                    progress: 0
                });
                throw error;
            }
        },

        getWorkflow: (workflowId: string) => {
            return get().workflows[workflowId];
        },

        // Context management
        setContext: (context: AgentContext) => {
            set({ currentContext: context });
        },

        updateContext: (updates: Partial<AgentContext>) => {
            set((prev) => ({
                currentContext: prev.currentContext
                    ? { ...prev.currentContext, ...updates }
                    : null
            }));
        },

        addArtifact: (artifact: AgentArtifact) => {
            set((prev) => ({
                artifacts: [...prev.artifacts, artifact]
            }));
        },

        removeArtifact: (artifactId: string) => {
            set((prev) => ({
                artifacts: prev.artifacts.filter(a => a.id !== artifactId)
            }));
        },

        // UI state management
        setGenerating: (generating: boolean) => {
            set({ isGenerating: generating });
        },

        setCurrentStep: (step: string | null) => {
            set({ currentStep: step });
        },

        setProgress: (progress: number) => {
            set({ progress: Math.max(0, Math.min(100, progress)) });
        },

        setError: (error: string | null) => {
            set({ error });
        },

        // Event management
        addEvent: (event: AgentEvent) => {
            set((prev) => ({
                events: [...prev.events, event].slice(-100) // Keep last 100 events
            }));
        },

        clearEvents: () => {
            set({ events: [] });
        },

        // High-level actions
        generateMVP: async (userIdea: string) => {
            logger.info('AgentStore', `Starting MVP generation for idea: ${userIdea}`);
            const { createWorkflow, executeWorkflow, setContext } = get();

            try {
                logger.info('AgentStore', 'Creating context...');
                // Create context
                const context: AgentContext = {
                    sessionId: `session-${Date.now()}`,
                    userId: 'current-user', // This would come from auth
                    messages: [],
                    state: { userIdea },
                    artifacts: []
                };

                setContext(context);
                logger.info('AgentStore', `Context created: ${context.sessionId}`);

                logger.info('AgentStore', 'Creating workflow...');
                // Create and execute workflow
                const workflowId = await createWorkflow(userIdea);
                logger.info('AgentStore', `Workflow created: ${workflowId}`);

                logger.info('AgentStore', 'Executing workflow...');
                const result = await executeWorkflow(workflowId);
                logger.info('AgentStore', 'Workflow completed successfully', {
                    success: result.success,
                    artifactCount: result.artifacts?.length || 0
                });

                return result;

            } catch (error) {
                logger.error('AgentStore', 'MVP generation failed', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    userIdea
                });

                const errorMessage = error instanceof Error ? error.message : 'Failed to generate MVP';
                set({ error: errorMessage, isGenerating: false });
                throw error;
            }
        },

        modifyComponent: async (componentName: string, request: string) => {
            const { registry, currentContext } = get();

            if (!currentContext) {
                throw new Error('No context available for component modification');
            }

            try {
                set({ isGenerating: true, error: null });

                const agent = registry.getAgent('component-editor');
                if (!agent) {
                    throw new Error('Component editor agent not available');
                }

                const modificationContext: AgentContext = {
                    ...currentContext,
                    state: {
                        ...currentContext.state,
                        targetComponent: componentName,
                        modificationRequest: request
                    }
                };

                const result = await agent.run(modificationContext);

                if (result.success && result.artifacts) {
                    set((prev) => ({
                        artifacts: [...prev.artifacts, ...result.artifacts!],
                        isGenerating: false
                    }));
                }

                return result;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to modify component';
                set({ error: errorMessage, isGenerating: false });
                throw error;
            }
        },

        // Cleanup
        reset: () => {
            const { orchestrator, registry } = get();
            orchestrator.destroy();
            registry.destroyAllAgents();

            set({
                ...initialState,
                orchestrator: new AgentOrchestrator(),
                registry: new AgentRegistry()
            });
        }
    }))
);

// Set up event listeners
const store = useAgentStore.getState();

// Listen to orchestrator events
store.orchestrator.addEventListener((event) => {
    store.addEvent(event);

    // Update UI based on events
    switch (event.type) {
        case 'workflow.started':
            store.setGenerating(true);
            store.setCurrentStep('Starting workflow...');
            break;

        case 'agent.progress':
            store.setProgress(event.progress);
            if (event.message) {
                store.setCurrentStep(event.message);
            }
            break;

        case 'workflow.completed':
            store.setGenerating(false);
            store.setCurrentStep(null);
            store.setProgress(100);
            break;

        case 'workflow.failed':
            store.setGenerating(false);
            store.setError(event.error.message);
            store.setCurrentStep(null);
            break;
    }
});

// Export types for convenience
export type { AgentStore, AgentStoreState }; 