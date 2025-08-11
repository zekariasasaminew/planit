/**
 * Fetch utilities for crawling Augustana College catalog pages
 */

import { RATE_LIMIT_MS } from './config.js';

export interface ProgramInfo {
  name: string;
  symbol: string;
  url: string;
}

/**
 * Fetch the main areas of study index page and extract program links
 */
export async function fetchIndex(indexUrl: string): Promise<ProgramInfo[]> {
  const response = await fetch(indexUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch index: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  // For now, return empty array since we're updating the parsing logic
  // This will be updated to use the new parseIndex function
  return [];
}

/**
 * Fetch a single program page and return raw HTML
 */
export async function fetchProgram(url: string): Promise<string> {
  // Rate limiting between requests
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch program ${url}: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}

/**
 * Convert a program base URL to the courses URL by appending "/courses"
 */
export function getProgramCoursesUrl(programUrl: string): string {
  return `${programUrl}/courses`;
}

/**
 * Parse the index page HTML to extract program links
 * This function looks for common patterns in Augustana's areas of study page
 */
function parseIndexLinks(html: string): ProgramInfo[] {
  const programs: ProgramInfo[] = [];
  
  // Look for links that contain program information
  // This regex looks for anchor tags with href attributes and extracts the text content
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)</gi;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const [, href, text] = match;
    const cleanText = text.trim();
    
    // Skip navigation links, headers, and other non-program content
    if (isLikelyProgramLink(href, cleanText)) {
      const symbol = extractSymbol(cleanText);
      const name = cleanProgramName(cleanText, symbol);
      
      if (name && symbol) {
        programs.push({
          name,
          symbol,
          url: resolveUrl(href),
        });
      }
    }
  }
  
  return programs;
}

/**
 * Determine if a link is likely to be a program page
 */
function isLikelyProgramLink(href: string, text: string): boolean {
  // Skip obvious navigation links
  if (href.includes('#') || href.includes('mailto:') || href.includes('tel:')) {
    return false;
  }
  
  // Look for program-like URLs
  const programUrlPatterns = [
    /academics.*major/i,
    /academics.*minor/i,
    /areas.*study/i,
    /programs?/i,
  ];
  
  // Check if text contains program symbols
  const hasSymbol = /[+~#*]/.test(text);
  
  // Check if URL looks like a program page
  const isLikelyUrl = programUrlPatterns.some(pattern => pattern.test(href));
  
  return hasSymbol || (isLikelyUrl && text.length > 3 && text.length < 100);
}

/**
 * Extract symbol from program text (like + or ~ or # or *)
 */
function extractSymbol(text: string): string {
  const symbolMatch = text.match(/([+~#*])/);
  return symbolMatch ? symbolMatch[1] : '';
}

/**
 * Clean program name by removing symbols and extra whitespace
 */
function cleanProgramName(text: string, symbol: string): string {
  // Escape special regex characters in the symbol
  const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text
    .replace(new RegExp(escapedSymbol, 'g'), '') // Remove symbol
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
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
  
  // For relative URLs, assume they're relative to the academics section
  return `${baseUrl}/academics/${href}`;
}
