/**
 * Configuration constants for Augustana College catalog ETL
 */

// Current catalog year being processed
export const CATALOG_YEAR = '2025-26';

// Base URL for Augustana College catalog areas of study
export const ROOT = 'https://www.augustana.edu/academics/areas-of-study';

// Mapping of symbols used in the catalog to program kinds
export const PROGRAM_KIND_MAP = {
  '+': 'major' as const,
  '~': 'minor' as const,
  '#': 'coordinated' as const,  // Skip these for now
  '*': 'advising' as const,     // Skip these for now
} as const;

// Rate limiting configuration
export const RATE_LIMIT_MS = 500; // 500ms delay between requests

// Batch size for database operations
export const DB_BATCH_SIZE = 50;

// Regular expressions for parsing
export const REGEX_PATTERNS = {
  // Match course codes like "ACCT-321" or "ACCT 321"
  courseCode: /([A-Z]{2,4})[-\s]?(\d{3})/g,
  
  // Match credit patterns like "(4 Credits)" or "4 credits"
  credits: /\(?\s*(\d+)\s+credits?\s*\)?/i,
  
  // Match prerequisite patterns
  prerequisites: /prerequisite[s]?[:\s]+([^.]+)/i,
  
  // Match program credit requirements like "32 credits including"
  programCredits: /(\d+)\s+credits?\s+including/i,
  
  // Match course block patterns like "ACCT-321 Intermediate Accounting I (4 Credits)"
  courseBlock: /([A-Z]{2,4})[-\s]?(\d{3})\s+([^(]+)\s*\((\d+)\s+credits?\)/ig,
} as const;

// UUID namespace for generating stable IDs
export const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Default course type for courses not clearly categorized
export const DEFAULT_COURSE_TYPE = 'Elective' as const;
