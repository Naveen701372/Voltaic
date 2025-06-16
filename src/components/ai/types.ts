export interface Message {
    id: string;
    type: 'user' | 'assistant' | 'system' | 'agent';
    content: string;
    timestamp: Date;
    files?: GeneratedFile[];
    preview?: string;
    isStreaming?: boolean;
    agentType?: AgentType;
    agentStatus?: AgentStatus;
}

export interface GeneratedFile {
    path: string;
    content: string;
    description: string;
    type: 'component' | 'page' | 'api' | 'config' | 'style';
}

export interface AppProject {
    id: string;
    name: string;
    description: string;
    files: GeneratedFile[];
    preview: string;
    status: 'generating' | 'ready' | 'error';
}

export interface GenerationStep {
    id: string;
    name: string;
    status: 'pending' | 'generating' | 'completed' | 'error';
    description: string;
}

export type AgentType = 'enthusiasm' | 'analyzer' | 'title-generator' | 'coder' | 'preview';

export type AgentStatus = 'pending' | 'thinking' | 'working' | 'completed' | 'error';

export interface AgentCard {
    id: string;
    type: AgentType;
    name: string;
    description: string;
    status: AgentStatus;
    output?: string;
    files?: GeneratedFile[];
    timestamp: Date;
}

export interface AgentWorkflow {
    id: string;
    userInput: string;
    agents: AgentCard[];
    currentAgentIndex: number;
    isComplete: boolean;
    previewUrl?: string;
    finalResult?: {
        title: string;
        files: GeneratedFile[];
        preview: string;
    };
} 