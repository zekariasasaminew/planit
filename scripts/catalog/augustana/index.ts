#!/usr/bin/env node

/**
 * Main orchestrator for Augustana College catalog ETL pipeline
 */

import 'dotenv/config';
import { ROOT, PROGRAM_KIND_MAP } from './config.js';
import { fetchIndex, fetchProgram, getProgramCoursesUrl } from './fetch.js';
import { parseIndex, parseProgram } from './parse.js';
import type { IndexItem } from './parse.js';
import { mapProgramData } from './map.js';
import { loadData, validateLoad } from './load.js';
import type { LoadSummary } from './load.js';

interface FinalReport {
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
  programCredits?: number;
  timing: {
    totalTime: number;
    programsProcessed: number;
  };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const programFilter = args[1];
  
  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    console.error('Error: SUPABASE_URL environment variable is required');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'run':
        await runFullPipeline(programFilter);
        break;
      case 'only':
        if (!programFilter) {
          console.error('Error: "only" command requires a program name');
          process.exit(1);
        }
        await runSingleProgram(programFilter);
        break;
      case 'dryrun':
        await runDryRun(programFilter);
        break;
      default:
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Run the complete ETL pipeline
 */
async function runFullPipeline(filter?: string): Promise<void> {
  const startTime = Date.now();
  const report: FinalReport = {
    programs: { inserted: 0, updated: 0, skipped: 0 },
    courses: { inserted: 0, updated: 0, skipped: 0 },
    prereqs: { inserted: 0, skipped: 0 },
    warnings: [],
    timing: { totalTime: 0, programsProcessed: 0 },
  };
  
  try {
    // Step 1: Fetch and parse the index
    console.error('Fetching program index...');
    const response = await fetch(ROOT);
    if (!response.ok) {
      throw new Error(`Failed to fetch index: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    const programs = parseIndex(html, ROOT);
    console.error(`Found ${programs.length} programs`);
    
    // Filter programs if specified
    const filteredPrograms = filter 
      ? programs.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      : programs;
    
    console.error(`Processing ${filteredPrograms.length} programs...`);
    
    // Step 2: Process each program
    for (const program of filteredPrograms) {
      try {
        const summary = await processSingleProgram(program);
        
        // Accumulate results
        report.programs.inserted += summary.programs.inserted;
        report.programs.updated += summary.programs.updated;
        report.programs.skipped += summary.programs.skipped;
        
        report.courses.inserted += summary.courses.inserted;
        report.courses.updated += summary.courses.updated;
        report.courses.skipped += summary.courses.skipped;
        
        report.prereqs.inserted += summary.prereqs.inserted;
        report.prereqs.skipped += summary.prereqs.skipped;
        
        report.warnings.push(...summary.warnings);
        report.timing.programsProcessed++;
        
        console.error(`✓ Processed ${program.name}`);
      } catch (error) {
        const warning = `Failed to process ${program.name}: ${error}`;
        report.warnings.push(warning);
        console.error(`✗ ${warning}`);
      }
    }
    
    // Calculate timing
    report.timing.totalTime = Date.now() - startTime;
    
    // Output final report
    console.log(JSON.stringify(report));
    
  } catch (error) {
    report.warnings.push(`Pipeline failed: ${error}`);
    report.timing.totalTime = Date.now() - startTime;
    console.log(JSON.stringify(report));
    throw error;
  }
}

/**
 * Run pipeline for a single program
 */
async function runSingleProgram(programName: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Find the program in the index
    const response = await fetch(ROOT);
    if (!response.ok) {
      throw new Error(`Failed to fetch index: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    const programs = parseIndex(html, ROOT);
    const program = programs.find(p => 
      p.name.toLowerCase().includes(programName.toLowerCase())
    );
    
    if (!program) {
      throw new Error(`Program "${programName}" not found`);
    }
    
    // For "only" command, do a dry run - fetch courses page and parse without loading to database
    console.error(`Processing ${program.name}...`);
    
    const coursesUrl = getProgramCoursesUrl(program.url);
    console.error(`Fetching courses from: ${coursesUrl}`);
    
    const coursesHtml = await fetchProgram(coursesUrl);
    const parsedProgram = parseProgram(coursesHtml);
    
    // Ensure program name is set
    if (!parsedProgram.program.name) {
      parsedProgram.program.name = program.name;
    }
    
    // Determine program kind from symbol
    const kind = program.symbol ? PROGRAM_KIND_MAP[program.symbol as keyof typeof PROGRAM_KIND_MAP] : null;
    if (!kind || (kind !== 'major' && kind !== 'minor')) {
      throw new Error(`Unsupported program kind: ${kind || 'none'}`);
    }
    
    // Create dry run summary without database operations
    const summary: LoadSummary = {
      programs: { inserted: 0, updated: 0, skipped: 0 },
      courses: { inserted: parsedProgram.courses.length, updated: 0, skipped: 0 },
      prereqs: { inserted: parsedProgram.prereqHints.length, skipped: 0 },
      warnings: [],
    };
    
    const report: FinalReport = {
      ...summary,
      programCredits: parsedProgram.program.credits || 0,
      timing: {
        totalTime: Date.now() - startTime,
        programsProcessed: 1,
      },
    };
    
    console.log(JSON.stringify(report));
    
  } catch (error) {
    const report: FinalReport = {
      programs: { inserted: 0, updated: 0, skipped: 0 },
      courses: { inserted: 0, updated: 0, skipped: 0 },
      prereqs: { inserted: 0, skipped: 0 },
      warnings: [`Single program pipeline failed: ${error}`],
      timing: {
        totalTime: Date.now() - startTime,
        programsProcessed: 0,
      },
    };
    
    console.log(JSON.stringify(report));
    throw error;
  }
}

/**
 * Run dry run (parse but don't load to database)
 */
async function runDryRun(filter?: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(ROOT);
    if (!response.ok) {
      throw new Error(`Failed to fetch index: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    const programs = parseIndex(html, ROOT);
    const filteredPrograms = filter 
      ? programs.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      : programs;
    
    console.error(`Dry run for ${filteredPrograms.length} programs...`);
    
    // Show top 5 parsed items for quick smoke check
    console.error('\nTop 5 parsed items:');
    for (let i = 0; i < Math.min(5, filteredPrograms.length); i++) {
      const item = filteredPrograms[i];
      console.error(`${i + 1}. ${item.name} (${item.symbol}) -> ${item.url}`);
    }
    console.error('');
    
    const allMappedData = [];
    
    for (const program of filteredPrograms) {
      try {
        const mappedData = await parseAndMapProgram(program);
        allMappedData.push({ program: program.name, data: mappedData });
        console.error(`✓ Parsed ${program.name}: ${mappedData.courses.length} courses, ${mappedData.prereqs.length} prereqs`);
      } catch (error) {
        console.error(`✗ Failed to parse ${program.name}: ${error}`);
      }
    }
    
    // Output summary without loading to database
    const report = {
      dryRun: true,
      programsProcessed: allMappedData.length,
      totalCourses: allMappedData.reduce((sum, p) => sum + p.data.courses.length, 0),
      totalPrereqs: allMappedData.reduce((sum, p) => sum + p.data.prereqs.length, 0),
      warnings: allMappedData.flatMap(p => p.data.warnings),
      timing: {
        totalTime: Date.now() - startTime,
        programsProcessed: allMappedData.length,
      },
      sampleData: allMappedData.slice(0, 3), // Include first 3 for inspection
    };
    
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error('Dry run failed:', error);
    process.exit(1);
  }
}

/**
 * Process a single program through the entire pipeline
 */
async function processSingleProgram(program: IndexItem): Promise<LoadSummary> {
  // Determine program kind
  if (!program.symbol) {
    throw new Error(`Skipping program ${program.name} with no symbol`);
  }
  
  const kind = PROGRAM_KIND_MAP[program.symbol as keyof typeof PROGRAM_KIND_MAP];
  
  if (!kind || (kind !== 'major' && kind !== 'minor')) {
    throw new Error(`Skipping program ${program.name} with unsupported kind: ${kind || program.symbol}`);
  }
  
  // Parse and map the program
  const mappedData = await parseAndMapProgram(program);
  
  // Load to database
  const summary = await loadData(mappedData);
  
  // Validate the load
  try {
    const validation = await validateLoad(program.name, mappedData.courses.length);
    if (validation.difference > 5) { // Allow some variance
      summary.warnings.push(`Course count validation failed for ${program.name}: expected ~${mappedData.courses.length}, got ${validation.actual}`);
    }
  } catch (error) {
    summary.warnings.push(`Validation failed for ${program.name}: ${error}`);
  }
  
  return summary;
}

/**
 * Parse and map a program without loading to database
 */
async function parseAndMapProgram(program: IndexItem) {
  // Determine program kind
  if (!program.symbol) {
    throw new Error(`Program ${program.name} has no symbol`);
  }
  
  const kind = PROGRAM_KIND_MAP[program.symbol as keyof typeof PROGRAM_KIND_MAP];
  
  if (!kind || (kind !== 'major' && kind !== 'minor')) {
    throw new Error(`Unsupported program kind: ${kind || program.symbol}`);
  }
  
  // Fetch and parse the program page
  const html = await fetchProgram(program.url);
  const parsedProgram = parseProgram(html);
  
  // Ensure program name is set
  if (!parsedProgram.program.name) {
    parsedProgram.program.name = program.name;
  }
  
  // Map to database format
  const mappedData = mapProgramData(parsedProgram, kind);
  
  return mappedData;
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.error(`
Usage: node scripts/catalog/augustana/index.js <command> [options]

Commands:
  run [filter]     Run full ETL pipeline, optionally filtered by program name
  only <program>   Process only the specified program
  dryrun [filter]  Parse and map data without loading to database

Examples:
  node scripts/catalog/augustana/index.js run
  node scripts/catalog/augustana/index.js run accounting
  node scripts/catalog/augustana/index.js only "Computer Science"
  node scripts/catalog/augustana/index.js dryrun

Environment variables required:
  SUPABASE_URL              - Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
`);
}

/**
 * Get top 10 unknown course codes for reporting
 */
function getTopUnknownCodes(warnings: string[]): string[] {
  const unknownPattern = /Unknown prerequisite courses: ([^}]+)/;
  const unknownCodes = new Set<string>();
  
  for (const warning of warnings) {
    const match = warning.match(unknownPattern);
    if (match) {
      const codes = match[1].split(', ');
      codes.forEach(code => unknownCodes.add(code.trim()));
    }
  }
  
  return Array.from(unknownCodes).slice(0, 10);
}

// Run if called directly
const scriptPath = process.argv[1];
const currentModulePath = new URL(import.meta.url).pathname;

if (scriptPath.includes('index.ts') || scriptPath.includes('index.js')) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
