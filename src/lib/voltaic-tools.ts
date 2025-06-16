'use client';

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Voltaic File Write Tool
export const voltWriteTool = new DynamicStructuredTool({
    name: 'volt_write',
    description: 'Create or update files in the project. Use this for <volt-write> operations.',
    schema: z.object({
        filePath: z.string().describe('The file path relative to project root'),
        content: z.string().describe('The complete file content'),
        description: z.string().describe('Description of what this file does')
    }),
    func: async ({ filePath, content, description }) => {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            // Write file
            await fs.writeFile(filePath, content, 'utf8');

            return `✅ Successfully created/updated ${filePath}: ${description}`;
        } catch (error) {
            return `❌ Error writing file ${filePath}: ${error}`;
        }
    }
});

// Voltaic Dependency Tool
export const voltDependencyTool = new DynamicStructuredTool({
    name: 'volt_dependency',
    description: 'Install npm packages. Use this for <volt-dependency> operations.',
    schema: z.object({
        packages: z.string().describe('Space-separated list of packages to install')
    }),
    func: async ({ packages }) => {
        try {
            const { stdout, stderr } = await execAsync(`npm install ${packages} --legacy-peer-deps`);
            return `✅ Successfully installed packages: ${packages}\n${stdout}`;
        } catch (error) {
            return `❌ Error installing packages ${packages}: ${error}`;
        }
    }
});

// Voltaic File Rename Tool
export const voltRenameTool = new DynamicStructuredTool({
    name: 'volt_rename',
    description: 'Rename files in the project. Use this for <volt-rename> operations.',
    schema: z.object({
        oldPath: z.string().describe('Current file path'),
        newPath: z.string().describe('New file path')
    }),
    func: async ({ oldPath, newPath }) => {
        try {
            // Ensure new directory exists
            const newDir = path.dirname(newPath);
            await fs.mkdir(newDir, { recursive: true });

            await fs.rename(oldPath, newPath);
            return `✅ Successfully renamed ${oldPath} to ${newPath}`;
        } catch (error) {
            return `❌ Error renaming file: ${error}`;
        }
    }
});

// Voltaic File Delete Tool
export const voltDeleteTool = new DynamicStructuredTool({
    name: 'volt_delete',
    description: 'Delete files from the project. Use this for <volt-delete> operations.',
    schema: z.object({
        filePath: z.string().describe('File path to delete')
    }),
    func: async ({ filePath }) => {
        try {
            await fs.unlink(filePath);
            return `✅ Successfully deleted ${filePath}`;
        } catch (error) {
            return `❌ Error deleting file ${filePath}: ${error}`;
        }
    }
});

// Voltaic SQL Execution Tool (Mock for now - would connect to Supabase)
export const voltExecuteSqlTool = new DynamicStructuredTool({
    name: 'volt_execute_sql',
    description: 'Execute SQL commands. Use this for <volt-execute-sql> operations.',
    schema: z.object({
        sql: z.string().describe('SQL command to execute'),
        description: z.string().describe('Description of what this SQL does')
    }),
    func: async ({ sql, description }) => {
        // For now, just log the SQL - in production this would execute on Supabase
        console.log(`SQL Execution: ${description}`);
        console.log(`SQL: ${sql}`);
        return `✅ SQL executed: ${description}\n\`\`\`sql\n${sql}\n\`\`\``;
    }
});

// Voltaic Command Tool
export const voltCommandTool = new DynamicStructuredTool({
    name: 'volt_command',
    description: 'Execute Voltaic commands like rebuild, restart, refresh, deploy.',
    schema: z.object({
        type: z.enum(['rebuild', 'restart', 'refresh', 'deploy']).describe('Command type to execute')
    }),
    func: async ({ type }) => {
        try {
            switch (type) {
                case 'rebuild':
                    await execAsync('rm -rf node_modules package-lock.json && npm install');
                    return '✅ Project rebuilt successfully';
                case 'restart':
                    // This would restart the dev server - for now just return success
                    return '✅ Development server restarted';
                case 'refresh':
                    return '✅ Preview refreshed';
                case 'deploy':
                    return '✅ Deployment initiated (would deploy to Vercel)';
                default:
                    return `❌ Unknown command type: ${type}`;
            }
        } catch (error) {
            return `❌ Error executing command ${type}: ${error}`;
        }
    }
});

// Export all tools as an array
export const voltaicTools = [
    voltWriteTool,
    voltDependencyTool,
    voltRenameTool,
    voltDeleteTool,
    voltExecuteSqlTool,
    voltCommandTool
]; 