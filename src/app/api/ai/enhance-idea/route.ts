import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userIdea } = await request.json();

    if (!userIdea) {
      return NextResponse.json(
        { success: false, error: 'User idea is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert product manager and software architect. Your job is to take a user's app idea and enhance it into a detailed, comprehensive specification.

For any app idea, provide a detailed JSON response with the following structure:
{
  "title": "Clear, concise app title",
  "description": "Original user description",
  "enhancedDescription": "Detailed, professional description of the app",
  "features": [
    {
      "id": "feature-id",
      "name": "Feature Name",
      "description": "Detailed feature description",
      "priority": "high|medium|low",
      "complexity": "low|medium|high"
    }
  ],
  "techStack": {
    "frontend": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    "backend": ["Next.js API Routes", "Node.js"],
    "database": ["PostgreSQL", "Prisma"],
    "deployment": ["Vercel"],
    "tools": ["ESLint", "Prettier", "Git"]
  },
  "userStories": [
    {
      "id": "story-id",
      "role": "user type",
      "goal": "what they want to do",
      "benefit": "why they want to do it",
      "acceptanceCriteria": ["criteria 1", "criteria 2"]
    }
  ],
  "wireframeRequirements": [
    {
      "page": "Page Name",
      "components": ["Component 1", "Component 2"],
      "layout": "Layout description"
    }
  ],
  "databaseSchema": [
    {
      "name": "table_name",
      "columns": [
        {"name": "id", "type": "uuid", "primaryKey": true},
        {"name": "column_name", "type": "varchar", "unique": false}
      ]
    }
  ],
  "apiEndpoints": [
    {
      "method": "GET|POST|PUT|DELETE",
      "path": "/api/endpoint",
      "description": "What this endpoint does"
    }
  ],
  "deploymentStrategy": {
    "platform": "Vercel",
    "environment": "production",
    "features": ["Automatic deployments", "Preview deployments"]
  }
}

Be thorough, practical, and ensure the specification is implementable. Focus on modern web development best practices. Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please enhance this app idea into a detailed specification: "${userIdea}"` }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0]?.message?.content || '';

    // Try to parse as JSON, handle markdown code blocks
    let enhancedSpec;
    try {
      // First try direct parsing
      enhancedSpec = JSON.parse(aiResponse);
    } catch (parseError) {
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          enhancedSpec = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (secondParseError) {
        // Fallback structure if JSON parsing fails
        enhancedSpec = {
          title: userIdea.split(' ').slice(0, 5).join(' '),
          description: userIdea,
          enhancedDescription: aiResponse,
          features: [
            {
              id: 'core-feature',
              name: 'Core Functionality',
              description: 'Main application features',
              priority: 'high',
              complexity: 'medium'
            }
          ],
          techStack: {
            frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
            backend: ['Next.js API Routes', 'Node.js'],
            database: ['PostgreSQL', 'Prisma'],
            deployment: ['Vercel'],
            tools: ['ESLint', 'Prettier', 'Git']
          },
          userStories: [],
          wireframeRequirements: [],
          databaseSchema: [],
          apiEndpoints: [],
          deploymentStrategy: {
            platform: 'Vercel',
            environment: 'production',
            features: ['Automatic deployments']
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: enhancedSpec
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enhance idea with AI' },
      { status: 500 }
    );
  }
} 