export interface Message {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    files?: GeneratedFile[];
    preview?: string;
    isStreaming?: boolean;
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
    status: 'pending' | 'generating' | 'completed';
    description: string;
} 