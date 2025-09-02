import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { checkRateLimit, recordRequest } from '@/lib/supabase/rls';
import { GeneratePlanRequestSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { generatePlan } from '@/lib/planner';
import { rankPlans } from '@/lib/agent';

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

    // Fetch ALL courses and their prerequisites to allow proper prerequisite resolution
    // The planner algorithm will determine which courses are actually needed
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id, code, credits, title, type, program_id');

    const { data: prereqs } = await supabase.from('course_prereqs').select('course_id, prereq_course_id');

    // Create course nodes with prerequisite information
    nodes = (allCourses || []).map((c) => ({
      id: c.id as string,
      code: c.code as string,
      credits: c.credits as number,
      title: c.title as string,
      type: c.type as string,
      programId: c.program_id as string,
      prereqIds: (prereqs || [])
        .filter((p) => p.course_id === c.id)
        .map((p) => p.prereq_course_id as string),
    }));

    const { plan, diagnostics } = generatePlan(parsed.data, nodes);
    // Temporarily skip AI ranking due to OpenAI quota limits
    // const ranked = await rankPlans([plan]);

    const res = NextResponse.json({ plan, diagnostics, rationale: "Plan generated successfully" }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'POST /api/plans/generate');
    return res;
  } catch (e: any) {

    
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ 
      code, 
      message: status === 401 ? 'Unauthorized' : 'Internal error',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

