import { NextRequest } from 'next/server';

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

import { TEST_CONFIG } from '@/config/testConfig';

// Helper function to simulate streaming for test data
async function simulateStreaming(text: string, sendEvent: (event: string, data: any) => void, agentId: string) {
    console.log(`🎬 [STREAMING] Starting simulation for ${agentId} with ${text.length} characters`);
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i += TEST_CONFIG.STREAMING.WORDS_PER_CHUNK) {
        const chunk = words.slice(i, i + TEST_CONFIG.STREAMING.WORDS_PER_CHUNK).join(' ');
        currentText += (currentText ? ' ' : '') + chunk;

        console.log(`📤 [STREAMING] ${agentId}: Sending chunk ${Math.floor(i / TEST_CONFIG.STREAMING.WORDS_PER_CHUNK) + 1}/${Math.ceil(words.length / TEST_CONFIG.STREAMING.WORDS_PER_CHUNK)}: "${chunk}"`);

        sendEvent('agent-stream', {
            agentId,
            content: chunk + ' ',
            fullContent: currentText
        });

        // Add delay between chunks
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.STREAMING.CHUNK_DELAY));
    }

    console.log(`✅ [STREAMING] Completed simulation for ${agentId}`);
}

export async function POST(request: NextRequest) {
    // Initialize AI clients inside the function to avoid build-time errors
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { userIdea } = await request.json();

    if (!userIdea) {
        return new Response('User idea is required', { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event: string, data: any) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            try {
                console.log(`🧪 [TEST MODE] Using test data: ${TEST_CONFIG.USE_TEST_DATA}`);

                // Step 1: Idea Enhancement
                sendEvent('agent-start', {
                    agentId: 'idea-enhancer',
                    name: 'Idea Enhancement',
                    provider: 'OpenAI GPT-4'
                });

                let enhancedSpec;

                if (TEST_CONFIG.USE_TEST_DATA) {
                    // Use test data with simulated streaming
                    const testOutput = TEST_CONFIG.AGENT_OUTPUTS['idea-enhancer'];
                    const streamingText = `✨ Enhanced Specification Generated!

📋 Title: ${testOutput.title}

📝 Description: ${testOutput.enhancedDescription}

🎯 Features: ${testOutput.features.length} comprehensive features including user management, recipe browsing, social features, meal planning, and more.

🛠️ Tech Stack: Modern web technologies including React.js, Node.js, MongoDB, and cloud services.

👥 User Stories: ${testOutput.userStories.length} detailed user stories covering all user types and scenarios.

🗄️ Database Schema: Complete schema with Users, Recipes, MealPlans, and GroceryLists entities.

🔗 API Endpoints: ${testOutput.apiEndpoints.length} RESTful endpoints for full functionality.

📋 Deployment Strategy: Comprehensive CI/CD pipeline with AWS/Vercel hosting.`;

                    await simulateStreaming(streamingText, sendEvent, 'idea-enhancer');
                    enhancedSpec = testOutput;
                } else {
                    // Use real OpenAI API
                    const enhanceResponse = await openai.chat.completions.create({
                        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                        messages: [
                            {
                                role: 'system',
                                content: `You are an expert product manager. Enhance the user's app idea into a detailed specification. Return ONLY a JSON object with title, description, enhancedDescription, features (array), techStack, userStories, wireframeRequirements, databaseSchema, apiEndpoints, and deploymentStrategy.`
                            },
                            {
                                role: 'user',
                                content: `Please enhance this app idea: "${userIdea}"`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 4000,
                        stream: true
                    });

                    let enhancedSpecText = '';
                    for await (const chunk of enhanceResponse) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            enhancedSpecText += content;
                            sendEvent('agent-stream', {
                                agentId: 'idea-enhancer',
                                content: content,
                                fullContent: enhancedSpecText
                            });
                        }
                    }

                    // Parse the enhanced specification
                    try {
                        const jsonMatch = enhancedSpecText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                        enhancedSpec = JSON.parse(jsonMatch ? jsonMatch[1] : enhancedSpecText);
                    } catch (error) {
                        enhancedSpec = {
                            title: userIdea,
                            description: userIdea,
                            enhancedDescription: enhancedSpecText,
                            features: [],
                            techStack: { frontend: ['React', 'Next.js'], backend: ['Node.js'], database: ['PostgreSQL'] }
                        };
                    }
                }

                sendEvent('agent-complete', {
                    agentId: 'idea-enhancer',
                    result: enhancedSpec
                });

                // Step 2: Wireframe Generation
                sendEvent('agent-start', {
                    agentId: 'wireframe-generator',
                    name: 'Wireframe Generation',
                    provider: 'Claude Sonnet'
                });

                let wireframeResult;

                if (TEST_CONFIG.USE_TEST_DATA) {
                    // Use test data with simulated streaming
                    const testOutput = TEST_CONFIG.AGENT_OUTPUTS['wireframe-generator'];
                    const streamingText = `🎨 Wireframe & Architecture Generated!

📊 Generated comprehensive wireframes including:
• User flow diagrams showing the complete user journey
• System architecture illustrating technical components
• Database schema with entity relationships
• Component hierarchy breaking down the app structure

🔧 Mermaid diagrams created for:
• User Flow: Complete navigation paths
• System Architecture: Backend and frontend integration
• Database Schema: Entity relationship diagrams
• Component Hierarchy: React component structure

✅ All wireframes are ready for development and provide clear guidance for the implementation phase.`;

                    await simulateStreaming(streamingText, sendEvent, 'wireframe-generator');
                    wireframeResult = testOutput;
                } else {
                    // Use real Anthropic API
                    const wireframeResponse = await anthropic.messages.create({
                        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
                        max_tokens: 4000,
                        temperature: 0.3,
                        messages: [
                            {
                                role: 'user',
                                content: `Based on this app specification, create Mermaid diagrams for user flow, system architecture, database schema, and component hierarchy. Return as JSON with userFlow, systemArchitecture, databaseSchema, componentHierarchy fields containing Mermaid code:\n\n${JSON.stringify(enhancedSpec, null, 2)}`
                            }
                        ],
                        stream: true
                    });

                    let wireframeText = '';
                    for await (const chunk of wireframeResponse) {
                        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                            const content = chunk.delta.text;
                            wireframeText += content;
                            sendEvent('agent-stream', {
                                agentId: 'wireframe-generator',
                                content: content,
                                fullContent: wireframeText
                            });
                        }
                    }

                    wireframeResult = { wireframes: wireframeText };
                }

                sendEvent('agent-complete', {
                    agentId: 'wireframe-generator',
                    result: wireframeResult
                });

                // Step 3-5: Simulate remaining agents
                const remainingAgents = [
                    { id: 'code-generator', name: 'Code Generation', provider: 'Claude Sonnet' },
                    { id: 'file-system', name: 'File Organization', provider: 'Custom Logic' },
                    { id: 'preview-setup', name: 'Preview Setup', provider: 'Custom Logic' }
                ];

                for (const agent of remainingAgents) {
                    sendEvent('agent-start', agent);

                    // Simulate streaming output
                    const simulatedOutput = `✅ ${agent.name} completed successfully!\n\nGenerated comprehensive ${agent.name.toLowerCase()} for your application.`;

                    if (TEST_CONFIG.USE_TEST_DATA) {
                        await simulateStreaming(simulatedOutput, sendEvent, agent.id);
                    } else {
                        const words = simulatedOutput.split(' ');
                        let currentOutput = '';
                        for (const word of words) {
                            currentOutput += (currentOutput ? ' ' : '') + word;
                            sendEvent('agent-stream', {
                                agentId: agent.id,
                                content: word + ' ',
                                fullContent: currentOutput
                            });
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }

                    sendEvent('agent-complete', {
                        agentId: agent.id,
                        result: { output: simulatedOutput }
                    });
                }

                sendEvent('generation-complete', {
                    message: 'MVP generation completed successfully!',
                    totalAgents: 5
                });

            } catch (error) {
                sendEvent('error', {
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
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
        },
    });
} 