-- ============================================================
-- Kanban Board — Full Supabase Schema
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TASKS ───────────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  status      text not null default 'todo'
                check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority    text not null default 'normal'
                check (priority in ('low', 'normal', 'high')),
  due_date    date,
  position    integer not null default 0,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── LABELS ──────────────────────────────────────────────────
create table if not exists public.labels (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  color      text not null default '#6366f1',
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(name, user_id)
);

-- ─── TASK_LABELS (junction) ───────────────────────────────────
create table if not exists public.task_labels (
  task_id  uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  content    text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── ACTIVITY LOG ────────────────────────────────────────────
create table if not exists public.activity_log (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  action     text not null,
  old_value  text,
  new_value  text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── Auto-update updated_at ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_tasks_user_id    on public.tasks(user_id);
create index if not exists idx_tasks_status     on public.tasks(status);
create index if not exists idx_comments_task_id on public.comments(task_id);
create index if not exists idx_activity_task_id on public.activity_log(task_id);
create index if not exists idx_labels_user_id   on public.labels(user_id);

-- ─── ENABLE ROW LEVEL SECURITY ────────────────────────────────
alter table public.tasks        enable row level security;
alter table public.labels       enable row level security;
alter table public.task_labels  enable row level security;
alter table public.comments     enable row level security;
alter table public.activity_log enable row level security;

-- ─── RLS POLICIES: tasks ─────────────────────────────────────
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ─── RLS POLICIES: labels ────────────────────────────────────
create policy "Users can view own labels"
  on public.labels for select
  using (auth.uid() = user_id);

create policy "Users can insert own labels"
  on public.labels for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own labels"
  on public.labels for delete
  using (auth.uid() = user_id);

-- ─── RLS POLICIES: task_labels ───────────────────────────────
create policy "Users can view own task_labels"
  on public.task_labels for select
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  );

create policy "Users can insert own task_labels"
  on public.task_labels for insert
  with check (
    exists (
      select 1 from public.tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  );

create policy "Users can delete own task_labels"
  on public.task_labels for delete
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_labels.task_id
        and tasks.user_id = auth.uid()
    )
  );

-- ─── RLS POLICIES: comments ──────────────────────────────────
create policy "Users can view comments on own tasks"
  on public.comments for select
  using (auth.uid() = user_id);

create policy "Users can insert comments on own tasks"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- ─── RLS POLICIES: activity_log ──────────────────────────────
create policy "Users can view own activity"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on public.activity_log for insert
  with check (auth.uid() = user_id);
