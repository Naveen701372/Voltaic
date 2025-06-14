import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { enhancedSpec } = await request.json();

        if (!enhancedSpec) {
            return NextResponse.json(
                { success: false, error: 'Enhanced specification is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `You are an expert UX/UI designer and system architect. Your job is to create comprehensive wireframes and system diagrams based on an enhanced app specification.

Generate Mermaid diagrams for the following aspects:

1. **User Flow Diagram**: Show how users navigate through the app
2. **System Architecture**: Show the high-level system components and their relationships
3. **Database Schema**: Show tables and their relationships
4. **Component Hierarchy**: Show the React component structure

Provide your response as a JSON object with this structure:
{
  "userFlow": "mermaid diagram code for user flow",
  "systemArchitecture": "mermaid diagram code for system architecture", 
  "databaseSchema": "mermaid diagram code for database schema",
  "componentHierarchy": "mermaid diagram code for component hierarchy",
  "wireframeNotes": [
    "Key design consideration 1",
    "Key design consideration 2"
  ]
}

Use proper Mermaid syntax. For flowcharts use 'flowchart TD', for ER diagrams use 'erDiagram', for system diagrams use 'graph TD'.`;

        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            temperature: 0.3,
            messages: [
                {
                    role: 'user',
                    content: `Based on this enhanced app specification, create comprehensive wireframes and system diagrams:

${JSON.stringify(enhancedSpec, null, 2)}

Please provide Mermaid diagrams for user flow, system architecture, database schema, and component hierarchy.`
                }
            ]
        });

        const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';

        // Try to parse as JSON, fallback if needed
        let wireframeData;
        try {
            wireframeData = JSON.parse(aiResponse);
        } catch (parseError) {
            // Fallback structure if JSON parsing fails
            wireframeData = {
                userFlow: `flowchart TD
    A[User Opens App] --> B[Login/Register]
    B --> C[Dashboard]
    C --> D[Main Features]
    D --> E[User Actions]
    E --> F[Results]`,
                systemArchitecture: `graph TD
    A[Frontend - React/Next.js] --> B[API Layer]
    B --> C[Business Logic]
    C --> D[Database]
    B --> E[External Services]`,
                databaseSchema: `erDiagram
    USER {
        uuid id PK
        string email
        string name
        timestamp created_at
    }`,
                componentHierarchy: `graph TD
    A[App] --> B[Layout]
    B --> C[Header]
    B --> D[Main Content]
    B --> E[Footer]
    D --> F[Feature Components]`,
                wireframeNotes: [
                    'Clean, modern interface design',
                    'Mobile-responsive layout',
                    'Intuitive user navigation',
                    'Accessible design patterns'
                ]
            };
        }

        return NextResponse.json({
            success: true,
            data: wireframeData
        });

    } catch (error) {
        console.error('Anthropic API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate wireframes with AI' },
            { status: 500 }
        );
    }
} 