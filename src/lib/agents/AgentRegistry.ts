import { AgentConfig, DEFAULT_AGENTS } from '@/types/agent';
import { BaseAgent } from './BaseAgent';

// Import specific agent implementations (we'll create these next)
import { IdeaEnhancerAgent } from './implementations/IdeaEnhancerAgent';
import { WireframeGeneratorAgent } from './implementations/WireframeGeneratorAgent';
import { CodeGeneratorAgent } from './implementations/CodeGeneratorAgent';
import { ComponentEditorAgent } from './implementations/ComponentEditorAgent';
import { FileSystemAgent } from './implementations/FileSystemAgent';
import { PreviewAgent } from './implementations/PreviewAgent';

export class AgentRegistry {
    private agents: Map<string, BaseAgent> = new Map();
    private configs: Map<string, AgentConfig> = new Map();

    constructor() {
        // Initialize with default agent configurations
        Object.values(DEFAULT_AGENTS).forEach(config => {
            this.configs.set(config.id, config);
        });
    }

    // Agent registration
    registerAgent(config: AgentConfig): void {
        this.configs.set(config.id, config);
    }

    // Agent instantiation
    getAgent(agentId: string): BaseAgent | null {
        console.log(`🔍 [AgentRegistry] Looking for agent: ${agentId}`);

        // Return cached agent if exists
        if (this.agents.has(agentId)) {
            console.log(`♻️ [AgentRegistry] Returning cached agent: ${agentId}`);
            return this.agents.get(agentId)!;
        }

        // Get config
        const config = this.configs.get(agentId);
        if (!config) {
            console.error(`❌ [AgentRegistry] Agent configuration not found: ${agentId}`);
            console.log(`📋 [AgentRegistry] Available agents:`, Array.from(this.configs.keys()));
            return null;
        }

        console.log(`🔧 [AgentRegistry] Creating new agent instance: ${agentId}`);
        // Create agent instance based on type
        const agent = this.createAgentInstance(config);
        if (agent) {
            console.log(`✅ [AgentRegistry] Agent created successfully: ${agentId}`);
            this.agents.set(agentId, agent);
        } else {
            console.error(`❌ [AgentRegistry] Failed to create agent: ${agentId}`);
        }

        return agent;
    }

    private createAgentInstance(config: AgentConfig): BaseAgent | null {
        try {
            switch (config.id) {
                case 'idea-enhancer':
                    return new IdeaEnhancerAgent(config);

                case 'wireframe-generator':
                    return new WireframeGeneratorAgent(config);

                case 'code-generator':
                    return new CodeGeneratorAgent(config);

                case 'component-editor':
                    return new ComponentEditorAgent(config);

                case 'file-system':
                    return new FileSystemAgent(config);

                case 'preview':
                    return new PreviewAgent(config);

                default:
                    console.error(`Unknown agent type: ${config.id}`);
                    return null;
            }
        } catch (error) {
            console.error(`Failed to create agent ${config.id}:`, error);
            return null;
        }
    }

    // Agent management
    getAllAgents(): BaseAgent[] {
        return Array.from(this.agents.values());
    }

    getAgentConfig(agentId: string): AgentConfig | undefined {
        return this.configs.get(agentId);
    }

    getAllConfigs(): AgentConfig[] {
        return Array.from(this.configs.values());
    }

    // Agent lifecycle
    destroyAgent(agentId: string): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.destroy();
            this.agents.delete(agentId);
        }
    }

    destroyAllAgents(): void {
        this.agents.forEach(agent => agent.destroy());
        this.agents.clear();
    }

    // Health check
    async healthCheck(): Promise<{ [agentId: string]: boolean }> {
        const results: { [agentId: string]: boolean } = {};

        for (const [agentId, agent] of this.agents) {
            try {
                // Basic health check - agent should be in a valid state
                const state = agent.getState();
                results[agentId] = state.status !== 'error';
            } catch (error) {
                results[agentId] = false;
            }
        }

        return results;
    }

    // Statistics
    getStats(): {
        totalConfigs: number;
        activeAgents: number;
        agentsByStatus: { [status: string]: number };
    } {
        const agentsByStatus: { [status: string]: number } = {};

        this.agents.forEach(agent => {
            const status = agent.getState().status;
            agentsByStatus[status] = (agentsByStatus[status] || 0) + 1;
        });

        return {
            totalConfigs: this.configs.size,
            activeAgents: this.agents.size,
            agentsByStatus
        };
    }
} 