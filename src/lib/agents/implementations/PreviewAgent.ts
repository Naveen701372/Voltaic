import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentResponse } from '@/types/agent';

export class PreviewAgent extends BaseAgent {
    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            this.reportProgress(10, 'Setting up preview environment...');

            // Get organized files from file system agent
            const organizedFiles = context.artifacts.filter(
                artifact => artifact.metadata?.type === 'organized-file'
            );

            this.reportProgress(50, 'Creating preview configuration...');

            // Create preview configuration
            const previewConfig = {
                url: 'http://localhost:3000',
                port: 3000,
                hotReload: true,
                environment: 'development'
            };

            this.reportProgress(90, 'Creating preview artifacts...');

            // Create preview artifact
            const configArtifact = this.createArtifact(
                'data',
                'preview-config.json',
                JSON.stringify(previewConfig, null, 2),
                { type: 'preview-config' }
            );

            this.reportProgress(100, 'Preview setup completed');

            return {
                success: true,
                content: 'Successfully set up preview environment',
                artifacts: [configArtifact],
                metadata: {
                    totalFiles: organizedFiles.length,
                    previewUrl: previewConfig.url
                }
            };

        } catch (error) {
            this.log('error', 'Failed to setup preview environment', error);
            throw error;
        }
    }
} 