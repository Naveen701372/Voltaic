-- Voltaic Platform Database Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- Note: auth.users table is managed by Supabase and cannot be altered
-- RLS is already enabled on auth.users by default

-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  project_type text default 'landing_page' check (project_type in ('landing_page', 'dashboard', 'app', 'website')),
  status text default 'generating' check (status in ('generating', 'ready', 'error', 'archived')),
  preview_url text,
  workflow_id text,
  ai_generations integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project_files table
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  file_path text not null,
  file_content text not null,
  file_type text default 'component' check (file_type in ('component', 'page', 'api', 'config', 'style')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, file_path)
);

-- Create user_stats table for dashboard stats
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  projects_created integer default 0,
  mvps_deployed integer default 0,
  ai_generations integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.user_stats enable row level security;

-- RLS policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- RLS policies for project_files
create policy "Users can view files of their own projects"
  on public.project_files for select
  using (
    exists (
      select 1 from public.projects 
      where id = project_files.project_id 
      and user_id = auth.uid()
    )
  );

create policy "Users can insert files to their own projects"
  on public.project_files for insert
  with check (
    exists (
      select 1 from public.projects 
      where id = project_files.project_id 
      and user_id = auth.uid()
    )
  );

create policy "Users can update files of their own projects"
  on public.project_files for update
  using (
    exists (
      select 1 from public.projects 
      where id = project_files.project_id 
      and user_id = auth.uid()
    )
  );

create policy "Users can delete files of their own projects"
  on public.project_files for delete
  using (
    exists (
      select 1 from public.projects 
      where id = project_files.project_id 
      and user_id = auth.uid()
    )
  );

-- RLS policies for user_stats
create policy "Users can view their own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

-- Functions to automatically update timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger handle_project_files_updated_at
  before update on public.project_files
  for each row execute function public.handle_updated_at();

create trigger handle_user_stats_updated_at
  before update on public.user_stats
  for each row execute function public.handle_updated_at();

-- Function to initialize user stats (called from API when user first accesses dashboard)
create or replace function public.initialize_user_stats(user_uuid uuid)
returns void as $$
begin
  insert into public.user_stats (user_id)
  values (user_uuid)
  on conflict (user_id) do nothing;
end;
$$ language plpgsql security definer;

-- Function to update user stats when projects are created (with lazy user_stats creation)
create or replace function public.update_user_stats_on_project_create()
returns trigger as $$
begin
  -- Create user_stats record if it doesn't exist, then update
  insert into public.user_stats (user_id, projects_created, ai_generations)
  values (new.user_id, 1, 1)
  on conflict (user_id) do update set
    projects_created = user_stats.projects_created + 1,
    ai_generations = user_stats.ai_generations + 1,
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update stats when project is created
create trigger on_project_created
  after insert on public.projects
  for each row execute function public.update_user_stats_on_project_create();

-- Function to update MVP deployment count
create or replace function public.update_mvp_deployed_count()
returns trigger as $$
begin
  if old.status != 'ready' and new.status = 'ready' then
    update public.user_stats
    set mvps_deployed = mvps_deployed + 1,
        updated_at = timezone('utc'::text, now())
    where user_id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update MVP deployed count when project status changes to ready
create trigger on_project_status_ready
  after update on public.projects
  for each row execute function public.update_mvp_deployed_count();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated; 