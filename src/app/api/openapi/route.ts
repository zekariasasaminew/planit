import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

export async function GET() {
  const requestId = randomUUID().slice(0, 8);
  const json = readFileSync('public/openapi.json', 'utf-8');
  const res = new NextResponse(json, { status: 200, headers: { 'Content-Type': 'application/json' } });
  res.headers.set('X-Request-Id', requestId);
  return res;
}

