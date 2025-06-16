import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { VOLTAIC_SYSTEM_PROMPT } from '@/lib/voltaic-system-prompt';

// Voltaic Tools
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

const voltDependencyTool = new DynamicStructuredTool({
    name: 'volt_dependency',
    description: 'Note required dependencies (for display only, not actual installation)',
    schema: z.object({
        packages: z.string().describe('Space-separated list of package names')
    }),
    func: async ({ packages }) => {
        console.log('Tool: volt_dependency called with', packages);
        return {
            type: 'dependencies_noted',
            packages: packages.split(' '),
            message: `Dependencies noted: ${packages} (for reference only)`
        };
    }
});

const voltExecuteSqlTool = new DynamicStructuredTool({
    name: 'volt_execute_sql',
    description: 'Generate SQL schema for database setup',
    schema: z.object({
        sql: z.string().describe('SQL commands to execute'),
        description: z.string().describe('Description of what this SQL does')
    }),
    func: async ({ sql, description }) => {
        return {
            type: 'sql_generated',
            sql,
            description,
            message: `SQL schema generated: ${description}`
        };
    }
});

// Initialize AI models
const getAIModel = () => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log('API Keys available:', { anthropic: !!anthropicKey, openai: !!openaiKey });

    if (anthropicKey) {
        console.log('Using Anthropic Claude');
        return new ChatAnthropic({
            apiKey: anthropicKey,
            model: 'claude-3-5-sonnet-20241022',
            temperature: 0.1,
            streaming: true
        });
    } else if (openaiKey) {
        console.log('Using OpenAI GPT-4');
        return new ChatOpenAI({
            apiKey: openaiKey,
            model: 'gpt-4-turbo-preview',
            temperature: 0.1,
            streaming: true
        });
    } else {
        throw new Error('No AI API key found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
    }
};

export async function POST(req: NextRequest) {
    try {
        const { messages, sessionId = 'default' } = await req.json();
        console.log('Chat API called with', messages.length, 'messages');

        const model = getAIModel();
        const tools = [voltWriteTool, voltDependencyTool, voltExecuteSqlTool];

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