import { topoSort, GraphCycleError, type CourseNode } from './graph';
import { schedulePlan } from './scheduler';
import type { GeneratePlanApiRequest, AcademicPlan } from '@/types';

export const GENERATOR_VERSION = '1.0.0';

export function generatePlan(req: GeneratePlanApiRequest, nodes: CourseNode[]): { plan: AcademicPlan; diagnostics: { code: string; message: string; details?: Record<string, unknown> }[] } {
  try {
    if (!nodes || nodes.length === 0) {
      throw new Error('No courses provided for plan generation');
    }
    
    const order = topoSort(nodes).order;
    const ordered = order.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean);
    
    if (ordered.length === 0) {
      throw new Error('No valid courses after topological sort');
    }
    
    return schedulePlan(req, ordered);
  } catch (error) {
    // If there's an error, return a plan with diagnostics
    const diagnostics = [{
      code: 'generation_error',
      message: error instanceof Error ? error.message : 'Unknown error during plan generation',
      details: { nodeCount: nodes?.length || 0 }
    }];
    
    const fallbackPlan: AcademicPlan = {
      id: 'error-plan',
      name: 'Error - Plan Generation Failed',
      majors: [],
      minors: [],
      startSemester: {
        season: req.startSeason as any,
        year: req.startYear,
      },
      endSemester: {
        season: req.startSeason as any,
        year: req.startYear,
      },
      preferences: {
        maxCreditsPerSemester: req.maxCreditsPerSemester,
        electivePriority: 'distributed',
        summerCourses: req.prefersSummer ?? false,
        winterimCourses: false,
        onlineCoursesAllowed: true,
      },
      semesters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return { plan: fallbackPlan, diagnostics };
  }
}

export { GraphCycleError };

