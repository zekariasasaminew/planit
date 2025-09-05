/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const alternativeGroups = [
  {
    name: "Physics Sequence",
    description:
      "Either the PHYS 151/152 sequence OR the PHYS 211/212 sequence",
    alternatives: [
      { sequence: ["PHYS 151", "PHYS 152"] },
      { sequence: ["PHYS 211", "PHYS 212"] },
    ],
  },
];

async function setupCourseAlternatives() {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    console.log("🚀 Setting up course alternatives...");

    for (const group of alternativeGroups) {
      console.log(`📝 Creating alternative group: ${group.name}`);

      // Create the alternative group
      const { data: altGroup, error: groupError } = await supabase
        .from("course_alternative_groups")
        .insert({
          name: group.name,
          description: group.description,
        })
        .select()
        .single();

      if (groupError) {
        console.error("❌ Group creation error:", groupError);
        continue;
      }

      // Add courses to the alternative group
      for (const alt of group.alternatives) {
        for (const courseCode of alt.sequence) {
          // Find the course
          const { data: course } = await supabase
            .from("courses")
            .select("id")
            .eq("code", courseCode)
            .single();

          if (course) {
            const { error: altError } = await supabase
              .from("course_alternatives")
              .insert({
                group_id: altGroup.id,
                course_id: course.id,
              });

            if (!altError) {
              console.log(`  ✅ Added ${courseCode} to group`);
            } else {
              console.error(`  ❌ Error adding ${courseCode}:`, altError);
            }
          } else {
            console.log(`  ⚠️  Course not found: ${courseCode}`);
          }
        }
      }

      // Now update prerequisite relationships to use the alternative group
      // Find courses that have both PHYS 152 and PHYS 212 as prerequisites
      const coursesWithBothPhysics = ["CHEM 361", "CHEM 365"];

      for (const courseCode of coursesWithBothPhysics) {
        const { data: course } = await supabase
          .from("courses")
          .select("id")
          .eq("code", courseCode)
          .single();

        if (course) {
          // Remove individual physics prerequisites
          const physCourses = ["PHYS 152", "PHYS 212"];
          for (const physCode of physCourses) {
            const { data: physCourse } = await supabase
              .from("courses")
              .select("id")
              .eq("code", physCode)
              .single();

            if (physCourse) {
              await supabase
                .from("course_prereqs")
                .delete()
                .eq("course_id", course.id)
                .eq("prereq_course_id", physCourse.id);
            }
          }

          // Add alternative group prerequisite
          const { error: prereqAltError } = await supabase
            .from("course_prereq_alternatives")
            .insert({
              course_id: course.id,
              prereq_group_id: altGroup.id,
            });

          if (!prereqAltError) {
            console.log(
              `  ✅ Updated ${courseCode} to use physics alternative group`
            );
          } else {
            console.error(`  ❌ Error updating ${courseCode}:`, prereqAltError);
          }
        }
      }
    }

    console.log("\n🎉 Course alternatives setup completed!");
  } catch (error) {
    console.error("💥 Setup failed:", error);
  }
}

// Run the setup
setupCourseAlternatives();
