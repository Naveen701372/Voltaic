import { BaseAgent } from './base-agent';
import { AgentContext, AgentResponse } from '../../types/agent';

export interface TitleGeneratorResponse {
    success: boolean;
    output?: string;
    error?: string;
}

export class TitleGeneratorAgent extends BaseAgent {
    async process(userInput: string): Promise<TitleGeneratorResponse> {
        try {
            const response = await this.callAI({
                prompt: `Generate a compelling, professional title for this landing page idea: "${userInput}"

Requirements:
- 2-4 words maximum
- Professional and modern sounding
- Memorable and brandable
- No generic words like "app", "platform", "solution"
- Should work as a package.json name (lowercase, no spaces, use hyphens)

Return ONLY the title, nothing else.`,
                systemPrompt: 'You are a branding expert who creates memorable product names.',
                temperature: 0.7,
                maxTokens: 100
            });

            // Clean the title for package.json compatibility
            const cleanTitle = response.trim()
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/--+/g, '-') // Replace multiple hyphens with single
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

            return {
                success: true,
                output: cleanTitle
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error in title generator'
            };
        }
    }

    async run(context: AgentContext): Promise<AgentResponse> {
        try {
            const userInput = context.state.userIdea || 'No idea provided';
            const result = await this.process(userInput);

            return {
                success: result.success,
                content: result.output,
                error: result.error ? {
                    code: 'TITLE_GENERATOR_ERROR',
                    message: result.error,
                    recoverable: true
                } : undefined
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'TITLE_GENERATOR_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    recoverable: true
                }
            };
        }
    }
} 