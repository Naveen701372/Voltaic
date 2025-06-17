'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GeneratedFile {
    path: string;
    content: string;
    description: string;
    type: 'component' | 'page' | 'api' | 'config' | 'style';
}

interface ProjectData {
    title: string;
    files: GeneratedFile[];
    description?: string;
}

export default function TemplatePreview() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProjectData() {
            try {
                // In production, we'll need to get the data from the session/API
                // For now, create a fallback preview
                const fallbackData: ProjectData = {
                    title: 'Generated App Preview',
                    description: 'This is a preview of your generated application. In production, the full build is not available.',
                    files: [
                        {
                            path: 'src/app/page.tsx',
                            type: 'page',
                            description: 'Main application page',
                            content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Generated App</h1>
        <p className="text-white/80 mb-6">Your application has been generated successfully!</p>
        <button className="glass-button px-6 py-2 text-white font-medium rounded-lg hover:scale-105 transition-transform">
          Get Started
        </button>
      </div>
    </div>
  );
}`
                        }
                    ]
                };

                setProjectData(fallbackData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load project data');
            } finally {
                setLoading(false);
            }
        }

        loadProjectData();
    }, [projectId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="glass-primary p-8 rounded-2xl text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading preview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="glass-primary p-8 rounded-2xl text-center">
                    <h1 className="text-xl font-bold text-white mb-4">Preview Error</h1>
                    <p className="text-white/80">{error}</p>
                </div>
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="glass-primary p-8 rounded-2xl text-center">
                    <h1 className="text-xl font-bold text-white mb-4">Project Not Found</h1>
                    <p className="text-white/80">The requested project could not be found.</p>
                </div>
            </div>
        );
    }

    // Render the generated app content
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Production Preview Header */}
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-yellow-200 text-sm font-medium">
                            Production Preview Mode
                        </span>
                    </div>
                    <span className="text-yellow-200/80 text-xs">
                        Full build available in development
                    </span>
                </div>
            </div>

            {/* App Preview */}
            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
                <div className="glass-primary p-8 rounded-2xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">{projectData.title}</h1>
                    <p className="text-white/80 mb-6">
                        {projectData.description || "Your application has been generated successfully!"}
                    </p>
                    <div className="space-y-3">
                        <button className="glass-button w-full px-6 py-3 text-white font-medium rounded-lg hover:scale-105 transition-transform">
                            Get Started
                        </button>
                        <div className="text-white/60 text-sm">
                            <p>Generated with {projectData.files.length} files</p>
                            <p className="mt-1">Project ID: {projectId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Files Preview */}
            <div className="max-w-4xl mx-auto p-6">
                <div className="glass-primary p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4">Generated Files</h2>
                    <div className="space-y-3">
                        {projectData.files.map((file, index) => (
                            <div key={index} className="glass-dark p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium">{file.path}</span>
                                    <span className="text-white/60 text-sm capitalize">{file.type}</span>
                                </div>
                                <p className="text-white/80 text-sm mb-3">{file.description}</p>
                                <details className="text-white/70">
                                    <summary className="cursor-pointer text-sm hover:text-white transition-colors">
                                        View Code
                                    </summary>
                                    <pre className="mt-3 p-3 bg-black/30 rounded text-xs overflow-x-auto">
                                        <code>{file.content}</code>
                                    </pre>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .glass-primary {
          backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .glass-dark {
          backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }

        .glass-button {
          backdrop-filter: blur(10px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: all 0.3s ease;
        }

        .glass-button:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          transform: translateY(-1px);
        }
      `}</style>
        </div>
    );
} 