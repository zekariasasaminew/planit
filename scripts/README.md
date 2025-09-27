# Scripts Directory

## 🚀 Production Scripts

### Core Scraping & Data Pipeline

- **`scrape.py`** - Course catalog web scraper for Augustana University
  - Scrapes program data, course listings, prerequisites, learning perspectives
  - Outputs data to `scraped_programs/` directory
  - Essential for keeping course data up-to-date

- **`scraped_programs/`** - Directory containing scraped program data
  - JSON files for each major/minor program
  - Source of truth for program requirements and course data
  - Used by migration scripts

- **`migrate-course-data.ts`** - Course data migration tool
  - Imports scraped JSON data into Supabase database
  - Handles program types (major/minor) and credit requirements
  - Used by `npm run db:import-courses`

### Database Management

- **`run-sql.js`** - Database migration runner
  - Executes SQL migration files from `src/lib/db/sql/`
  - Used by `npm run db:migrate`

- **`dev.seed.ts`** - Development database seeding
  - Creates sample user data for local development
  - Used by `npm run db:seed`

### API Documentation

- **`openapi.gen.ts`** - OpenAPI specification generator
  - Generates `public/openapi.json` from route schemas
  - Used by `npm run openapi:gen`

### Utilities

- **`setup-course-alternatives.js`** - Course alternatives setup utility
- **`fix-function-security.sql`** - Database security fixes

## 🔄 Workflow

1. **Scrape Data**: `python scrape.py` → Updates `scraped_programs/`
2. **Migrate Data**: `npm run db:import-courses` → Imports to database
3. **Verify**: Check application for updated course/program data

## 📁 File Status

✅ **Production Ready** - All files in this directory are essential for the application

- **`dev.seed.ts`** - Development database seeding
  - Seeds database with test data for development
  - Not used in production

- **`openapi.gen.ts`** - OpenAPI code generation
  - Generates TypeScript types from OpenAPI specs
  - Development tooling

- **`setup-course-alternatives.js`** - Course alternatives setup
  - Sets up course alternative groups (e.g., Physics sequences)
  - One-time setup tool

### Data Storage

- **`scraped_programs/`** - Course data JSON files
  - Contains scraped course data for all programs
  - Source data for migrations
  - Keep until successful database import

## ✅ Cleanup Completed

### Removed Files (~300+ files, 50-100MB)

- ❌ All testing and debugging scripts
- ❌ 84 generated import scripts (replaced by migrate-course-data.ts)
- ❌ 85 updated import scripts (replaced by migrate-course-data.ts)
- ❌ Jupyter notebooks and Python analysis files
- ❌ Migration verification and cleanup scripts
- ❌ Development documentation and temporary files
- ❌ Python cache directories

### Repository Size Reduction

- **Before**: ~450 files in scripts directory
- **After**: ~90 files (7 scripts + scraped data)
- **Reduction**: ~80% file count reduction

The repository is now production-ready with only essential tools and data!
