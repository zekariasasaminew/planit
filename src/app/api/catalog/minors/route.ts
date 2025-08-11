import { NextResponse } from 'next/server';
import { withRequest } from '@/lib/logging/logger';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'node:crypto';

export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId, null);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('programs').select('*').eq('kind', 'minor');
    if (error) throw error;
    const res = NextResponse.json(data || [], { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/catalog/minors');
    return res;
  } catch (e) {
    const res = NextResponse.json({ code: 'internal', message: 'Internal error' }, { status: 500 });
    res.headers.set('X-Request-Id', requestId);
    log.error({ err: e, status: 500, elapsedMs: Date.now() - start }, 'GET /api/catalog/minors failed');
    return res;
  }
}

