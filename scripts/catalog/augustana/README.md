# Augustana College Catalog ETL

This ETL pipeline crawls the Augustana College catalog and loads academic program and course data into the PlanIt database.

## Overview

The ETL process consists of:

1. **Fetch**: Crawl the Areas of Study index and individual program pages
2. **Parse**: Extract program details, courses, and prerequisites from HTML
3. **Map**: Transform parsed data into database-ready format with stable UUIDs
4. **Load**: Upsert data into Supabase tables with conflict resolution

## Requirements

### Environment Variables

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Copy `.env.local.example` to `.env.local` and fill in your values.

### Dependencies

- Node.js 18+
- TypeScript
- Supabase service role access

## Installation

```bash
npm install
```

## Usage

### Full Pipeline

Process all majors and minors from the catalog:

```bash
npm run catalog:augustana run
```

### Filtered Processing

Process only programs matching a filter:

```bash
npm run catalog:augustana run accounting
```

### Single Program

Process a specific program:

```bash
npm run catalog:augustana only "Computer Science"
```

### Dry Run

Parse and validate without loading to database:

```bash
npm run catalog:augustana dryrun
npm run catalog:augustana dryrun accounting
```

## Output Format

The script outputs a single-line JSON report to stdout:

```json
{
  "programs": {
    "inserted": 15,
    "updated": 3,
    "skipped": 0
  },
  "courses": {
    "inserted": 245,
    "updated": 12,
    "skipped": 5
  },
  "prereqs": {
    "inserted": 89,
    "skipped": 3
  },
  "warnings": [
    "Unknown prerequisite courses: PHYS 999, CHEM 888",
    "Prerequisite for ACCT 321 has multiple requirements - treating as AND logic"
  ],
  "timing": {
    "totalTime": 45000,
    "programsProcessed": 18
  }
}
```

## Data Mapping

### Programs

- **ID**: Stable UUID based on kind + name
- **Kind**: Only 'major' and 'minor' (coordinated programs and advising tracks are skipped)
- **Name**: Cleaned program title
- **Department**: Extracted if available
- **Credits**: Parsed from "X credits including" patterns

### Courses

- **ID**: Stable UUID based on normalized course code
- **Code**: Normalized format (e.g., "ACCT 321")
- **Title**: Course title from catalog
- **Credits**: Number of credit hours
- **Type**:
  - "Core" for courses matching the program's subject prefix
  - "Elective" for all others
- **Program ID**: Linked to program for Core courses only

### Prerequisites

- **Course ID**: Reference to the course requiring prerequisites
- **Prerequisite Course ID**: Reference to the required course
- **Logic**: OR relationships are flattened to multiple AND relationships (with warnings)

## Parsing Rules

### Course Code Normalization

All course codes are normalized to "SUBJ ###" format:

- `ACCT-321` → `ACCT 321`
- `ACCT321` → `ACCT 321`
- `acct-321` → `ACCT 321`

### Prerequisite Parsing

The parser handles various prerequisite formats:

- `Prerequisite: ACCT 321` → Single requirement
- `Prerequisites: ACCT 321 and ACCT 322` → Multiple requirements (AND)
- `Prerequisite: ACCT 200 or 201` → Expands to "ACCT 200" and "ACCT 201" (treated as OR)

### Course Attributes

Special attributes are detected from course listings:

- **Q**: Quantitative reasoning course
- **SI**: Speaking intensive course

## Error Handling

### Resilient Parsing

- Minor HTML structure changes are handled gracefully
- Parse failures for individual programs don't stop the entire pipeline
- Missing data fields are handled with sensible defaults

### Warnings

The system generates warnings for:

- Unknown prerequisite courses not found in the current catalog
- OR logic in prerequisites (since our schema models AND relationships)
- Parse failures or data inconsistencies
- Course count validation mismatches

### Idempotency

- All operations use upsert patterns for safe re-running
- Stable UUIDs ensure consistent IDs across runs
- Existing data is preserved when new data is incomplete

## Testing

Run the test suite:

```bash
npm test scripts/catalog/augustana/__tests__/parse.test.ts
```

The tests verify:

- Correct parsing of the accounting sample
- ACCT 321 extraction with 4 credits
- Prerequisite detection (ACCT 313 requires ACCT 201)
- Program credit parsing (32 credits for Accounting major)
- Course attribute detection (Q for quantitative courses)
- UUID stability and normalization

## File Structure

```
scripts/catalog/augustana/
├── config.ts              # Configuration constants
├── fetch.ts               # Web crawling utilities
├── parse.ts               # HTML parsing logic
├── map.ts                 # Data transformation
├── load.ts                # Database operations
├── index.ts               # Main orchestrator
├── samples/
│   └── accounting.html    # Test data
├── __tests__/
│   └── parse.test.ts     # Unit tests
└── README.md             # This file
```

## Database Schema

The ETL targets these existing tables:

```sql
-- Programs (majors/minors)
CREATE TABLE programs (
  id UUID PRIMARY KEY,
  kind program_kind NOT NULL,  -- 'major' | 'minor'
  name TEXT NOT NULL,
  department TEXT,
  credits INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL,
  type course_type NOT NULL,   -- 'Major' | 'Core' | 'GenEd' | 'LP' | 'Elective' | 'Minor'
  program_id UUID REFERENCES programs(id)
);

-- Prerequisites
CREATE TABLE course_prereqs (
  course_id UUID REFERENCES courses(id),
  prereq_course_id UUID REFERENCES courses(id),
  PRIMARY KEY (course_id, prereq_course_id)
);
```

## Rate Limiting

The crawler includes a 500ms delay between requests to be respectful of Augustana's servers.

## Known Limitations

1. **OR Logic**: Prerequisites with OR relationships are flattened to multiple AND relationships
2. **Complex Prerequisites**: Advanced prerequisite logic (e.g., "3.0 GPA or instructor permission") is not captured
3. **Placeholder Courses**: Unknown prerequisite courses are created with minimal data
4. **Subject Mapping**: Program-to-subject-prefix mapping is based on keyword matching

## Troubleshooting

### Common Issues

**Missing Environment Variables**

```
Error: SUPABASE_URL environment variable is required
```

Solution: Copy `.env.local.example` to `.env.local` and add your Supabase credentials.

**Network Timeouts**

```
Failed to fetch program: 500 Internal Server Error
```

Solution: The catalog website may be temporarily unavailable. Try again later.

**Parse Warnings**

```
Unknown prerequisite courses: PHYS 999, CHEM 888
```

Solution: These warnings indicate courses referenced as prerequisites but not found in the current catalog pages. They're created as placeholder records.

### Validation

After running the ETL, validate the results:

```sql
-- Check program counts
SELECT kind, COUNT(*) FROM programs GROUP BY kind;

-- Check course distribution
SELECT type, COUNT(*) FROM courses GROUP BY type;

-- Check prerequisite relationships
SELECT COUNT(*) FROM course_prereqs;

-- Find placeholder courses
SELECT * FROM courses WHERE title = 'Unknown';
```

## Extending the ETL

To add support for other institutions:

1. Copy the `augustana/` directory structure
2. Update `config.ts` with institution-specific URLs and patterns
3. Modify parsing logic in `parse.ts` for the new HTML structure
4. Adjust subject prefix mapping in `map.ts`
5. Add institution-specific tests

The core pipeline architecture is designed to be reusable across different catalog formats.
