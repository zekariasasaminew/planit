/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const accountingData = {
  program: {
    name: "Accounting",
    department: "Accounting",
    credits: 120,
  },
  courses: [
    {
      code: "ACCT 200",
      title: "Accounting Fundamentals",
      credits: 4,
      description:
        "Introduction to fundamental accounting and related business topics. Covers the accounting cycle, financial statements, internal controls, management accounting, payroll, and HR management. Not open to students who completed ACCT 201.",
      type: "Major",
      prerequisites: [],
    },
    {
      code: "ACCT 201",
      title: "Financial Accounting",
      credits: 4,
      description:
        "Basic theory, concepts, and procedures for developing and interpreting financial (external) accounting reports.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "ACCT 202",
      title: "Managerial Accounting",
      credits: 4,
      description:
        "Basic theory, concepts, and procedures to develop and interpret managerial (internal) accounting reports.",
      type: "Core",
      prerequisites: ["ACCT 200", "ACCT 201"],
    },
    {
      code: "ACCT 311",
      title: "Accounting Information Systems",
      credits: 4,
      description:
        "Covers information systems concepts, computer technology, systems analysis, and application of computer-based accounting systems with internal control.",
      type: "Core",
      prerequisites: ["ACCT 200", "ACCT 201"],
    },
    {
      code: "ACCT 313",
      title: "Auditing",
      credits: 4,
      description:
        "Principles of auditing, objectives and fundamentals of auditing procedures, and professional ethics.",
      type: "Core",
      prerequisites: ["ACCT 321"],
    },
    {
      code: "ACCT 314",
      title: "Tax Accounting",
      credits: 4,
      description:
        "Introduction to the role of taxes in society and their impact on individuals and businesses, with emphasis on federal individual income taxation.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "ACCT 321",
      title: "Intermediate Accounting I",
      credits: 4,
      description:
        "Covers financial accounting theory and practice related to assets, accounting framework, cycle, and time value of money.",
      type: "Core",
      prerequisites: ["ACCT 200", "ACCT 201"],
    },
    {
      code: "ACCT 322",
      title: "Intermediate Accounting II",
      credits: 4,
      description:
        "Covers financial accounting for liabilities and equity, deferred taxes, pensions, leases, and professional standards research.",
      type: "Core",
      prerequisites: ["ACCT 321"],
    },
    {
      code: "ACCT 456",
      title: "Advanced Tax",
      credits: 2,
      description:
        "Federal tax laws for individuals, partnerships, corporations, estates, and trusts. Covers returns, corporate tax issues, IRS audits, and international taxation.",
      type: "Core",
      prerequisites: ["ACCT 314"],
    },
    {
      code: "DATA 101",
      title: "Introduction to Data Analytics",
      credits: 4,
      description: "Introduction to data analytics methods and tools.",
      type: "Supporting",
      prerequisites: [],
    },
    {
      code: "ECON 200",
      title: "Principles of Economics",
      credits: 4,
      description: "Fundamental concepts of microeconomics and macroeconomics.",
      type: "Supporting",
      prerequisites: [],
    },
    {
      code: "BUSN 211",
      title: "Business Statistics",
      credits: 4,
      description:
        "Statistical concepts and methods applied to business decision-making.",
      type: "Supporting",
      prerequisites: [],
    },
    {
      code: "MATH 315",
      title: "Mathematical Statistics",
      credits: 4,
      description:
        "Probability and statistics with applications in business and science.",
      type: "Supporting",
      prerequisites: [],
    },
  ],
};

async function importAccountingData() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error(
      "❌ Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable"
    );
    console.log("Please create a .env.local file in the project root with:");
    console.log("SUPABASE_URL=your_supabase_url");
    console.log("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
    return;
  }

  if (!supabaseKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    console.log("Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    console.log("🚀 Starting Accounting major import...");

    // Step 1: Check if program already exists
    let { data: program } = await supabase
      .from("programs")
      .select("*")
      .eq("name", accountingData.program.name)
      .eq("kind", "major")
      .single();

    if (!program) {
      console.log("📖 Creating Accounting major program...");
      const { data: newProgram, error: programError } = await supabase
        .from("programs")
        .insert({
          kind: "major",
          name: accountingData.program.name,
          department: accountingData.program.department,
          credits: accountingData.program.credits,
        })
        .select()
        .single();

      if (programError) {
        console.error("❌ Program insert error:", programError);
        return;
      }

      program = newProgram;
      console.log(
        `✅ Created program: ${program.name} (${program.credits} credits)`
      );
    } else {
      console.log(`📚 Program already exists: ${program.name}`);
    }

    // Step 2: Insert courses
    console.log(`📖 Inserting ${accountingData.courses.length} courses...`);

    // Map course types - handle "Supporting" type by converting to "Core"
    const coursesToInsert = accountingData.courses.map((course) => ({
      code: course.code,
      title: course.title,
      description: course.description || null,
      credits: course.credits,
      type: course.type === "Supporting" ? "Core" : course.type, // Convert Supporting to Core
      program_id: program.id,
    }));

    const { data: insertedCourses, error: coursesError } = await supabase
      .from("courses")
      .upsert(coursesToInsert, { onConflict: "code" })
      .select();

    if (coursesError) {
      console.error("❌ Courses insert error:", coursesError);
      return;
    }

    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Step 3: Insert prerequisites
    console.log("🔗 Setting up prerequisites...");
    let prereqCount = 0;

    for (const courseData_course of accountingData.courses) {
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
          // Find prerequisite course ID (might be from existing courses or newly inserted)
          const { data: prereqCourse } = await supabase
            .from("courses")
            .select("id")
            .eq("code", prereqCode)
            .single();

          if (prereqCourse) {
            const { error: prereqError } = await supabase
              .from("course_prereqs")
              .upsert(
                {
                  course_id: course.id,
                  prereq_course_id: prereqCourse.id,
                },
                { onConflict: "course_id,prereq_course_id" }
              );

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

    console.log("\n🎉 Accounting major import completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   • Program: ${program.name} (${program.credits} credits)`);
    console.log(`   • Courses: ${insertedCourses.length}`);
    console.log(`   • Prerequisites: ${prereqCount}`);
  } catch (error) {
    console.error("💥 Import failed:", error);
  }
}

// Run the import
importAccountingData();
