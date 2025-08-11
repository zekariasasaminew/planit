/**
 * Unit tests for the Augustana catalog index parsing functionality
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseIndex } from '../../scripts/catalog/augustana/parse.js';
import { ROOT } from '../../scripts/catalog/augustana/config.js';

describe('Augustana Catalog Index Parser', () => {
  let areasOfStudyHtml: string;
  
  beforeAll(() => {
    // Load the sample areas of study HTML
    const samplePath = join(__dirname, '../../scripts/catalog/augustana/samples/areas-of-study.html');
    areasOfStudyHtml = readFileSync(samplePath, 'utf-8');
  });
  
  describe('parseIndex', () => {
    test('should return more than 50 items', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      expect(result.length).toBeGreaterThan(50);
    });
    
    test('should find expected programs with non-null symbols', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      // Find specific programs by name
      const accounting = result.find(item => item.name === 'Accounting');
      const biochemistry = result.find(item => item.name === 'Biochemistry');
      const computerScience = result.find(item => item.name === 'Computer Science');
      
      expect(accounting).toBeDefined();
      expect(accounting?.symbol).not.toBeNull();
      
      expect(biochemistry).toBeDefined();
      expect(biochemistry?.symbol).not.toBeNull();
      
      expect(computerScience).toBeDefined();
      expect(computerScience?.symbol).not.toBeNull();
    });
    
    test('should find Accounting with + or ~ symbol', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      const accounting = result.find(item => item.name === 'Accounting');
      expect(accounting).toBeDefined();
      expect(accounting?.symbol).toMatch(/[+~]/);
    });
    
    test('should have all URLs starting with ROOT', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      for (const item of result) {
        expect(item.url).toMatch(/^https:\/\/www\.augustana\.edu/);
      }
    });
    
    test('should extract only leaf links without additional slashes after slug', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      // All URLs should match the pattern /academics/areas-of-study/<slug> without additional slashes
      for (const item of result) {
        const urlParts = new URL(item.url).pathname;
        const match = urlParts.match(/^\/academics\/areas-of-study\/([^\/]+)$/);
        expect(match).toBeTruthy();
        expect(match?.[1]).toBeTruthy(); // Should have a slug
      }
    });
    
    test('should deduplicate by name', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      const names = result.map(item => item.name);
      const uniqueNames = new Set(names);
      
      expect(names.length).toBe(uniqueNames.size);
    });
    
    test('should extract valid symbols', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      for (const item of result) {
        if (item.symbol !== null) {
          expect(item.symbol).toMatch(/^[+~#*]$/);
        }
      }
    });
    
    test('should have trimmed, non-empty names', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      for (const item of result) {
        expect(item.name).toBeTruthy();
        expect(item.name).toBe(item.name.trim());
        expect(item.name.length).toBeGreaterThan(0);
      }
    });
    
    test('should find programs with different symbol types', () => {
      const result = parseIndex(areasOfStudyHtml, ROOT);
      
      const symbolCounts = {
        '+': 0,
        '~': 0,
        '#': 0,
        '*': 0,
        null: 0
      };
      
      for (const item of result) {
        symbolCounts[item.symbol || 'null']++;
      }
      
      // Should have programs with different types of symbols
      expect(symbolCounts['+']).toBeGreaterThan(0);
      expect(symbolCounts['~']).toBeGreaterThan(0);
      // Note: # and * might be less common, so we don't require them
    });
  });
});
