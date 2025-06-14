import {
    AgentConfig,
    AgentContext,
    AgentResponse,
    AgentError,
    AgentState,
    AgentEvent,
    AgentMessage,
    AgentArtifact
} from '@/types/agent';

export abstract class BaseAgent {
    protected config: AgentConfig;
    protected state: AgentState;
    protected eventListeners: ((event: AgentEvent) => void)[] = [];

    constructor(config: AgentConfig) {
        this.config = config;
        this.state = {
            status: 'idle',
            lastActivity: new Date()
        };
    }

    // Abstract methods that must be implemented by specific agents
    abstract execute(context: AgentContext): Promise<AgentResponse>;

    // Public API methods
    async run(context: AgentContext): Promise<AgentResponse> {
        try {
            console.log(`🚀 [${this.config.name}] Starting agent execution`);
            console.log(`📝 [${this.config.name}] Context:`, {
                sessionId: context.sessionId,
                userId: context.userId,
                stateKeys: Object.keys(context.state),
                artifactCount: context.artifacts.length
            });

            this.updateState({ status: 'thinking', currentTask: 'Initializing...' });
            this.emitEvent({ type: 'agent.started', agentId: this.config.id, context });

            // Validate dependencies
            console.log(`🔍 [${this.config.name}] Validating dependencies...`);
            await this.validateDependencies(context);

            // Validate inputs
            console.log(`✅ [${this.config.name}] Validating inputs...`);
            this.validateInputs(context);

            // Execute the agent logic
            console.log(`⚡ [${this.config.name}] Executing agent logic...`);
            const response = await this.execute(context);
            console.log(`📊 [${this.config.name}] Agent execution result:`, {
                success: response.success,
                artifactCount: response.artifacts?.length || 0,
                hasError: !!response.error
            });

            // Validate outputs
            this.validateOutputs(response);

            this.updateState({ status: 'completed' });
            this.emitEvent({ type: 'agent.completed', agentId: this.config.id, response });

            console.log(`🎉 [${this.config.name}] Agent execution completed successfully`);
            return response;
        } catch (error) {
            console.error(`❌ [${this.config.name}] Agent execution failed:`, error);
            const agentError = this.handleError(error);
            this.updateState({ status: 'error', error: agentError });
            this.emitEvent({ type: 'agent.error', agentId: this.config.id, error: agentError });

            return {
                success: false,
                error: agentError
            };
        }
    }

    // State management
    protected updateState(updates: Partial<AgentState>): void {
        this.state = {
            ...this.state,
            ...updates,
            lastActivity: new Date()
        };
    }

    getState(): AgentState {
        return { ...this.state };
    }

    getConfig(): AgentConfig {
        return { ...this.config };
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

    protected emitEvent(event: AgentEvent): void {
        this.eventListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    // Progress reporting
    protected reportProgress(progress: number, message?: string): void {
        this.updateState({ progress, currentTask: message });
        this.emitEvent({
            type: 'agent.progress',
            agentId: this.config.id,
            progress,
            message
        });
    }

    // Validation methods
    protected validateInputs(context: AgentContext): void {
        // Basic validation - can be overridden by specific agents
        if (!context.sessionId) {
            throw new Error('Session ID is required');
        }
        if (!context.userId) {
            throw new Error('User ID is required');
        }
    }

    protected validateOutputs(response: AgentResponse): void {
        // Basic validation - can be overridden by specific agents
        if (!response.success && !response.error) {
            throw new Error('Response must have either success=true or an error');
        }
    }

    protected async validateDependencies(context: AgentContext): Promise<void> {
        if (!this.config.dependencies || this.config.dependencies.length === 0) {
            return;
        }

        // Check if required artifacts from dependencies are present
        for (const depId of this.config.dependencies) {
            const hasRequiredArtifacts = context.artifacts.some(
                artifact => artifact.metadata?.agentId === depId
            );

            if (!hasRequiredArtifacts) {
                throw new Error(`Missing required artifacts from dependency: ${depId}`);
            }
        }
    }

    // Error handling
    protected handleError(error: unknown): AgentError {
        if (error instanceof Error) {
            return {
                code: 'AGENT_EXECUTION_ERROR',
                message: error.message,
                details: { stack: error.stack },
                recoverable: this.isRecoverableError(error)
            };
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            details: { error: String(error) },
            recoverable: false
        };
    }

    protected isRecoverableError(error: Error): boolean {
        // Define which errors are recoverable (can be retried)
        const recoverableErrors = [
            'RATE_LIMIT_EXCEEDED',
            'NETWORK_ERROR',
            'TIMEOUT_ERROR',
            'TEMPORARY_SERVICE_UNAVAILABLE'
        ];

        return recoverableErrors.some(code =>
            error.message.includes(code) || error.name.includes(code)
        );
    }

    // Utility methods for agents
    protected createMessage(role: 'user' | 'assistant' | 'system', content: string): AgentMessage {
        return {
            id: this.generateId(),
            role,
            content,
            timestamp: new Date()
        };
    }

    protected createArtifact(
        type: AgentArtifact['type'],
        name: string,
        content: string,
        metadata?: Record<string, any>
    ): AgentArtifact {
        return {
            id: this.generateId(),
            type,
            name,
            content,
            metadata: {
                ...metadata,
                agentId: this.config.id,
                agentName: this.config.name
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    protected generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Logging
    protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            agent: this.config.id,
            level,
            message,
            data
        };

        switch (level) {
            case 'error':
                console.error(`[${this.config.name}]`, message, data);
                break;
            case 'warn':
                console.warn(`[${this.config.name}]`, message, data);
                break;
            default:
                console.log(`[${this.config.name}]`, message, data);
        }

        // In production, you might want to send logs to a service
        // this.sendToLoggingService(logEntry);
    }

    // Cleanup
    destroy(): void {
        this.eventListeners = [];
        this.updateState({ status: 'idle' });
    }
} 