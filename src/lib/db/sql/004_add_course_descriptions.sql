-- Add description field to courses table for storing course descriptions
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT;
