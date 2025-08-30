import { describe, it, expect } from 'vitest';
import { topoSort } from '@/lib/planner/graph';
import { schedulePlan } from '@/lib/planner/scheduler';
import { generatePlan } from '@/lib/planner';

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

  // Comprehensive tests with smaller course set
  describe('Planning Algorithm Validation', () => {
    const basicCourses = [
      { id: 'cs101', code: 'CS101', credits: 3, prereqIds: [] },
      { id: 'cs102', code: 'CS102', credits: 3, prereqIds: ['cs101'] },
      { id: 'math101', code: 'MATH101', credits: 4, prereqIds: [] },
      { id: 'math102', code: 'MATH102', credits: 4, prereqIds: ['math101'] },
    ];

    it('generates valid basic plan', () => {
      const req = {
        majorIds: ['cs-major'],
        takenCourseIds: [],
        semestersRemaining: 3,
        maxCreditsPerSemester: 15,
        allowOverload: false,
        startSeason: 'Fall',
        startYear: 2024,
      };

      const { plan, diagnostics } = generatePlan(req, basicCourses);
      
      // Basic validation
      expect(plan).toBeDefined();
      expect(plan.semesters.length).toBeGreaterThan(0);
      expect(plan.semesters.length).toBeLessThanOrEqual(3);
      
      // Check total credits don't exceed limit
      plan.semesters.forEach(semester => {
        expect(semester.totalCredits).toBeLessThanOrEqual(15);
        expect(semester.totalCredits).toBeGreaterThan(0);
      });

      // Check prerequisites are respected
      const courseSchedule = new Map<string, number>();
      plan.semesters.forEach((semester, semesterIndex) => {
        semester.courses.forEach(course => {
          courseSchedule.set(course.id, semesterIndex);
        });
      });

      basicCourses.forEach(course => {
        if (courseSchedule.has(course.id)) {
          const coursePosition = courseSchedule.get(course.id)!;
          course.prereqIds.forEach(prereqId => {
            const prereqPosition = courseSchedule.get(prereqId);
            if (prereqPosition !== undefined) {
              expect(prereqPosition).toBeLessThan(coursePosition);
            }
          });
        }
      });

      console.log('\n=== Generated Basic Plan ===');
      plan.semesters.forEach((semester, i) => {
        console.log(`\n${semester.name} (${semester.totalCredits} credits):`);
        semester.courses.forEach(course => {
          console.log(`  - ${course.code}: ${course.title} (${course.credits} credits)`);
        });
      });
      
      if (diagnostics.length > 0) {
        console.log('\nDiagnostics:', diagnostics);
      }
    });

    it('handles taken courses correctly', () => {
      const req = {
        majorIds: ['cs-major'],
        takenCourseIds: ['cs101', 'math101'], // Already taken intro courses
        semestersRemaining: 2,
        maxCreditsPerSemester: 15,
        allowOverload: false,
        startSeason: 'Spring',
        startYear: 2024,
      };

      const { plan, diagnostics } = generatePlan(req, basicCourses);
      
      // Should not schedule already taken courses
      const scheduledCourseIds = plan.semesters.flatMap(s => s.courses.map(c => c.id));
      expect(scheduledCourseIds).not.toContain('cs101');
      expect(scheduledCourseIds).not.toContain('math101');
      
      // Should be able to schedule their dependents since prerequisites are satisfied
      if (scheduledCourseIds.length > 0) {
        expect(scheduledCourseIds).toContain('cs102'); // Depends on cs101
        expect(scheduledCourseIds).toContain('math102'); // Depends on math101
      }

      console.log('\n=== Plan with Prerequisites Taken ===');
      console.log('Already taken: CS101, MATH101');
      console.log('Scheduled courses:', scheduledCourseIds);
      plan.semesters.forEach((semester, i) => {
        console.log(`\n${semester.name} (${semester.totalCredits} credits):`);
        semester.courses.forEach(course => {
          console.log(`  - ${course.code}: ${course.title} (${course.credits} credits)`);
        });
      });
      
      if (diagnostics.length > 0) {
        console.log('\nDiagnostics:', diagnostics);
      }
    });

    it('respects credit overload settings', () => {
      const req = {
        majorIds: ['cs-major'],
        takenCourseIds: [],
        semestersRemaining: 2,
        maxCreditsPerSemester: 12,
        allowOverload: true, // Allow up to 2 extra credits
        startSeason: 'Fall',
        startYear: 2024,
      };

      const { plan } = generatePlan(req, basicCourses);
      
      // With overload allowed, should be able to take up to 14 credits
      plan.semesters.forEach(semester => {
        expect(semester.totalCredits).toBeLessThanOrEqual(14);
      });

      console.log('\n=== Plan with Overload Allowed ===');
      plan.semesters.forEach((semester, i) => {
        console.log(`\n${semester.name} (${semester.totalCredits} credits):`);
        semester.courses.forEach(course => {
          console.log(`  - ${course.code}: ${course.title} (${course.credits} credits)`);
        });
      });
    });

    it('handles semester progression correctly', () => {
      const req = {
        majorIds: ['cs-major'],
        takenCourseIds: [],
        semestersRemaining: 3,
        maxCreditsPerSemester: 15,
        allowOverload: false,
        prefersSummer: false,
        startSeason: 'Spring',
        startYear: 2024,
      };

      const { plan } = generatePlan(req, basicCourses);
      
      // Check semester sequence: Spring 2024 -> Fall 2024 -> Spring 2025 (skipping Summer)
      expect(plan.semesters[0].season).toBe('Spring');
      expect(plan.semesters[0].year).toBe(2024);
      
      if (plan.semesters.length > 1) {
        expect(plan.semesters[1].season).toBe('Fall');
        expect(plan.semesters[1].year).toBe(2024);
      }
      
      if (plan.semesters.length > 2) {
        expect(plan.semesters[2].season).toBe('Spring');
        expect(plan.semesters[2].year).toBe(2025);
      }

      console.log('\n=== Semester Progression Test ===');
      plan.semesters.forEach((semester, i) => {
        console.log(`${i + 1}. ${semester.season} ${semester.year} (${semester.totalCredits} credits)`);
      });
    });
  });

  describe('Edge Cases', () => {
    const testCourses = [
      { id: 'cs101', code: 'CS101', credits: 3, prereqIds: [] },
      { id: 'cs102', code: 'CS102', credits: 3, prereqIds: ['cs101'] },
      { id: 'math101', code: 'MATH101', credits: 4, prereqIds: [] },
      { id: 'math102', code: 'MATH102', credits: 4, prereqIds: ['math101'] },
    ];

    it('handles impossible prerequisites gracefully', () => {
      const impossible = [
        { id: 'A', code: 'A', credits: 3, prereqIds: ['B'] },
        { id: 'B', code: 'B', credits: 3, prereqIds: ['A'] }, // Circular dependency
      ];

      expect(() => {
        generatePlan({
          majorIds: [],
          takenCourseIds: [],
          semestersRemaining: 2,
          maxCreditsPerSemester: 15,
          startSeason: 'Fall',
          startYear: 2024,
        }, impossible);
      }).toThrow('Prerequisite cycle detected');
    });

    it('handles insufficient semesters', () => {
      const req = {
        majorIds: [],
        takenCourseIds: [],
        semestersRemaining: 1, // Only 1 semester for 4 courses
        maxCreditsPerSemester: 3, // Very low credit limit - can only fit 1 course
        startSeason: 'Fall',
        startYear: 2024,
      };

      const { plan, diagnostics } = generatePlan(req, testCourses);
      
      console.log('\n=== Insufficient Semesters Test ===');
      console.log('Diagnostics:', diagnostics);
      console.log('Courses placed:', plan.semesters.flatMap(s => s.courses.map(c => c.code)));
      console.log('Total courses to place:', testCourses.length);
      console.log('Courses actually placed:', plan.semesters.flatMap(s => s.courses).length);
      
      // Should either generate diagnostics OR not be able to place all courses
      const coursesPlaced = plan.semesters.flatMap(s => s.courses).length;
      const shouldHaveDiagnostics = coursesPlaced < testCourses.length;
      
      if (shouldHaveDiagnostics) {
        expect(diagnostics.length).toBeGreaterThan(0);
      }
    });
  });
});

