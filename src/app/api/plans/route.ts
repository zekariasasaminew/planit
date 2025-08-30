import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { PlanCreateSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const start = Date.now();
  try {
    const user = await getUserOrThrow();
    const body = await req.json();
    const parsed = PlanCreateSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        start_season: parsed.data.startSeason,
        start_year: parsed.data.startYear,
        preferences: parsed.data.preferences,
      })
      .select('*')
      .single();
    
    if (error) throw error;
    const res = NextResponse.json(data, { status: 201 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 201, elapsedMs: Date.now() - start }, 'POST /api/plans');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const start = Date.now();
  try {
    const user = await getUserOrThrow();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('plans')
      .select('id, name, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const res = NextResponse.json(data || [], { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/plans');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

