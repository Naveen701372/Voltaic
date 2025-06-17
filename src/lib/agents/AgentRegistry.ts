import { AgentType } from '../../components/ai/types';
import { BaseAgent } from './base-agent';

export interface AgentConfig {
    name: string;
    description: string;
    capabilities: string[];
    priority: number;
}

export class AgentRegistry {
    private agents: Map<AgentType, BaseAgent> = new Map();
    private configs: Map<AgentType, AgentConfig> = new Map();

    constructor() {
        this.initializeConfigs();
    }

    private initializeConfigs(): void {
        this.configs.set('enthusiasm', {
            name: 'Enthusiasm Agent',
            description: 'Provides encouraging responses and motivation',
            capabilities: ['motivation', 'encouragement'],
            priority: 1
        });

        this.configs.set('title-generator', {
            name: 'Title Generator',
            description: 'Generates compelling project titles',
            capabilities: ['title-generation', 'naming'],
            priority: 2
        });

        this.configs.set('analyzer', {
            name: 'Feature Analyzer',
            description: 'Analyzes project requirements and features',
            capabilities: ['analysis', 'requirements'],
            priority: 3
        });

        this.configs.set('coder', {
            name: 'Code Generator',
            description: 'Generates application code and components',
            capabilities: ['code-generation', 'development'],
            priority: 4
        });

        this.configs.set('error-recovery', {
            name: 'Error Recovery Specialist',
            description: 'Handles errors and provides recovery solutions',
            capabilities: ['error-handling', 'debugging'],
            priority: 5
        });

        this.configs.set('preview', {
            name: 'Preview Generator',
            description: 'Sets up live preview environments',
            capabilities: ['preview', 'deployment'],
            priority: 6
        });
    }

    registerAgent(type: AgentType, agent: BaseAgent): void {
        this.agents.set(type, agent);
    }

    getAgent(type: AgentType): BaseAgent | undefined {
        return this.agents.get(type);
    }

    getConfig(type: AgentType): AgentConfig | undefined {
        return this.configs.get(type);
    }

    getAllAgentTypes(): AgentType[] {
        return Array.from(this.configs.keys());
    }

    isAgentRegistered(type: AgentType): boolean {
        return this.agents.has(type);
    }

    getRegisteredAgents(): AgentType[] {
        return Array.from(this.agents.keys());
    }

    destroyAllAgents(): void {
        this.agents.clear();
    }
} 