import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { SemesterCreateSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    await getUserOrThrow();
    const { id } = await params;
    const body = await req.json();
    const parsed = SemesterCreateSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const { data, error } = await supabase
      .from('plan_semesters')
      .insert({ plan_id: id, season: parsed.data.season, year: parsed.data.year, position: parsed.data.position })
      .select('*')
      .single();
    if (error) throw error;
    const res = NextResponse.json(data, { status: 201 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 201, elapsedMs: Date.now() - start }, 'POST /api/plans/[id]/semesters');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

