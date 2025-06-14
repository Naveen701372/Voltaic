import { BaseAgent } from '../BaseAgent';
import { AgentConfig, AgentContext, AgentResponse, AgentArtifact, AgentError } from '@/types/agent';

export class IdeaEnhancerAgent extends BaseAgent {
    constructor(config: AgentConfig) {
        super(config);
    }

    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            this.reportProgress(0, 'Starting idea enhancement...');
            this.log('info', 'Starting idea enhancement', { userIdea: context.state.userIdea });

            // Call server-side API endpoint
            this.reportProgress(25, 'Calling OpenAI API...');
            const response = await fetch('/api/ai/enhance-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIdea: context.state.userIdea
                }),
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            this.reportProgress(75, 'Processing AI response...');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to enhance idea');
            }

            const enhancedSpec = result.data;
            this.log('info', 'Enhanced specification generated', {
                title: enhancedSpec.title,
                featuresCount: enhancedSpec.features?.length || 0
            });

            // Create artifacts
            const artifact = this.createArtifact(
                'data',
                'Enhanced App Specification',
                JSON.stringify(enhancedSpec, null, 2),
                {
                    features: enhancedSpec.features?.length || 0,
                    techStack: enhancedSpec.techStack,
                    userStories: enhancedSpec.userStories?.length || 0,
                    agentId: this.config.id
                }
            );

            this.reportProgress(100, 'Idea enhancement completed');

            return {
                success: true,
                content: `Enhanced "${context.state.userIdea}" into a comprehensive specification with ${enhancedSpec.features?.length || 0} features and detailed technical requirements.`,
                artifacts: [artifact],
                metadata: { enhancedSpec }
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.log('error', 'Failed to enhance idea', { error: errorMessage });

            const agentError: AgentError = {
                code: 'IDEA_ENHANCEMENT_FAILED',
                message: errorMessage,
                recoverable: true
            };

            return {
                success: false,
                content: `Failed to enhance idea: ${errorMessage}`,
                artifacts: [],
                error: agentError
            };
        }
    }
}

// Type definitions for enhanced specification
interface EnhancedSpecification {
    title: string;
    description: string;
    enhancedDescription: string;
    features: Feature[];
    techStack: TechStack;
    userStories: UserStory[];
    wireframeRequirements: WireframeRequirement[];
    databaseSchema: DatabaseTable[];
    apiEndpoints: ApiEndpoint[];
    deploymentStrategy: DeploymentStrategy;
}

interface Feature {
    id: string;
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    complexity: 'low' | 'medium' | 'high';
}

interface TechStack {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
    tools: string[];
}

interface UserStory {
    id: string;
    role: string;
    goal: string;
    benefit: string;
    acceptanceCriteria: string[];
}

interface WireframeRequirement {
    page: string;
    components: string[];
    layout: string;
}

interface DatabaseTable {
    name: string;
    columns: DatabaseColumn[];
}

interface DatabaseColumn {
    name: string;
    type: string;
    primaryKey?: boolean;
    unique?: boolean;
    nullable?: boolean;
}

interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
}

interface DeploymentStrategy {
    platform: string;
    environment: string;
    features: string[];
} 