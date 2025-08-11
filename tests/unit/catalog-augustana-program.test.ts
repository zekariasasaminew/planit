/**
 * Unit tests for the Augustana catalog program parsing functionality
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProgram, normalizeCode } from '../../scripts/catalog/augustana/parse.js';

describe('Augustana Catalog Program Parser', () => {
  let accountingCoursesHtml: string;
  
  beforeAll(() => {
    // Load the sample accounting courses HTML
    const samplePath = join(__dirname, '../../scripts/catalog/augustana/samples/accounting_courses.html');
    accountingCoursesHtml = readFileSync(samplePath, 'utf-8');
  });
  
  describe('parseProgram for Accounting', () => {
    test('should parse Accounting program name', () => {
      const result = parseProgram(accountingCoursesHtml);
      
      expect(result.program.name.toLowerCase()).toContain('accounting');
    });
    
    test('should parse Accounting credits as 32', () => {
      const result = parseProgram(accountingCoursesHtml);
      
      expect(result.program.credits).toBe(32);
    });
    
    test('should extract required course codes', () => {
      const result = parseProgram(accountingCoursesHtml);
      
      const expectedCodes = [
        'ACCT 200', 'ACCT 201', 'ACCT 202', 'ACCT 311', 
        'ACCT 313', 'ACCT 314', 'ACCT 321', 'ACCT 322', 'ACCT 456'
      ];
      
      const actualCodes = result.courses.map(c => c.code);
      
      for (const expectedCode of expectedCodes) {
        expect(actualCodes).toContain(expectedCode);
      }
    });
    
    test('should handle "ACCT 200 or 201" abbreviation correctly', () => {
      const result = parseProgram(accountingCoursesHtml);
      
      const actualCodes = result.courses.map(c => c.code);
      
      // Should expand "ACCT 200 or 201" to both codes
      expect(actualCodes).toContain('ACCT 200');
      expect(actualCodes).toContain('ACCT 201');
    });
    
    test('should not have duplicate codes', () => {
      const result = parseProgram(accountingCoursesHtml);
      
      const codes = result.courses.map(c => c.code);
      const uniqueCodes = new Set(codes);
      
      expect(codes.length).toBe(uniqueCodes.size);
    });
    
    test('should normalize course codes correctly', () => {
      // Test the normalizeCode function directly
      expect(normalizeCode('ACCT-321')).toBe('ACCT 321');
      expect(normalizeCode('ACCT 321')).toBe('ACCT 321');
      expect(normalizeCode('acct-321')).toBe('ACCT 321');
    });
  });
});
