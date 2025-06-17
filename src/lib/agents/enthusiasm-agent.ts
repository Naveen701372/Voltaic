import { BaseAgent } from './base-agent';
import { AgentContext, AgentResponse } from '../../types/agent';

export interface EnthusiasmAgentResponse {
    success: boolean;
    output?: string;
    error?: string;
}

export class EnthusiasmAgent extends BaseAgent {
    async process(userInput: string): Promise<EnthusiasmAgentResponse> {
        try {
            const response = await this.callAI({
                prompt: `Analyze this landing page idea and respond with genuine enthusiasm: "${userInput}"

Show excitement about the potential and briefly outline 2-3 key features that would make this compelling.

Keep it conversational and engaging - like a product manager who just heard a great idea.`,
                systemPrompt: 'You are an enthusiastic product manager who gets excited about new ideas and sees their potential immediately.',
                temperature: 0.8,
                maxTokens: 500
            });

            return {
                success: true,
                output: response
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error in enthusiasm agent'
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
                    code: 'ENTHUSIASM_AGENT_ERROR',
                    message: result.error,
                    recoverable: true
                } : undefined
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'ENTHUSIASM_AGENT_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    recoverable: true
                }
            };
        }
    }
} 