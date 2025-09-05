import type { GeneratePlanApiRequest, AcademicPlan, Semester } from '@/types';
import { randomUUID } from 'node:crypto';
import type { CourseNode } from './graph';

export type Diagnostics = { code: string; message: string; details?: Record<string, unknown> }[];

function canPlace(courseId: string, placedByCourse: Map<string, number>, prereqs: Map<string, string[]>, takenCourses: Set<string>): boolean {
  for (const p of prereqs.get(courseId) || []) {
    // Prerequisites can be satisfied by either placed courses or already taken courses
    if (!placedByCourse.has(p) && !takenCourses.has(p)) {
      return false;
    }
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
  const seasonOrder = ['Fall', 'Spring', 'Summer'];
  function nextTerm() {
    const idx = seasonOrder.indexOf(season);
    const ni = (idx + 1) % seasonOrder.length;
    if (ni === 0) year += 1;
    season = seasonOrder[ni];
  }

  let position = 0;
  const diags: Diagnostics = [];
  let consecutiveEmptyTerms = 0;

  while (placedByCourse.size < remaining.length && semesters.length < req.semestersRemaining) {
    if (season === 'Summer' && !req.prefersSummer) {
      nextTerm();
      position += 1;
      continue;
    }

    let credits = 0;
    const selected: string[] = [];
    for (const c of remaining) {
      if (placedByCourse.has(c.id)) continue;
      if (!canPlace(c.id, placedByCourse, prereqs, taken)) continue;
      const tentative = credits + c.credits;
      if (tentative <= max + overflow) {
        selected.push(c.id);
        credits += c.credits;
      }
    }
    if (selected.length === 0) {
      // couldn't place anything
      consecutiveEmptyTerms += 1;
      diags.push({ code: 'no_placement', message: `Could not place any course in ${season} ${year} due to constraints` });
      
      // Prevent infinite loop - if we can't place anything for 3 consecutive terms, break
      if (consecutiveEmptyTerms >= 3) {
        diags.push({ code: 'placement_impossible', message: 'Unable to place remaining courses within constraints - may need more semesters or different prerequisites' });
        break;
      }
      
      nextTerm();
      position += 1;
      continue;
    }
    
    // Reset consecutive empty counter when we successfully place courses
    consecutiveEmptyTerms = 0;

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

  // Add diagnostic if not all courses could be placed
  const coursesPlaced = placedByCourse.size;
  const totalCourses = remaining.length;
  if (coursesPlaced < totalCourses) {
    diags.push({
      code: 'incomplete_schedule',
      message: `Only ${coursesPlaced} of ${totalCourses} courses could be scheduled within the given constraints`,
      details: { coursesPlaced, totalCourses, semestersUsed: semesters.length }
    });
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

