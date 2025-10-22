# Data Migration Summary for New Chat

## 🎯 Current Situation

- Repository has been cleaned up from ~450 files to ~90 files (production ready)
- Database has OLD tables with data and NEW enhanced tables without data
- Table structures are DIFFERENT - cannot do simple data copy
- Need to migrate data preserving relationships and enhancing structure

## 📊 Database State Analysis

### Tables WITH Data (OLD - need to migrate FROM these):

1. **`course_prereqs`**
   - Structure: `course_id, prereq_course_id` (simple mapping)
   - Has prerequisite relationship data

2. **`courses_with_lp`** (likely a VIEW)
   - Has Learning Perspective assignments for courses
   - Structure unknown - needs inspection

### Tables WITHOUT Data (NEW - need to migrate TO these):

1. **`course_prerequisites`**
   - Enhanced structure: `id, course_id, prerequisite_course_id, is_required, prerequisite_type, notes, created_at, updated_at`

2. **`course_learning_perspectives`**
   - Junction table: `id, course_id, learning_perspective_code, is_primary, fulfillment_strength, notes, created_at, updated_at`

### Safe to Delete:

- **`lp_requirements`** - no data in either old or new

## 🚀 Required Actions

### Step 1: Inspect Table Structures

```sql
-- Check exact structure of old tables
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'course_prereqs';
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses_with_lp';
```

### Step 2: Create Structure-Aware Migration

- Map old `course_prereqs` columns to new `course_prerequisites` enhanced structure
- Map old `courses_with_lp` columns to new `course_learning_perspectives` junction table
- Handle data type conversions and default values

### Step 3: Execute Migration + Verification

- Migrate data with proper structure mapping
- Verify record counts match
- Test that application code works with new tables

### Step 4: Cleanup

- Delete old tables: `course_prereqs`, `courses_with_lp`, `lp_requirements`
- Add optimized indexes

## 🎯 Goal

Convert from old simple tables to new enhanced relational structure while preserving all existing course and prerequisite data.

## 📁 Current Repository State

- ✅ Code updated to use new table names
- ✅ Repository cleaned up (production ready)
- ✅ New database schema created
- ⏳ **NEED**: Data migration from old to new tables
- ⏳ **THEN**: Import 83 scraped course programs
