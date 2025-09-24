-- Add course alternatives table to handle course substitutions
-- This allows defining groups of courses where only one from the group is required

create table if not exists course_alternative_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists course_alternatives (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references course_alternative_groups(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  created_at timestamptz default now(),
  unique(group_id, course_id)
);

-- Add prerequisite alternative groups
-- This allows prerequisites to reference alternative groups instead of individual courses
create table if not exists course_prereq_alternatives (
  course_id uuid not null references courses(id) on delete cascade,
  prereq_group_id uuid not null references course_alternative_groups(id) on delete cascade,
  primary key(course_id, prereq_group_id)
);
