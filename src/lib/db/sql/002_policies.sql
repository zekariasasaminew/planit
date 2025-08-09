alter table public.users enable row level security;
alter table plans enable row level security;
alter table plan_semesters enable row level security;
alter table plan_courses enable row level security;
alter table user_settings enable row level security;
alter table share_links enable row level security;

-- Users: self access
drop policy if exists users_all on public.users;
create policy users_all on public.users
  using (id = auth.uid())
  with check (id = auth.uid());

-- Plans: owner access
drop policy if exists plans_all on plans;
create policy plans_all on plans
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Plan semesters: via parent plan ownership
drop policy if exists plan_semesters_all on plan_semesters;
create policy plan_semesters_all on plan_semesters
  using (exists (select 1 from plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from plans p where p.id = plan_id and p.user_id = auth.uid()));

-- Plan courses: via parent semester->plan ownership
drop policy if exists plan_courses_all on plan_courses;
create policy plan_courses_all on plan_courses
  using (
    exists (
      select 1 from plan_semesters s
      join plans p on p.id = s.plan_id
      where s.id = plan_semester_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from plan_semesters s
      join plans p on p.id = s.plan_id
      where s.id = plan_semester_id and p.user_id = auth.uid()
    )
  );

-- User settings: self access
drop policy if exists user_settings_all on user_settings;
create policy user_settings_all on user_settings
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Share links: public read when not expired
drop policy if exists share_links_read on share_links;
create policy share_links_read on share_links
  for select using (is_public = true and (expires_at is null or expires_at > now()));

-- Security definer function to validate share token and return plan_id
create or replace function can_read_shared_plan(in_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  result uuid;
begin
  select plan_id into result
  from share_links
  where token = in_token
    and is_public = true
    and (expires_at is null or expires_at > now());
  return result;
end;
$$;

