import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentResponse } from '@/types/agent';

interface CodeFile {
  filename: string;
  content: string;
}

export class CodeGeneratorAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResponse> {
    try {
      this.reportProgress(10, 'Analyzing specification and wireframes...');

      // Get enhanced specification
      const specArtifact = context.artifacts.find(
        artifact => artifact.metadata?.type === 'enhanced-specification'
      );

      if (!specArtifact) {
        throw new Error('Enhanced specification not found');
      }

      const specification = JSON.parse(specArtifact.content);

      this.reportProgress(30, 'Generating component code...');

      // Generate components
      const components = await this.generateComponents(specification);

      this.reportProgress(50, 'Generating pages...');

      // Generate pages
      const pages = await this.generatePages(specification);

      this.reportProgress(70, 'Generating API routes...');

      // Generate API routes
      const apiRoutes = await this.generateApiRoutes(specification);

      this.reportProgress(85, 'Generating configuration files...');

      // Generate config files
      const configFiles = await this.generateConfigFiles(specification);

      this.reportProgress(95, 'Creating code artifacts...');

      // Create artifacts
      const artifacts = [
        ...components.map(comp => this.createArtifact('code', comp.filename, comp.content, { type: 'component' })),
        ...pages.map(page => this.createArtifact('code', page.filename, page.content, { type: 'page' })),
        ...apiRoutes.map(route => this.createArtifact('code', route.filename, route.content, { type: 'api-route' })),
        ...configFiles.map(config => this.createArtifact('file', config.filename, config.content, { type: 'config' }))
      ];

      this.reportProgress(100, 'Code generation completed');

      return {
        success: true,
        content: 'Successfully generated complete application code',
        artifacts,
        metadata: {
          componentsGenerated: components.length,
          pagesGenerated: pages.length,
          apiRoutesGenerated: apiRoutes.length,
          configFilesGenerated: configFiles.length
        }
      };

    } catch (error) {
      this.log('error', 'Failed to generate code', error);
      throw error;
    }
  }

  private async generateComponents(specification: any): Promise<CodeFile[]> {
    const components: CodeFile[] = [];

    // Generate basic components
    components.push({
      filename: 'components/ui/Button.tsx',
      content: `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`}
      {...props}
    />
  );
};`
    });

    return components;
  }

  private async generatePages(specification: any): Promise<CodeFile[]> {
    const pages: CodeFile[] = [];

    pages.push({
      filename: 'app/page.tsx',
      content: `import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-24 text-center">
        <h1 className="text-4xl font-bold mb-6">
          ${specification.title || 'Welcome to Your App'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ${specification.description || 'Your application description goes here.'}
        </p>
      </main>
    </div>
  );
}`
    });

    return pages;
  }

  private async generateApiRoutes(specification: any): Promise<CodeFile[]> {
    const routes: CodeFile[] = [];

    routes.push({
      filename: 'app/api/hello/route.ts',
      content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello World' });
}`
    });

    return routes;
  }

  private async generateConfigFiles(specification: any): Promise<CodeFile[]> {
    const configs: CodeFile[] = [];

    configs.push({
      filename: 'package.json',
      content: JSON.stringify({
        name: specification.title?.toLowerCase().replace(/\s+/g, '-') || 'generated-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'typescript': '^5.0.0'
        }
      }, null, 2)
    });

    return configs;
  }
} 