import OpenAI from 'openai';
import type { AcademicPlan } from '@/types';
import { SYSTEM_PROMPT } from './tools';

export async function rankPlans(candidates: AcademicPlan[]): Promise<{ plan: AcademicPlan; rationale: string }>
{
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { plan: candidates[0], rationale: 'No LLM configured; returning first valid plan.' };
  }
  const client = new OpenAI({ apiKey });
  const content = JSON.stringify(candidates.map((c, i) => ({ index: i, semesters: c.semesters.map((s) => ({ season: s.season, year: s.year, totalCredits: s.totalCredits, courses: s.courses.map((x) => x.code) })) })));
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
  });
  const txt = resp.choices[0]?.message?.content || '{"index":0,"rationale":"default"}';
  const parsed = JSON.parse(txt) as { index: number; rationale: string };
  const idx = Math.min(Math.max(parsed.index ?? 0, 0), candidates.length - 1);
  return { plan: candidates[idx], rationale: parsed.rationale || 'LLM did not provide a rationale.' };
}

