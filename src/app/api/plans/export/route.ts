import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export async function POST() {
  const requestId = randomUUID().slice(0, 8);
  const blob = Buffer.from('%PDF-1.4\n% placeholder PDF');
  const res = new NextResponse(blob, { status: 200 });
  res.headers.set('Content-Type', 'application/pdf');
  res.headers.set('X-Request-Id', requestId);
  return res;
}

