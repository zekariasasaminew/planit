-- Sample programs and courses with a small prereq chain
insert into programs (id, kind, name, department, credits)
values
  (gen_random_uuid(), 'major', 'Computer Science B.S.', 'CS', 120),
  (gen_random_uuid(), 'minor', 'Mathematics Minor', 'MATH', 18)
on conflict do nothing;

-- Insert courses with program reference
insert into courses (code, title, credits, type, program_id)
select 'CS101', 'Intro to Computer Science', 3, 'Core', p.id from programs p where p.name = 'Computer Science B.S.' limit 1
on conflict (code) do nothing;

insert into courses (code, title, credits, type, program_id)
select 'CS102', 'Data Structures', 3, 'Core', p.id from programs p where p.name = 'Computer Science B.S.' limit 1
on conflict (code) do nothing;

insert into courses (code, title, credits, type, program_id)
select 'CS201', 'Algorithms', 3, 'Core', p.id from programs p where p.name = 'Computer Science B.S.' limit 1
on conflict (code) do nothing;

insert into courses (code, title, credits, type, program_id)
select 'MATH101', 'Calculus I', 4, 'Core', p.id from programs p where p.name = 'Computer Science B.S.' limit 1
on conflict (code) do nothing;

insert into courses (code, title, credits, type, program_id)
select 'MATH102', 'Calculus II', 4, 'Core', p.id from programs p where p.name = 'Computer Science B.S.' limit 1
on conflict (code) do nothing;

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

