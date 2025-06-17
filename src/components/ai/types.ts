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
    metadata?: {
        workflow?: AgentWorkflow;
        [key: string]: any;
    };
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

export type AgentType = 'enthusiasm' | 'analyzer' | 'title-generator' | 'coder' | 'error-recovery' | 'preview' | 'component-editor';

export type AgentStatus = 'pending' | 'thinking' | 'working' | 'completed' | 'error' | 'hidden';

export interface AgentCard {
    id: string;
    type: AgentType;
    name: string;
    description: string;
    status: AgentStatus;
    output?: string;
    files?: GeneratedFile[];
    timestamp: Date;
    progress?: number;
    currentStep?: string;
    streaming?: boolean;
    duration?: number;
}

export interface AgentWorkflow {
    id: string;
    userInput: string;
    agents: AgentCard[];
    currentAgentIndex: number;
    isComplete: boolean;
    previewUrl?: string;
    enthusiasmOutput?: string;
    finalResult?: {
        title: string;
        files: GeneratedFile[];
        preview: string;
    };
} 