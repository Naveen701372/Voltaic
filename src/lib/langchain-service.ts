import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { voltaicTools } from './voltaic-tools';

// Enhanced Voltaic System Prompt
const VOLTAIC_SYSTEM_PROMPT = `
## Role & Identity
You are **Voltaic**, an AI-powered MVP generator that transforms ideas into production-ready web applications. You are built by **Navi**, an experienced developer who has created successful applications like [www.theideahub.app](https://www.theideahub.app) and runs the creative agency [www.kupacreative.com](https://www.kupacreative.com). 

You specialize in generating **complete, beautiful, modern web applications** with **glass morphism UI design**, following **Apple-like design principles** with clean, minimalist aesthetics and excellent UX.

## Technical Standards
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with React (.tsx/.ts files)
- **Styling**: Tailwind CSS with glass morphism
- **Icons**: Lucide React exclusively
- **Database**: Supabase (with detailed integration)
- **Authentication**: Supabase Auth (Google OAuth only)
- **Deployment**: Vercel

## Available Tools
You have access to these Voltaic tools:
- **volt_write**: Create or update files in the project
- **volt_dependency**: Install npm packages
- **volt_rename**: Rename files
- **volt_delete**: Delete files
- **volt_execute_sql**: Execute SQL commands (Supabase)
- **volt_command**: Execute system commands (rebuild, restart, refresh, deploy)

## Code Implementation Guidelines
When creating applications:
1. **Always use TypeScript** with proper type definitions
2. **Use glass morphism components** from @/components/glass when available
3. **Create complete, production-ready code** - no TODOs or placeholders
4. **Include proper error handling** and loading states
5. **Make it responsive** with mobile-first design
6. **Use Lucide React icons** exclusively
7. **Follow Next.js 14 App Router patterns**

## Response Format
When implementing features:
1. Explain what you're building
2. Use the appropriate tools to create files
3. Install any required dependencies
4. Provide a summary of what was created

Always create beautiful, functional applications that users will love!
`;

export class LangChainVoltaicService {
    private agent: AgentExecutor | null = null;
    private model: ChatOpenAI | ChatAnthropic;

    constructor() {
        // Initialize the LLM based on available API keys
        const openaiKey = process.env.OPENAI_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (openaiKey) {
            this.model = new ChatOpenAI({
                modelName: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                temperature: 0.7,
                streaming: true,
            });
        } else if (anthropicKey) {
            this.model = new ChatAnthropic({
                modelName: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
                temperature: 0.7,
                streaming: true,
            });
        } else {
            throw new Error('No API key found. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.');
        }

        this.initializeAgent();
    }

    private async initializeAgent() {
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', VOLTAIC_SYSTEM_PROMPT],
            ['human', '{input}'],
            ['placeholder', '{agent_scratchpad}'],
        ]);

        const agent = await createToolCallingAgent({
            llm: this.model,
            tools: voltaicTools,
            prompt,
        });

        this.agent = new AgentExecutor({
            agent,
            tools: voltaicTools,
            verbose: true,
            maxIterations: 10,
        });
    }

    async generateApp(request: {
        prompt: string;
        previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) {
        if (!this.agent) {
            throw new Error('Agent not initialized');
        }

        try {
            // Build context from previous messages
            let context = '';
            if (request.previousMessages && request.previousMessages.length > 0) {
                context = '\n\nPrevious conversation:\n' +
                    request.previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            }

            const fullPrompt = `${request.prompt}${context}

Please create a complete, production-ready application based on this request. Use the available tools to:
1. Create all necessary files with proper TypeScript and React components
2. Install any required dependencies
3. Set up proper project structure
4. Include beautiful glass morphism UI design
5. Make it fully responsive and accessible

Generate a complete working application that the user can immediately use and deploy.`;

            const result = await this.agent.invoke({
                input: fullPrompt,
            });

            return {
                name: this.extractAppName(request.prompt),
                description: `A modern application built with Next.js, TypeScript, and glass morphism UI`,
                response: result.output,
                toolResults: result.intermediateSteps || [],
            };

        } catch (error) {
            console.error('LangChain generation error:', error);
            throw new Error(`Failed to generate app: ${error}`);
        }
    }

    async continueConversation(request: {
        prompt: string;
        previousMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) {
        if (!this.agent) {
            throw new Error('Agent not initialized');
        }

        try {
            // Build context from previous messages
            const context = '\n\nPrevious conversation:\n' +
                request.previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

            const fullPrompt = `${request.prompt}${context}

Please help the user modify or enhance their existing application. Use the available tools as needed to make the requested changes.`;

            const result = await this.agent.invoke({
                input: fullPrompt,
            });

            return {
                response: result.output,
                toolResults: result.intermediateSteps || [],
            };

        } catch (error) {
            console.error('LangChain conversation error:', error);
            throw new Error(`Failed to process request: ${error}`);
        }
    }

    // Streaming version for real-time responses
    async *streamGeneration(request: {
        prompt: string;
        previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }) {
        if (!this.agent) {
            throw new Error('Agent not initialized');
        }

        try {
            // Build context from previous messages
            let context = '';
            if (request.previousMessages && request.previousMessages.length > 0) {
                context = '\n\nPrevious conversation:\n' +
                    request.previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            }

            const fullPrompt = `${request.prompt}${context}

Please create a complete, production-ready application based on this request. Use the available tools to create all necessary files and set up the project structure.`;

            // Stream the agent execution
            const stream = await this.agent.streamEvents({
                input: fullPrompt,
            }, { version: 'v1' });

            for await (const event of stream) {
                if (event.event === 'on_llm_stream') {
                    yield {
                        type: 'token',
                        content: event.data.chunk.content || '',
                    };
                } else if (event.event === 'on_tool_start') {
                    yield {
                        type: 'tool_start',
                        tool: event.name,
                        input: event.data.input,
                    };
                } else if (event.event === 'on_tool_end') {
                    yield {
                        type: 'tool_end',
                        tool: event.name,
                        output: event.data.output,
                    };
                }
            }

        } catch (error) {
            console.error('LangChain streaming error:', error);
            yield {
                type: 'error',
                content: `Failed to generate app: ${error}`,
            };
        }
    }

    private extractAppName(prompt: string): string {
        if (prompt.toLowerCase().includes('todo')) return 'Todo Master';
        if (prompt.toLowerCase().includes('recipe')) return 'Recipe Hub';
        if (prompt.toLowerCase().includes('fitness')) return 'Fitness Tracker';
        if (prompt.toLowerCase().includes('project')) return 'Project Manager';
        if (prompt.toLowerCase().includes('social')) return 'Social Dashboard';
        if (prompt.toLowerCase().includes('ecommerce') || prompt.toLowerCase().includes('store')) return 'E-Commerce Store';
        if (prompt.toLowerCase().includes('blog')) return 'Blog Platform';
        if (prompt.toLowerCase().includes('chat')) return 'Chat Application';
        if (prompt.toLowerCase().includes('dashboard')) return 'Analytics Dashboard';
        return 'Custom App';
    }
}

// Export singleton instance
export const langchainService = new LangChainVoltaicService(); 