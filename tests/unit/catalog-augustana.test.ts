/**
 * Unit tests for the Augustana catalog parsing functionality
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProgram, normalizeCode } from '../../scripts/catalog/augustana/parse.js';
import { mapProgramData, courseIdFor, programIdFor } from '../../scripts/catalog/augustana/map.js';

describe('Augustana Catalog Parser', () => {
  let accountingHtml: string;
  
  beforeAll(() => {
    // Load the sample accounting HTML
    const samplePath = join(__dirname, '../../scripts/catalog/augustana/samples/accounting.html');
    accountingHtml = readFileSync(samplePath, 'utf-8');
  });
  
  describe('parseProgram', () => {
    test('should parse ACCT 321 with 4 credits', () => {
      const result = parseProgram(accountingHtml);
      
      const acct321 = result.courses.find(c => c.code === 'ACCT 321');
      expect(acct321).toBeDefined();
      expect(acct321?.credits).toBe(4);
      expect(acct321?.title).toContain('Intermediate Accounting');
    });
    
    test('should find prerequisite for ACCT 313 requiring ACCT 201', () => {
      const result = parseProgram(accountingHtml);
      
      const acct313Prereq = result.prereqHints.find(p => p.code === 'ACCT 313');
      expect(acct313Prereq).toBeDefined();
      expect(acct313Prereq?.requires).toContain('ACCT 201');
    });
    
    test('should parse program credits for Accounting major as 32', () => {
      const result = parseProgram(accountingHtml);
      
      expect(result.program.credits).toBe(32);
    });
    
    test('should extract program name', () => {
      const result = parseProgram(accountingHtml);
      
      expect(result.program.name).toBeTruthy();
      expect(result.program.name.toLowerCase()).toContain('accounting');
    });
    
    test('should parse multiple prerequisites correctly', () => {
      const result = parseProgram(accountingHtml);
      
      const acct321Prereq = result.prereqHints.find(p => p.code === 'ACCT 321');
      expect(acct321Prereq).toBeDefined();
      expect(acct321Prereq?.requires).toContain('ACCT 313');
      expect(acct321Prereq?.requires).toContain('ACCT 200');
    });
    
    test('should detect Q attribute for quantitative courses', () => {
      const result = parseProgram(accountingHtml);
      
      const busn215 = result.courses.find(c => c.code === 'BUSN 215');
      expect(busn215).toBeDefined();
      expect(busn215?.attrs.Q).toBe(true);
      
      const math115 = result.courses.find(c => c.code === 'MATH 115');
      expect(math115).toBeDefined();
      expect(math115?.attrs.Q).toBe(true);
    });
    
    test('should extract all expected courses', () => {
      const result = parseProgram(accountingHtml);
      
      const expectedCodes = [
        'ACCT 200', 'ACCT 201', 'ACCT 313', 'ACCT 321', 'ACCT 322',
        'ACCT 401', 'ACCT 410', 'ACCT 420', 'BUSN 215', 'ECON 210',
        'ECON 220', 'MATH 115'
      ];
      
      const actualCodes = result.courses.map(c => c.code);
      
      for (const expectedCode of expectedCodes) {
        expect(actualCodes).toContain(expectedCode);
      }
    });
  });
  
  describe('normalizeCode', () => {
    test('should normalize ACCT-321 to ACCT 321', () => {
      expect(normalizeCode('ACCT-321')).toBe('ACCT 321');
    });
    
    test('should normalize ACCT 321 to ACCT 321', () => {
      expect(normalizeCode('ACCT 321')).toBe('ACCT 321');
    });
    
    test('should handle lowercase input', () => {
      expect(normalizeCode('acct-321')).toBe('ACCT 321');
    });
    
    test('should handle extra whitespace', () => {
      expect(normalizeCode('  ACCT   321  ')).toBe('ACCT 321');
    });
  });
  
  describe('mapProgramData', () => {
    test('should generate stable UUIDs for courses', () => {
      const id1 = courseIdFor('ACCT 321');
      const id2 = courseIdFor('ACCT 321');
      const id3 = courseIdFor('ACCT-321'); // Should normalize to same
      
      expect(id1).toBe(id2);
      expect(id1).toBe(id3);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
    
    test('should generate stable UUIDs for programs', () => {
      const id1 = programIdFor('major', 'Accounting');
      const id2 = programIdFor('major', 'Accounting');
      const id3 = programIdFor('major', 'accounting'); // Should be case insensitive
      
      expect(id1).toBe(id2);
      expect(id1).toBe(id3);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
    
    test('should map accounting program data correctly', () => {
      const parsedProgram = parseProgram(accountingHtml);
      parsedProgram.program.name = 'Accounting'; // Ensure name is set
      
      const mappedData = mapProgramData(parsedProgram, 'major');
      
      expect(mappedData.programs).toHaveLength(1);
      
      const program = mappedData.programs[0];
      expect(program.kind).toBe('major');
      expect(program.name).toBe('Accounting');
      expect(program.credits).toBe(32);
      
      // Check that ACCT courses are marked as Core and linked to program
      const acctCourses = mappedData.courses.filter(c => c.code.startsWith('ACCT'));
      expect(acctCourses.length).toBeGreaterThan(0);
      
      for (const course of acctCourses) {
        expect(course.type).toBe('Core');
        expect(course.program_id).toBe(program.id);
      }
      
      // Check that non-ACCT courses are marked as Elective
      const nonAcctCourses = mappedData.courses.filter(c => !c.code.startsWith('ACCT'));
      expect(nonAcctCourses.length).toBeGreaterThan(0);
      
      for (const course of nonAcctCourses) {
        expect(course.type).toBe('Elective');
        expect(course.program_id).toBeUndefined();
      }
    });
    
    test('should create prerequisite relationships', () => {
      const parsedProgram = parseProgram(accountingHtml);
      parsedProgram.program.name = 'Accounting';
      
      const mappedData = mapProgramData(parsedProgram, 'major');
      
      expect(mappedData.prereqs.length).toBeGreaterThan(0);
      
      // Find a specific prerequisite relationship
      const acct313Id = courseIdFor('ACCT 313');
      const acct201Id = courseIdFor('ACCT 201');
      
      const prereqRelation = mappedData.prereqs.find(p => 
        p.course_id === acct313Id && p.prereq_course_id === acct201Id
      );
      
      expect(prereqRelation).toBeDefined();
    });
    
    test('should generate warnings for unknown prerequisite courses', () => {
      // Create a mock parsed program with unknown prerequisites
      const mockParsedProgram = {
        program: { name: 'Test Program', credits: 30 },
        courses: [
          { code: 'TEST 100', title: 'Test Course', credits: 4, attrs: {} }
        ],
        prereqHints: [
          { code: 'TEST 100', requires: ['UNKNOWN 999'] }
        ]
      };
      
      const mappedData = mapProgramData(mockParsedProgram, 'major');
      
      expect(mappedData.warnings.length).toBeGreaterThan(0);
      expect(mappedData.warnings.some(w => w.includes('Unknown prerequisite courses'))).toBe(true);
    });
  });
  
  describe('integration test', () => {
    test('should process full accounting program end-to-end', () => {
      const parsedProgram = parseProgram(accountingHtml);
      parsedProgram.program.name = 'Accounting';
      
      const mappedData = mapProgramData(parsedProgram, 'major');
      
      // Validate the complete pipeline
      expect(mappedData.programs).toHaveLength(1);
      expect(mappedData.courses.length).toBeGreaterThan(10);
      expect(mappedData.prereqs.length).toBeGreaterThan(0);
      
      // Validate program
      const program = mappedData.programs[0];
      expect(program.name).toBe('Accounting');
      expect(program.kind).toBe('major');
      expect(program.credits).toBe(32);
      
      // Validate specific course
      const acct321 = mappedData.courses.find(c => c.code === 'ACCT 321');
      expect(acct321).toBeDefined();
      expect(acct321?.credits).toBe(4);
      expect(acct321?.type).toBe('Core');
      expect(acct321?.program_id).toBe(program.id);
      
      // Validate prerequisite chain
      const prereqsForAcct321 = mappedData.prereqs.filter(p => 
        p.course_id === acct321?.id
      );
      expect(prereqsForAcct321.length).toBeGreaterThan(0);
    });
  });
});
