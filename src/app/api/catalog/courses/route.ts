import { NextRequest, NextResponse } from 'next/server';
import { withRequest } from '@/lib/logging/logger';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'node:crypto';

export async function GET(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId, null);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    const q = searchParams.get('q');

    let query = supabase.from('courses').select('*');
    if (programId) query = query.eq('program_id', programId);
    if (q) query = query.or(`code.ilike.%${q}%,title.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;
    const res = NextResponse.json(data || [], { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/catalog/courses');
    return res;
  } catch (e) {
    const res = NextResponse.json({ code: 'internal', message: 'Internal error' }, { status: 500 });
    res.headers.set('X-Request-Id', requestId);
    log.error({ err: e, status: 500, elapsedMs: Date.now() - start }, 'GET /api/catalog/courses failed');
    return res;
  }
}

