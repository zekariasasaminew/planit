import { describe, it, expect } from 'vitest';
import { topoSort } from '@/lib/planner/graph';
import { schedulePlan } from '@/lib/planner/scheduler';

describe('planner', () => {
  it('topo sorts simple chain', () => {
    const { order } = topoSort([
      { id: 'A', code: 'A', credits: 3, prereqIds: [] },
      { id: 'B', code: 'B', credits: 3, prereqIds: ['A'] },
      { id: 'C', code: 'C', credits: 3, prereqIds: ['B'] },
    ]);
    expect(order[0]).toBe('A');
    expect(order[2]).toBe('C');
  });

  it('enforces credit cap', () => {
    const req = {
      majorIds: [],
      takenCourseIds: [],
      semestersRemaining: 2,
      maxCreditsPerSemester: 3,
      startSeason: 'Fall',
      startYear: 2024,
    } as any;
    const { plan } = schedulePlan(req, [
      { id: 'A', code: 'A', credits: 3, prereqIds: [] },
      { id: 'B', code: 'B', credits: 3, prereqIds: [] },
    ]);
    expect(plan.semesters[0].totalCredits).toBe(3);
  });
});

