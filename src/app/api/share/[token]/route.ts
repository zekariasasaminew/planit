import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { withRequest } from '@/lib/logging/logger';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const requestId = randomUUID().slice(0, 8);
  const log = withRequest(requestId);
  const supabase = createSupabaseServiceClient();
  const start = Date.now();
  try {
    const { token } = await params;
    const { data: link } = await supabase
      .from('share_links')
      .select('plan_id')
      .eq('token', token)
      .eq('is_public', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!link?.plan_id) {
      const res = NextResponse.json({ code: 'not_found', message: 'Invalid or expired token' }, { status: 404 });
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const { data, error } = await supabase
      .from('plans')
      .select('*, plan_semesters(*, plan_courses(*, courses(*)))')
      .eq('id', link.plan_id)
      .single();
    if (error) throw error;
    
    // Sort semesters by position to ensure proper chronological order
    if (data.plan_semesters) {
      data.plan_semesters.sort((a: any, b: any) => a.position - b.position);
    }
    
    const res = NextResponse.json(data, { status: 200 });
    res.headers.set('X-Request-Id', requestId);
    log.info({ status: 200, elapsedMs: Date.now() - start }, 'GET /api/share/[token]');
    return res;
  } catch {
    const res = NextResponse.json({ code: 'internal', message: 'Internal error' }, { status: 500 });
    res.headers.set('X-Request-Id', requestId);
    return res;
  }
}

