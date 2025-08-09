-- Enable required extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type program_kind as enum ('major', 'minor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type course_type as enum ('Major', 'Core', 'GenEd', 'LP', 'Elective', 'Minor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type course_source as enum ('user', 'generator', 'transfer', 'ap');
exception when duplicate_object then null; end $$;

-- Tables
create table if not exists public.users (
  id uuid primary key references auth.users(id),
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  kind program_kind not null,
  name text not null,
  department text,
  credits int not null,
  created_at timestamptz default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  credits int not null check (credits > 0),
  type course_type not null,
  program_id uuid references programs(id)
);

create table if not exists course_prereqs (
  course_id uuid not null references courses(id) on delete cascade,
  prereq_course_id uuid not null references courses(id) on delete cascade,
  primary key(course_id, prereq_course_id)
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  name text not null,
  start_season text not null,
  start_year int not null,
  end_season text,
  end_year int,
  preferences jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists plan_semesters (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  season text not null,
  year int not null,
  position int not null,
  total_credits int not null default 0
);

create table if not exists plan_courses (
  id uuid primary key default gen_random_uuid(),
  plan_semester_id uuid not null references plan_semesters(id) on delete cascade,
  course_id uuid not null references courses(id),
  source course_source not null default 'generator',
  is_locked boolean not null default false,
  unique(plan_semester_id, course_id)
);

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz,
  is_public boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists request_log (
  id bigserial primary key,
  user_id uuid not null,
  kind text not null,
  created_at timestamptz default now()
);

create table if not exists user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb
);

-- Trigger to keep plan_semesters.total_credits updated
create or replace function update_total_credits() returns trigger as $$
begin
  update plan_semesters ps
  set total_credits = coalesce((
    select sum(c.credits)
    from plan_courses pc
    join courses c on c.id = pc.course_id
    where pc.plan_semester_id = ps.id
  ), 0)
  where ps.id = coalesce(new.plan_semester_id, old.plan_semester_id);
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_update_total_credits_ins on plan_courses;
create trigger trg_update_total_credits_ins
after insert or update or delete on plan_courses
for each row execute function update_total_credits();

