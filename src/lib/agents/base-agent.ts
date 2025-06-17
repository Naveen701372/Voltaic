import { AgentContext, AgentResponse } from '../../types/agent';

export abstract class BaseAgent {
    protected async callAI(params: {
        prompt: string;
        systemPrompt: string;
        useAnthropic?: boolean;
        temperature?: number;
        maxTokens?: number;
    }): Promise<string> {
        const { prompt, systemPrompt, useAnthropic = false, temperature = 0.7, maxTokens = 2000 } = params;

        try {
            if (useAnthropic) {
                const response = await fetch('/api/ai/claude', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt }
                        ],
                        temperature,
                        max_tokens: maxTokens
                    })
                });

                if (!response.ok) {
                    throw new Error(`Anthropic API request failed: ${response.status}`);
                }

                const data = await response.json();
                return data.content || data.message || 'No response generated';
            } else {
                const response = await fetch('/api/ai/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt }
                        ],
                        temperature,
                        max_tokens: maxTokens
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API request failed: ${response.status}`);
                }

                const data = await response.json();
                return data.content || data.message || 'No response generated';
            }
        } catch (error) {
            console.error('AI API Error:', error);
            throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    protected cleanGeneratedCode(code: string): string {
        // Remove markdown code block markers and surrounding text
        let cleaned = code.replace(/```[\w]*\n?/g, '');
        cleaned = cleaned.replace(/```/g, '');

        // Remove any leading/trailing explanatory text
        const lines = cleaned.split('\n');
        let startIndex = 0;
        let endIndex = lines.length - 1;

        // Find the first line that looks like code (imports, exports, or component definitions)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import ') ||
                line.startsWith('export ') ||
                line.startsWith('const ') ||
                line.startsWith('function ') ||
                line.startsWith('"use client"') ||
                line.startsWith("'use client'")) {
                startIndex = i;
                break;
            }
        }

        // Find the last meaningful line (usually a closing brace or export)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line && !line.startsWith('//') && !line.match(/^[A-Za-z\s:.,!?-]+$/)) {
                endIndex = i;
                break;
            }
        }

        cleaned = lines.slice(startIndex, endIndex + 1).join('\n');

        // Ensure proper 'use client' directive placement
        cleaned = this.ensureClientDirective(cleaned);

        return cleaned.trim();
    }

    protected ensureClientDirective(code: string): string {
        const hasInteractivity = code.includes('useState') ||
            code.includes('useEffect') ||
            code.includes('onClick') ||
            code.includes('onChange') ||
            code.includes('onSubmit') ||
            code.includes('addEventListener') ||
            code.includes('document.') ||
            code.includes('window.') ||
            code.includes('setInterval') ||
            code.includes('setTimeout');

        const hasUseClient = code.includes('"use client"') || code.includes("'use client'");

        if (hasInteractivity && !hasUseClient) {
            // Add 'use client' directive at the beginning
            const lines = code.split('\n');
            const firstNonEmptyIndex = lines.findIndex(line => line.trim() !== '');

            if (firstNonEmptyIndex !== -1) {
                lines.splice(firstNonEmptyIndex, 0, "'use client';", '');
                return lines.join('\n');
            }
        }

        return code;
    }

    abstract run(context: AgentContext): Promise<AgentResponse>;
} 