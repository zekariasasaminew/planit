import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { CourseAddSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; sid: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    await getUserOrThrow();
    const { id, sid } = await params;
    const body = await req.json();
    const parsed = CourseAddSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }

    // Validate prereqs placed earlier and credit cap
    const { data: semester } = await supabase.from('plan_semesters').select('*').eq('id', sid).single();
    if (!semester) {
      const res = NextResponse.json({ code: 'not_found', message: 'Semester not found' }, { status: 404 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const { data: plan } = await supabase.from('plans').select('*').eq('id', id).single();
    const max = (plan?.preferences as any)?.maxCreditsPerSemester ?? 18;
    const allowOverload = (plan?.preferences as any)?.allowOverload ?? false;
    const overflow = allowOverload ? 2 : 0;
    const { data: course } = await supabase.from('courses').select('*').eq('id', parsed.data.courseId).single();
    const { data: prereqs } = await supabase.from('course_prereqs').select('*').eq('course_id', parsed.data.courseId);
    const { data: earlierCourses } = await supabase
      .from('plan_courses')
      .select('course_id, plan_semesters(position)')
      .eq('plan_semesters.plan_id', id)
      .lt('plan_semesters.position', semester.position)
      .order('plan_semesters.position');

    const earlierIds = new Set((earlierCourses || []).map((r: any) => r.course_id));
    for (const p of prereqs || []) {
      if (!earlierIds.has(p.prereq_course_id)) {
        const res = NextResponse.json({ code: 'conflict', message: 'Prerequisite not satisfied' }, { status: 409 });
        res.headers.set('X-Request-Id', requestId);
        return res;
      }
    }

    if ((semester.total_credits || 0) + (course?.credits || 0) > max + overflow) {
      const res = NextResponse.json({ code: 'conflict', message: 'Credit cap exceeded' }, { status: 409 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }

    const { data, error } = await supabase
      .from('plan_courses')
      .insert({ plan_semester_id: sid, course_id: parsed.data.courseId })
      .select('*')
      .single();
    if (error) throw error;
    const res = NextResponse.json(data, { status: 201 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 201, elapsedMs: Date.now() - start }, 'POST /api/plans/[id]/semesters/[sid]/courses');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

