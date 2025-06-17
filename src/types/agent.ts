// Agent Framework Type Definitions
export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    provider: 'openai' | 'claude' | 'custom';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    capabilities: AgentCapability[];
    dependencies?: string[];
}

export interface AgentCapability {
    type: 'text-generation' | 'code-generation' | 'image-analysis' | 'file-manipulation' | 'wireframe-generation';
    description: string;
    inputTypes: string[];
    outputTypes: string[];
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface AgentContext {
    sessionId: string;
    userId: string;
    projectId?: string;
    messages: AgentMessage[];
    state: Record<string, any>;
    artifacts: AgentArtifact[];
}

export interface AgentArtifact {
    id: string;
    type: 'code' | 'wireframe' | 'file' | 'image' | 'data';
    name: string;
    content: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentResponse {
    success: boolean;
    content?: string;
    artifacts?: AgentArtifact[];
    error?: AgentError;
    metadata?: Record<string, any>;
    nextActions?: AgentAction[];
}

export interface AgentError {
    code: string;
    message: string;
    details?: Record<string, any>;
    recoverable: boolean;
}

export interface AgentAction {
    type: 'generate' | 'modify' | 'validate' | 'export' | 'preview';
    description: string;
    parameters: Record<string, any>;
}

export interface AgentState {
    status: 'idle' | 'thinking' | 'generating' | 'error' | 'completed';
    progress?: number;
    currentTask?: string;
    error?: AgentError;
    lastActivity: Date;
}

export interface WorkflowStep {
    id: string;
    agentId: string;
    name: string;
    description: string;
    inputs: Record<string, any>;
    outputs?: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    dependencies?: string[];
    retryCount?: number;
    maxRetries?: number;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}

// Agent Event Types
export type AgentEvent =
    | { type: 'agent.started'; agentId: string; context: AgentContext }
    | { type: 'agent.progress'; agentId: string; progress: number; message?: string }
    | { type: 'agent.completed'; agentId: string; response: AgentResponse }
    | { type: 'agent.error'; agentId: string; error: AgentError }
    | { type: 'workflow.started'; workflowId: string }
    | { type: 'workflow.step.completed'; workflowId: string; stepId: string }
    | { type: 'workflow.completed'; workflowId: string }
    | { type: 'workflow.failed'; workflowId: string; error: AgentError };

// Agent Registry
export interface AgentRegistry {
    [key: string]: AgentConfig;
}

// Default Agent Configurations
export const DEFAULT_AGENTS: AgentRegistry = {
    'idea-enhancer': {
        id: 'idea-enhancer',
        name: 'Idea Enhancement Agent',
        description: 'Enhances and refines user ideas into detailed project specifications',
        provider: 'openai',
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 4000,
        capabilities: [
            {
                type: 'text-generation',
                description: 'Enhances user ideas with detailed specifications',
                inputTypes: ['text'],
                outputTypes: ['enhanced-specification']
            }
        ]
    },
    'wireframe-generator': {
        id: 'wireframe-generator',
        name: 'Wireframe Generation Agent',
        description: 'Creates wireframes and system architecture diagrams',
        provider: 'claude',
        model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        temperature: 0.3,
        maxTokens: 6000,
        capabilities: [
            {
                type: 'wireframe-generation',
                description: 'Generates Mermaid diagrams for wireframes and architecture',
                inputTypes: ['enhanced-specification'],
                outputTypes: ['mermaid-diagram', 'wireframe']
            }
        ],
        dependencies: ['idea-enhancer']
    },
    'code-generator': {
        id: 'code-generator',
        name: 'Code Generation Agent',
        description: 'Generates complete application code from specifications',
        provider: 'claude',
        model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        temperature: 0.2,
        maxTokens: 8000,
        capabilities: [
            {
                type: 'code-generation',
                description: 'Generates React/Next.js application code',
                inputTypes: ['enhanced-specification', 'wireframe'],
                outputTypes: ['code', 'file']
            }
        ],
        dependencies: ['idea-enhancer', 'wireframe-generator']
    },
    'component-editor': {
        id: 'component-editor',
        name: 'Component Editor Agent',
        description: 'Edits and modifies individual components based on user feedback',
        provider: 'claude',
        model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        temperature: 0.3,
        maxTokens: 4000,
        capabilities: [
            {
                type: 'code-generation',
                description: 'Modifies existing components based on user requests',
                inputTypes: ['code', 'modification-request'],
                outputTypes: ['modified-code']
            }
        ]
    },
    'file-system': {
        id: 'file-system',
        name: 'File System Agent',
        description: 'Manages project structure and file organization',
        provider: 'custom',
        capabilities: [
            {
                type: 'file-manipulation',
                description: 'Creates and manages project file structure',
                inputTypes: ['code', 'project-specification'],
                outputTypes: ['file-structure', 'file']
            }
        ]
    },
    'preview': {
        id: 'preview',
        name: 'Preview Agent',
        description: 'Handles real-time preview updates and hot reloading',
        provider: 'custom',
        capabilities: [
            {
                type: 'file-manipulation',
                description: 'Updates preview environment with new code',
                inputTypes: ['code', 'file'],
                outputTypes: ['preview-update']
            }
        ]
    }
}; 