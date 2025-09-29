-- SAFE DATABASE WIPE SCRIPT
-- Each statement runs independently to avoid transaction rollbacks

-- Drop all views first
DROP VIEW IF EXISTS courses_with_lp CASCADE;
DROP VIEW IF EXISTS course_prerequisite_details CASCADE;

-- Drop all tables in dependency order (most dependent first)
DROP TABLE IF EXISTS plan_change_log CASCADE;
DROP TABLE IF EXISTS plan_semester_courses CASCADE;
DROP TABLE IF EXISTS plan_courses CASCADE;
DROP TABLE IF EXISTS plan_semesters CASCADE;
DROP TABLE IF EXISTS academic_plans CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS degree_progress CASCADE;
DROP TABLE IF EXISTS student_lp_fulfillment CASCADE;
DROP TABLE IF EXISTS course_learning_perspectives CASCADE;
DROP TABLE IF EXISTS course_prereq_alternatives CASCADE;
DROP TABLE IF EXISTS alternative_group_courses CASCADE;
DROP TABLE IF EXISTS course_alternatives CASCADE;
DROP TABLE IF EXISTS course_alternative_groups CASCADE;
DROP TABLE IF EXISTS alternative_course_groups CASCADE;
DROP TABLE IF EXISTS program_requirements CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS course_prereqs CASCADE;
DROP TABLE IF EXISTS course_prerequisite_groups CASCADE;
DROP TABLE IF EXISTS student_programs CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS learning_perspectives CASCADE;
DROP TABLE IF EXISTS share_links CASCADE;
DROP TABLE IF EXISTS plan_shares CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS request_log CASCADE;

-- User table (be careful with auth integration)
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all custom types/enums
DROP TYPE IF EXISTS academic_status CASCADE;
DROP TYPE IF EXISTS prerequisite_type CASCADE;
DROP TYPE IF EXISTS semester_season CASCADE;
DROP TYPE IF EXISTS course_source CASCADE;
DROP TYPE IF EXISTS course_category CASCADE;
DROP TYPE IF EXISTS course_type CASCADE;
DROP TYPE IF EXISTS program_type CASCADE;
DROP TYPE IF EXISTS program_kind CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_total_credits() CASCADE;
DROP FUNCTION IF EXISTS update_semester_credits() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Success message
SELECT 'Database successfully wiped clean! Ready for new schema.' as message;
