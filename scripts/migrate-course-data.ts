import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables from parent directory
dotenv.config({ path: "../.env" });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CourseData {
  code: string;
  title: string;
  description: string;
  credits: number;
  type?: string;
  learningPerspective?: string;
  prerequisites?: string[];
}

interface ImportData {
  courseData: CourseData[];
  programInfo: {
    title: string;
    department: string;
    type?: string;
    faculty?: string[];
    requirements?: any; // Can be object or string array
  };
}

// Learning Perspective code mapping
const LP_CODE_MAP: Record<string, string> = {
  "Learning Perspective (PA)": "PA",
  "Learning Perspective (PH)": "PH",
  "Learning Perspective (PS)": "PS",
  "Learning Perspective (PP)": "PP",
  "Learning Perspective (PL)": "PL",
  "Learning Perspective (PN)": "PN",
};

// Extract LP code from course type
function extractLPCode(courseType?: string): string | null {
  if (!courseType) return null;

  // Direct mapping from our enhanced files
  if (LP_CODE_MAP[courseType]) {
    return LP_CODE_MAP[courseType];
  }

  // Fallback regex pattern for other formats
  const match = courseType.match(/\(([A-Z]{2})\)/);
  return match ? match[1] : null;
}

// Normalize course code for prerequisite matching
function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, " ");
}

// Parse HTML course data from scraped files
function parseCoursesFromHtml(coursesHtml: string): CourseData[] {
  const courses: CourseData[] = [];

  // Remove document.write wrapper and unescape quotes
  const cleanHtml = coursesHtml
    .replace(/document\.write\('|'\);?$/g, "")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');

  // Regex to match course entries
  const courseRegex =
    /<p><strong>([A-Z]{2,4}[-\s]*\d{3}[A-Z]?)\s+(.+?)\s+\((\d+)\s+Credits?\)<\/strong><br\/?>(.+?)<\/p>/g;

  let match;
  while ((match = courseRegex.exec(cleanHtml)) !== null) {
    const [, rawCode, title, creditsStr, description] = match;

    // Clean up the course code
    const code = normalizeCourseCode(rawCode.replace(/-/g, " "));

    // Parse credits
    const credits = parseInt(creditsStr, 10);

    // Clean up description (remove HTML tags and extra whitespace)
    const cleanDescription = description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract learning perspective from beginning of description (look for patterns like "(PA)", "(PH)", etc.)
    const lpMatch = cleanDescription.match(/^\(([A-Z]{2})\)/);
    const learningPerspective = lpMatch ? lpMatch[1] : null;

    courses.push({
      code,
      title: title.trim(),
      description: cleanDescription,
      credits,
      type: learningPerspective
        ? `Learning Perspective (${learningPerspective})`
        : "core",
      learningPerspective: learningPerspective || undefined,
      prerequisites: [], // Will be parsed from description separately
    });
  }

  return courses;
}

// Parse prerequisites from description
function parsePrerequisites(description: string): string[] {
  const prereqs: string[] = [];

  // Common prerequisite patterns
  const patterns = [
    /(?:Prerequisite|Prerequisites|Prereq):\s*([^.]+)/gi,
    /(?:Prerequisite|Prerequisites|Prereq)\s*[:\-]\s*([^.]+)/gi,
    /([A-Z]{2,4}\s*\d{3}[A-Z]?)/g, // Course codes like CHEM 101, MATH 151A
  ];

  for (const pattern of patterns) {
    const matches = description.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // Extract course codes from the match
        const courseCodes = match.match(/[A-Z]{2,4}\s*\d{3}[A-Z]?/g);
        if (courseCodes) {
          prereqs.push(...courseCodes.map(normalizeCourseCode));
        }
      });
    }
  }

  return [...new Set(prereqs)]; // Remove duplicates
}

// Determine program type from title and requirements
function determineProgramType(
  title: string,
  requirements?: any
): { type: string; isMajor: boolean; isMinor: boolean; credits: number } {
  const titleLower = title.toLowerCase();
  const reqText =
    typeof requirements === "string"
      ? requirements.toLowerCase()
      : Array.isArray(requirements)
        ? requirements.join(" ").toLowerCase()
        : "";

  let isMajor = false;
  let isMinor = false;
  let type = "major"; // default

  // Extract credits from requirements
  const { majorCredits, minorCredits } =
    extractCreditsFromRequirements(requirements);

  if (titleLower.includes("minor") || reqText.includes("minor requirement")) {
    isMinor = true;
    type = "minor";
  }

  if (
    titleLower.includes("major") ||
    reqText.includes("major requirement") ||
    (!titleLower.includes("minor") && !reqText.includes("minor"))
  ) {
    isMajor = true;
    if (isMinor) {
      type = "major_minor";
    } else {
      type = "major";
    }
  }

  // Determine credits based on type and extracted values
  let credits = 32; // Default fallback
  if (type === "minor" && minorCredits) {
    credits = minorCredits;
  } else if (type === "major" && majorCredits) {
    credits = majorCredits;
  } else if (type === "minor") {
    credits = 16; // Default minor credits
  }

  console.log(
    `Program: ${title}, Type: ${type}, Credits: ${credits} (extracted: major=${majorCredits}, minor=${minorCredits})`
  );

  return { type, isMajor, isMinor, credits };
}

async function migrateProgram(
  importData: ImportData,
  filename: string
): Promise<void> {
  const { courseData, programInfo } = importData;

  console.log(`\nMigrating program: ${programInfo.title}`);

  // Determine program type
  const { type, isMajor, isMinor, credits } = determineProgramType(
    programInfo.title,
    programInfo.requirements
  );

  // 1. Insert or update program
  const { data: program, error: programError } = await supabase
    .from("programs")
    .insert({
      name: programInfo.title,
      kind: type, // Add the required kind field
      credits: credits, // Use extracted credits instead of hardcoded value
      department:
        programInfo.department || extractDepartmentFromFilename(filename),
      program_type: type,
      is_major: isMajor,
      is_minor: isMinor,
      faculty: programInfo.faculty || [],
      requirements: programInfo.requirements || [],
    })
    .select()
    .single();

  if (programError) {
    console.error(
      `Error inserting program ${programInfo.title}:`,
      programError
    );
    return;
  }

  console.log(
    `✓ Program inserted/updated: ${program.name} (ID: ${program.id})`
  );

  // 2. Process courses
  const coursesInserted = [];
  const prerequisiteRelations = [];

  for (const course of courseData) {
    // Extract Learning Perspective code
    const lpCode = extractLPCode(course.type);

    // Parse prerequisites
    const prereqCodes = parsePrerequisites(course.description);

    // Insert course
    const { data: insertedCourse, error: courseError } = await supabase
      .from("courses")
      .insert({
        code: normalizeCourseCode(course.code),
        title: course.title,
        description: course.description,
        credits: course.credits || 3, // Default to 3 credits if not specified
        type: lpCode ? "LP" : "Core", // Set type based on whether it's a learning perspective course
        program_id: program.id,
        learning_perspective_code: lpCode,
        course_type_enhanced: course.type || "core",
      })
      .select()
      .single();

    if (courseError) {
      console.error(`Error inserting course ${course.code}:`, courseError);
      continue;
    }

    coursesInserted.push(insertedCourse);

    // Store prerequisite relations for batch processing
    if (prereqCodes.length > 0) {
      prerequisiteRelations.push({
        courseId: insertedCourse.id,
        courseCode: insertedCourse.code,
        prereqCodes,
      });
    }
  }

  console.log(`✓ Inserted ${coursesInserted.length} courses`);

  // 3. Process prerequisites after all courses are inserted
  if (prerequisiteRelations.length > 0) {
    await processPrerequisites(prerequisiteRelations);
  }

  // 4. Log Learning Perspective distribution
  const lpStats = coursesInserted.reduce(
    (acc, course) => {
      if (course.learning_perspective_code) {
        acc[course.learning_perspective_code] =
          (acc[course.learning_perspective_code] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  if (Object.keys(lpStats).length > 0) {
    console.log("Learning Perspective distribution:", lpStats);
  }
}

async function processPrerequisites(
  prerequisiteRelations: Array<{
    courseId: number;
    courseCode: string;
    prereqCodes: string[];
  }>
): Promise<void> {
  console.log(
    `Processing ${prerequisiteRelations.length} courses with prerequisites...`
  );

  for (const relation of prerequisiteRelations) {
    const { courseId, courseCode, prereqCodes } = relation;

    for (const prereqCode of prereqCodes) {
      // Find prerequisite course by code
      const { data: prereqCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("code", normalizeCourseCode(prereqCode))
        .single();

      if (prereqCourse) {
        // Insert prerequisite relationship
        const { error } = await supabase.from("course_prerequisites").upsert(
          {
            course_id: courseId,
            prerequisite_course_id: prereqCourse.id,
            prerequisite_type: "course",
            is_required: true,
          },
          {
            onConflict: "course_id,prerequisite_course_id,prerequisite_type",
          }
        );

        if (error && !error.message.includes("duplicate")) {
          console.error(
            `Error creating prerequisite ${prereqCode} -> ${courseCode}:`,
            error
          );
        }
      } else {
        console.warn(
          `Prerequisite course not found: ${prereqCode} for ${courseCode}`
        );
      }
    }
  }
}

function extractDepartmentFromFilename(filename: string): string {
  // Extract department from filename like "accounting-courses.json"
  const baseName = filename.replace("-courses.json", "");
  return baseName.charAt(0).toUpperCase() + baseName.slice(1).replace("-", " ");
}

// Function to extract credits from requirement text
function extractCreditsFromRequirements(requirements: any): {
  majorCredits: number | null;
  minorCredits: number | null;
} {
  let majorCredits = null;
  let minorCredits = null;

  if (typeof requirements === "object" && requirements !== null) {
    // Check major_in requirement
    if (requirements.major_in && typeof requirements.major_in === "string") {
      const majorMatch = requirements.major_in.match(/(\d+)\s*credits/i);
      if (majorMatch) {
        majorCredits = parseInt(majorMatch[1]);
      }
    }

    // Check minor_in requirement
    if (requirements.minor_in && typeof requirements.minor_in === "string") {
      const minorMatch = requirements.minor_in.match(/(\d+)\s*credits/i);
      if (minorMatch) {
        minorCredits = parseInt(minorMatch[1]);
      }
    }
  }

  return { majorCredits, minorCredits };
}

async function migrateAllCourses(): Promise<void> {
  const importDir = join(process.cwd(), "scraped_programs");

  try {
    const files = await readdir(importDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    console.log(`Found ${jsonFiles.length} course import files to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of jsonFiles) {
      try {
        const filePath = join(importDir, file);
        const fileContent = await readFile(filePath, "utf-8");

        // Parse the JavaScript module export
        let importData: ImportData;

        if (fileContent.includes("module.exports")) {
          // Handle Node.js module format
          const moduleExport = fileContent.replace("module.exports = ", "");
          importData = JSON.parse(moduleExport);
        } else {
          // Handle scraped JSON format
          const scrapedData = JSON.parse(fileContent);

          // Parse courses from HTML
          const courseData = parseCoursesFromHtml(
            scrapedData.courses_html || ""
          );

          // Convert to expected format
          importData = {
            courseData,
            programInfo: {
              title:
                scrapedData.program_title ||
                scrapedData.scrape_metadata?.original_title ||
                "Unknown Program",
              department:
                scrapedData.scrape_metadata?.original_title ||
                "Unknown Department",
              type: "major",
              faculty: [],
              requirements: scrapedData.requirements || {}, // Keep as object for credit extraction
            },
          };
        }

        await migrateProgram(importData, file);
        successCount++;

        // Add small delay to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`Successfully migrated: ${successCount} programs`);
    console.log(`Errors: ${errorCount} programs`);

    // Generate summary report
    await generateMigrationReport();
  } catch (error) {
    console.error("Error reading import directory:", error);
  }
}

async function generateMigrationReport(): Promise<void> {
  console.log("\n📊 Migration Report:");

  // Count programs by type
  const { data: programStats } = await supabase
    .from("programs")
    .select("program_type, count(*)", { count: "exact" });

  if (programStats) {
    console.log("\nPrograms by type:");
    // Note: This is a simplified count, actual query would need aggregation
    const { count: totalPrograms } = await supabase
      .from("programs")
      .select("*", { count: "exact", head: true });
    console.log(`Total programs: ${totalPrograms}`);
  }

  // Count courses with Learning Perspectives
  const { data: lpStats } = await supabase
    .from("courses")
    .select("learning_perspective_code, count(*)", { count: "exact" })
    .not("learning_perspective_code", "is", null);

  if (lpStats) {
    console.log("\nLearning Perspective courses:");
    // This would need a proper aggregation query in production
    const { count: lpCourses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .not("learning_perspective_code", "is", null);
    console.log(`Courses with Learning Perspectives: ${lpCourses}`);
  }

  // Count prerequisites
  const { count: prereqCount } = await supabase
    .from("course_prerequisites")
    .select("*", { count: "exact", head: true });

  console.log(`Prerequisite relationships: ${prereqCount}`);
}

// Main execution
if (require.main === module) {
  migrateAllCourses().catch(console.error);
}

export {
  migrateAllCourses,
  migrateProgram,
  extractLPCode,
  parsePrerequisites,
  determineProgramType,
};
