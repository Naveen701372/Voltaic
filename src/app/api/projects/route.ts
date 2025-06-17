import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

async function getAuthenticatedUser(supabase: any) {
    // Try multiple ways to get the user
    try {
        // First, try getting the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session?.user && !sessionError) {
            return { user: session.user, error: null };
        }

        // If session fails, try getting user directly
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (user && !userError) {
            return { user, error: null };
        }

        return { user: null, error: userError || sessionError || new Error('No authentication found') };
    } catch (error) {
        return { user: null, error };
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient();

        // Get the authenticated user
        const { user, error: authError } = await getAuthenticatedUser(supabase);

        if (authError || !user) {
            console.log('Authentication failed:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, workflow_id, files, preview_url, project_type = 'landing_page' } = body;

        if (!name || !workflow_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name,
                description: description || `AI-generated ${project_type.replace('_', ' ')} created from user input`,
                project_type,
                status: 'ready',
                preview_url,
                workflow_id
            })
            .select()
            .single();

        if (projectError) {
            console.error('Error creating project:', projectError);
            return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
        }

        // Save project files if provided
        if (files && Array.isArray(files) && files.length > 0) {
            const fileInserts = files.map(file => ({
                project_id: project.id,
                file_path: file.path,
                file_content: file.content,
                file_type: file.type || 'component',
                description: file.description
            }));

            const { error: filesError } = await supabase
                .from('project_files')
                .insert(fileInserts);

            if (filesError) {
                console.error('Error saving project files:', filesError);
                // Don't fail the request if files can't be saved, just log the error
            }
        }

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                preview_url: project.preview_url
            }
        });

    } catch (error) {
        console.error('Error in projects API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient();

        // Get the authenticated user
        const { user, error: authError } = await getAuthenticatedUser(supabase);

        if (authError || !user) {
            console.log('Auth error or no user:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Current user ID:', user.id);
        console.log('User email:', user.email);

        // Temporarily show all projects for debugging
        const { data: allProjects, error: allError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('All projects in database:', allProjects);

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
        }

        console.log('Found projects:', projects?.length || 0);
        console.log('Projects data:', projects);

        return NextResponse.json({ data: projects });

    } catch (error) {
        console.error('Error in projects API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 