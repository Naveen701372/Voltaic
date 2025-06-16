// Voltaic Multi-Agent Router System
// Routes requests to specialized agents for better performance and cost optimization

export type AgentType =
    | 'UI_AGENT'
    | 'AUTH_AGENT'
    | 'DATABASE_AGENT'
    | 'FULLSTACK_AGENT'
    | 'HELPER_AGENT';

export interface AgentSelection {
    agent: AgentType;
    confidence: number;
    reason: string;
    estimatedTokens: number;
    estimatedCost: number;
}

export interface AgentCapabilities {
    name: AgentType;
    description: string;
    expertise: string[];
    tokenRange: [number, number];
    costPerToken: number;
    bestFor: string[];
}

// Agent definitions with capabilities
export const AGENT_CAPABILITIES: Record<AgentType, AgentCapabilities> = {
    UI_AGENT: {
        name: 'UI_AGENT',
        description: 'Specialist in React components and glass morphism design',
        expertise: ['React components', 'Tailwind CSS', 'Glass morphism', 'Responsive design', 'UI/UX'],
        tokenRange: [2100, 2800],
        costPerToken: 0.002, // Claude Sonnet pricing
        bestFor: ['component creation', 'styling', 'design systems', 'layouts', 'themes']
    },

    AUTH_AGENT: {
        name: 'AUTH_AGENT',
        description: 'Authentication and user management specialist',
        expertise: ['Google OAuth', 'Supabase Auth', 'Session management', 'Security'],
        tokenRange: [2300, 3000],
        costPerToken: 0.002,
        bestFor: ['authentication', 'login systems', 'user profiles', 'session handling']
    },

    DATABASE_AGENT: {
        name: 'DATABASE_AGENT',
        description: 'Database design and PostgreSQL specialist',
        expertise: ['PostgreSQL', 'RLS policies', 'Schema design', 'Migrations', 'CRUD operations'],
        tokenRange: [2500, 3200],
        costPerToken: 0.002,
        bestFor: ['database schema', 'SQL queries', 'data modeling', 'migrations']
    },

    FULLSTACK_AGENT: {
        name: 'FULLSTACK_AGENT',
        description: 'Complete application development specialist',
        expertise: ['Full-stack development', 'MVP creation', 'Complex integrations', 'Architecture'],
        tokenRange: [4500, 5000],
        costPerToken: 0.003, // GPT-4 for complex tasks
        bestFor: ['complete applications', 'MVPs', 'complex features', 'full systems']
    },

    HELPER_AGENT: {
        name: 'HELPER_AGENT',
        description: 'General guidance and information specialist',
        expertise: ['Explanations', 'Troubleshooting', 'Best practices', 'Documentation'],
        tokenRange: [1200, 1800],
        costPerToken: 0.0005, // GPT-3.5 for simple tasks
        bestFor: ['questions', 'explanations', 'guidance', 'troubleshooting']
    }
};

// Lightweight router prompt (only ~200 tokens)
const ROUTER_PROMPT = `You are Voltaic Router. Analyze the user request and select the best specialist agent.

Agents available:
- UI_AGENT: React components, styling, glass morphism, responsive design
- AUTH_AGENT: Google OAuth, Supabase authentication, user management  
- DATABASE_AGENT: PostgreSQL schema, RLS policies, SQL queries, data modeling
- FULLSTACK_AGENT: Complete applications, MVPs, complex full-stack features
- HELPER_AGENT: Questions, explanations, guidance, troubleshooting

Respond in this exact format:
AGENT: [AGENT_NAME]
CONFIDENCE: [0-100]
REASON: [brief explanation why this agent is best]

Examples:
- "Create a glass button component" → UI_AGENT (90% - component creation)
- "Add Google sign-in" → AUTH_AGENT (95% - authentication focus)
- "Design user profiles table" → DATABASE_AGENT (90% - database schema)
- "Build a complete todo app" → FULLSTACK_AGENT (85% - full application)
- "What's the difference between React and Vue?" → HELPER_AGENT (80% - informational)

User request: `;

export class VoltaicRouter {
    /**
     * Route a user request to the most appropriate agent
     */
    static async routeRequest(userInput: string): Promise<AgentSelection> {
        // For demo purposes, we'll simulate the routing logic
        // In production, this would call a lightweight model
        return this.simulateRouting(userInput);
    }

    /**
     * Simulate intelligent routing based on request patterns
     */
    private static simulateRouting(userInput: string): AgentSelection {
        const input = userInput.toLowerCase();

        // UI-focused requests
        if (this.matchesPatterns(input, [
            /component|button|form|card|ui|design|interface|layout|style|responsive|mobile|theme/
        ])) {
            return {
                agent: 'UI_AGENT',
                confidence: 90,
                reason: 'Request focuses on UI components and design',
                estimatedTokens: 2400,
                estimatedCost: 0.0048
            };
        }

        // Authentication requests
        if (this.matchesPatterns(input, [
            /auth|login|signin|signup|user|account|session|oauth|google/
        ])) {
            return {
                agent: 'AUTH_AGENT',
                confidence: 95,
                reason: 'Request involves authentication or user management',
                estimatedTokens: 2650,
                estimatedCost: 0.0053
            };
        }

        // Database requests
        if (this.matchesPatterns(input, [
            /database|table|query|sql|store|save|data|crud|schema|migration/
        ])) {
            return {
                agent: 'DATABASE_AGENT',
                confidence: 88,
                reason: 'Request involves database operations or schema design',
                estimatedTokens: 2850,
                estimatedCost: 0.0057
            };
        }

        // Full-stack/complex requests
        if (this.matchesPatterns(input, [
            /full app|mvp|complete|entire|platform|system|advanced|build app|create app/
        ])) {
            return {
                agent: 'FULLSTACK_AGENT',
                confidence: 85,
                reason: 'Request requires full-stack development expertise',
                estimatedTokens: 4750,
                estimatedCost: 0.0143
            };
        }

        // Help/informational requests
        if (this.matchesPatterns(input, [
            /what|how|why|explain|difference|help|guide|documentation|question/
        ]) && !this.matchesPatterns(input, [/create|build|add|implement/])) {
            return {
                agent: 'HELPER_AGENT',
                confidence: 80,
                reason: 'Request is informational and needs guidance',
                estimatedTokens: 1500,
                estimatedCost: 0.00075
            };
        }

        // Default to full-stack for ambiguous requests
        return {
            agent: 'FULLSTACK_AGENT',
            confidence: 60,
            reason: 'Ambiguous request, using full-stack specialist for safety',
            estimatedTokens: 4750,
            estimatedCost: 0.0143
        };
    }

    /**
     * Check if input matches any of the given patterns
     */
    private static matchesPatterns(input: string, patterns: RegExp[]): boolean {
        return patterns.some(pattern => pattern.test(input));
    }

    /**
     * Get the appropriate prompt for the selected agent
     */
    static getAgentPrompt(selection: AgentSelection, userInput: string): string {
        const agentPrompts = {
            UI_AGENT: this.buildUIAgentPrompt(),
            AUTH_AGENT: this.buildAuthAgentPrompt(),
            DATABASE_AGENT: this.buildDatabaseAgentPrompt(),
            FULLSTACK_AGENT: this.buildFullStackAgentPrompt(),
            HELPER_AGENT: this.buildHelperAgentPrompt()
        };

        return agentPrompts[selection.agent];
    }

    /**
     * Agent-specific prompt builders
     */
    private static buildUIAgentPrompt(): string {
        return `You are the Voltaic UI Agent, specialized in creating beautiful React components with glass morphism design.

## Your Expertise
- React/TypeScript component development
- Glass morphism design system
- Tailwind CSS styling
- Responsive design patterns
- Apple-like UI aesthetics

## Available Glass Components
Always prefer existing components from @/components/glass:
- GlassCard, GlassButton, GlassInput, GlassTextarea
- Variants: light/dark/primary, sizes: sm/md/lg
- Built-in responsive design and theme support

## Implementation Standards
- Mobile-first responsive design
- Perfect accessibility (WCAG compliant)
- Smooth animations and micro-interactions
- Light/dark theme support
- Production-ready, complete code

Focus on creating visually stunning, highly functional UI components that embody Voltaic's design philosophy.`;
    }

    private static buildAuthAgentPrompt(): string {
        return `You are the Voltaic Auth Agent, specialized in authentication and user management systems.

## Your Expertise
- Google OAuth integration
- Supabase authentication setup
- Session management
- User profile systems
- Security best practices

## Authentication Standards
- ONLY Google OAuth (never username/password forms)
- Environment variable configuration
- Proper error handling and user feedback
- Secure session management
- RLS policy integration

## Implementation Pattern
1. Set up Supabase client with env vars
2. Create GoogleSignIn component with GlassButton
3. Configure auth callback handling
4. Implement user profile management (if needed)
5. Add session state management

Always prioritize security and user experience in authentication flows.`;
    }

    private static buildDatabaseAgentPrompt(): string {
        return `You are the Voltaic Database Agent, specialized in PostgreSQL schema design and Supabase integration.

## Your Expertise
- PostgreSQL database design
- Row Level Security (RLS) policies
- Schema migrations
- CRUD operations
- Data modeling best practices

## Database Standards
- Proper UUID primary keys
- User-scoped RLS policies
- Normalized data structures
- Optimized indexes
- Clear naming conventions

## RLS Policy Template
Always include comprehensive RLS policies:
- SELECT: Users can view own records
- INSERT: Users can create own records
- UPDATE: Users can modify own records
- DELETE: Users can remove own records

Focus on creating secure, scalable database architectures that support multi-tenant applications.`;
    }

    private static buildFullStackAgentPrompt(): string {
        return `You are the Voltaic Full-Stack Agent, specialized in complete application development.

## Your Expertise
- Complete MVP development
- Full-stack architecture
- Complex feature integration
- System design patterns
- Performance optimization

## Technical Stack
- Next.js 14+ App Router
- TypeScript/React
- Supabase (auth + database)
- Glass morphism UI
- Tailwind CSS

## Implementation Approach
1. Plan complete application architecture
2. Set up all necessary integrations
3. Create database schema with RLS
4. Build authentication system
5. Develop core features
6. Implement responsive UI
7. Add error handling
8. Optimize performance

Always deliver complete, production-ready applications that users can deploy immediately.`;
    }

    private static buildHelperAgentPrompt(): string {
        return `You are the Voltaic Helper Agent, specialized in providing guidance and explanations.

## Your Expertise
- Clear technical explanations
- Best practice guidance
- Troubleshooting assistance
- Documentation and examples
- Technology comparisons

## Response Style
- Clear, concise explanations
- Practical examples
- Step-by-step guidance
- Relevant context
- Actionable recommendations

## When to Code vs Explain
- Code changes: Only when explicitly requested
- Information: Provide explanations without modifications
- Guidance: Offer suggestions and best practices
- Troubleshooting: Help diagnose and solve issues

Focus on helping users understand concepts and make informed decisions about their projects.`;
    }

    /**
     * Get cost estimation for different request types
     */
    static getCostEstimation(agentType: AgentType): { min: number; max: number; average: number } {
        const agent = AGENT_CAPABILITIES[agentType];
        const [minTokens, maxTokens] = agent.tokenRange;
        const avgTokens = (minTokens + maxTokens) / 2;

        return {
            min: minTokens * agent.costPerToken,
            max: maxTokens * agent.costPerToken,
            average: avgTokens * agent.costPerToken
        };
    }

    /**
     * Get routing statistics for optimization
     */
    static getRoutingStats(requests: string[]): {
        routingDistribution: Record<AgentType, number>;
        averageCost: number;
        potentialSavings: number;
    } {
        const routings = requests.map(req => this.simulateRouting(req));
        const distribution: Record<AgentType, number> = {
            UI_AGENT: 0,
            AUTH_AGENT: 0,
            DATABASE_AGENT: 0,
            FULLSTACK_AGENT: 0,
            HELPER_AGENT: 0
        };

        routings.forEach(routing => {
            distribution[routing.agent]++;
        });

        const averageCost = routings.reduce((sum, r) => sum + r.estimatedCost, 0) / routings.length;
        const fullStackCost = 0.0143; // Cost if all requests used full-stack agent
        const potentialSavings = ((fullStackCost - averageCost) / fullStackCost) * 100;

        return {
            routingDistribution: distribution,
            averageCost,
            potentialSavings
        };
    }
} 