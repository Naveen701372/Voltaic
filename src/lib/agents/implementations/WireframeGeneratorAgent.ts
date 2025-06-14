import { BaseAgent } from '../BaseAgent';
import { AgentConfig, AgentContext, AgentResponse, AgentArtifact, AgentError } from '@/types/agent';

export class WireframeGeneratorAgent extends BaseAgent {
    constructor(config: AgentConfig) {
        super(config);
    }

    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            this.reportProgress(0, 'Starting wireframe generation...');
            this.log('info', 'Starting wireframe generation');

            // Get enhanced specification from previous agent
            const enhancedSpecArtifact = context.artifacts.find(
                artifact => artifact.metadata?.agentId === 'idea-enhancer'
            );

            if (!enhancedSpecArtifact) {
                throw new Error('Enhanced specification not found. Idea enhancer must run first.');
            }

            let enhancedSpec;
            try {
                enhancedSpec = JSON.parse(enhancedSpecArtifact.content);
            } catch (error) {
                throw new Error('Failed to parse enhanced specification');
            }

            // Call server-side API endpoint
            this.reportProgress(25, 'Calling Claude API...');
            const response = await fetch('/api/ai/generate-wireframe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    enhancedSpec
                }),
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }

            this.reportProgress(75, 'Processing AI response...');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to generate wireframes');
            }

            const wireframeData = result.data;
            this.log('info', 'Wireframes generated successfully', {
                diagramCount: Object.keys(wireframeData).length - 1 // -1 for wireframeNotes
            });

            // Create artifacts for each diagram
            const artifacts: AgentArtifact[] = [];

            if (wireframeData.userFlow) {
                artifacts.push(this.createArtifact(
                    'wireframe',
                    'User Flow Diagram',
                    wireframeData.userFlow,
                    { diagramType: 'userFlow', agentId: this.config.id }
                ));
            }

            if (wireframeData.systemArchitecture) {
                artifacts.push(this.createArtifact(
                    'wireframe',
                    'System Architecture Diagram',
                    wireframeData.systemArchitecture,
                    { diagramType: 'systemArchitecture', agentId: this.config.id }
                ));
            }

            if (wireframeData.databaseSchema) {
                artifacts.push(this.createArtifact(
                    'wireframe',
                    'Database Schema Diagram',
                    wireframeData.databaseSchema,
                    { diagramType: 'databaseSchema', agentId: this.config.id }
                ));
            }

            if (wireframeData.componentHierarchy) {
                artifacts.push(this.createArtifact(
                    'wireframe',
                    'Component Hierarchy Diagram',
                    wireframeData.componentHierarchy,
                    { diagramType: 'componentHierarchy', agentId: this.config.id }
                ));
            }

            this.reportProgress(100, 'Wireframe generation completed');

            return {
                success: true,
                content: `Generated ${artifacts.length} wireframe diagrams including user flow, system architecture, database schema, and component hierarchy.`,
                artifacts,
                metadata: { wireframeData }
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.log('error', 'Failed to generate wireframes', { error: errorMessage });

            const agentError: AgentError = {
                code: 'WIREFRAME_GENERATION_FAILED',
                message: errorMessage,
                recoverable: true
            };

            return {
                success: false,
                content: `Failed to generate wireframes: ${errorMessage}`,
                artifacts: [],
                error: agentError
            };
        }
    }
} 