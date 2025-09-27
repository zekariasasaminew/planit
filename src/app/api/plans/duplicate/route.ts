import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { withRequest } from "@/lib/logging/logger";
import { getUserOrThrow } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const supabase = createSupabaseServiceClient();
  const log = withRequest(requestId);
  const start = Date.now();

  try {
    const user = await getUserOrThrow();
    const { planId } = await req.json();

    if (!planId) {
      const res = NextResponse.json(
        { code: "validation_failed", message: "Plan ID is required" },
        { status: 400 }
      );
      res.headers.set("X-Request-Id", requestId);
      return res;
    }

    // First, get the original plan with all its data
    const { data: originalPlan, error: fetchError } = await supabase
      .from("plans")
      .select("*, plan_semesters(*, plan_courses(*, courses(*)))")
      .eq("id", planId)
      .eq("user_id", user.id) // Make sure user owns the plan
      .single();

    if (fetchError || !originalPlan) {
      const res = NextResponse.json(
        { code: "not_found", message: "Plan not found" },
        { status: 404 }
      );
      res.headers.set("X-Request-Id", requestId);
      return res;
    }

    // Create the new plan with "(Copy)" appended to the name
    const newPlanId = randomUUID();
    const duplicatedName = `${originalPlan.name} (Copy)`;

    const { data: newPlan, error: createError } = await supabase
      .from("plans")
      .insert({
        id: newPlanId,
        user_id: user.id,
        name: duplicatedName,
        start_season: originalPlan.start_season,
        start_year: originalPlan.start_year,
        end_season: originalPlan.end_season,
        end_year: originalPlan.end_year,
        preferences: originalPlan.preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !newPlan) {
      log.error({ createError }, "Failed to create duplicated plan");
      const res = NextResponse.json(
        { code: "internal_error", message: "Failed to create plan copy" },
        { status: 500 }
      );
      res.headers.set("X-Request-Id", requestId);
      return res;
    }

    // Duplicate all semesters and courses
    if (originalPlan.plan_semesters && originalPlan.plan_semesters.length > 0) {
      for (const semester of originalPlan.plan_semesters) {
        const newSemesterId = randomUUID();

        // Create the semester
        const { error: semesterError } = await supabase
          .from("plan_semesters")
          .insert({
            id: newSemesterId,
            plan_id: newPlanId,
            season: semester.season,
            year: semester.year,
            position: semester.position,
            total_credits: semester.total_credits,
          });

        if (semesterError) {
          log.error({ semesterError }, "Failed to create semester copy");
          continue;
        }

        // Duplicate all courses in this semester
        if (semester.plan_courses && semester.plan_courses.length > 0) {
          const coursesToInsert = semester.plan_courses.map(
            (planCourse: any) => ({
              id: randomUUID(),
              plan_semester_id: newSemesterId,
              course_id: planCourse.course_id,
            })
          );

          const { error: coursesError } = await supabase
            .from("plan_courses")
            .insert(coursesToInsert);

          if (coursesError) {
            log.error({ coursesError }, "Failed to create course copies");
          }
        }
      }
    }

    // Fetch the complete duplicated plan to return
    const { data: completePlan, error: fetchCompleteError } = await supabase
      .from("plans")
      .select("*, plan_semesters(*, plan_courses(*, courses(*)))")
      .eq("id", newPlanId)
      .single();

    if (fetchCompleteError || !completePlan) {
      log.error(
        { fetchCompleteError },
        "Failed to fetch complete duplicated plan"
      );
      const res = NextResponse.json(
        {
          code: "internal_error",
          message: "Plan duplicated but failed to fetch result",
        },
        { status: 500 }
      );
      res.headers.set("X-Request-Id", requestId);
      return res;
    }

    // Transform the response to match the expected format
    const transformedPlan = {
      ...completePlan,
      startSemester: {
        season: completePlan.start_season,
        year: completePlan.start_year,
      },
      endSemester: {
        season: completePlan.end_season || "Spring",
        year: completePlan.end_year || completePlan.start_year + 4,
      },
      majors: [],
      minors: [],
      semesters: (completePlan.plan_semesters || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((semester: any) => ({
          id: semester.id,
          name: `${semester.season} ${semester.year}`,
          season: semester.season,
          year: semester.year,
          position: semester.position,
          totalCredits: semester.total_credits || 0,
          courses: (semester.plan_courses || []).map((planCourse: any) => ({
            id: planCourse.courses?.id,
            code: planCourse.courses?.code,
            title: planCourse.courses?.title,
            credits: planCourse.courses?.credits,
            type: planCourse.courses?.type,
            description: planCourse.courses?.description,
          })),
        })),
    };

    // Clean up the database fields that shouldn't be in the response
    delete (transformedPlan as any).start_season;
    delete (transformedPlan as any).start_year;
    delete (transformedPlan as any).end_season;
    delete (transformedPlan as any).end_year;
    delete (transformedPlan as any).plan_semesters;

    const res = NextResponse.json(transformedPlan, { status: 201 });
    res.headers.set("X-Request-Id", requestId);
    log.info(
      { status: 201, elapsedMs: Date.now() - start },
      "POST /api/plans/duplicate"
    );
    return res;
  } catch (e: any) {
    log.error({ error: e }, "Error in duplicate plan endpoint");
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? "unauthorized" : "internal";
    const res = NextResponse.json(
      { code, message: status === 401 ? "Unauthorized" : "Internal error" },
      { status }
    );
    res.headers.set("X-Request-Id", requestId);
    return res;
  }
}
