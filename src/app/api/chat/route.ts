import { NextRequest, NextResponse } from 'next/server';
import { langchainService } from '@/lib/langchain-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { messages, isNewApp } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get the latest user message
        const userMessage = messages[messages.length - 1];
        if (!userMessage || userMessage.role !== 'user') {
            return NextResponse.json(
                { error: 'Last message must be from user' },
                { status: 400 }
            );
        }

        // Get previous messages for context (excluding the latest user message)
        const previousMessages = messages.slice(0, -1).map((msg: any) => ({
            role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: String(msg.content)
        }));

        // Create a readable stream for Server-Sent Events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    if (isNewApp) {
                        // Generate new app
                        const streamGenerator = langchainService.streamGeneration({
                            prompt: userMessage.content,
                            previousMessages
                        });

                        for await (const chunk of streamGenerator) {
                            const data = `data: ${JSON.stringify(chunk)}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }
                    } else {
                        // Continue conversation
                        const result = await langchainService.continueConversation({
                            prompt: userMessage.content,
                            previousMessages: previousMessages
                        });

                        // Stream the response
                        const words = result.response.split(' ');
                        for (let i = 0; i < words.length; i++) {
                            const chunk = {
                                type: 'token',
                                content: words[i] + (i < words.length - 1 ? ' ' : '')
                            };
                            const data = `data: ${JSON.stringify(chunk)}\n\n`;
                            controller.enqueue(encoder.encode(data));

                            // Add small delay for streaming effect
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }

                        // Send tool results if any
                        if (result.toolResults && result.toolResults.length > 0) {
                            const toolChunk = {
                                type: 'tools',
                                content: result.toolResults
                            };
                            const data = `data: ${JSON.stringify(toolChunk)}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }
                    }

                    // Send completion signal
                    const doneChunk = { type: 'done' };
                    const data = `data: ${JSON.stringify(doneChunk)}\n\n`;
                    controller.enqueue(encoder.encode(data));

                } catch (error) {
                    console.error('Streaming error:', error);
                    const errorChunk = {
                        type: 'error',
                        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                    };
                    const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
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