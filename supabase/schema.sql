-- Run this once in the Supabase SQL Editor for the Awakure project.
create table if not exists public.awakure_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  alarms jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  payload_version integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint awakure_alarms_are_array check (jsonb_typeof(alarms) = 'array'),
  constraint awakure_tasks_are_array check (jsonb_typeof(tasks) = 'array'),
  constraint awakure_preferences_are_object check (jsonb_typeof(preferences) = 'object')
);

alter table public.awakure_user_data enable row level security;

revoke all on table public.awakure_user_data from anon;
revoke all on table public.awakure_user_data from authenticated;
grant select, insert, update, delete on table public.awakure_user_data to authenticated;

drop policy if exists "Users can read their Awakure data" on public.awakure_user_data;
create policy "Users can read their Awakure data"
on public.awakure_user_data for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their Awakure data" on public.awakure_user_data;
create policy "Users can create their Awakure data"
on public.awakure_user_data for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their Awakure data" on public.awakure_user_data;
create policy "Users can update their Awakure data"
on public.awakure_user_data for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their Awakure data" on public.awakure_user_data;
create policy "Users can delete their Awakure data"
on public.awakure_user_data for delete
to authenticated
using ((select auth.uid()) = user_id);
