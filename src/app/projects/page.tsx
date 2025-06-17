'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import {
    ArrowLeft,
    Plus,
    Folder,
    Calendar,
    Eye,
    ExternalLink,
    Play,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { AppHeader } from '@/components/AppHeader';

interface Project {
    id: string;
    name: string;
    description: string;
    project_type: string;
    status: 'generating' | 'ready' | 'error' | 'archived';
    preview_url?: string;
    workflow_id?: string;
    created_at: string;
    updated_at: string;
}

interface ServerStatus {
    success: boolean;
    status: {
        projectId: string;
        port: number;
        status: 'starting' | 'running' | 'failed' | 'stopped';
        startTime: number;
        lastAccess: number;
        uptime: number;
        lastActivity: number;
        url: string;
    } | null;
    message?: string;
}

export default function ProjectsPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [serverStatuses, setServerStatuses] = useState<Map<string, ServerStatus>>(new Map());
    const [launchingProjects, setLaunchingProjects] = useState<Set<string>>(new Set());

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (user && !loading) {
            loadProjects();
        }
    }, [user?.id, loading]); // Only trigger when user ID changes or loading state changes

    // Check server statuses for ready projects (only when projects change)
    useEffect(() => {
        if (projects.length > 0) {
            checkServerStatuses();
        }
    }, [projects.length]); // Only trigger when the number of projects changes

    const loadProjects = async () => {
        if (!user) return;

        setLoadingProjects(true);
        try {
            console.log('Starting to load projects directly from Supabase...');
            console.log('Current user ID:', user.id);
            console.log('User email:', user.email);

            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading projects:', error);
            } else {
                console.log('Loaded projects directly:', projects);
                console.log('Number of projects:', projects?.length || 0);
                setProjects(projects || []);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const checkServerStatuses = async () => {
        const readyProjects = projects.filter(p => p.status === 'ready');
        const statusMap = new Map<string, ServerStatus>();

        await Promise.all(
            readyProjects.map(async (project) => {
                try {
                    const response = await fetch(`/api/preview/manage?projectId=${project.workflow_id || project.id}`);
                    const status: ServerStatus = await response.json();
                    statusMap.set(project.id, status);
                } catch (error) {
                    console.error(`Error checking status for ${project.id}:`, error);
                    statusMap.set(project.id, { success: false, status: null });
                }
            })
        );

        setServerStatuses(statusMap);
    };

    const launchProject = async (project: Project) => {
        const projectKey = project.workflow_id || project.id;
        setLaunchingProjects(prev => new Set(prev).add(project.id));

        try {
            // Construct the correct project path
            // workflow_id already contains the workflow prefix, so we need to check
            let projectPath;
            if (projectKey.startsWith('workflow_')) {
                projectPath = `./generated-apps/${projectKey}`;
            } else {
                projectPath = `./generated-apps/workflow_${projectKey}`;
            }

            console.log(`Launching project: ${project.name}`);
            console.log(`Project ID: ${project.id}`);
            console.log(`Workflow ID: ${project.workflow_id}`);
            console.log(`Project Key: ${projectKey}`);
            console.log(`Project Path: ${projectPath}`);

            const response = await fetch('/api/preview/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: projectKey,
                    projectPath,
                    action: 'start'
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Update server status
                await checkServerStatuses();

                // Open the preview after a short delay to ensure server is ready
                setTimeout(() => {
                    window.open(result.url, '_blank');
                }, 2000);
            } else {
                console.error('Failed to launch project:', result.error);

                // Provide more specific error messages based on the error type
                let errorMessage = 'Failed to launch project. ';
                if (result.error?.includes('does not exist')) {
                    errorMessage += 'Project files not found. The project may have been corrupted.';
                } else if (result.error?.includes('package.json')) {
                    errorMessage += 'Project configuration is missing. Try regenerating the project.';
                } else if (result.error?.includes('ENOENT')) {
                    errorMessage += 'Required dependencies not found. Please ensure Node.js and npm are installed.';
                } else if (result.error?.includes('syntax error') || result.error?.includes('Syntax Error')) {
                    errorMessage += 'The generated code has syntax errors. This project needs to be regenerated.';
                } else if (result.error?.includes('timeout')) {
                    errorMessage += 'The server took too long to start. This may be due to build errors or missing dependencies.';
                } else {
                    errorMessage += 'Please try again or regenerate the project if the issue persists.';
                }

                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error launching project:', error);
            alert('Network error occurred while launching project. Please check your connection and try again.');
        } finally {
            setLaunchingProjects(prev => {
                const newSet = new Set(prev);
                newSet.delete(project.id);
                return newSet;
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'generating': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'error': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'archived': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ready': return 'Ready';
            case 'generating': return 'Generating';
            case 'error': return 'Error';
            case 'archived': return 'Archived';
            default: return 'Unknown';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getServerStatusInfo = (project: Project) => {
        const status = serverStatuses.get(project.id);
        if (!status || !status.success || !status.status) {
            return { isRunning: false, canLaunch: true, status: 'stopped' as const, url: '', port: null };
        }

        const serverStatus = status.status.status;
        return {
            isRunning: serverStatus === 'running',
            canLaunch: serverStatus === 'stopped' || serverStatus === 'failed',
            status: serverStatus,
            url: status.status.url,
            port: status.status.port
        };
    };

    const handleProjectClick = (project: Project) => {
        const serverInfo = getServerStatusInfo(project);

        if (serverInfo.isRunning && serverInfo.url) {
            // Server is running, open directly
            window.open(serverInfo.url, '_blank');
        } else if (project.preview_url) {
            // Try stored preview URL
            const previewUrl = `/api/project-preview/${project.id}`;
            window.open(previewUrl, '_blank');
        } else {
            // Launch the server
            launchProject(project);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to signin
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply animate-pulse" />
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-2000" />
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-4000" />
                </div>
            </div>

            {/* Header */}
            <AppHeader
                title="My Projects"
                subtitle={`${projects.length} ${projects.length === 1 ? 'project' : 'projects'} created`}
                logoDestination="home"
            />

            {/* Main Content */}
            <main className="relative z-10 pt-20 lg:pt-24 px-4 py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Navigation and Actions */}
                    <div className="flex items-center justify-between mb-8">
                        <GlassButton
                            onClick={() => router.push('/dashboard')}
                            variant="dark"
                            className="p-3"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </GlassButton>
                        <button
                            onClick={() => router.push('/create')}
                            className="h-10 px-4 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500/90 hover:to-teal-500/90 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Project</span>
                        </button>
                    </div>

                    {/* Projects Grid */}
                    {loadingProjects ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <GlassCard className="p-12 text-center">
                            <Folder className="w-16 h-16 text-white/40 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                            <p className="text-gray-300 mb-6">
                                It all starts with an idea. Create your first MVP to get started.
                            </p>
                            <button
                                onClick={() => router.push('/create')}
                                className="h-10 px-4 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500/90 hover:to-teal-500/90 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Your First Project</span>
                            </button>
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => {
                                const serverInfo = getServerStatusInfo(project);
                                const isLaunching = launchingProjects.has(project.id);

                                // Debug log for each project
                                console.log('Project data:', {
                                    id: project.id,
                                    name: project.name,
                                    workflow_id: project.workflow_id
                                });

                                return (
                                    <GlassCard key={project.id} className="p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                                        {/* Header with title, status badges, and ID */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-white truncate leading-tight">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400/30 flex items-center justify-center">
                                                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-400">
                                                        ID: {project.workflow_id ? project.workflow_id.replace('workflow_', '') : project.id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 flex-shrink-0 ml-3">
                                                <div className={`px-2.5 py-1 rounded-full text-xs border font-medium ${getStatusColor(project.status)}`}>
                                                    {getStatusText(project.status)}
                                                </div>
                                                {project.status === 'ready' && serverInfo.isRunning && (
                                                    <div className="px-2.5 py-1 rounded-full text-xs border text-emerald-400 bg-emerald-400/10 border-emerald-400/30 font-medium animate-pulse">
                                                        Live
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-300 text-sm mb-5 line-clamp-2 leading-relaxed">
                                            {project.description || 'No description available'}
                                        </p>

                                        {/* Metadata - 2 lines only */}
                                        <div className="space-y-2 text-xs text-gray-400 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                <span>Created {formatDate(project.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Folder className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="capitalize">{project.project_type.replace('_', ' ')}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            {project.status === 'ready' && (
                                                <div className="flex gap-2 justify-center">
                                                    {serverInfo.isRunning ? (
                                                        // Server is running - show preview button
                                                        <button
                                                            onClick={() => handleProjectClick(project)}
                                                            className="h-10 px-2.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-1.5 min-w-[85px]"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>Preview</span>
                                                        </button>
                                                    ) : (
                                                        // Server is not running - show launch button
                                                        <button
                                                            onClick={() => launchProject(project)}
                                                            disabled={isLaunching}
                                                            className="h-10 px-2.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[85px]"
                                                        >
                                                            {isLaunching ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    <span>Launching...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play className="w-4 h-4" />
                                                                    <span>Launch</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}

                                                    {/* Action buttons */}
                                                    <button
                                                        onClick={() => checkServerStatuses()}
                                                        className="h-10 w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center group"
                                                        title="Refresh server status for all projects"
                                                    >
                                                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                                                    </button>

                                                    {serverInfo.isRunning && (
                                                        <button
                                                            onClick={() => window.open(serverInfo.url, '_blank')}
                                                            className="h-10 w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center group"
                                                            title="Open in new tab"
                                                        >
                                                            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {project.status === 'generating' && (
                                                <button
                                                    disabled
                                                    className="w-full h-10 px-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Generating...</span>
                                                </button>
                                            )}

                                            {project.status === 'error' && (
                                                <button
                                                    onClick={() => router.push('/create')}
                                                    className="w-full h-10 px-4 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-300 hover:text-red-200 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Retry Generation</span>
                                                </button>
                                            )}

                                            {/* Server status indicator */}
                                            {project.status === 'ready' && serverInfo.status && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <div className={`w-2 h-2 rounded-full ${serverInfo.status === 'running' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                                                            serverInfo.status === 'starting' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
                                                                'bg-gray-400'
                                                            }`} />
                                                        <span className="capitalize font-medium">
                                                            {serverInfo.status === 'running' ? 'Server Online' :
                                                                serverInfo.status === 'starting' ? 'Starting...' :
                                                                    'Server Offline'}
                                                        </span>
                                                    </div>
                                                    {serverInfo.isRunning && (
                                                        <span className="text-green-400 font-medium">
                                                            Port {serverInfo.port}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 