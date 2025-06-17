import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const supabase = createSupabaseServerClient();

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = params;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // Get the project from database
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, name, preview_url, status, workflow_id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // If project has a preview URL, redirect to it
        if (project.preview_url) {
            // Check if it's a full URL or relative path
            if (project.preview_url.startsWith('http')) {
                return NextResponse.redirect(project.preview_url);
            } else {
                // Construct full URL for relative paths
                const baseUrl = request.nextUrl.origin;
                return NextResponse.redirect(`${baseUrl}${project.preview_url}`);
            }
        }

        // If no preview URL, try to construct one from workflow_id
        if (project.workflow_id) {
            const baseUrl = request.nextUrl.origin;
            return NextResponse.redirect(`${baseUrl}/api/preview/${project.workflow_id}`);
        }

        return NextResponse.json({
            error: 'No preview available for this project',
            project: {
                id: project.id,
                name: project.name,
                status: project.status
            }
        }, { status: 404 });

    } catch (error) {
        console.error('Error in project preview API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 