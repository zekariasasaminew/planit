import type { GeneratePlanApiRequest, AcademicPlan, Semester } from '@/types';
import { randomUUID } from 'node:crypto';
import type { CourseNode } from './graph';

export type Diagnostics = { code: string; message: string; details?: Record<string, unknown> }[];

function canPlace(courseId: string, placedByCourse: Map<string, number>, prereqs: Map<string, string[]>): boolean {
  for (const p of prereqs.get(courseId) || []) {
    if (!placedByCourse.has(p)) return false;
  }
  return true;
}

export function schedulePlan(req: GeneratePlanApiRequest, requiredCourses: CourseNode[]): { plan: AcademicPlan; diagnostics: Diagnostics } {
  const max = req.maxCreditsPerSemester;
  const overflow = req.allowOverload ? 2 : 0;
  const semesters: Semester[] = [];
  const prereqs = new Map(requiredCourses.map((c) => [c.id, c.prereqIds]));
  const byId = new Map(requiredCourses.map((c) => [c.id, c]));
  const taken = new Set(req.takenCourseIds);

  const remaining = requiredCourses.filter((c) => !taken.has(c.id));
  const placedByCourse = new Map<string, number>();

  let season = req.startSeason;
  let year = req.startYear;
  const seasonOrder = ['Spring', 'Summer', 'Fall'];
  function nextTerm() {
    const idx = seasonOrder.indexOf(season);
    const ni = (idx + 1) % seasonOrder.length;
    if (ni === 0) year += 1;
    season = seasonOrder[ni];
  }

  let position = 0;
  const diags: Diagnostics = [];

  while (placedByCourse.size < remaining.length && semesters.length < req.semestersRemaining) {
    // build a term
    let credits = 0;
    const selected: string[] = [];
    for (const c of remaining) {
      if (placedByCourse.has(c.id)) continue;
      if (!canPlace(c.id, placedByCourse, prereqs)) continue;
      const tentative = credits + c.credits;
      if (tentative <= max + overflow) {
        selected.push(c.id);
        credits += c.credits;
      }
    }
    if (selected.length === 0) {
      // couldn't place anything
      diags.push({ code: 'no_placement', message: 'Could not place any course this term due to constraints' });
      nextTerm();
      position += 1;
      continue;
    }

    for (const id of selected) placedByCourse.set(id, position);
    const termCourses = selected.map((id) => ({
      id,
      code: byId.get(id)!.code,
      title: byId.get(id)!.code,
      credits: byId.get(id)!.credits,
      type: 'Core' as const,
      programId: null,
    }));

    semesters.push({ 
      id: randomUUID(), 
      name: `${season} ${year}`,
      season: season as any, 
      year, 
      position, 
      totalCredits: credits, 
      courses: termCourses 
    });
    nextTerm();
    position += 1;
  }

  const plan: AcademicPlan = {
    id: randomUUID(),
    name: 'Generated Plan',
    majors: [],
    minors: [],
    startSemester: {
      season: req.startSeason as any,
      year: req.startYear,
    },
    endSemester: {
      season: semesters[semesters.length - 1]?.season ?? 'Fall',
      year: semesters[semesters.length - 1]?.year ?? req.startYear,
    },
    preferences: {
      maxCreditsPerSemester: req.maxCreditsPerSemester,
      electivePriority: 'distributed',
      summerCourses: req.prefersSummer ?? false,
      winterimCourses: false,
      onlineCoursesAllowed: true,
    },
    semesters,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { plan, diagnostics: diags };
}

