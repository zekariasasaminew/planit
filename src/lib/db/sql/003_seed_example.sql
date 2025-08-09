-- Sample programs and courses with a small prereq chain
insert into programs (id, kind, name, department, credits)
values
  (gen_random_uuid(), 'major', 'Computer Science B.S.', 'CS', 120),
  (gen_random_uuid(), 'minor', 'Mathematics Minor', 'MATH', 18)
on conflict do nothing;

-- Get program ids
with pm as (
  select id from programs where name = 'Computer Science B.S.'
), mn as (
  select id from programs where name = 'Mathematics Minor'
)
insert into courses (code, title, credits, type, program_id)
values
  ('CS101', 'Intro to Computer Science', 3, 'Core', (select id from pm)),
  ('CS102', 'Data Structures', 3, 'Core', (select id from pm)),
  ('CS201', 'Algorithms', 3, 'Core', (select id from pm)),
  ('MATH101', 'Calculus I', 4, 'Core', (select id from pm)),
  ('MATH102', 'Calculus II', 4, 'Core', (select id from pm))
on conflict do nothing;

-- Prereqs: CS101 -> CS102 -> CS201, MATH101 -> MATH102
insert into course_prereqs (course_id, prereq_course_id)
select c2.id, c1.id from courses c1 join courses c2 on c1.code = 'CS101' and c2.code = 'CS102'
on conflict do nothing;

insert into course_prereqs (course_id, prereq_course_id)
select c2.id, c1.id from courses c1 join courses c2 on c1.code = 'CS102' and c2.code = 'CS201'
on conflict do nothing;

insert into course_prereqs (course_id, prereq_course_id)
select c2.id, c1.id from courses c1 join courses c2 on c1.code = 'MATH101' and c2.code = 'MATH102'
on conflict do nothing;

