-- Cleanup Migration: Remove Redundant Learning Perspectives Tables
-- This removes old/duplicate tables and keeps the superior single-table design

BEGIN;

-- 1. Drop redundant views first (if they exist)
DROP VIEW IF EXISTS courses_with_lp;
DROP VIEW IF EXISTS course_prerequisite_details CASCADE;

-- 2. Drop old tables that have been replaced
DROP TABLE IF EXISTS lp_requirements CASCADE;
DROP TABLE IF EXISTS course_prereqs CASCADE;

-- 3. Clean up any orphaned policies
DROP POLICY IF EXISTS "Users can view own LP requirements" ON lp_requirements;
DROP POLICY IF EXISTS "Users can insert own LP requirements" ON lp_requirements;
DROP POLICY IF EXISTS "Users can update own LP requirements" ON lp_requirements;

-- 4. Optional: Drop course alternatives system if not used
-- Uncomment these lines if you're not using the alternatives system:

-- DROP TABLE IF EXISTS course_prereq_alternatives CASCADE;
-- DROP TABLE IF EXISTS course_alternatives CASCADE; 
-- DROP TABLE IF EXISTS course_alternative_groups CASCADE;

-- 5. Add any missing indexes to optimized tables
CREATE INDEX IF NOT EXISTS idx_course_lp_course_primary ON course_learning_perspectives(course_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_student_lp_user_lp ON student_lp_fulfillment(user_id, learning_perspective_code);

-- 6. Update any existing data if needed
-- (This would be custom based on your current data state)

COMMIT;

-- Comments
COMMENT ON TABLE course_learning_perspectives IS 'Junction table: courses can fulfill multiple Learning Perspectives (final design)';
COMMENT ON TABLE student_lp_fulfillment IS 'Student LP progress tracking (replaces old lp_requirements)';
COMMENT ON TABLE course_prerequisites IS 'Enhanced prerequisites with metadata (replaces old course_prereqs)';