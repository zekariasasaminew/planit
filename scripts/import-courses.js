/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const courseData = {
  program: {
    name: "Chemistry",
    department: "Chemistry",
    credits: 120,
  },
  courses: [
    {
      code: "CHEM 131",
      title: "General Chemistry I",
      credits: 4,
      description:
        "Fundamental principles of chemistry including atomic structure, bonding, stoichiometry, and basic thermodynamics.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "BIOL 130",
      title: "General Biology",
      credits: 4,
      description:
        "Introduction to biological principles including cell structure, genetics, evolution, and ecology.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "CHEM 132",
      title: "General Chemistry II",
      credits: 4,
      description:
        "Chemical reactions, stoichiometry, kinetics, thermochemistry, equilibrium, electrochemistry, and nuclear chemistry.",
      type: "Core",
      prerequisites: ["CHEM 131"],
    },
    {
      code: "CHEM 235",
      title: "Intro to Inorganic Chemistry",
      credits: 4,
      description:
        "Covers atomic structure, periodic properties, descriptive inorganic chemistry, bonding theories, symmetry, electrochemistry, and coordination chemistry.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "CHEM 255",
      title: "Quant Analytical Chemistry",
      credits: 4,
      description:
        "Theory and practice of chemical analysis, statistics, and basic laboratory instrumental analysis.",
      type: "Core",
      prerequisites: ["CHEM 132", "CHEM 235"],
    },
    {
      code: "CHEM 321",
      title: "Organic Chemistry I",
      credits: 4,
      description:
        "Structures, properties, reactivity, and mechanisms of organic compounds. Includes substitution, elimination, and addition reactions.",
      type: "Core",
      prerequisites: ["CHEM 132", "CHEM 235"],
    },
    {
      code: "CHEM 322",
      title: "Organic Chemistry II",
      credits: 4,
      description:
        "Continuation of Organic Chemistry I, covering radical reactions, conjugated systems, aromatic substitutions, and synthesis.",
      type: "Core",
      prerequisites: ["CHEM 321"],
    },
    {
      code: "CHEM 361",
      title: "Physical Chemistry I",
      credits: 4,
      description:
        "Thermodynamics and kinetics with application to chemical equilibria at microscopic and macroscopic levels.",
      type: "Core",
      prerequisites: [
        "CHEM 131",
        "CHEM 235",
        "PHYS 152",
        "PHYS 212",
        "MATH 220",
      ],
    },
    {
      code: "CHEM 365",
      title: "Physical Chemistry II",
      credits: 4,
      description:
        "Quantum theory with applications to atoms, molecules, spectroscopy, and reaction dynamics.",
      type: "Core",
      prerequisites: [
        "CHEM 131",
        "CHEM 235",
        "PHYS 152",
        "PHYS 212",
        "MATH 220",
      ],
    },
    {
      code: "CHEM 435",
      title: "Advanced Inorganic Chemistry",
      credits: 4,
      description:
        "Bonding, structure, spectra, and reactions of inorganic and organometallic materials.",
      type: "Core",
      prerequisites: ["CHEM 322"],
    },
    {
      code: "CHEM 441",
      title: "Biochemistry I",
      credits: 4,
      description:
        "Structure and function of proteins, enzymes, carbohydrates, and lipids; membranes, catalysis, regulation, bioenergetics, and catabolic metabolism.",
      type: "Core",
      prerequisites: ["CHEM 322", "BIOL 130"],
    },
    {
      code: "CHEM 471",
      title: "Inquiry in Chemistry",
      credits: 2,
      description:
        "Covers chemical literature, online searching techniques, research proposals, and ethics in scientific inquiry.",
      type: "Core",
      prerequisites: ["CHEM 322"],
    },
    {
      code: "CHEM 474",
      title: "Senior Inquiry Research Proposal",
      credits: 2,
      description:
        "Research proposal development including literature search, experimental approaches, outcomes, and oral/written presentation.",
      type: "Core",
      prerequisites: ["CHEM 471"],
    },
    {
      code: "CHEM 475",
      title: "Senior Inquiry Lab Research",
      credits: 2,
      description:
        "Laboratory research project under faculty supervision culminating in a paper, presentation, and reflective essay.",
      type: "Core",
      prerequisites: ["CHEM 471"],
    },
    {
      code: "CHEM 476",
      title: "Senior Inquiry Off Campus Lab Research",
      credits: 2,
      description:
        "Off-campus summer research culminating in notebook, paper, oral presentation, and reflective essay.",
      type: "Core",
      prerequisites: ["CHEM 471"],
    },
    {
      code: "PHYS 151",
      title: "Physics I",
      credits: 4,
      description: "Introductory physics course sequence option.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "PHYS 152",
      title: "Physics II",
      credits: 4,
      description: "Continuation of Physics I.",
      type: "Core",
      prerequisites: ["PHYS 151"],
    },
    {
      code: "PHYS 211",
      title: "Physics I (alternative sequence)",
      credits: 4,
      description: "Alternative introductory physics sequence.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "PHYS 212",
      title: "Physics II (alternative sequence)",
      credits: 4,
      description: "Continuation of Physics I (alternative sequence).",
      type: "Core",
      prerequisites: ["PHYS 211"],
    },
    {
      code: "MATH 160",
      title: "Calculus I",
      credits: 4,
      description: "Differential calculus and applications.",
      type: "Core",
      prerequisites: [],
    },
    {
      code: "MATH 220",
      title: "Calculus II",
      credits: 4,
      description: "Integral calculus and applications.",
      type: "Core",
      prerequisites: ["MATH 160"],
    },
    {
      code: "MATH 230",
      title: "Multivariable Calculus",
      credits: 4,
      description: "Calculus of functions of several variables.",
      type: "Core",
      prerequisites: ["MATH 220"],
    },
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

    let { data: program } = await supabase
      .from("programs")
      .select("*")
      .eq("name", courseData.program.name)
      .eq("kind", "major")
      .single();

    if (!program) {
      const { data: newProgram, error: programError } = await supabase
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

      program = newProgram;
    } else {
    }

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
