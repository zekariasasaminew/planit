/**
 * HTML parsing utilities for extracting program and course data from Augustana catalog pages
 */

import * as cheerio from 'cheerio';
import { REGEX_PATTERNS } from './config.js';
import type { ProgramInfo } from './fetch.js';

export interface ParsedProgram {
  program: {
    name: string;
    kind: 'major' | 'minor';
    department?: string;
    credits?: number;
  };
  courses: ParsedCourse[];
  prereqHints: PrereqHint[];
}

export interface ParsedCourse {
  code: string;
  title: string;
  credits: number;
  attrs: {
    Q?: boolean;
    SI?: boolean;
  };
}

export interface PrereqHint {
  code: string;
  requires: string[];
}

export interface IndexItem {
  name: string;
  url: string;
  symbol: '+' | '~' | '#' | '*' | null;
}

/**
 * Parse the areas of study index page to extract program information using Cheerio
 */
export function parseIndex(html: string, rootUrl: string): IndexItem[] {
  const $ = cheerio.load(html);
  const items: IndexItem[] = [];
  const seenNames = new Set<string>();
  
  // Find all h2 elements with class 'area-list__title'
  $('h2.area-list__title').each((_, element) => {
    const $h2 = $(element);
    const $anchor = $h2.find('a').first();
    
    if ($anchor.length === 0) return;
    
    const href = $anchor.attr('href');
    if (!href) return;
    
    // Only keep links that point to /academics/areas-of-study/<slug>
    const areaStudyMatch = href.match(/^\/academics\/areas-of-study\/([^\/]+)$/);
    if (!areaStudyMatch) return;
    
    const name = $anchor.text().trim();
    if (!name || seenNames.has(name)) return;
    
    seenNames.add(name);
    
    // Look for symbols in the h2 text after the anchor
    const h2Text = $h2.text();
    const symbolMatch = h2Text.match(/[+~#*]/);
    const symbol = symbolMatch ? (symbolMatch[0] as '+' | '~' | '#' | '*') : null;
    
    // Create absolute URL
    const url = new URL(href, rootUrl).toString();
    
    items.push({
      name,
      url,
      symbol,
    });
  });
  
  return items;
}

/**
 * Parse a program page to extract program details, courses, and prerequisites
 * Updated to work with live Augustana College pages using Cheerio
 */
export function parseProgram(html: string): ParsedProgram {
  const $ = cheerio.load(html);
  
  // Extract the main content and collapse whitespace for easier matching
  const mainContent = $('.paragraph--type--text').text().replace(/\s+/g, ' ').trim();
  
  const program = extractProgramInfoLive($, mainContent);
  const courses = extractCoursesLive($, mainContent);
  const prereqHints = extractPrerequisitesLive($, mainContent, courses);
  
  return {
    program,
    courses,
    prereqHints,
  };
}

/**
 * Extract program information from HTML
 */
function extractProgramInfo(html: string): ParsedProgram['program'] {
  const program: ParsedProgram['program'] = {
    name: '',
    kind: 'major', // Default, will be determined by caller
  };
  
  // Extract program name from title or main heading
  const titleMatch = html.match(/<title[^>]*>([^<]+)</i) || 
                    html.match(/<h1[^>]*>([^<]+)</i) ||
                    html.match(/<h2[^>]*>([^<]+)</i);
  
  if (titleMatch) {
    program.name = cleanText(titleMatch[1]);
  }
  
  // Extract department if mentioned
  const deptMatch = html.match(/department[:\s]+([^<\n.]+)/i);
  if (deptMatch) {
    program.department = cleanText(deptMatch[1]);
  }
  
  // Extract required credits
  const creditsMatch = html.match(REGEX_PATTERNS.programCredits);
  if (creditsMatch) {
    program.credits = parseInt(creditsMatch[1], 10);
  }
  
  return program;
}

/**
 * Extract course information from HTML
 */
function extractCourses(html: string): ParsedCourse[] {
  const courses: ParsedCourse[] = [];
  const seenCodes = new Set<string>();
  
  // Use the course block pattern to find courses
  let match;
  const coursePattern = new RegExp(REGEX_PATTERNS.courseBlock.source, 'gi');
  
  while ((match = coursePattern.exec(html)) !== null) {
    const [, subject, number, title, credits] = match;
    const code = normalizeCode(`${subject} ${number}`);
    
    // Skip duplicates
    if (seenCodes.has(code)) {
      continue;
    }
    seenCodes.add(code);
    
    const course: ParsedCourse = {
      code,
      title: cleanText(title),
      credits: parseInt(credits, 10),
      attrs: extractCourseAttributes(html, code),
    };
    
    courses.push(course);
  }
  
  // Also look for course codes without full formatting
  const simpleCodePattern = /([A-Z]{2,4})[-\s]?(\d{3})/g;
  let codeMatch;
  
  while ((codeMatch = simpleCodePattern.exec(html)) !== null) {
    const [, subject, number] = codeMatch;
    const code = normalizeCode(`${subject} ${number}`);
    
    if (!seenCodes.has(code)) {
      // Try to find title and credits nearby
      const context = extractNearbyText(html, codeMatch.index, 200);
      const titleMatch = context.match(new RegExp(`${subject}[-\\s]?${number}\\s+([^(\\n]+)`, 'i'));
      const creditsMatch = context.match(REGEX_PATTERNS.credits);
      
      if (titleMatch && creditsMatch) {
        seenCodes.add(code);
        courses.push({
          code,
          title: cleanText(titleMatch[1]),
          credits: parseInt(creditsMatch[1], 10),
          attrs: extractCourseAttributes(html, code),
        });
      }
    }
  }
  
  return courses;
}

/**
 * Extract course attributes like Q (quantitative) or SI (speaking intensive)
 */
function extractCourseAttributes(html: string, courseCode: string): ParsedCourse['attrs'] {
  const attrs: ParsedCourse['attrs'] = {};
  
  // Create a regex pattern for the course code that handles different formats
  const escapedCode = courseCode.replace(/[\s-]/g, '[-\\s]?').replace(/[()]/g, '\\$&');
  
  // Look for the course code followed by attributes in parentheses or nearby text
  const patterns = [
    // Pattern 1: "ACCT-321 ... (4 Credits, Q)"
    new RegExp(`${escapedCode}[^(]*\\([^)]*\\b(Q|SI)\\b[^)]*\\)`, 'gi'),
    // Pattern 2: "ACCT-321 ... Q" or "ACCT-321 ... SI"
    new RegExp(`${escapedCode}[^\\n<]*\\b(Q|SI)\\b`, 'gi'),
    // Pattern 3: Look in the line containing the course
    new RegExp(`[^\\n]*${escapedCode}[^\\n]*`, 'gi')
  ];
  
  for (const pattern of patterns) {
    const matches = html.match(pattern);
    if (matches) {
      for (const match of matches) {
        if (/\bQ\b/.test(match)) {
          attrs.Q = true;
        }
        if (/\bSI\b/.test(match)) {
          attrs.SI = true;
        }
      }
    }
  }
  
  return attrs;
}

/**
 * Extract prerequisite information from HTML
 */
function extractPrerequisites(html: string, courses: ParsedCourse[]): PrereqHint[] {
  const prereqHints: PrereqHint[] = [];
  
  // Look for prerequisite statements
  const prereqPattern = new RegExp(REGEX_PATTERNS.prerequisites.source, 'gi');
  let match;
  
  while ((match = prereqPattern.exec(html)) !== null) {
    const prereqText = match[1];
    
    // Find the course this prerequisite applies to
    const contextBefore = html.substring(Math.max(0, match.index - 500), match.index);
    const courseMatch = contextBefore.match(/([A-Z]{2,4})[-\s]?(\d{3})/g);
    
    if (courseMatch && courseMatch.length > 0) {
      const lastCourse = courseMatch[courseMatch.length - 1];
      const courseCode = normalizeCode(lastCourse);
      
      // Parse the prerequisite requirements
      const requires = parsePrereqText(prereqText);
      
      if (requires.length > 0) {
        prereqHints.push({
          code: courseCode,
          requires,
        });
      }
    }
  }
  
  return prereqHints;
}

/**
 * Parse prerequisite text to extract required course codes
 */
function parsePrereqText(text: string): string[] {
  const requires: string[] = [];
  const seenCodes = new Set<string>();
  
  // Split on 'or' and 'and' to handle different prerequisite structures
  const parts = text.split(/\s+(or|and)\s+/i);
  
  for (const part of parts) {
    // Skip the connector words themselves
    if (/^(or|and)$/i.test(part.trim())) {
      continue;
    }
    
    // Extract course codes from this part
    const codeMatches = part.match(/([A-Z]{2,4})[-\s]?(\d{3})/g);
    if (codeMatches) {
      for (const codeMatch of codeMatches) {
        const normalized = normalizeCode(codeMatch);
        if (!seenCodes.has(normalized)) {
          seenCodes.add(normalized);
          requires.push(normalized);
        }
      }
    }
    
    // Handle abbreviated forms like "ACCT 200 or 201"
    const abbrevMatch = part.match(/([A-Z]{2,4})[-\s]?(\d{3})[^A-Z]*?(\d{3})/);
    if (abbrevMatch) {
      const [, subject, firstNum, secondNum] = abbrevMatch;
      const firstCode = normalizeCode(`${subject} ${firstNum}`);
      const secondCode = normalizeCode(`${subject} ${secondNum}`);
      
      if (!seenCodes.has(firstCode)) {
        seenCodes.add(firstCode);
        requires.push(firstCode);
      }
      if (!seenCodes.has(secondCode)) {
        seenCodes.add(secondCode);
        requires.push(secondCode);
      }
    }
  }
  
  return requires;
}

/**
 * Normalize course codes to a consistent format (e.g., "ACCT 321")
 */
export function normalizeCode(code: string): string {
  // First trim and normalize whitespace
  const trimmed = code.trim().replace(/\s+/g, ' ');
  const match = trimmed.match(/([A-Z]{2,4})[-\s]?(\d{3})/i);
  if (!match) {
    return trimmed.toUpperCase();
  }
  
  const [, subject, number] = match;
  return `${subject.toUpperCase()} ${number}`;
}

/**
 * Extract symbol from text containing program symbols
 */
function extractSymbolFromText(text: string): string {
  const symbolMatch = text.match(/([+~#*])/);
  return symbolMatch ? symbolMatch[1] : '';
}

/**
 * Clean program name by removing symbols and normalizing whitespace
 */
function cleanProgramName(text: string, symbol: string): string {
  return text
    .replace(new RegExp(`\\${symbol}`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean text by removing HTML entities and normalizing whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/&[a-z]+;/gi, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Extract text near a specific position in the HTML
 */
function extractNearbyText(html: string, position: number, radius: number): string {
  const start = Math.max(0, position - radius);
  const end = Math.min(html.length, position + radius);
  return html.substring(start, end);
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(href: string): string {
  if (href.startsWith('http')) {
    return href;
  }
  
  const baseUrl = 'https://www.augustana.edu';
  
  if (href.startsWith('/')) {
    return baseUrl + href;
  }
  
  return `${baseUrl}/academics/${href}`;
}

/**
 * Extract program information from live Augustana pages using Cheerio
 */
function extractProgramInfoLive($: any, mainContent: string): ParsedProgram['program'] {
  const program: ParsedProgram['program'] = {
    name: '',
    kind: 'major', // Will be determined by caller
  };
  
  // Extract program name from the h3 heading
  const h3Text = $('h3').first().text().trim();
  if (h3Text) {
    program.name = h3Text;
  }
  
  // Look for the "MAJOR IN [PROGRAM]." sentence and extract credits
  const majorMatch = mainContent.match(/MAJOR IN [^.]*\.\s*(\d+)\s+credits/i);
  if (majorMatch) {
    program.credits = parseInt(majorMatch[1], 10);
  }
  
  return program;
}

/**
 * Extract courses from live Augustana pages, focusing on major requirements
 */
function extractCoursesLive($: any, mainContent: string): ParsedCourse[] {
  const courses: ParsedCourse[] = [];
  const seenCodes = new Set<string>();
  
  // Find the "MAJOR IN ACCOUNTING." sentence and extract course codes
  const majorMatch = mainContent.match(/MAJOR IN [^.]*\.\s*\d+\s+credits\s+including\s+([^.]+)\./i);
  
  if (majorMatch) {
    const courseText = majorMatch[1];
    
    // Extract all course codes from the requirements text
    const codes = extractCourseCodesFromText(courseText);
    
    for (const code of codes) {
      const normalizedCode = normalizeCode(code);
      if (!seenCodes.has(normalizedCode)) {
        seenCodes.add(normalizedCode);
        
        courses.push({
          code: normalizedCode,
          title: normalizedCode, // Use code as title for now
          credits: 0, // Set to 0 for now as requested
          attrs: {},
        });
      }
    }
  }
  
  return courses;
}

/**
 * Extract course codes from a text string, handling abbreviated forms
 */
function extractCourseCodesFromText(text: string): string[] {
  const codes: string[] = [];
  
  // Handle patterns like "ACCT-200 or 201" by expanding to full codes
  const expandedText = text.replace(/([A-Z]{2,4})[-\s]?(\d{3})\s+or\s+(\d{3})/g, (match, subject, num1, num2) => {
    return `${subject}-${num1}, ${subject}-${num2}`;
  });
  
  // Extract all course codes
  const codePattern = /([A-Z]{2,4})[-\s]?(\d{3})/g;
  let match;
  
  while ((match = codePattern.exec(expandedText)) !== null) {
    const [, subject, number] = match;
    codes.push(`${subject} ${number}`);
  }
  
  return codes;
}

/**
 * Extract prerequisites from live Augustana pages
 */
function extractPrerequisitesLive($: any, mainContent: string, courses: ParsedCourse[]): PrereqHint[] {
  const prereqHints: PrereqHint[] = [];
  
  // Look for prerequisite sentences
  const prereqPattern = /prerequisite[s]?[:\s]+([^.]+)/gi;
  let match;
  
  while ((match = prereqPattern.exec(mainContent)) !== null) {
    const prereqText = match[1];
    const codes = extractCourseCodesFromText(prereqText);
    
    if (codes.length > 0) {
      // For now, we don't have a specific course this applies to from the sentence structure
      // This could be enhanced if prerequisite information is more structured
      for (const code of codes) {
        const normalizedCode = normalizeCode(code);
        // This is a simplified approach - in a full implementation, we'd need to determine
        // which course these prerequisites apply to
      }
    }
  }
  
  return prereqHints;
}
