-- Migration: Course Learning Perspectives - Single Table Approach
-- This creates a junction table for many-to-many relationship between courses and Learning Perspectives

BEGIN;

-- 1. Create Learning Perspectives lookup table (keeping this for data integrity)
CREATE TABLE IF NOT EXISTS learning_perspectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(2) UNIQUE NOT NULL, -- PA, PH, PS, PP, PL, PN
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the six Learning Perspectives
INSERT INTO learning_perspectives (code, name, description) VALUES
    ('PA', 'Perspectives on the Arts', 'Courses exploring artistic expression, creativity, and cultural understanding through various art forms'),
    ('PH', 'Perspectives on Human Existence and Values', 'Courses examining philosophical questions, ethics, and the meaning of human existence'),
    ('PS', 'Perspectives on the Individual and Society', 'Courses analyzing social structures, human behavior, and societal relationships'),
    ('PP', 'Perspectives on the Past', 'Courses studying historical events, contexts, and their impact on contemporary understanding'),
    ('PL', 'Perspectives on Literature and Texts', 'Courses focusing on literary analysis, textual interpretation, Written communication'),
    ('PN', 'Perspectives on the Natural World', 'Courses exploring scientific concepts, natural phenomena, and empirical understanding')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Create the main junction table (YOUR PREFERRED APPROACH)
CREATE TABLE IF NOT EXISTS course_learning_perspectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    learning_perspective_code VARCHAR(2) NOT NULL REFERENCES learning_perspectives(code),
    is_primary BOOLEAN DEFAULT true, -- Primary vs secondary fulfillment
    fulfillment_strength VARCHAR(20) DEFAULT 'full', -- 'full', 'partial', 'optional'
    notes TEXT, -- Why this course fulfills this LP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicates
    UNIQUE(course_id, learning_perspective_code)
);

-- 3. Update programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_type VARCHAR(20) DEFAULT 'major';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_major BOOLEAN DEFAULT true;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT false;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS faculty JSONB DEFAULT '[]'::jsonb;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Update courses table (minimal changes)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type_enhanced VARCHAR(50) DEFAULT 'core';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Enhanced prerequisites table
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    prerequisite_type VARCHAR(20) DEFAULT 'course', -- 'course', 'corequisite', 'recommended'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_id, prerequisite_course_id, prerequisite_type)
);

-- 6. Student LP fulfillment tracking
CREATE TABLE IF NOT EXISTS student_lp_fulfillment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_perspective_code VARCHAR(2) NOT NULL REFERENCES learning_perspectives(code),
    course_id UUID NOT NULL REFERENCES courses(id),
    fulfilled_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    semester VARCHAR(20),
    academic_year VARCHAR(9), -- e.g., "2024-2025"
    
    -- Allow multiple courses to fulfill same LP (student might take extra)
    UNIQUE(user_id, learning_perspective_code, course_id)
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_lp_course ON course_learning_perspectives(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lp_perspective ON course_learning_perspectives(learning_perspective_code);
CREATE INDEX IF NOT EXISTS idx_course_lp_primary ON course_learning_perspectives(course_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_prereq_course ON course_prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_prereq_prerequisite ON course_prerequisites(prerequisite_course_id);

CREATE INDEX IF NOT EXISTS idx_student_lp_user ON student_lp_fulfillment(user_id);
CREATE INDEX IF NOT EXISTS idx_student_lp_perspective ON student_lp_fulfillment(learning_perspective_code);

-- 8. Helpful Views
CREATE OR REPLACE VIEW courses_with_learning_perspectives AS
SELECT 
    c.id as course_id,
    c.code,
    c.title,
    c.description,
    c.credits,
    c.course_type_enhanced,
    p.name as program_name,
    p.department,
    p.program_type,
    -- Aggregate all LPs for this course
    ARRAY_AGG(clp.learning_perspective_code ORDER BY clp.is_primary DESC, clp.learning_perspective_code) 
        FILTER (WHERE clp.learning_perspective_code IS NOT NULL) as learning_perspectives,
    ARRAY_AGG(lp.name ORDER BY clp.is_primary DESC, clp.learning_perspective_code) 
        FILTER (WHERE lp.name IS NOT NULL) as learning_perspective_names,
    -- Primary LP only
    (SELECT clp2.learning_perspective_code FROM course_learning_perspectives clp2 
     WHERE clp2.course_id = c.id AND clp2.is_primary = true LIMIT 1) as primary_learning_perspective
FROM courses c
LEFT JOIN programs p ON c.program_id = p.id
LEFT JOIN course_learning_perspectives clp ON c.id = clp.course_id
LEFT JOIN learning_perspectives lp ON clp.learning_perspective_code = lp.code
GROUP BY c.id, c.code, c.title, c.description, c.credits, c.course_type_enhanced, 
         p.name, p.department, p.program_type;

-- 9. View for student LP progress
CREATE OR REPLACE VIEW student_lp_progress AS
SELECT 
    u.id as user_id,
    lp.code as learning_perspective_code,
    lp.name as learning_perspective_name,
    COUNT(slf.course_id) > 0 as is_fulfilled,
    COUNT(slf.course_id) as courses_taken,
    ARRAY_AGG(c.code ORDER BY slf.fulfilled_date) FILTER (WHERE c.code IS NOT NULL) as fulfilling_courses,
    MIN(slf.fulfilled_date) as first_fulfilled_date
FROM auth.users u
CROSS JOIN learning_perspectives lp
LEFT JOIN student_lp_fulfillment slf ON u.id = slf.user_id AND lp.code = slf.learning_perspective_code
LEFT JOIN courses c ON slf.course_id = c.id
GROUP BY u.id, lp.code, lp.name;

-- 10. Functions for common queries
CREATE OR REPLACE FUNCTION get_courses_for_learning_perspective(lp_code VARCHAR(2))
RETURNS TABLE(
    course_id UUID,
    course_code TEXT,
    course_title TEXT,
    program_name TEXT,
    is_primary_lp BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.code,
        c.title,
        p.name,
        clp.is_primary
    FROM courses c
    JOIN course_learning_perspectives clp ON c.id = clp.course_id
    JOIN programs p ON c.program_id = p.id
    WHERE clp.learning_perspective_code = lp_code
    ORDER BY clp.is_primary DESC, c.code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_student_lp_status(student_id UUID)
RETURNS TABLE(
    learning_perspective_code VARCHAR(2),
    learning_perspective_name VARCHAR(100),
    is_fulfilled BOOLEAN,
    courses_count INTEGER,
    fulfilling_courses TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lp.code,
        lp.name,
        COUNT(slf.course_id) > 0,
        COUNT(slf.course_id)::INTEGER,
        ARRAY_AGG(c.code ORDER BY slf.fulfilled_date) FILTER (WHERE c.code IS NOT NULL)
    FROM learning_perspectives lp
    LEFT JOIN student_lp_fulfillment slf ON lp.code = slf.learning_perspective_code AND slf.user_id = student_id
    LEFT JOIN courses c ON slf.course_id = c.id
    GROUP BY lp.code, lp.name
    ORDER BY lp.code;
END;
$$ LANGUAGE plpgsql;

-- 11. Row Level Security
ALTER TABLE course_learning_perspectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lp_fulfillment ENABLE ROW LEVEL SECURITY;

-- Everyone can read course LP information
CREATE POLICY IF NOT EXISTS "Course LP information is publicly readable" ON course_learning_perspectives
    FOR SELECT USING (true);

-- Users can only manage their own fulfillment records
CREATE POLICY IF NOT EXISTS "Users can view own LP fulfillment" ON student_lp_fulfillment
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own LP fulfillment" ON student_lp_fulfillment
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own LP fulfillment" ON student_lp_fulfillment
    FOR UPDATE USING (auth.uid() = user_id);

COMMIT;

-- Comments
COMMENT ON TABLE course_learning_perspectives IS 'Junction table: courses can fulfill multiple Learning Perspectives';
COMMENT ON TABLE student_lp_fulfillment IS 'Tracks which courses students used to fulfill LP requirements';
COMMENT ON VIEW courses_with_learning_perspectives IS 'Courses with all their Learning Perspective information aggregated';
COMMENT ON VIEW student_lp_progress IS 'Student progress toward Learning Perspective requirements';
COMMENT ON FUNCTION get_courses_for_learning_perspective(VARCHAR(2)) IS 'Get all courses that fulfill a specific Learning Perspective';
COMMENT ON FUNCTION get_student_lp_status(UUID) IS 'Get Learning Perspective fulfillment status for a student';