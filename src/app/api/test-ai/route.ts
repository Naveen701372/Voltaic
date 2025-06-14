import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

        return NextResponse.json({
            success: true,
            config: {
                openai: hasOpenAI ? 'configured' : 'missing',
                anthropic: hasAnthropic ? 'configured' : 'missing'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to check AI configuration' },
            { status: 500 }
        );
    }
} 