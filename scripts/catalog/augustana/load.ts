/**
 * Database loading utilities for inserting catalog data into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { DB_BATCH_SIZE } from './config.js';
import type { DatabaseProgram, DatabaseCourse, DatabasePrereq, MappedData } from './map.js';

export interface LoadSummary {
  programs: {
    inserted: number;
    updated: number;
    skipped: number;
  };
  courses: {
    inserted: number;
    updated: number;
    skipped: number;
  };
  prereqs: {
    inserted: number;
    skipped: number;
  };
  warnings: string[];
}

/**
 * Create Supabase client with service role for bypassing RLS
 */
function createServiceClient(): ReturnType<typeof createClient> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Load mapped data into the database with upsert operations
 */
export async function loadData(mappedData: MappedData): Promise<LoadSummary> {
  const client = createServiceClient();
  const summary: LoadSummary = {
    programs: { inserted: 0, updated: 0, skipped: 0 },
    courses: { inserted: 0, updated: 0, skipped: 0 },
    prereqs: { inserted: 0, skipped: 0 },
    warnings: [...mappedData.warnings],
  };
  
  try {
    // Load programs first
    if (mappedData.programs.length > 0) {
      const programResult = await upsertPrograms(client, mappedData.programs);
      summary.programs = programResult;
    }
    
    // Load courses
    if (mappedData.courses.length > 0) {
      const courseResult = await upsertCourses(client, mappedData.courses);
      summary.courses = courseResult;
    }
    
    // Load prerequisites
    if (mappedData.prereqs.length > 0) {
      const prereqResult = await upsertPrerequisites(client, mappedData.prereqs);
      summary.prereqs = prereqResult;
    }
    
    return summary;
  } catch (error) {
    summary.warnings.push(`Database operation failed: ${error}`);
    throw error;
  }
}

/**
 * Upsert programs into the database
 */
async function upsertPrograms(
  client: ReturnType<typeof createClient>,
  programs: DatabaseProgram[]
): Promise<LoadSummary['programs']> {
  const summary = { inserted: 0, updated: 0, skipped: 0 };
  
  // Process in batches
  for (let i = 0; i < programs.length; i += DB_BATCH_SIZE) {
    const batch = programs.slice(i, i + DB_BATCH_SIZE);
    
    try {
      // First, check which programs already exist
      const existingQuery = await client
        .from('programs')
        .select('id')
        .in('id', batch.map(p => p.id));
      
      if (existingQuery.error) {
        throw existingQuery.error;
      }
      
      const existingIds = new Set(existingQuery.data?.map(p => p.id) || []);
      
      // Separate into inserts and updates
      const toInsert = batch.filter(p => !existingIds.has(p.id));
      const toUpdate = batch.filter(p => existingIds.has(p.id));
      
      // Insert new programs
      if (toInsert.length > 0) {
        const insertResult = await client
          .from('programs')
          .insert(toInsert);
        
        if (insertResult.error) {
          throw insertResult.error;
        }
        
        summary.inserted += toInsert.length;
      }
      
      // Update existing programs
      for (const program of toUpdate) {
        const updateResult = await client
          .from('programs')
          .update({
            kind: program.kind,
            name: program.name,
            department: program.department,
            credits: program.credits,
          })
          .eq('id', program.id);
        
        if (updateResult.error) {
          throw updateResult.error;
        }
        
        summary.updated++;
      }
    } catch (error) {
      throw new Error(`Failed to upsert programs batch: ${error}`);
    }
  }
  
  return summary;
}

/**
 * Upsert courses into the database
 */
async function upsertCourses(
  client: ReturnType<typeof createClient>,
  courses: DatabaseCourse[]
): Promise<LoadSummary['courses']> {
  const summary = { inserted: 0, updated: 0, skipped: 0 };
  
  // Process in batches
  for (let i = 0; i < courses.length; i += DB_BATCH_SIZE) {
    const batch = courses.slice(i, i + DB_BATCH_SIZE);
    
    try {
      // Check which courses already exist by code
      const existingQuery = await client
        .from('courses')
        .select('id, code, title')
        .in('code', batch.map(c => c.code));
      
      if (existingQuery.error) {
        throw existingQuery.error;
      }
      
      const existingCodes = new Set(existingQuery.data?.map(c => c.code) || []);
      const existingMap = new Map(
        existingQuery.data?.map(c => [c.code, c]) || []
      );
      
      // Separate into inserts and updates
      const toInsert = batch.filter(c => !existingCodes.has(c.code));
      const toUpdate = batch.filter(c => existingCodes.has(c.code));
      
      // Insert new courses
      if (toInsert.length > 0) {
        const insertResult = await client
          .from('courses')
          .insert(toInsert.map(course => ({
            id: course.id,
            code: course.code,
            title: course.title,
            credits: course.credits,
            type: course.type,
            program_id: course.program_id || null,
          })));
        
        if (insertResult.error) {
          throw insertResult.error;
        }
        
        summary.inserted += toInsert.length;
      }
      
      // Update existing courses (only if new data is better)
      for (const course of toUpdate) {
        const existing = existingMap.get(course.code);
        
        // Skip update if existing course has better data
        if (existing && existing.title !== 'Unknown' && course.title === 'Unknown') {
          summary.skipped++;
          continue;
        }
        
        const updateResult = await client
          .from('courses')
          .update({
            title: course.title,
            credits: course.credits,
            type: course.type,
            program_id: course.program_id || null,
          })
          .eq('code', course.code);
        
        if (updateResult.error) {
          throw updateResult.error;
        }
        
        summary.updated++;
      }
    } catch (error) {
      throw new Error(`Failed to upsert courses batch: ${error}`);
    }
  }
  
  return summary;
}

/**
 * Upsert prerequisites into the database
 */
async function upsertPrerequisites(
  client: ReturnType<typeof createClient>,
  prereqs: DatabasePrereq[]
): Promise<LoadSummary['prereqs']> {
  const summary = { inserted: 0, skipped: 0 };
  
  // First, resolve course IDs by code to ensure all referenced courses exist
  const allCourseIds = new Set([
    ...prereqs.map(p => p.course_id),
    ...prereqs.map(p => p.prereq_course_id),
  ]);
  
  const courseQuery = await client
    .from('courses')
    .select('id')
    .in('id', Array.from(allCourseIds));
  
  if (courseQuery.error) {
    throw courseQuery.error;
  }
  
  const validCourseIds = new Set(courseQuery.data?.map(c => c.id) || []);
  
  // Filter out prerequisites where either course doesn't exist
  const validPrereqs = prereqs.filter(p => 
    validCourseIds.has(p.course_id) && validCourseIds.has(p.prereq_course_id)
  );
  
  if (validPrereqs.length < prereqs.length) {
    const skipped = prereqs.length - validPrereqs.length;
    summary.skipped += skipped;
  }
  
  // Process in batches
  for (let i = 0; i < validPrereqs.length; i += DB_BATCH_SIZE) {
    const batch = validPrereqs.slice(i, i + DB_BATCH_SIZE);
    
    try {
      // Check which prerequisites already exist
      const existingQuery = await client
        .from('course_prereqs')
        .select('course_id, prereq_course_id')
        .in('course_id', batch.map(p => p.course_id));
      
      if (existingQuery.error) {
        throw existingQuery.error;
      }
      
      const existingSet = new Set(
        existingQuery.data?.map(p => `${p.course_id}:${p.prereq_course_id}`) || []
      );
      
      // Filter out existing prerequisites
      const toInsert = batch.filter(p => 
        !existingSet.has(`${p.course_id}:${p.prereq_course_id}`)
      );
      
      summary.skipped += batch.length - toInsert.length;
      
      // Insert new prerequisites
      if (toInsert.length > 0) {
        const insertResult = await client
          .from('course_prereqs')
          .insert(toInsert.map(prereq => ({
            course_id: prereq.course_id,
            prereq_course_id: prereq.prereq_course_id,
          })));
        
        if (insertResult.error) {
          throw insertResult.error;
        }
        
        summary.inserted += toInsert.length;
      }
    } catch (error) {
      throw new Error(`Failed to upsert prerequisites batch: ${error}`);
    }
  }
  
  return summary;
}

/**
 * Validate that the expected number of courses were loaded
 */
export async function validateLoad(
  programName: string,
  expectedCourseCount: number
): Promise<{ actual: number; difference: number }> {
  const client = createServiceClient();
  
  // This is a simplified validation - in a real implementation,
  // you might want to be more specific about which courses belong to which program
  const countQuery = await client
    .from('courses')
    .select('id', { count: 'exact' });
  
  if (countQuery.error) {
    throw countQuery.error;
  }
  
  const actual = countQuery.count || 0;
  const difference = Math.abs(actual - expectedCourseCount);
  
  return { actual, difference };
}
