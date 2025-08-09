import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { ProfileUpdateSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const user = await getUserOrThrow();
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    const res = NextResponse.json({ id: user.id, ...data }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/me');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

export async function PUT(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const user = await getUserOrThrow();
    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, full_name: parsed.data.full_name, avatar_url: parsed.data.avatar_url })
      .select('*');
    if (error) throw error;
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'PUT /api/me');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

