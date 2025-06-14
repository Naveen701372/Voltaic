import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentResponse } from '@/types/agent';

export class FileSystemAgent extends BaseAgent {
    async execute(context: AgentContext): Promise<AgentResponse> {
        try {
            this.reportProgress(10, 'Analyzing project artifacts...');

            // Get all code artifacts from previous agents
            const codeArtifacts = context.artifacts.filter(
                artifact => artifact.type === 'code' || artifact.type === 'file'
            );

            if (codeArtifacts.length === 0) {
                throw new Error('No code artifacts found to organize');
            }

            this.reportProgress(30, 'Creating project structure...');

            // Create project structure
            const projectStructure = await this.createProjectStructure(codeArtifacts);

            this.reportProgress(60, 'Generating file tree...');

            // Generate file tree visualization
            const fileTree = this.generateFileTree(projectStructure);

            this.reportProgress(80, 'Creating project files...');

            // Create organized file artifacts
            const organizedFiles = this.organizeFiles(codeArtifacts, projectStructure);

            this.reportProgress(95, 'Creating structure artifacts...');

            // Create structure artifacts
            const structureArtifact = this.createArtifact(
                'data',
                'project-structure.json',
                JSON.stringify(projectStructure, null, 2),
                { type: 'project-structure' }
            );

            const fileTreeArtifact = this.createArtifact(
                'data',
                'file-tree.txt',
                fileTree,
                { type: 'file-tree' }
            );

            this.reportProgress(100, 'File system organization completed');

            return {
                success: true,
                content: 'Successfully organized project file structure',
                artifacts: [structureArtifact, fileTreeArtifact, ...organizedFiles],
                metadata: {
                    totalFiles: codeArtifacts.length,
                    directories: Object.keys(projectStructure.directories).length,
                    organizedFiles: organizedFiles.length
                }
            };

        } catch (error) {
            this.log('error', 'Failed to organize file system', error);
            throw error;
        }
    }

    private async createProjectStructure(artifacts: any[]): Promise<ProjectStructure> {
        const structure: ProjectStructure = {
            name: 'generated-project',
            directories: {
                'src/': {
                    'app/': {
                        'api/': {},
                        'auth/': {},
                        'dashboard/': {}
                    },
                    'components/': {
                        'ui/': {},
                        'layout/': {},
                        'auth/': {},
                        'dashboard/': {}
                    },
                    'lib/': {
                        'agents/': {
                            'implementations/': {}
                        }
                    },
                    'types/': {}
                },
                'public/': {
                    'images/': {},
                    'icons/': {}
                }
            },
            files: []
        };

        // Organize files into appropriate directories
        artifacts.forEach(artifact => {
            const path = this.determineFilePath(artifact.name);
            structure.files.push({
                name: artifact.name,
                path: path,
                type: artifact.type,
                size: artifact.content.length
            });
        });

        return structure;
    }

    private determineFilePath(filename: string): string {
        // Determine the appropriate directory path for each file
        if (filename.includes('components/')) {
            return 'src/components/';
        }

        if (filename.includes('app/')) {
            return 'src/app/';
        }

        if (filename.includes('lib/')) {
            return 'src/lib/';
        }

        if (filename.includes('types/')) {
            return 'src/types/';
        }

        if (filename.endsWith('.json') && !filename.includes('/')) {
            return './';
        }

        if (filename.endsWith('.js') || filename.endsWith('.ts')) {
            return 'src/';
        }

        return './';
    }

    private generateFileTree(structure: ProjectStructure): string {
        let tree = `${structure.name}/\n`;
        tree += this.generateDirectoryTree(structure.directories, 1);

        // Add root files
        const rootFiles = structure.files.filter(file => file.path === './');
        rootFiles.forEach(file => {
            tree += `├── ${file.name}\n`;
        });

        return tree;
    }

    private generateDirectoryTree(directories: any, depth: number): string {
        let tree = '';
        const indent = '│   '.repeat(depth - 1);
        const entries = Object.entries(directories);

        entries.forEach(([dirName, subDirs], index) => {
            const isLast = index === entries.length - 1;
            const prefix = isLast ? '└── ' : '├── ';

            tree += `${indent}${prefix}${dirName}\n`;

            if (typeof subDirs === 'object' && subDirs && Object.keys(subDirs).length > 0) {
                tree += this.generateDirectoryTree(subDirs, depth + 1);
            }
        });

        return tree;
    }

    private organizeFiles(artifacts: any[], structure: ProjectStructure): any[] {
        return artifacts.map(artifact => {
            const path = this.determineFilePath(artifact.name);
            const fullPath = path + artifact.name.split('/').pop();

            return this.createArtifact(
                artifact.type,
                fullPath,
                artifact.content,
                {
                    ...artifact.metadata,
                    type: 'organized-file',
                    originalId: artifact.id,
                    directory: path
                }
            );
        });
    }
}

interface ProjectStructure {
    name: string;
    directories: Record<string, any>;
    files: ProjectFile[];
}

interface ProjectFile {
    name: string;
    path: string;
    type: string;
    size: number;
} 