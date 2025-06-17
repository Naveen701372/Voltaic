import { AgentWorkflow, AgentCard, AgentType, GeneratedFile, Message } from '../components/ai/types';
import { logger } from './logger';

export interface AgentResponse {
    success: boolean;
    output?: string;
    files?: GeneratedFile[];
    error?: string;
    previewUrl?: string;
}

export class MultiAgentService {
    private sessionId: string;

    constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async *processWorkflow(userInput: string): AsyncGenerator<{
        workflow: AgentWorkflow;
        isComplete: boolean;
        enthusiasmMessage?: Message;
        agentReveal?: { agentIndex: number };
    }> {
        const workflow: AgentWorkflow = {
            id: `workflow_${Date.now()}`,
            userInput,
            agents: this.createAgentCards(),
            currentAgentIndex: 0,
            isComplete: false
        };

        console.log('\n' + '='.repeat(80));
        console.log(`🚀 STARTING MULTI-AGENT WORKFLOW: ${workflow.id}`);
        console.log(`📝 User Request: "${userInput}"`);
        console.log(`🤖 Total Agents: ${workflow.agents.length}`);
        console.log(`📋 Agent Pipeline: ${workflow.agents.map(a => a.name).join(' → ')}`);
        console.log('='.repeat(80) + '\n');

        logger.info('WORKFLOW', `🚀 Starting workflow: ${workflow.id} with ${workflow.agents.length} agents`);

        // Hide all agents initially - enthusiasm will be streamed as chat, others appear progressively
        workflow.agents.forEach(agent => {
            agent.status = 'hidden';
        });

        // Yield initial workflow state with hidden agents
        yield { workflow, isComplete: false };

        // First, handle the enthusiasm agent separately as chat message only
        const startTime = Date.now();
        console.log(`\n🤖 [SPECIAL AGENT] ENTHUSIASM AGENT`);
        console.log(`📊 Status: STARTING → Acknowledging your idea with excitement`);

        // Create initial streaming message for enthusiasm
        const enthusiasmMessageId = `enthusiasm_${workflow.id}`;
        const initialMessage: Message = {
            id: enthusiasmMessageId,
            type: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };

        yield {
            workflow,
            isComplete: false,
            enthusiasmMessage: initialMessage
        };

        try {
            const response = await this.processEnthusiasmAgent(userInput);

            if (response.success && response.output) {
                // Stream the enthusiasm response
                let currentContent = '';
                const chunks = this.createStreamingChunks(response.output);

                for (const chunk of chunks) {
                    currentContent += chunk;
                    const streamingMessage: Message = {
                        id: enthusiasmMessageId,
                        type: 'assistant',
                        content: currentContent,
                        timestamp: new Date(),
                        isStreaming: true
                    };

                    yield {
                        workflow,
                        isComplete: false,
                        enthusiasmMessage: streamingMessage
                    };

                    // Small delay for streaming effect
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                // Final message without streaming flag
                const finalMessage: Message = {
                    id: enthusiasmMessageId,
                    type: 'assistant',
                    content: currentContent,
                    timestamp: new Date(),
                    isStreaming: false
                };

                // Store enthusiasm output for other agents to reference
                workflow.enthusiasmOutput = response.output;

                // Yield with final enthusiasm message
                yield {
                    workflow,
                    isComplete: false,
                    enthusiasmMessage: finalMessage
                };
            }
        } catch (error) {
            console.error('Enthusiasm agent error:', error);
        }

        // Minimal pause for enthusiasm agent to complete before starting first agent
        await new Promise(resolve => setTimeout(resolve, 150));

        // Process each agent in the workflow
        for (let i = 0; i < workflow.agents.length; i++) {
            const agent = workflow.agents[i];
            const agentStartTime = Date.now();

            console.log(`\n🤖 [AGENT ${i + 1}/${workflow.agents.length}] ${agent.name.toUpperCase()}`);
            console.log(`📊 Status: STARTING → ${agent.description}`);

            // Update current agent index
            workflow.currentAgentIndex = i;

            // ONLY reveal THIS agent if it's hidden (don't touch other agents)
            if (agent.status === 'hidden') {
                console.log(`🎬 REVEALING AGENT: ${agent.name} (index ${i}) - This should be the ONLY agent showing`);
                agent.status = 'pending';

                // Yield immediately after revealing to show the agent card
                yield {
                    workflow,
                    isComplete: false,
                    agentReveal: { agentIndex: i }
                };
                console.log(`✅ Agent ${agent.name} revealed - UI should now show this agent only`);

                // Delay for animation before starting work
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log(`⏳ Agent ${agent.name} already revealed, proceeding...`);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Now transition to working state
            agent.status = 'working';
            agent.progress = 0;
            agent.currentStep = 'Starting...';
            yield { workflow, isComplete: false };

            console.log(`⚡ Status: WORKING → Starting agent processing...`);
            logger.agentStart(agent.id, workflow.id, agent.description);

            try {
                // Show initial progress
                agent.progress = 20;
                agent.currentStep = 'Processing...';
                console.log(`⚡ Status: WORKING → Processing request...`);
                logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                yield { workflow, isComplete: false };

                // Update progress based on agent type
                if (agent.type === 'coder') {
                    agent.progress = 50;
                    agent.currentStep = 'Generating code structure...';
                    console.log(`🔧 Progress: 50% → Generating code structure...`);
                    logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 500));

                    agent.progress = 70;
                    agent.currentStep = 'Creating components...';
                    console.log(`🔧 Progress: 70% → Creating components...`);
                    logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                    yield { workflow, isComplete: false };
                } else {
                    agent.progress = 50;
                    agent.currentStep = 'Generating response...';
                    console.log(`💭 Progress: 50% → Generating response...`);
                    logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                // Process agent based on type with streaming for visible output
                console.log(`🤖 Calling AI agent for ${agent.type} processing...`);
                const response = await this.processAgent(agent.type, userInput, workflow, agent);

                // Update agent to show it's processing the response
                agent.progress = 80;
                agent.currentStep = 'Processing response...';
                yield { workflow, isComplete: false };

                // If this agent produces visible output, stream it
                if (response.success && response.output && (agent.type === 'title-generator' || agent.type === 'analyzer')) {
                    console.log(`📝 Streaming output for ${agent.type}: ${response.output.substring(0, 50)}...`);

                    agent.streaming = true;
                    agent.output = ''; // Clear output before streaming
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 200));

                    // Stream the response
                    let currentContent = '';
                    const chunks = this.createStreamingChunks(response.output);

                    for (const chunk of chunks) {
                        currentContent += chunk;
                        agent.output = currentContent;
                        agent.streaming = true;
                        yield { workflow, isComplete: false };
                        await new Promise(resolve => setTimeout(resolve, 80));
                    }

                    // Finalize streaming
                    agent.streaming = false;
                    agent.output = response.output;
                    console.log(`✅ Streaming complete for ${agent.type}`);
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 300));
                } else if (response.success && response.output) {
                    // For agents that don't stream (like coder), just set the output
                    agent.output = response.output;
                }

                // Update progress to show completion immediately after processing
                if (agent.type === 'coder') {
                    agent.progress = 90;
                    agent.currentStep = 'Parsing generated files...';
                    console.log(`📁 Progress: 90% → Parsing generated files...`);
                    logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 300));
                } else {
                    agent.progress = 90;
                    agent.currentStep = 'Finalizing...';
                    console.log(`✨ Progress: 90% → Finalizing...`);
                    logger.agentProgress(agent.id, workflow.id, agent.currentStep, agent.progress);
                    yield { workflow, isComplete: false };

                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                const duration = Date.now() - agentStartTime;

                if (response.success) {
                    agent.status = 'completed';
                    agent.progress = 100;
                    agent.currentStep = 'Complete';
                    agent.output = response.output;
                    agent.duration = duration;

                    if (response.files) {
                        agent.files = response.files;
                        console.log(`📂 Generated ${response.files.length} files:`);
                        response.files.forEach(file => {
                            console.log(`   📄 ${file.path} (${file.type})`);
                        });
                    }
                    if (response.previewUrl) {
                        workflow.previewUrl = response.previewUrl;
                        console.log(`🌐 Preview URL: ${response.previewUrl}`);
                    }

                    console.log(`✅ COMPLETED: ${agent.name} (${duration}ms)`);
                    if (agent.output) {
                        const truncatedOutput = agent.output.length > 150 ?
                            agent.output.substring(0, 150) + '...' : agent.output;
                        console.log(`📝 Output: ${truncatedOutput}`);
                    }
                    console.log(`⏱️  Duration: ${duration}ms\n`);

                    logger.agentComplete(agent.id, workflow.id, agent.output || 'Success');

                    // CRITICAL: Yield immediately after agent completion to update UI
                    yield { workflow, isComplete: false };

                    // ONLY reveal the next agent if this isn't the last agent
                    if (i < workflow.agents.length - 1) {
                        console.log(`⏳ Current agent ${agent.name} completed. Waiting before revealing next agent (${i + 1})...`);
                        await new Promise(resolve => setTimeout(resolve, 800)); // Longer delay to see completion

                        const nextAgent = workflow.agents[i + 1];
                        if (nextAgent && nextAgent.status === 'hidden') {
                            console.log(`🎬 Revealing ONLY next agent: ${nextAgent.name} (index ${i + 1}) - All other agents should remain as-is`);
                            console.log(`📊 Agent states before reveal:`, workflow.agents.map(a => ({ name: a.name, status: a.status })));

                            nextAgent.status = 'pending';

                            console.log(`📊 Agent states after reveal:`, workflow.agents.map(a => ({ name: a.name, status: a.status })));

                            // Yield specifically for next agent reveal
                            yield {
                                workflow,
                                isComplete: false,
                                agentReveal: { agentIndex: i + 1 }
                            };
                            console.log(`✅ Next agent ${nextAgent.name} revealed, continuing to next iteration`);
                        } else {
                            console.log(`⚠️ Next agent ${nextAgent?.name} is not hidden (status: ${nextAgent?.status}), skipping reveal`);
                        }
                    }
                } else {
                    agent.status = 'error';
                    agent.output = response.error || 'Agent processing failed';
                    agent.duration = duration;

                    console.log(`❌ ERROR: ${agent.name} (${duration}ms)`);
                    console.log(`💥 Error: ${agent.output}\n`);
                    logger.agentError(agent.id, workflow.id, agent.output);

                    yield { workflow, isComplete: false };
                }
            } catch (error) {
                const duration = Date.now() - agentStartTime;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                agent.status = 'error';
                agent.output = errorMessage;
                agent.duration = duration;

                console.log(`💥 EXCEPTION: ${agent.name} (${duration}ms)`);
                console.log(`🚨 Exception: ${errorMessage}`);

                logger.agentError(agent.id, workflow.id, errorMessage, error);
                yield { workflow, isComplete: false };
            }
        }

        // Workflow complete
        workflow.isComplete = true;
        workflow.currentAgentIndex = workflow.agents.length; // Move past last agent
        workflow.finalResult = this.compileFinalResult(workflow);

        console.log('\n' + '='.repeat(80));
        console.log(`🎉 WORKFLOW COMPLETED: ${workflow.id}`);
        console.log(`📊 Summary:`);
        console.log(`   ✅ Successful agents: ${workflow.agents.filter(a => a.status === 'completed').length}`);
        console.log(`   ❌ Failed agents: ${workflow.agents.filter(a => a.status === 'error').length}`);
        console.log(`   📁 Total files generated: ${workflow.finalResult?.files?.length || 0}`);
        if (workflow.previewUrl) {
            console.log(`   🌐 Preview URL: ${workflow.previewUrl}`);
        }
        console.log('='.repeat(80) + '\n');

        logger.info('WORKFLOW', `✅ Workflow complete: ${workflow.id}`);
        yield { workflow, isComplete: true };
    }

    private createAgentCards(): AgentCard[] {
        return [
            // Enthusiasm agent is handled separately as chat message, not as a card
            {
                id: 'title-generator',
                type: 'title-generator',
                name: 'Title Generator',
                description: 'Creating a compelling project title',
                status: 'hidden', // Start hidden, will be revealed progressively
                timestamp: new Date()
            },
            {
                id: 'analyzer-agent',
                type: 'analyzer',
                name: 'Feature Analyzer',
                description: 'Analyzing features and components needed',
                status: 'hidden', // Start hidden, will be revealed progressively
                timestamp: new Date()
            },
            {
                id: 'coder-agent',
                type: 'coder',
                name: 'Code Generator',
                description: 'Writing code and creating application files',
                status: 'hidden', // Start hidden, will be revealed progressively
                timestamp: new Date()
            },
            {
                id: 'error-recovery-agent',
                type: 'error-recovery',
                name: 'Error Recovery Specialist',
                description: 'Analyzing and fixing any issues',
                status: 'hidden', // Start hidden, will be revealed progressively
                timestamp: new Date()
            },
            {
                id: 'preview-agent',
                type: 'preview',
                name: 'Preview Generator',
                description: 'Setting up live preview environment',
                status: 'hidden', // Start hidden, will be revealed progressively
                timestamp: new Date()
            }
        ];
    }

    private async processAgent(agentType: AgentType, userInput: string, workflow: AgentWorkflow, agent?: AgentCard): Promise<AgentResponse> {
        switch (agentType) {
            case 'enthusiasm':
                return this.processEnthusiasmAgent(userInput, agent);
            case 'title-generator':
                return this.processTitleGenerator(userInput, agent);
            case 'analyzer':
                return this.processAnalyzerAgent(userInput, workflow, agent);
            case 'coder':
                return this.processCoderAgent(userInput, workflow, agent);
            case 'error-recovery':
                return this.processErrorRecoveryAgent(userInput, workflow, agent);
            case 'preview':
                return this.processPreviewAgent(userInput, workflow, agent);
            default:
                return { success: false, error: 'Unknown agent type' };
        }
    }

    private async processEnthusiasmAgent(userInput: string, agent?: AgentCard): Promise<AgentResponse> {
        logger.agentProgress('enthusiasm-agent', 'workflow_current', 'Analyzing user idea');

        // Create enthusiasm response with features and inspirations
        const response = await this.callAI({
            prompt: `You are an enthusiastic AI assistant. The user wants to create: "${userInput}"

Respond with genuine enthusiasm and excitement. Include:
1. Acknowledge their idea enthusiastically 
2. Show 3-4 key features this landing page should have
3. Mention design inspirations (clean, modern, professional)
4. End with "Let's get to it! 🚀"

Keep response to 3-4 sentences. Be exciting but professional.`,
            systemPrompt: 'You are Voltaic, an enthusiastic AI that loves building beautiful apps.'
        });

        logger.agentProgress('enthusiasm-agent', 'workflow_current', 'Generated enthusiastic response');

        return {
            success: true,
            output: response
        };
    }

    private async processTitleGenerator(userInput: string, agent?: AgentCard): Promise<AgentResponse> {
        logger.agentProgress('title-generator', 'workflow_current', 'Generating compelling title');

        const response = await this.callAI({
            prompt: `Generate a compelling, professional title for this landing page idea: "${userInput}"

Requirements:
- 2-4 words maximum
- Professional and modern sounding
- Memorable and brandable
- No generic words like "app", "platform", "solution"

Return ONLY the title, nothing else.`,
            systemPrompt: 'You are a branding expert who creates memorable product names.'
        });

        logger.agentProgress('title-generator', 'workflow_current', `Generated title: "${response.trim()}"`);

        return {
            success: true,
            output: response.trim()
        };
    }

    private async processAnalyzerAgent(userInput: string, workflow: AgentWorkflow, agent?: AgentCard): Promise<AgentResponse> {
        const enthusiasm = workflow.enthusiasmOutput || '';
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || '';

        const response = await this.callAI({
            prompt: `Analyze this landing page idea and identify the key components needed:

User Idea: "${userInput}"
Project Title: "${title}"
Previous Analysis: "${enthusiasm}"

Create a technical breakdown including:
1. Hero section requirements
2. Key features to highlight (3-4 main ones)
3. UI components needed (navbar, hero, features, CTA, footer)
4. Design style (modern, clean, professional with glass morphism)
5. Color scheme suggestions

Format as a concise technical specification.`,
            systemPrompt: 'You are a senior product designer who creates detailed component specifications.'
        });

        return {
            success: true,
            output: response
        };
    }

    private async processCoderAgent(userInput: string, workflow: AgentWorkflow, agent?: AgentCard): Promise<AgentResponse> {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'Landing Page';
        const analysis = workflow.agents.find(a => a.type === 'analyzer')?.output || '';

        logger.agentProgress('coder-agent', 'workflow_current', `Starting code generation for "${title}"`);
        console.log(`🔧 CODE GENERATOR: Starting code generation for "${title}"`);

        logger.agentProgress('coder-agent', 'workflow_current', 'Preparing comprehensive code prompt');
        console.log(`🔧 CODE GENERATOR: Preparing comprehensive code prompt`);

        // Use Anthropic for code generation
        const codeResponse = await this.callAI({
            prompt: `Generate a complete Next.js 14 application for: "${userInput}"

Project Title: "${title}"
Technical Requirements: "${analysis}"

Generate 4 main files:
1. app/page.tsx - Main landing page with glass morphism design
2. components/Hero.tsx - Hero section component  
3. components/Features.tsx - Features showcase section
4. components/Navbar.tsx - Navigation component

🚨 CRITICAL CODE QUALITY REQUIREMENTS:
- NEVER include any markdown text, explanations, or comments outside the actual code
- NEVER include \`\`\` code block markers in the actual files  
- NEVER add any prose or explanations after the closing braces
- Each file must contain ONLY valid TypeScript/React code
- Files must end immediately after the last closing brace
- ENSURE ALL JSX TAGS ARE PROPERLY CLOSED AND COMPLETE
- COMPLETE ALL MAP FUNCTIONS AND JSX EXPRESSIONS PROPERLY
- NEVER LEAVE JSX EXPRESSIONS INCOMPLETE OR TRUNCATED

📋 FUNCTIONAL REQUIREMENTS:
- Use TypeScript and React
- Modern glass morphism design with Tailwind CSS
- Responsive layout for mobile and desktop
- Beautiful gradients and smooth animations
- Professional, clean code structure
- All navigation links must be clickable and functional
- Implement smooth scrolling to sections when nav items are clicked
- Add section IDs for navigation targets (hero, features, about, contact)

🔧 TECHNICAL RULES:
- Export components with named exports: export function ComponentName() {}
- Use ONLY relative imports (no @/ aliases)
- app/page.tsx imports: import { Hero } from '../components/Hero'
- All lucide-react icons: import { IconName } from 'lucide-react'
- Ensure all syntax is valid TypeScript/React with no errors

🧭 NAVIGATION REQUIREMENTS:
- Navbar must have working smooth scroll navigation
- Add onClick handlers that scroll to sections smoothly
- Use document.getElementById and scrollIntoView with smooth behavior
- Section IDs should be: hero, features, about, contact (or relevant sections)
- Example: onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}

🎨 DESIGN REQUIREMENTS - DARK GLASS MORPHISM THEME:
- **MANDATORY DARK THEME**: Use dark backgrounds (slate-900, purple-900, gray-900)
- **Main background**: bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
- **Text colors**: text-white, text-white/80, text-white/60 for hierarchy
- **Glass morphism cards**: bg-white/10, border border-white/20, backdrop-blur-xl
- **Interactive elements**: hover:bg-white/20, hover:scale-105 transitions
- **Buttons**: bg-gradient-to-r from-purple-500 to-blue-600 with hover effects
- **Accent colors**: purple-400, blue-400, green-400 for highlights
- **Typography**: Large bold headings (text-4xl, text-5xl) with gradient text effects
- **Spacing**: Generous padding and margins for premium feel
- **Animations**: Smooth transitions (transition-all duration-300)
- NEVER use light colors like gray-900 text or blue-50 backgrounds
- NEVER use external image files (no /image.jpg, /photo.png, etc.)
- Use lucide-react icons and CSS gradients only

Return ONLY the code for each file in this exact format (no extra text):
==== app/page.tsx ====
[PURE CODE ONLY]

==== components/Hero.tsx ====
[PURE CODE ONLY]

==== components/Features.tsx ====
[PURE CODE ONLY]

==== components/Navbar.tsx ====
[PURE CODE ONLY]`,
            systemPrompt: 'You are a senior React/Next.js developer who writes clean, production-ready code with DARK GLASS MORPHISM designs. You NEVER include explanations or markdown in code files. You create beautiful dark-themed applications with glass morphism effects, gradient backgrounds, and premium styling. CRITICAL: Always use DARK THEME colors (slate-900, purple-900, text-white) and glass morphism effects (bg-white/10, backdrop-blur-xl). Always add "use client" directive at the top of components that use React hooks, event handlers, or browser APIs.',
            useAnthropic: true
        });

        logger.agentProgress('coder-agent', 'workflow_current', 'Parsing generated code into files');
        console.log(`🔧 CODE GENERATOR: Parsing generated code into files`);
        console.log(`🔧 CODE GENERATOR: Raw AI response length: ${codeResponse.length} characters`);
        console.log(`🔧 CODE GENERATOR: First 500 chars of response:`);
        console.log(codeResponse.substring(0, 500));
        console.log(`🔧 CODE GENERATOR: Last 500 chars of response:`);
        console.log(codeResponse.substring(Math.max(0, codeResponse.length - 500)));

        // Parse the generated code into files
        const files = this.parseGeneratedCode(codeResponse, title);

        logger.agentProgress('coder-agent', 'workflow_current', `Generated ${files.length} files successfully`);
        console.log(`🔧 CODE GENERATOR: Generated ${files.length} files successfully`);

        return {
            success: true,
            output: `Successfully generated ${files.length} files for your ${title}. The code includes a modern glass morphism design with responsive layout, hero section, features showcase, and navigation.`,
            files
        };
    }

    private async processErrorRecoveryAgent(userInput: string, workflow: AgentWorkflow, agent?: AgentCard): Promise<AgentResponse> {
        const files = workflow.agents.find(a => a.type === 'coder')?.files || [];

        if (files.length === 0) {
            return {
                success: true,
                output: 'No files to analyze for errors. Error recovery is on standby.'
            };
        }

        // Skip importing error recovery service to avoid client-side bundling issues
        // The actual error recovery will happen server-side during the build process

        // Simulate analyzing the generated code for potential issues
        const analysisReport: string[] = [];
        let fixedFiles: GeneratedFile[] = [...files];
        let totalFixes = 0;

        // Check for common issues in the generated files
        for (const file of files) {
            if (file.path.endsWith('.tsx')) {
                // Check for truncation issues first
                if (this.detectTruncationIssues(file.content)) {
                    console.log(`🔧 ERROR RECOVERY: Detected truncation in ${file.path}, using fallback`);
                    const fallbackContent = this.generateFallbackComponent(file.path,
                        workflow.agents.find(a => a.type === 'title-generator')?.output || 'App');

                    const fixedFileIndex = fixedFiles.findIndex(f => f.path === file.path);
                    if (fixedFileIndex !== -1) {
                        fixedFiles[fixedFileIndex] = { ...file, content: fallbackContent };
                        analysisReport.push(`✅ Fixed truncated component in ${file.path}`);
                        totalFixes++;
                    }
                }
                // Check for missing "use client" directives
                else if (this.needsUseClient(file.content) && !file.content.includes('"use client"')) {
                    const updatedContent = `"use client";\n\n${file.content}`;
                    const fixedFileIndex = fixedFiles.findIndex(f => f.path === file.path);
                    if (fixedFileIndex !== -1) {
                        fixedFiles[fixedFileIndex] = { ...file, content: updatedContent };
                        analysisReport.push(`✅ Added "use client" directive to ${file.path}`);
                        totalFixes++;
                    }
                }

                // Check for potential import issues
                if (file.content.includes('@/') && !file.content.includes('import ')) {
                    analysisReport.push(`⚠️ Potential import path issue in ${file.path}`);
                }

                // Check for missing key props in map functions
                if (file.content.includes('.map(') && !file.content.includes('key=')) {
                    analysisReport.push(`⚠️ Missing key props in map function in ${file.path}`);
                }
            }
        }

        // Generate comprehensive analysis output
        const output = totalFixes > 0
            ? `🔧 **Error Prevention Analysis Complete**

**Pre-emptive Fixes Applied:** ${totalFixes} optimization${totalFixes > 1 ? 's' : ''}

${analysisReport.join('\n')}

**System Status:** ✅ Code optimized and ready for compilation
**Error Recovery:** Standing by for any build issues
**Next Step:** Proceeding to preview generation with enhanced error handling`

            : `🔍 **Code Quality Analysis Complete**

**Files Analyzed:** ${files.length} components
**Issues Found:** None - code looks clean!
**Optimization Status:** All files pass pre-compilation checks

${analysisReport.length > 0 ? '\n**Notes:**\n' + analysisReport.join('\n') : ''}

**System Status:** ✅ Ready for seamless preview generation
**Error Recovery:** Monitoring system ready for any edge cases`;

        return {
            success: true,
            output,
            files: totalFixes > 0 ? fixedFiles : undefined
        };
    }

    private needsUseClient(content: string): boolean {
        const clientFeatures = [
            'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
            'onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur',
            'document.', 'window.', 'localStorage', 'sessionStorage',
            'addEventListener'
        ];

        return clientFeatures.some(feature => content.includes(feature));
    }

    private detectTruncationIssues(code: string): boolean {
        // Check for common truncation patterns that cause React compilation errors
        const truncationPatterns = [
            /className={\s*`[^`]*$/m,           // Incomplete template literal in className
            /w-\d+\s+h-\s*$/m,                 // Incomplete Tailwind classes like "w-12 h-"
            /<[a-zA-Z][^>]*\s+$/m,             // Incomplete JSX tag at end
            /{\s*[^}]*$/m,                     // Incomplete JSX expression at end
            /\(\s*$/m,                         // Incomplete function call at end
            /icon className={\s*`[^`]*$/m,     // Specific issue with icon className truncation
        ];

        return truncationPatterns.some(pattern => pattern.test(code));
    }

    private async processPreviewAgent(userInput: string, workflow: AgentWorkflow, agent?: AgentCard): Promise<AgentResponse> {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'App';
        const files = workflow.agents.find(a => a.type === 'coder')?.files || [];

        logger.agentProgress('preview-agent', 'workflow_current', `Setting up preview for "${title}" with ${files.length} files`);

        try {
            const projectId = workflow.id;

            // Check if we're in production environment (multiple checks for different platforms)
            const isProduction =
                process.env.NODE_ENV === 'production' ||
                process.env.VERCEL === '1' ||
                process.env.VERCEL_ENV === 'production' ||
                process.env.NETLIFY === 'true' ||
                process.env.AWS_LAMBDA_FUNCTION_NAME || // AWS Lambda
                process.cwd().includes('/var/task') || // Vercel Lambda working directory
                process.cwd().includes('/.vercel/') || // Vercel local development
                !process.env.NODE_ENV || // Default to production if NODE_ENV is not set
                process.env.VOLTAIC_FORCE_PRODUCTION_MODE === 'true'; // Force production mode for testing

            if (isProduction) {
                // 🚀 BREAKTHROUGH: Use the production dev server system that was successfully tested
                logger.agentProgress('preview-agent', 'workflow_current', `Production environment: Using breakthrough dev server system`);

                try {
                    // Convert generated files to the format expected by the dev server API
                    const reactComponent = this.extractMainReactComponent(files, title);

                    // Call the production dev server API
                    let baseUrl = '';
                    if (typeof window === 'undefined') {
                        // Server-side: construct base URL
                        baseUrl = process.env.VERCEL_URL
                            ? `https://${process.env.VERCEL_URL}`
                            : 'http://localhost:3000';
                    } else {
                        // Client-side: use current origin
                        baseUrl = window.location.origin;
                    }

                    const devServerResponse = await fetch(`${baseUrl}/api/dev-server/start`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            projectId,
                            projectTitle: title,
                            reactComponent,
                            quickMode: true // Use quick preview mode for fast deployment
                        })
                    });

                    const devServerResult = await devServerResponse.json();

                    if (devServerResult.success) {
                        // The dev server system is working! Generate preview URL
                        const previewUrl = `/api/dev-server/preview/${projectId}`;

                        // Save project to database
                        await this.saveProjectToDatabase(title, userInput, workflow.id, files, previewUrl);

                        logger.agentProgress('preview-agent', 'workflow_current', `✅ Production dev server created successfully`);

                        return {
                            success: true,
                            output: `🚀 **Live React Preview Ready!** Your ${title} is now running in Vercel's serverless environment!\n\n✨ **Preview URL:** ${previewUrl}\n\n🔧 **Technology:** Serverless React with CDN libraries\n📦 **Files:** ${files.length} components converted to live preview\n⚡ **Speed:** Quick preview mode (< 10 seconds)\n🌐 **Environment:** Production-ready serverless deployment\n\nYour app is running live with full React functionality in the cloud!`,
                            files,
                            previewUrl
                        };
                    } else {
                        // Dev server failed, log the error and fall back
                        console.log('Production dev server failed:', devServerResult.error);
                        logger.agentProgress('preview-agent', 'workflow_current', `Dev server failed: ${devServerResult.error}, falling back to template`);
                    }
                } catch (devServerError) {
                    console.log('Production dev server error:', devServerError);
                    logger.agentProgress('preview-agent', 'workflow_current', `Dev server error: ${devServerError}, falling back to template`);
                }

                // Fallback to template preview if dev server fails
                const templatePreviewUrl = `/preview/template/${projectId}`;
                await this.saveProjectToDatabase(title, userInput, workflow.id, files, templatePreviewUrl);

                return {
                    success: true,
                    output: `📄 **Template Preview Ready!** Your ${title} is ready for viewing.\n\n🎨 **Preview Mode:** Template-based rendering (fallback)\n📁 **Files Generated:** ${files.length} components\n\nView your beautiful landing page design in the preview panel!`,
                    files,
                    previewUrl: templatePreviewUrl
                };
            }

            // Development environment - continue with file writing and live preview
            try {
                let baseUrl = '';
                if (typeof window === 'undefined') {
                    baseUrl = 'http://localhost:3000';
                } else {
                    baseUrl = window.location.origin;
                }

                const response = await fetch(`${baseUrl}/api/write-files`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        projectId,
                        title,
                        files
                    })
                });

                if (response.ok) {
                    console.log('✅ Files written successfully to filesystem');
                } else {
                    console.log('⚠️ File writing failed, falling back to template preview');
                    const fallbackPreviewUrl = `/api/preview/${projectId}`;

                    // Save project to database even if file writing failed
                    await this.saveProjectToDatabase(title, userInput, workflow.id, files, fallbackPreviewUrl);

                    return {
                        success: true,
                        output: `📄 **Template Preview Ready!** Your ${title} is ready for viewing.\n\nNote: File writing failed, using template preview mode.`,
                        previewUrl: fallbackPreviewUrl
                    };
                }
            } catch (writeError) {
                console.log('⚠️ File writing error:', writeError);
                const errorPreviewUrl = `/api/preview/${projectId}`;

                // Save project to database even with write errors
                await this.saveProjectToDatabase(title, userInput, workflow.id, files, errorPreviewUrl);

                return {
                    success: true,
                    output: `📄 **Template Preview Ready!** Your ${title} is ready for viewing.\n\nNote: Using template preview due to file system limitations.`,
                    previewUrl: errorPreviewUrl
                };
            }

            // Check if dynamic build is forced via configuration
            const forceBuildPreview = process.env.VOLTAIC_FORCE_BUILD_PREVIEW === 'true';

            if (forceBuildPreview) {
                console.log('🔧 Force build preview enabled - always using dynamic build mode');
                logger.info('PREVIEW_AGENT', '🔧 Force build preview enabled - always using dynamic build mode', null, 'preview-agent', workflow.id);
            }

            // Determine which preview approach to use
            const complexity = this.determineComplexity(files);
            const shouldUseBuild = forceBuildPreview || this.shouldUseBuildPreview(files, complexity, userInput);

            console.log(`📊 Preview decision: complexity=${complexity}, forceBuild=${forceBuildPreview}, shouldUseBuild=${shouldUseBuild}`);
            logger.info('PREVIEW_AGENT', `📊 Preview decision: complexity=${complexity}, forceBuild=${forceBuildPreview}, shouldUseBuild=${shouldUseBuild}`, null, 'preview-agent', workflow.id);

            if (shouldUseBuild) {
                // Try dynamic build preview
                try {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                    const buildResponse = await fetch(`${baseUrl}/api/preview/build`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            projectId,
                            title,
                            files,
                            mode: 'build'
                        })
                    });

                    const buildResult = await buildResponse.json();

                    if (buildResult.success) {
                        // Save project to database
                        await this.saveProjectToDatabase(title, userInput, workflow.id, files, buildResult.previewUrl);

                        return {
                            success: true,
                            output: `🚀 **Live App Preview Ready!** Your ${title} is now running as a real Next.js application!\n\n✨ **Preview URL:** ${buildResult.previewUrl}\n\n🔧 **Build Mode:** Dynamic compilation with full React functionality\n📦 **Files:** ${files.length} components successfully built\n\nYour app is running live with all interactive features!`,
                            previewUrl: buildResult.previewUrl
                        };
                    } else {
                        console.log('Build preview failed, falling back to template:', buildResult.error);
                    }
                } catch (buildError) {
                    console.log('Build preview error, falling back to template:', buildError);
                }
            }

            // Fallback to template preview
            const templatePreviewUrl = `/api/preview/${projectId}`;

            // Save project to database for template preview too
            await this.saveProjectToDatabase(title, userInput, workflow.id, files, templatePreviewUrl);

            return {
                success: true,
                output: `📄 **Template Preview Ready!** Your ${title} is ready for viewing.\n\n🎨 **Preview Mode:** Template-based rendering\n📁 **Files Generated:** ${files.length} components\n\nView your beautiful landing page design in the preview panel!`,
                previewUrl: templatePreviewUrl
            };

        } catch (error) {
            return {
                success: false,
                error: `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    private determineComplexity(files: GeneratedFile[]): 'simple' | 'medium' | 'complex' {
        const fileCount = files.length;
        const hasApiRoutes = files.some(f => f.type === 'api');
        const hasComplexLogic = files.some(f =>
            f.content.includes('useState') ||
            f.content.includes('useEffect') ||
            f.content.includes('fetch(') ||
            f.content.includes('async') ||
            f.content.includes('localStorage') ||
            f.content.includes('useRouter')
        );

        if (hasApiRoutes || hasComplexLogic || fileCount > 10) {
            return 'complex';
        } else if (fileCount > 5 || files.some(f => f.content.length > 2000)) {
            return 'medium';
        } else {
            return 'simple';
        }
    }

    private shouldUseBuildPreview(files: GeneratedFile[], complexity: 'simple' | 'medium' | 'complex', userInput: string): boolean {
        // Always use build for complex apps
        if (complexity === 'complex') {
            return true;
        }

        // Use build if user specifically requests interactive features
        const requestsInteractivity = userInput.toLowerCase().includes('interactive') ||
            userInput.toLowerCase().includes('dynamic') ||
            userInput.toLowerCase().includes('state') ||
            userInput.toLowerCase().includes('form');

        // Use build if files contain interactive patterns
        const hasInteractiveFeatures = files.some(f =>
            f.content.includes('onClick') ||
            f.content.includes('onChange') ||
            f.content.includes('onSubmit') ||
            f.content.includes('useState') ||
            f.content.includes('useEffect')
        );

        return requestsInteractivity || hasInteractiveFeatures;
    }

    private async saveFilesToDisk(files: GeneratedFile[], projectId: string, title: string): Promise<{ success: boolean; error?: string }> {
        // For now, skip file writing and just return success
        // Files will be available in the workflow object for the preview
        return { success: true };
    }

    private async saveProjectToDatabase(title: string, userInput: string, workflowId: string, files: GeneratedFile[], previewUrl: string): Promise<void> {
        try {
            let baseUrl = '';
            if (typeof window === 'undefined') {
                baseUrl = 'http://localhost:3000';
            } else {
                baseUrl = window.location.origin;
            }

            const response = await fetch(`${baseUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: title,
                    description: `AI-generated landing page: ${userInput}`,
                    workflow_id: workflowId,
                    files: files,
                    preview_url: previewUrl,
                    project_type: 'landing_page'
                })
            });

            if (response.ok) {
                console.log(`✅ Project "${title}" saved to database successfully`);
                logger.info('PROJECT_SAVE', `✅ Project "${title}" saved to database successfully`);
            } else {
                const error = await response.text();
                console.error(`❌ Failed to save project "${title}" to database:`, error);
            }
        } catch (error) {
            console.error(`❌ Error saving project "${title}" to database:`, error);
        }
    }

    private async callAI(params: { prompt: string; systemPrompt: string; useAnthropic?: boolean }): Promise<string> {
        try {
            // Import AI models directly
            const { ChatAnthropic } = await import('@langchain/anthropic');
            const { ChatOpenAI } = await import('@langchain/openai');
            const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

            const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
            const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

            let model;
            let serviceName = '';

            // Use appropriate model based on useAnthropic flag
            if (params.useAnthropic && anthropicKey) {
                console.log(`🤖 AI REQUEST: Calling Anthropic Claude...`);
                serviceName = 'Anthropic Claude';
                model = new ChatAnthropic({
                    apiKey: anthropicKey,
                    model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
                    temperature: 0.1
                });
            } else if (openaiKey) {
                console.log(`🤖 AI REQUEST: Calling OpenAI GPT...`);
                serviceName = 'OpenAI GPT';
                model = new ChatOpenAI({
                    apiKey: openaiKey,
                    model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
                    temperature: 0.1
                });
            } else if (anthropicKey) {
                console.log(`🤖 AI REQUEST: Calling Anthropic Claude (fallback)...`);
                serviceName = 'Anthropic Claude';
                model = new ChatAnthropic({
                    apiKey: anthropicKey,
                    model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
                    temperature: 0.1
                });
            } else {
                throw new Error('No AI API key found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
            }

            console.log(`📝 Prompt length: ${params.prompt.length} characters`);
            console.log(`🎯 System prompt: ${params.systemPrompt.substring(0, 60)}...`);

            const startTime = Date.now();

            const messages = [
                new SystemMessage(params.systemPrompt),
                new HumanMessage(params.prompt)
            ];

            const response = await model.invoke(messages);

            const duration = Date.now() - startTime;
            const responseContent = response.content as string;
            console.log(`✅ AI RESPONSE: Received from ${serviceName} (${duration}ms)`);
            console.log(`📊 Response length: ${responseContent.length} characters`);

            return responseContent;

        } catch (error) {
            console.error('AI call error:', error);
            throw error;
        }
    }

    private parseGeneratedCode(codeResponse: string, title: string): GeneratedFile[] {
        const files: GeneratedFile[] = [];
        const sections = codeResponse.split('====');

        console.log(`🔍 PARSER: Found ${sections.length} sections in AI response`);
        sections.forEach((section, index) => {
            const preview = section.trim().substring(0, 100);
            console.log(`🔍 PARSER: Section ${index}: "${preview}${section.length > 100 ? '...' : ''}"`);
        });

        for (let i = 1; i < sections.length; i += 2) {
            if (i + 1 < sections.length) {
                const pathLine = sections[i].trim();
                let code = sections[i + 1].trim();

                if (pathLine && code) {
                    let path = pathLine.replace(/=+/g, '').trim();
                    console.log(`🔍 PARSER: Processing file: "${path}" (original pathLine: "${pathLine}")`);

                    // Smart path normalization: only add src/ prefix if path doesn't already have it
                    // and the path starts with app/ or components/
                    if (!path.startsWith('src/')) {
                        if (path.startsWith('app/') || path.startsWith('components/')) {
                            const newPath = 'src/' + path;
                            console.log(`🔍 PARSER: Normalized path: "${path}" -> "${newPath}"`);
                            path = newPath;
                        }
                        // For standalone CSS files, put them in src/app/
                        else if (path.endsWith('.css') && !path.includes('/')) {
                            const newPath = 'src/app/' + path;
                            console.log(`🔍 PARSER: CSS file normalized: "${path}" -> "${newPath}"`);
                            path = newPath;
                        }
                    }
                    // If path already starts with src/, leave it as-is to avoid src/src/ nesting

                    // Skip if we already have this file (prevent duplicates)
                    if (files.some(f => f.path === path)) {
                        console.log(`⚠️  Skipping duplicate file: ${path}`);
                        continue;
                    }

                    // Enhanced code cleaning
                    code = this.cleanGeneratedCode(code);

                    // Validate the generated code and fallback if invalid
                    if (!this.validateReactComponent(code, path)) {
                        console.log(`⚠️  Invalid React component detected in ${path}, using fallback`);
                        code = this.generateFallbackComponent(path, title);
                    }

                    // Add CSS import to layout files
                    if (path.includes('layout.tsx')) {
                        code = this.ensureLayoutHasCssImport(code);
                    }

                    console.log(`📁 Adding file: ${path}`);
                    files.push({
                        path,
                        content: code,
                        description: this.getFileDescription(path),
                        type: this.getFileType(path)
                    });
                }
            }
        }

        // Fallback if parsing fails
        if (files.length === 0) {
            console.log(`⚠️  No files parsed, using fallback generation`);
            const fallbackFiles = this.generateFallbackFiles(title);
            console.log(`📋 Fallback files generated (${fallbackFiles.length}):`);
            fallbackFiles.forEach(file => {
                console.log(`  📁 ${file.path} (${file.type}) - ${file.description}`);
            });
            return fallbackFiles;
        }

        // Add required CSS file if missing
        if (!files.some(f => f.path.includes('globals.css'))) {
            console.log(`📄 Adding missing globals.css`);
            files.push({
                path: 'src/app/globals.css',
                content: this.generateGlobalsCss(),
                description: 'Global CSS styles with Tailwind',
                type: 'style'
            });
        }

        return files;
    }

    private validateReactComponent(code: string, path: string): boolean {
        // Basic validation checks for React components
        const requiredPatterns = [
            'export function', // Must have export function
            'return (' // Must have return statement
        ];

        // Check for required patterns
        for (const pattern of requiredPatterns) {
            if (!code.includes(pattern)) {
                console.log(`❌ Missing required pattern "${pattern}" in ${path}`);
                return false;
            }
        }

        // Check for proper JSX structure
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;

        if (openBraces !== closeBraces) {
            console.log(`❌ Mismatched braces in ${path}: ${openBraces} open, ${closeBraces} close`);
            return false;
        }

        // Check for incomplete template literals in JSX
        const templateLiteralPattern = /className={\s*`[^`]*$/m;
        if (templateLiteralPattern.test(code)) {
            console.log(`❌ Incomplete template literal in className detected in ${path}`);
            return false;
        }

        // Check for incomplete map functions
        if (code.includes('.map(') && !code.includes('))}')) {
            console.log(`❌ Incomplete map function detected in ${path}`);
            return false;
        }

        // Check for incomplete JSX tags
        const openTags = (code.match(/<[a-zA-Z][^>]*[^/]>/g) || []).length;
        const closeTags = (code.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
        const selfClosingTags = (code.match(/<[a-zA-Z][^>]*\/>/g) || []).length;

        if (openTags !== closeTags + selfClosingTags) {
            console.log(`❌ Mismatched JSX tags in ${path}: ${openTags} open, ${closeTags} close, ${selfClosingTags} self-closing`);
            return false;
        }

        return true;
    }

    private generateFallbackComponent(path: string, title: string): string {
        if (path.includes('Features.tsx')) {
            return this.generateFeaturesComponent();
        } else if (path.includes('Hero.tsx')) {
            return this.generateHeroComponent(title);
        } else if (path.includes('Navbar.tsx')) {
            return this.generateNavbarComponent(title);
        } else if (path.includes('page.tsx')) {
            return this.generateMainPage(title, '');
        }

        // Default fallback
        return `'use client';

export function DefaultComponent() {
    return (
        <div className="p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Component</h2>
            <p className="text-white/70">This is a fallback component.</p>
        </div>
    );
}`;
    }

    private cleanGeneratedCode(code: string): string {
        // Remove code block markers
        if (code.startsWith('```')) {
            const lines = code.split('\n');
            lines.shift(); // Remove first ```tsx line
            if (lines[lines.length - 1].trim() === '```') {
                lines.pop(); // Remove last ``` line
            }
            code = lines.join('\n');
        }

        // Split by lines for processing
        const lines = code.split('\n');
        const cleanLines: string[] = [];
        let exportFunctionStarted = false;
        let braceCount = 0;
        let functionBraceCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Stop processing if we hit obvious markdown patterns
            if (trimmedLine.startsWith('```') ||
                trimmedLine.startsWith('This implementation') ||
                trimmedLine.startsWith('Key features:') ||
                trimmedLine.startsWith('Make sure to:') ||
                trimmedLine.startsWith('To complete') ||
                /^\d+\./.test(trimmedLine) || // numbered lists
                trimmedLine.startsWith('- ')) { // bullet points
                break;
            }

            // Track when we start an export function
            if (trimmedLine.includes('export function') || trimmedLine.includes('export default function')) {
                exportFunctionStarted = true;
                functionBraceCount = 0;
            }

            // Count braces for the main function
            if (exportFunctionStarted) {
                for (const char of line) {
                    if (char === '{') functionBraceCount++;
                    if (char === '}') functionBraceCount--;
                }
            }

            // Count all braces in the file
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }

            // Always add the line
            cleanLines.push(line);

            // If we're in an export function and hit the closing brace AND it's the component's closing brace
            if (exportFunctionStarted && functionBraceCount === 0 && trimmedLine === '}' && cleanLines.length > 10) {
                // Look ahead to see if there's more meaningful code
                let hasMoreContent = false;
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine && !nextLine.startsWith('```') && !nextLine.startsWith('//') &&
                        !nextLine.startsWith('This') && !nextLine.startsWith('Note:') &&
                        !/^\d+\./.test(nextLine) && !nextLine.startsWith('- ')) {
                        hasMoreContent = true;
                        break;
                    }
                }
                if (!hasMoreContent) {
                    break;
                }
            }
        }

        let cleanedCode = cleanLines.join('\n').trim();

        // Remove any trailing incomplete code or explanations
        const lastBraceIndex = cleanedCode.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            // Keep everything up to and including the last brace
            const afterLastBrace = cleanedCode.substring(lastBraceIndex + 1).trim();
            // If there's significant content after the last brace, it's likely explanation text
            if (afterLastBrace.length > 50 || afterLastBrace.includes('This') || afterLastBrace.includes('Note:')) {
                cleanedCode = cleanedCode.substring(0, lastBraceIndex + 1);
            }
        }

        // Auto-add 'use client' directive if needed
        cleanedCode = this.ensureClientDirective(cleanedCode);

        return cleanedCode;
    }

    /**
     * Automatically add 'use client' directive for components that need it
     */
    private ensureClientDirective(code: string): string {
        // Check if code already has 'use client' directive
        if (code.includes("'use client'") || code.includes('"use client"')) {
            return code;
        }

        // Check if component needs client-side features
        const needsClientDirective =
            code.includes('useState') ||
            code.includes('useEffect') ||
            code.includes('useCallback') ||
            code.includes('useMemo') ||
            code.includes('useRef') ||
            code.includes('useContext') ||
            code.includes('useReducer') ||
            code.includes('onClick') ||
            code.includes('onChange') ||
            code.includes('onSubmit') ||
            code.includes('onFocus') ||
            code.includes('onBlur') ||
            code.includes('document.') ||
            code.includes('window.') ||
            code.includes('addEventListener') ||
            code.includes('localStorage') ||
            code.includes('sessionStorage') ||
            code.includes('navigator.');

        if (needsClientDirective) {
            // Add 'use client' at the top of the file
            const lines = code.split('\n');

            // Find the first non-empty, non-comment line
            let insertIndex = 0;
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
                    insertIndex = i;
                    break;
                }
            }

            lines.splice(insertIndex, 0, "'use client';", '');
            return lines.join('\n');
        }

        return code;
    }

    private getFileDescription(path: string): string {
        if (path.includes('page.tsx')) return 'Main landing page component';
        if (path.includes('Hero.tsx')) return 'Hero section component';
        if (path.includes('Features.tsx')) return 'Features section component';
        if (path.includes('Navbar.tsx')) return 'Navigation component';
        return 'Component file';
    }

    private getFileType(path: string): 'component' | 'page' | 'api' | 'config' | 'style' {
        if (path.includes('/app/') && path.endsWith('page.tsx')) return 'page';
        if (path.includes('/api/')) return 'api';
        if (path.includes('/components/')) return 'component';
        if (path.endsWith('.css') || path.endsWith('.scss')) return 'style';
        if (path.includes('config') || path.endsWith('.json') || path.endsWith('.js')) return 'config';
        return 'component';
    }

    private ensureLayoutHasCssImport(code: string): string {
        // Check if CSS import already exists
        if (code.includes("import './globals.css'") || code.includes('import "./globals.css"')) {
            return code;
        }

        // Add CSS import to the top of layout files
        const lines = code.split('\n');
        let insertIndex = 0;

        // Find where to insert (after any existing imports)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('import') && !line.startsWith('//') && !line.startsWith('/*')) {
                insertIndex = i;
                break;
            }
        }

        lines.splice(insertIndex, 0, "import './globals.css'", '');
        console.log(`✅ Added CSS import to layout file`);
        return lines.join('\n');
    }

    private generateGlobalsCss(): string {
        return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .glass-primary {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 16px;
  }
  
  .glass-dark {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(17, 25, 40, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.125);
    border-radius: 16px;
  }

  .glass-button {
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: calc(16px * 0.7);
    transition: all 0.3s ease;
  }

  .glass-button:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.12));
    transform: translateY(-1px);
  }

  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }
}`;
    }

    private generateFallbackFiles(title: string): GeneratedFile[] {
        return [
            {
                path: 'src/app/page.tsx',
                content: this.generateMainPage(title, ''),
                description: 'Main landing page component',
                type: 'page'
            },
            {
                path: 'src/app/layout.tsx',
                content: this.generateLayoutComponent(title),
                description: 'Root layout component with CSS import',
                type: 'page'
            },
            {
                path: 'src/app/globals.css',
                content: this.generateGlobalsCss(),
                description: 'Global CSS styles with Tailwind',
                type: 'style'
            },
            {
                path: 'src/components/Hero.tsx',
                content: this.generateHeroComponent(title),
                description: 'Hero section component',
                type: 'component'
            },
            {
                path: 'src/components/Features.tsx',
                content: this.generateFeaturesComponent(),
                description: 'Features section component',
                type: 'component'
            },
            {
                path: 'src/components/Navbar.tsx',
                content: this.generateNavbarComponent(title),
                description: 'Navigation component',
                type: 'component'
            }
        ];
    }

    private createStreamingChunks(text: string): string[] {
        const words = text.split(' ');
        const chunks: string[] = [];

        // Stream word by word with spaces to ensure proper formatting
        for (let i = 0; i < words.length; i++) {
            if (i === 0) {
                chunks.push(words[i]);
            } else {
                chunks.push(' ' + words[i]);
            }
        }

        return chunks;
    }

    private compileFinalResult(workflow: AgentWorkflow) {
        const title = workflow.agents.find(a => a.type === 'title-generator')?.output || 'Landing Page';
        const files = workflow.agents.find(a => a.type === 'coder')?.files || [];

        return {
            title,
            files,
            preview: workflow.previewUrl ? `<iframe src="${workflow.previewUrl}" width="100%" height="600" frameborder="0"></iframe>` : this.generatePreview(title, files)
        };
    }

    private generatePreview(title: string, files: GeneratedFile[]): string {
        const mainFile = files.find(f => f.path.includes('page.tsx')) || files[0];
        if (!mainFile) {
            return `<div>No files generated</div>`;
        }

        return `
        <div style="font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1>${title}</h1>
            <p>Generated ${files.length} files:</p>
            <ul>
                ${files.map(f => `<li><strong>${f.path}</strong> (${f.type})</li>`).join('')}
            </ul>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3>Main Component Preview:</h3>
                <pre style="white-space: pre-wrap; font-size: 14px;">${mainFile.content.substring(0, 500)}...</pre>
            </div>
        </div>
        `;
    }

    /**
     * Extract the main React component from generated files for the dev server API
     */
    private extractMainReactComponent(files: GeneratedFile[], title: string): string {
        // Find the main page component
        const mainPageFile = files.find(f =>
            f.path.includes('page.tsx') ||
            f.path.includes('App.tsx') ||
            f.path.includes('index.tsx')
        );

        if (mainPageFile) {
            // Return the main page component
            return mainPageFile.content;
        }

        // If no main page found, create a simple component that imports and uses other components
        const componentFiles = files.filter(f =>
            f.path.includes('components/') &&
            f.path.endsWith('.tsx') &&
            !f.path.includes('layout') &&
            !f.path.includes('globals')
        );

        if (componentFiles.length === 0) {
            // Fallback: create a simple React component
            return `"use client";

import React from 'react';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">${title}</h1>
                <p className="text-white/80">Welcome to your new React application!</p>
            </div>
        </div>
    );
}`;
        }

        // Create a main component that imports and uses the generated components
        const imports = componentFiles.map(f => {
            const componentName = f.path.split('/').pop()?.replace('.tsx', '') || 'Component';
            const importPath = f.path.replace('.tsx', '').replace('components/', './components/');
            return `import { ${componentName} } from '${importPath}';`;
        }).join('\n');

        const componentUsage = componentFiles.map(f => {
            const componentName = f.path.split('/').pop()?.replace('.tsx', '') || 'Component';
            return `            <${componentName} />`;
        }).join('\n');

        return `"use client";

import React from 'react';
${imports}

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
${componentUsage}
        </div>
    );
}`;
    }

    private generateMainPage(title: string, analysis: string): string {
        return `'use client';

import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Navbar } from '../components/Navbar';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Navbar />
            <section id="hero">
                <Hero title="${title}" />
            </section>
            <section id="features">
                <Features />
            </section>
        </div>
    );
}`;
    }

    private generateHeroComponent(title: string): string {
        return `'use client';

interface HeroProps {
    title: string;
}

export function Hero({ title }: HeroProps) {
    return (
        <section className="pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
                    {title}
                </h1>
                <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
                    Experience the future of modern web applications with our cutting-edge platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Get Started
                    </button>
                    <button className="px-8 py-4 border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all duration-300">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
}`;
    }

    private generateFeaturesComponent(): string {
        return `'use client';

import { Sparkles, Zap, Shield } from 'lucide-react';

export function Features() {
    const features = [
        {
            icon: Sparkles,
            title: 'Modern Design',
            description: 'Beautiful glass morphism UI with smooth animations'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Optimized performance for the best user experience'
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security and 99.9% uptime'
        }
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-white text-center mb-16">
                    Why Choose Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                            <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                            <p className="text-white/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}`;
    }

    private generateLayoutComponent(title: string): string {
        return `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '${title}',
  description: 'Generated by Voltaic AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`;
    }

    private generateNavbarComponent(title: string): string {
        return `'use client';

interface NavbarProps {
    title?: string;
}

export function Navbar({ title = "${title}" }: NavbarProps) {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white cursor-pointer"
                         onClick={() => scrollToSection('hero')}>
                        {title}
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button 
                            onClick={() => scrollToSection('hero')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Home
                        </button>
                        <button 
                            onClick={() => scrollToSection('features')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Features
                        </button>
                        <button 
                            onClick={() => scrollToSection('about')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            About
                        </button>
                        <button 
                            onClick={() => scrollToSection('contact')}
                            className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            Contact
                        </button>
                    </div>
                    <button className="px-6 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}`;
    }
} 