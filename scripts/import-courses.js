/**
 * Import script for course data extracted by ChatGPT
 *
 * Usage:
 * 1. Get JSON from ChatGPT using the prompt
 * 2. Paste the JSON into the `courseData` variable below
 * 3. Run: node scripts/import-courses.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// PASTE YOUR CHATGPT JSON HERE:
const courseData = {
  program: {
    name: "Biochemistry",
    department: "Chemistry",
    credits: 120,
  },
  courses: [
    {
      code: "CHEM 201",
      title: "Organic Chemistry I",
      credits: 4,
      description: "Introduction to organic chemistry principles",
      type: "Core",
      prerequisites: ["CHEM 101"],
    },
    // Add more courses here...
  ],
};

async function importCourseData() {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    console.log("🚀 Starting course data import...");

    // Step 1: Insert the program
    console.log(`📚 Inserting program: ${courseData.program.name}`);
    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert({
        kind: "major",
        name: courseData.program.name,
        department: courseData.program.department,
        credits: courseData.program.credits,
      })
      .select()
      .single();

    if (programError) {
      console.error("❌ Program insert error:", programError);
      return;
    }

    console.log(`✅ Program created with ID: ${program.id}`);

    // Step 2: Insert courses
    console.log(`📖 Inserting ${courseData.courses.length} courses...`);
    const coursesToInsert = courseData.courses.map((course) => ({
      code: course.code,
      title: course.title,
      description: course.description || null,
      credits: course.credits,
      type: course.type,
      program_id: program.id,
    }));

    const { data: insertedCourses, error: coursesError } = await supabase
      .from("courses")
      .insert(coursesToInsert)
      .select();

    if (coursesError) {
      console.error("❌ Courses insert error:", coursesError);
      return;
    }

    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Step 3: Insert prerequisites
    console.log("🔗 Setting up prerequisites...");
    let prereqCount = 0;

    for (const courseData_course of courseData.courses) {
      if (
        courseData_course.prerequisites &&
        courseData_course.prerequisites.length > 0
      ) {
        // Find the course ID
        const course = insertedCourses.find(
          (c) => c.code === courseData_course.code
        );
        if (!course) continue;

        for (const prereqCode of courseData_course.prerequisites) {
          // Find prerequisite course ID (might be from existing courses)
          const { data: prereqCourse } = await supabase
            .from("courses")
            .select("id")
            .eq("code", prereqCode)
            .single();

          if (prereqCourse) {
            const { error: prereqError } = await supabase
              .from("course_prereqs")
              .insert({
                course_id: course.id,
                prereq_course_id: prereqCourse.id,
              });

            if (!prereqError) {
              prereqCount++;
              console.log(`  ✅ ${prereqCode} → ${courseData_course.code}`);
            } else {
              console.log(
                `  ⚠️  Could not link ${prereqCode} → ${courseData_course.code}: ${prereqError.message}`
              );
            }
          } else {
            console.log(`  ⚠️  Prerequisite course not found: ${prereqCode}`);
          }
        }
      }
    }

    console.log(`✅ Created ${prereqCount} prerequisite relationships`);

    console.log("\n🎉 Import completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   • Program: ${program.name} (${program.credits} credits)`);
    console.log(`   • Courses: ${insertedCourses.length}`);
    console.log(`   • Prerequisites: ${prereqCount}`);
  } catch (error) {
    console.error("💥 Import failed:", error);
  }
}

// Run the import
importCourseData();
