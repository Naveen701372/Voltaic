import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { VOLTAIC_SYSTEM_PROMPT } from '@/lib/voltaic-system-prompt';

// Voltaic Tools - Simplified for now
const voltWriteTool = new DynamicStructuredTool({
    name: 'volt_write',
    description: 'Create or update a file with the given content',
    schema: z.object({
        path: z.string().describe('File path relative to src/'),
        content: z.string().describe('Complete file content'),
        description: z.string().describe('Brief description of what this file does')
    }),
    func: async ({ path, content, description }) => {
        console.log('Tool: volt_write called for', path);
        return {
            type: 'file_created',
            path,
            content,
            description,
            success: true
        };
    }
});

// Initialize AI models with provider selection
const getAIModel = (forceProvider?: 'anthropic' | 'openai') => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log('API Keys available:', { anthropic: !!anthropicKey, openai: !!openaiKey });

    // Force specific provider if requested
    if (forceProvider === 'anthropic' && anthropicKey) {
        console.log('Using Anthropic Claude (forced)');
        return new ChatAnthropic({
            apiKey: anthropicKey,
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.1,
            streaming: true
        });
    } else if (forceProvider === 'openai' && openaiKey) {
        console.log('Using OpenAI GPT-4 (forced)');
        return new ChatOpenAI({
            apiKey: openaiKey,
            model: 'gpt-4-turbo-preview',
            temperature: 0.1,
            streaming: true
        });
    }

    // Default behavior: prefer OpenAI for general tasks, fallback to Anthropic
    if (openaiKey) {
        console.log('Using OpenAI GPT-4 (default)');
        return new ChatOpenAI({
            apiKey: openaiKey,
            model: 'gpt-4-turbo-preview',
            temperature: 0.1,
            streaming: true
        });
    } else if (anthropicKey) {
        console.log('Using Anthropic Claude (fallback)');
        return new ChatAnthropic({
            apiKey: anthropicKey,
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.1,
            streaming: true
        });
    } else {
        throw new Error('No AI API key found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Chat API called with body:', body);

        // Handle both multi-agent and regular chat requests
        if (body.message) {
            // Multi-agent workflow
            const { message } = body;
            console.log('Starting multi-agent workflow for:', message);

            // Import the multi-agent service
            const { MultiAgentService } = await import('../../../lib/multi-agent-service');
            const multiAgentService = new MultiAgentService();

            // Stream the multi-agent workflow
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const { workflow, isComplete } of multiAgentService.processWorkflow(message)) {
                            const data = JSON.stringify({
                                type: 'workflow',
                                workflow,
                                isComplete
                            });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }

                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (error) {
                        console.error('Multi-agent workflow error:', error);
                        const errorData = JSON.stringify({
                            type: 'error',
                            error: error instanceof Error ? error.message : 'Multi-agent workflow failed'
                        });
                        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                        controller.close();
                    }
                }
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // Regular chat workflow
        const { messages, sessionId = 'default', forceProvider } = body;
        console.log('Regular chat with', messages?.length || 0, 'messages');

        const model = getAIModel(forceProvider);
        const tools = [voltWriteTool]; // Only file writing for now

        // Convert messages to LangChain format
        const langchainMessages = [
            new SystemMessage(VOLTAIC_SYSTEM_PROMPT),
            ...messages.map((msg: any) => {
                if (msg.role === 'user') {
                    return new HumanMessage(msg.content);
                } else if (msg.role === 'assistant') {
                    return new AIMessage(msg.content);
                }
                return null;
            }).filter(Boolean)
        ];

        console.log('Prepared', langchainMessages.length, 'messages for AI');

        // Stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    console.log('Starting AI stream...');

                    // First try without tools to see if basic streaming works
                    const stream = await model.stream(langchainMessages);

                    let fullContent = '';
                    let chunkCount = 0;

                    for await (const chunk of stream) {
                        chunkCount++;
                        console.log(`Chunk ${chunkCount}:`, typeof chunk.content, chunk.content?.toString().slice(0, 50));

                        // Handle content chunks
                        if (chunk.content && typeof chunk.content === 'string') {
                            fullContent += chunk.content;

                            const data = JSON.stringify({
                                type: 'content',
                                content: fullContent,
                                done: false
                            });

                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }

                    console.log('Stream completed. Total content length:', fullContent.length);

                    // Send completion signal
                    const finalData = JSON.stringify({
                        type: 'content',
                        content: fullContent,
                        done: true
                    });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();

                } catch (error) {
                    console.error('Stream error:', error);
                    const errorData = JSON.stringify({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Failed to generate response'
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 