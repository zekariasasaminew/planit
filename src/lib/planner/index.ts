import { topoSort, GraphCycleError, type CourseNode } from './graph';
import { schedulePlan } from './scheduler';
import type { GeneratePlanApiRequest, AcademicPlan } from '@/types';

export const GENERATOR_VERSION = '1.0.0';

export function generatePlan(req: GeneratePlanApiRequest, nodes: CourseNode[]): { plan: AcademicPlan; diagnostics: { code: string; message: string; details?: Record<string, unknown> }[] } {
  const order = topoSort(nodes).order;
  const ordered = order.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean);
  return schedulePlan(req, ordered);
}

export { GraphCycleError };

