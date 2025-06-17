import { NextRequest, NextResponse } from 'next/server';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        // Initialize AI model
        const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
        const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        let model;
        if (anthropicKey) {
            model = new ChatAnthropic({
                apiKey: anthropicKey,
                model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL,
                temperature: 0.1
            });
        } else if (openaiKey) {
            model = new ChatOpenAI({
                apiKey: openaiKey,
                model: process.env.NEXT_PUBLIC_OPENAI_MODEL,
                temperature: 0.1
            });
        } else {
            return NextResponse.json({
                error: 'No AI API key found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY'
            }, { status: 500 });
        }

        // Simple test message
        const response = await model.invoke([
            new HumanMessage(`You are Voltaic, an AI app generator. Respond to this test message: "${message}"`)
        ]);

        return NextResponse.json({
            success: true,
            response: response.content,
            provider: anthropicKey ? 'Anthropic Claude' : 'OpenAI GPT-4'
        });

    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 