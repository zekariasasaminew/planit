import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { getUserOrThrow } from '@/lib/auth/session';
import { SettingsUpdateSchema } from '@/lib/validation/schemas';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const user = await getUserOrThrow();
    const { data } = await supabase.from('user_settings').select('prefs').eq('user_id', user.id).maybeSingle();
    const res = NextResponse.json({ prefs: data?.prefs ?? {} }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/settings');
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
    const parsed = SettingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const res = NextResponse.json({ code: 'validation_failed', message: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, prefs: parsed.data.prefs });
    if (error) throw error;
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'PUT /api/settings');
    return res;
  } catch (e: any) {
    const status = e?.status === 401 ? 401 : 500;
    const code = status === 401 ? 'unauthorized' : 'internal';
    const res = NextResponse.json({ code, message: status === 401 ? 'Unauthorized' : 'Internal error' }, { status });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

