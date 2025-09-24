import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { PlanUpdateSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const supabase = createSupabaseServiceClient();
  const log = withRequest(requestId);
  const start = Date.now();
  try {
    await getUserOrThrow();
    const { id } = await params;
    const { data, error } = await supabase
      .from('plans')
      .select('*, plan_semesters(*, plan_courses(*, courses(*)))')
      .eq('id', id)
      .single();
    if (error) throw error;
    

    const transformedPlan = {
      ...data,
      startSemester: {
        season: data.start_season,
        year: data.start_year
      },
      endSemester: {
        season: data.end_season || 'Spring',
        year: data.end_year || (data.start_year + 4)
      },
      majors: [],
      minors: [],
      semesters: (data.plan_semesters || [])
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
          })).filter((course: any) => course.id)
        }))
      }
    

    delete transformedPlan.plan_semesters;
    delete transformedPlan.start_season;
    delete transformedPlan.start_year;
    delete transformedPlan.end_season;
    delete transformedPlan.end_year;
    

    
    const res = NextResponse.json(transformedPlan, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/plans/[id]');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const supabase = createSupabaseServiceClient();
  const log = withRequest(requestId);
  const start = Date.now();
  try {
    await getUserOrThrow();
    const { id } = await params;
    const body = await req.json();
    const parsed = PlanUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const updates: Record<string, unknown> = {};
    if (parsed.data.name) updates.name = parsed.data.name;
    if (parsed.data.preferences) updates.preferences = parsed.data.preferences;
    const { data, error } = await supabase.from('plans').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    const res = NextResponse.json(data, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'PUT /api/plans/[id]');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const supabase = createSupabaseServiceClient();
  const log = withRequest(requestId);
  const start = Date.now();
  try {
    await getUserOrThrow();
    const { id } = await params;
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) throw error;
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'DELETE /api/plans/[id]');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

