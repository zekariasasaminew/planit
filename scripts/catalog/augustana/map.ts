/**
 * Data mapping utilities for transforming parsed catalog data into database-ready rows
 */

import { v5 as uuidv5 } from 'uuid';
import { UUID_NAMESPACE, DEFAULT_COURSE_TYPE } from './config.js';
import type { ParsedProgram, ParsedCourse, PrereqHint } from './parse.js';

export interface DatabaseProgram {
  id: string;
  kind: 'major' | 'minor';
  name: string;
  department?: string;
  credits: number;
}

export interface DatabaseCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  type: 'Major' | 'Core' | 'GenEd' | 'LP' | 'Elective' | 'Minor';
  program_id?: string;
}

export interface DatabasePrereq {
  course_id: string;
  prereq_course_id: string;
}

export interface MappedData {
  programs: DatabaseProgram[];
  courses: DatabaseCourse[];
  prereqs: DatabasePrereq[];
  warnings: string[];
}

/**
 * Normalize course code to standard format (e.g., "ACCT 321")
 */
export function normalizeCode(code: string): string {
  // First trim and normalize whitespace
  const trimmed = code.trim().replace(/\s+/g, ' ');
  const match = trimmed.match(/([A-Z]{2,4})[-\s]?(\d{3})/i);
  if (!match) {
    return trimmed.toUpperCase();
  }
  
  const [, subject, number] = match;
  return `${subject.toUpperCase()} ${number}`;
}

/**
 * Generate stable UUID for a course based on its normalized code
 */
export function courseIdFor(code: string): string {
  const normalizedCode = normalizeCode(code);
  return uuidv5(normalizedCode, UUID_NAMESPACE);
}

/**
 * Generate stable UUID for a program based on its kind and name
 */
export function programIdFor(kind: 'major' | 'minor', name: string): string {
  const key = `${kind}:${name.toLowerCase().trim()}`;
  return uuidv5(key, UUID_NAMESPACE);
}

/**
 * Map parsed program data to database-ready rows
 */
export function mapProgramData(
  parsedProgram: ParsedProgram,
  kind: 'major' | 'minor'
): MappedData {
  const warnings: string[] = [];
  
  // Map program
  const program: DatabaseProgram = {
    id: programIdFor(kind, parsedProgram.program.name),
    kind,
    name: parsedProgram.program.name,
    department: parsedProgram.program.department || undefined,
    credits: parsedProgram.program.credits || 0,
  };
  
  // Determine subject prefix for this program
  const subjectPrefix = inferSubjectPrefix(parsedProgram.program.name);
  
  // Map courses
  const courses: DatabaseCourse[] = [];
  const courseMap = new Map<string, DatabaseCourse>();
  
  for (const parsedCourse of parsedProgram.courses) {
    const courseId = courseIdFor(parsedCourse.code);
    const isFromThisProgram = subjectPrefix && 
      parsedCourse.code.startsWith(subjectPrefix);
    
    const course: DatabaseCourse = {
      id: courseId,
      code: normalizeCode(parsedCourse.code),
      title: parsedCourse.title,
      credits: parsedCourse.credits,
      type: isFromThisProgram ? 'Core' : DEFAULT_COURSE_TYPE,
      program_id: isFromThisProgram ? program.id : undefined,
    };
    
    courses.push(course);
    courseMap.set(parsedCourse.code, course);
  }
  
  // Map prerequisites
  const prereqs: DatabasePrereq[] = [];
  const unknownCourses: Set<string> = new Set();
  
  for (const hint of parsedProgram.prereqHints) {
    const courseId = courseIdFor(hint.code);
    
    for (const requiredCode of hint.requires) {
      const prereqId = courseIdFor(requiredCode);
      
      // Check if the prerequisite course exists in our parsed data
      const normalizedRequired = normalizeCode(requiredCode);
      const prereqExists = courses.some(c => c.code === normalizedRequired);
      
      if (!prereqExists) {
        unknownCourses.add(normalizedRequired);
        
        // Create placeholder course for the prerequisite
        const placeholderCourse: DatabaseCourse = {
          id: prereqId,
          code: normalizedRequired,
          title: 'Unknown',
          credits: 0, // Will need to be updated later
          type: DEFAULT_COURSE_TYPE,
        };
        
        // Only add if we haven't already added this placeholder
        if (!courses.some(c => c.id === prereqId)) {
          courses.push(placeholderCourse);
        }
      }
      
      prereqs.push({
        course_id: courseId,
        prereq_course_id: prereqId,
      });
    }
  }
  
  // Add warnings for unknown courses
  if (unknownCourses.size > 0) {
    warnings.push(`Unknown prerequisite courses: ${Array.from(unknownCourses).slice(0, 10).join(', ')}${unknownCourses.size > 10 ? ' and more' : ''}`);
  }
  
  // Add warnings for OR logic in prerequisites
  const orLogicWarnings = detectOrLogic(parsedProgram.prereqHints);
  warnings.push(...orLogicWarnings);
  
  return {
    programs: [program],
    courses,
    prereqs,
    warnings,
  };
}

/**
 * Infer the subject prefix for a program based on its name
 */
function inferSubjectPrefix(programName: string): string | null {
  const mappings: Record<string, string> = {
    'accounting': 'ACCT',
    'art': 'ART',
    'biology': 'BIOL',
    'business': 'BUSN',
    'chemistry': 'CHEM',
    'computer science': 'CSCI',
    'economics': 'ECON',
    'education': 'EDUC',
    'english': 'ENGL',
    'history': 'HIST',
    'mathematics': 'MATH',
    'music': 'MUSC',
    'philosophy': 'PHIL',
    'physics': 'PHYS',
    'political science': 'POLS',
    'psychology': 'PSYC',
    'sociology': 'SOCI',
    'theatre': 'THEA',
  };
  
  const lowerName = programName.toLowerCase();
  
  for (const [keyword, prefix] of Object.entries(mappings)) {
    if (lowerName.includes(keyword)) {
      return prefix;
    }
  }
  
  return null;
}

/**
 * Detect OR logic in prerequisite hints and generate warnings
 */
function detectOrLogic(prereqHints: PrereqHint[]): string[] {
  const warnings: string[] = [];
  
  for (const hint of prereqHints) {
    if (hint.requires.length > 1) {
      // This might be OR logic, but our schema models AND logic
      // We need to warn about this ambiguity
      warnings.push(`Prerequisite for ${hint.code} has multiple requirements (${hint.requires.join(', ')}) - treating as AND logic, but may be OR`);
    }
  }
  
  return warnings;
}

/**
 * Create a placeholder course for an unknown prerequisite
 */
export function createPlaceholderCourse(code: string): DatabaseCourse {
  return {
    id: courseIdFor(code),
    code: normalizeCode(code),
    title: 'Unknown',
    credits: 0,
    type: DEFAULT_COURSE_TYPE,
  };
}

/**
 * Merge course data, preferring non-placeholder courses
 */
export function mergeCourses(existing: DatabaseCourse, incoming: DatabaseCourse): DatabaseCourse {
  // If existing is a placeholder and incoming is not, prefer incoming
  if (existing.title === 'Unknown' && incoming.title !== 'Unknown') {
    return incoming;
  }
  
  // If incoming is a placeholder and existing is not, prefer existing
  if (incoming.title === 'Unknown' && existing.title !== 'Unknown') {
    return existing;
  }
  
  // If both are real courses, prefer the one with more complete data
  const existingComplete = existing.credits > 0 && existing.title !== 'Unknown';
  const incomingComplete = incoming.credits > 0 && incoming.title !== 'Unknown';
  
  if (incomingComplete && !existingComplete) {
    return incoming;
  }
  
  return existing;
}
