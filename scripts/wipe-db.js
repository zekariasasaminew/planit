/* eslint-disable */
// SAFE DATABASE WIPE SCRIPT
// Runs each DROP statement individually to avoid transaction issues

// Allow local migrations behind corporate/self-signed MITM proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";

// Load .env.local first (if present), then .env
try {
  require("dotenv").config({ path: ".env.local" });
} catch {}
require("dotenv").config();

const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required for database wipe");
    process.exit(1);
  }

  console.log("⚠️  WIPING DATABASE - ALL DATA WILL BE LOST!");
  console.log("Starting database wipe...\n");

  // Function to create and execute a single statement
  async function executeStatement(statement) {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { require: true, rejectUnauthorized: false },
    });

    try {
      await client.connect();
      await client.query(statement);
      await client.end();
      return { success: true };
    } catch (error) {
      await client.end();
      return { success: false, error };
    }
  }

  // List of statements to execute in order
  const statements = [
    // Drop views first
    "DROP VIEW IF EXISTS courses_with_lp CASCADE",
    "DROP VIEW IF EXISTS course_prerequisite_details CASCADE",

    // Drop tables in dependency order
    "DROP TABLE IF EXISTS plan_change_log CASCADE",
    "DROP TABLE IF EXISTS plan_semester_courses CASCADE",
    "DROP TABLE IF EXISTS plan_courses CASCADE",
    "DROP TABLE IF EXISTS plan_semesters CASCADE",
    "DROP TABLE IF EXISTS academic_plans CASCADE",
    "DROP TABLE IF EXISTS plans CASCADE",
    "DROP TABLE IF EXISTS degree_progress CASCADE",
    "DROP TABLE IF EXISTS student_lp_fulfillment CASCADE",
    "DROP TABLE IF EXISTS course_learning_perspectives CASCADE",
    "DROP TABLE IF EXISTS course_prereq_alternatives CASCADE",
    "DROP TABLE IF EXISTS alternative_group_courses CASCADE",
    "DROP TABLE IF EXISTS course_alternatives CASCADE",
    "DROP TABLE IF EXISTS course_alternative_groups CASCADE",
    "DROP TABLE IF EXISTS alternative_course_groups CASCADE",
    "DROP TABLE IF EXISTS program_requirements CASCADE",
    "DROP TABLE IF EXISTS course_prerequisites CASCADE",
    "DROP TABLE IF EXISTS course_prereqs CASCADE",
    "DROP TABLE IF EXISTS course_prerequisite_groups CASCADE",
    "DROP TABLE IF EXISTS student_programs CASCADE",
    "DROP TABLE IF EXISTS courses CASCADE",
    "DROP TABLE IF EXISTS programs CASCADE",
    "DROP TABLE IF EXISTS departments CASCADE",
    "DROP TABLE IF EXISTS learning_perspectives CASCADE",
    "DROP TABLE IF EXISTS share_links CASCADE",
    "DROP TABLE IF EXISTS plan_shares CASCADE",
    "DROP TABLE IF EXISTS user_settings CASCADE",
    "DROP TABLE IF EXISTS request_log CASCADE",
    "DROP TABLE IF EXISTS public.users CASCADE",

    // Drop types/enums
    "DROP TYPE IF EXISTS academic_status CASCADE",
    "DROP TYPE IF EXISTS prerequisite_type CASCADE",
    "DROP TYPE IF EXISTS semester_season CASCADE",
    "DROP TYPE IF EXISTS course_source CASCADE",
    "DROP TYPE IF EXISTS course_category CASCADE",
    "DROP TYPE IF EXISTS course_type CASCADE",
    "DROP TYPE IF EXISTS program_type CASCADE",
    "DROP TYPE IF EXISTS program_kind CASCADE",

    // Drop functions
    "DROP FUNCTION IF EXISTS update_total_credits() CASCADE",
    "DROP FUNCTION IF EXISTS update_semester_credits() CASCADE",
    "DROP FUNCTION IF EXISTS update_updated_at() CASCADE",
    "DROP FUNCTION IF EXISTS is_admin() CASCADE",
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    const result = await executeStatement(statement);

    if (result.success) {
      console.log(`✅ ${statement}`);
      successCount++;
    } else {
      // Only show error if it's not "does not exist"
      if (!result.error.message.includes("does not exist")) {
        console.log(`❌ ${statement}`);
        console.log(`   Error: ${result.error.message}`);
        errorCount++;
      } else {
        console.log(`⏭️  ${statement} (already gone)`);
        successCount++;
      }
    }
  }

  console.log(`\n🎉 Database wipe completed!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log("\nDatabase is now clean and ready for new schema!");
}

main().catch((err) => {
  console.error("❌ Database wipe failed:", err);
  process.exit(1);
});
