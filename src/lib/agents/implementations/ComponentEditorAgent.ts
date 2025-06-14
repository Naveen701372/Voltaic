import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentResponse } from '@/types/agent';

export class ComponentEditorAgent extends BaseAgent {
    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            this.reportProgress(10, 'Analyzing modification request...');

            // Get modification request from context
            const modificationRequest = context.state.modificationRequest as string;
            const targetComponent = context.state.targetComponent as string;

            if (!modificationRequest || !targetComponent) {
                throw new Error('Modification request and target component are required');
            }

            this.reportProgress(30, 'Finding target component...');

            // Find the target component in artifacts
            const componentArtifact = context.artifacts.find(
                artifact => artifact.name === targetComponent || artifact.name.includes(targetComponent)
            );

            if (!componentArtifact) {
                throw new Error(`Component not found: ${targetComponent}`);
            }

            this.reportProgress(60, 'Applying modifications...');

            // Apply modifications to the component
            const modifiedCode = await this.modifyComponent(
                componentArtifact.content,
                modificationRequest
            );

            this.reportProgress(90, 'Creating modified component artifact...');

            // Create modified component artifact
            const modifiedArtifact = this.createArtifact(
                'code',
                componentArtifact.name,
                modifiedCode,
                {
                    type: 'modified-component',
                    originalId: componentArtifact.id,
                    modificationRequest
                }
            );

            this.reportProgress(100, 'Component modification completed');

            return {
                success: true,
                content: `Successfully modified component: ${targetComponent}`,
                artifacts: [modifiedArtifact],
                metadata: {
                    targetComponent,
                    modificationRequest,
                    originalSize: componentArtifact.content.length,
                    modifiedSize: modifiedCode.length
                }
            };

        } catch (error) {
            this.log('error', 'Failed to modify component', error);
            throw error;
        }
    }

    private async modifyComponent(originalCode: string, request: string): Promise<string> {
        // For now, we'll implement basic modifications
        // In production, this would use Claude API for intelligent code modifications

        let modifiedCode = originalCode;

        // Simple text-based modifications based on common requests
        if (request.toLowerCase().includes('add button')) {
            modifiedCode = this.addButton(modifiedCode);
        }

        if (request.toLowerCase().includes('change color') || request.toLowerCase().includes('change style')) {
            modifiedCode = this.updateStyling(modifiedCode, request);
        }

        if (request.toLowerCase().includes('add prop') || request.toLowerCase().includes('add property')) {
            modifiedCode = this.addProperty(modifiedCode, request);
        }

        if (request.toLowerCase().includes('remove') || request.toLowerCase().includes('delete')) {
            modifiedCode = this.removeElement(modifiedCode, request);
        }

        // Add modification comment
        const timestamp = new Date().toISOString();
        const comment = `// Modified on ${timestamp}: ${request}`;

        // Insert comment at the top of the file (after imports)
        const lines = modifiedCode.split('\n');
        const importEndIndex = this.findImportEndIndex(lines);
        lines.splice(importEndIndex + 1, 0, comment, '');

        return lines.join('\n');
    }

    private addButton(code: string): string {
        // Add a button to the component
        const buttonCode = `
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => console.log('Button clicked')}
        >
          New Button
        </button>`;

        // Find the return statement and add button before the closing tag
        const returnMatch = code.match(/return\s*\(/);
        if (returnMatch) {
            const returnIndex = returnMatch.index! + returnMatch[0].length;
            const beforeReturn = code.substring(0, returnIndex);
            const afterReturn = code.substring(returnIndex);

            // Find the last closing tag and insert button before it
            const lastClosingTagMatch = afterReturn.match(/.*(<\/\w+>)\s*\)\s*;\s*$/);
            if (lastClosingTagMatch) {
                const insertIndex = afterReturn.lastIndexOf(lastClosingTagMatch[1]);
                const beforeInsert = afterReturn.substring(0, insertIndex);
                const afterInsert = afterReturn.substring(insertIndex);

                return beforeReturn + beforeInsert + buttonCode + '\n      ' + afterInsert;
            }
        }

        return code;
    }

    private updateStyling(code: string, request: string): string {
        // Update styling based on request
        let modifiedCode = code;

        // Extract color from request if mentioned
        const colorMatch = request.match(/(?:color|to)\s+(\w+)/i);
        if (colorMatch) {
            const newColor = colorMatch[1].toLowerCase();

            // Replace common color classes
            modifiedCode = modifiedCode.replace(/bg-\w+-\d+/g, `bg-${newColor}-600`);
            modifiedCode = modifiedCode.replace(/text-\w+-\d+/g, `text-${newColor}-600`);
            modifiedCode = modifiedCode.replace(/border-\w+-\d+/g, `border-${newColor}-600`);
        }

        return modifiedCode;
    }

    private addProperty(code: string, request: string): string {
        // Add a new property to the component interface
        const propMatch = request.match(/add\s+(?:prop|property)\s+(\w+)/i);
        if (propMatch) {
            const propName = propMatch[1];

            // Find the interface definition
            const interfaceMatch = code.match(/interface\s+\w+Props[^{]*{([^}]*)}/);
            if (interfaceMatch) {
                const interfaceContent = interfaceMatch[1];
                const newProp = `  ${propName}?: string;`;

                // Add the new property
                const updatedInterface = interfaceContent.trim() + '\n' + newProp;
                return code.replace(interfaceMatch[1], '\n' + updatedInterface + '\n');
            }
        }

        return code;
    }

    private removeElement(code: string, request: string): string {
        // Remove elements based on request
        const elementMatch = request.match(/remove\s+(\w+)/i);
        if (elementMatch) {
            const elementName = elementMatch[1].toLowerCase();

            // Remove lines containing the element
            const lines = code.split('\n');
            const filteredLines = lines.filter(line =>
                !line.toLowerCase().includes(elementName) ||
                line.trim().startsWith('//')
            );

            return filteredLines.join('\n');
        }

        return code;
    }

    private findImportEndIndex(lines: string[]): number {
        let lastImportIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import ') || line.startsWith('export ')) {
                lastImportIndex = i;
            } else if (line && !line.startsWith('//') && lastImportIndex >= 0) {
                break;
            }
        }

        return lastImportIndex;
    }
} 