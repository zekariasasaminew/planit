import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { checkRateLimit, recordRequest } from '@/lib/supabase/rls';
import { GeneratePlanRequestSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { generatePlan } from '@/lib/planner';
// import { rankPlans } from '@/lib/agent'; // Temporarily disabled due to OpenAI quota limits

export async function POST(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const start = Date.now();
  
  let parsed: any = null;
  let nodes: any[] = [];
  
  try {
    const user = await getUserOrThrow();
    const body = await req.json();
    parsed = GeneratePlanRequestSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }

    // rate limit
    const { allowed } = await checkRateLimit(user.id, 'plan_generate');
    if (!allowed) {
      const res = NextResponse.json({ code: 'rate_limit_exceeded', message: 'Too many requests' }, { status: 429 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    await recordRequest(user.id, 'plan_generate');

    const supabase = createSupabaseServiceClient();

    // Fetch courses for selected majors and minors, plus any prerequisite courses
    const programIds = [...parsed.data.majorIds];
    if (parsed.data.minorIds) {
      programIds.push(...parsed.data.minorIds);
    }

    // First, get courses for the selected programs
    const { data: programCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id, code, credits, title, type, program_id')
      .in('program_id', programIds);

    if (coursesError) {
      log.error({ error: coursesError, programIds }, 'Failed to fetch program courses');
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    log.info({ 
      programIds, 
      courseCount: programCourses?.length || 0 
    }, 'Fetched program courses');

    // Get all prerequisite relationships to find any prerequisite courses not in selected programs
    const { data: prereqs, error: prereqsError } = await supabase.from('course_prereqs').select('course_id, prereq_course_id');
    
    if (prereqsError) {
      log.error({ error: prereqsError }, 'Failed to fetch prerequisites');
      throw new Error(`Failed to fetch prerequisites: ${prereqsError.message}`);
    }

    // Get alternative group prerequisites
    const { data: prereqAlts, error: prereqAltsError } = await supabase
      .from('course_prereq_alternatives')
      .select(`
        course_id,
        prereq_group_id,
        course_alternative_groups!inner(
          id,
          name,
          description
        )
      `);

    if (prereqAltsError) {
      log.error({ error: prereqAltsError }, 'Failed to fetch prerequisite alternatives');
      throw new Error(`Failed to fetch prerequisite alternatives: ${prereqAltsError.message}`);
    }

    // Get all courses in alternative groups
    const { data: altCourses, error: altCoursesError } = await supabase
      .from('course_alternatives')
      .select(`
        group_id,
        course_id,
        courses!inner(
          id,
          code,
          credits,
          title,
          type,
          program_id
        )
      `);

    if (altCoursesError) {
      log.error({ error: altCoursesError }, 'Failed to fetch alternative courses');
      throw new Error(`Failed to fetch alternative courses: ${altCoursesError.message}`);
    }
    
    // Find prerequisite course IDs that are not already in our program courses
    const programCourseIds = new Set((programCourses || []).map(c => c.id));
    const prereqIds = new Set<string>();
    
    for (const prereq of prereqs || []) {
      if (programCourseIds.has(prereq.course_id) && !programCourseIds.has(prereq.prereq_course_id)) {
        prereqIds.add(prereq.prereq_course_id);
      }
    }

    // Handle alternative groups - select one course from each group that has prerequisites
    const selectedFromAlternatives: any[] = [];
    const altGroupsWithPrereqs = new Set<string>();
    
    // Find which alternative groups are needed as prerequisites
    for (const prereqAlt of prereqAlts || []) {
      if (programCourseIds.has(prereqAlt.course_id)) {
        altGroupsWithPrereqs.add(prereqAlt.prereq_group_id);
      }
    }

    // For each needed alternative group, select the first available sequence
    for (const groupId of altGroupsWithPrereqs) {
      const groupCourses = (altCourses || [])
        .filter(ac => ac.group_id === groupId)
        .map(ac => ac.courses);

      if (groupCourses.length > 0) {
        // For physics sequences, prefer the 151/152 sequence (first sequence)
        // This could be made configurable based on user preferences later
        const firstSequence = groupCourses.filter((c: any) => c.code.includes('151') || c.code.includes('152'));
        const selectedSequence = firstSequence.length > 0 ? firstSequence : groupCourses.slice(0, 2);
        
        selectedFromAlternatives.push(...selectedSequence);
        
        // Add to prereq IDs so they get included in the final course list
        for (const course of selectedSequence) {
          if (!programCourseIds.has((course as any).id)) {
            prereqIds.add((course as any).id);
          }
        }
      }
    }

    // Fetch any prerequisite courses that aren't already included
    let prereqCourses: any[] = [];
    if (prereqIds.size > 0) {
      const { data, error: prereqCoursesError } = await supabase
        .from('courses')
        .select('id, code, credits, title, type, program_id')
        .in('id', Array.from(prereqIds));
      
      if (prereqCoursesError) {
        log.error({ error: prereqCoursesError, prereqIds: Array.from(prereqIds) }, 'Failed to fetch prerequisite courses');
        throw new Error(`Failed to fetch prerequisite courses: ${prereqCoursesError.message}`);
      }
      
      prereqCourses = data || [];
    }

    // Combine program courses and prerequisite courses
    const allCourses = [...(programCourses || []), ...prereqCourses];

    if (allCourses.length === 0) {
      log.warn({ programIds }, 'No courses found for selected programs');
      const res = NextResponse.json({ 
        code: 'no_courses_found', 
        message: 'No courses found for the selected programs. Please ensure the programs exist and have courses.' 
      }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }

    // Create course nodes with prerequisite information
    nodes = (allCourses || []).map((c) => {
      // Get regular prerequisites
      const regularPrereqs = (prereqs || [])
        .filter((p) => p.course_id === c.id)
        .map((p) => p.prereq_course_id as string);

      // Get prerequisites from alternative groups
      const altGroupPrereqs: string[] = [];
      for (const prereqAlt of prereqAlts || []) {
        if (prereqAlt.course_id === c.id) {
          // Find the selected courses from this alternative group
          const selectedFromGroup = selectedFromAlternatives.filter((selected: any) => {
            return (altCourses || []).some(ac => 
              ac.group_id === prereqAlt.prereq_group_id && 
              ac.course_id === selected.id
            );
          });
          altGroupPrereqs.push(...selectedFromGroup.map((s: any) => s.id));
        }
      }

      return {
        id: c.id as string,
        code: c.code as string,
        credits: c.credits as number,
        title: c.title as string,
        type: c.type as string,
        programId: c.program_id as string,
        prereqIds: [...regularPrereqs, ...altGroupPrereqs],
      };
    });

    log.info({ 
      totalCourses: allCourses.length,
      nodeCount: nodes.length,
      requestData: {
        majorIds: parsed.data.majorIds,
        minorIds: parsed.data.minorIds,
        semestersRemaining: parsed.data.semestersRemaining
      }
    }, 'Generated course nodes, starting plan generation');

    const { plan, diagnostics } = generatePlan(parsed.data, nodes);
    // Temporarily skip AI ranking due to OpenAI quota limits
    // const ranked = await rankPlans([plan]);

    if (!plan || plan.id === 'error-plan') {
      log.error({ diagnostics }, 'Plan generation failed');
      const res = NextResponse.json({ 
        code: 'plan_generation_failed', 
        message: 'Failed to generate a valid plan',
        diagnostics 
      }, { status: 500 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }

    log.info({ 
      planId: plan.id, 
      semesterCount: plan.semesters?.length || 0,
      diagnosticsCount: diagnostics?.length || 0 
    }, 'Plan generated successfully');

    const res = NextResponse.json({ plan, diagnostics, rationale: "Plan generated successfully" }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'POST /api/plans/generate');
    return res;
  } catch (e: any) {
    // Enhanced error logging
    log.error(
      { 
        error: e.message, 
        stack: e.stack, 
        parsed: parsed?.success ? 'valid' : parsed?.error?.flatten(), 
        nodeCount: nodes.length,
        requestId 
      }, 
      'POST /api/plans/generate - Error'
    );
    
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ 
      code, 
      message: status === 401 ? 'Unauthorized' : 'Internal error',
      details: process.env.NODE_ENV === 'development' ? {
        message: e.message,
        stack: e.stack,
        nodeCount: nodes.length,
        validationResult: parsed?.success ? 'valid' : parsed?.error?.flatten()
      } : undefined
    }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

