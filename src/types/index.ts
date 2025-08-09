export type UUID = string;

export type ProgramKind = 'major' | 'minor';
export type CourseType = 'Major' | 'Core' | 'Gen Ed' | 'LP' | 'Elective' | 'Minor';
export type CourseSource = 'user' | 'generator' | 'transfer' | 'ap';
export type SemesterSeason = 'Fall' | 'Spring' | 'Summer';
export type ElectivePriority = 'distributed' | 'concentrated';
export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export interface Course {
  id: UUID;
  code: string;
  title: string;
  credits: number;
  type: CourseType;
  programId?: UUID | null;
  prerequisites?: string[];
}

export interface Major {
  id: UUID;
  name: string;
  department: string;
  credits: number;
}

export interface Minor {
  id: UUID;
  name: string;
  department: string;
  credits: number;
}

export interface SemesterCourseEntry {
  id: UUID;
  course: Course;
  source: CourseSource;
  isLocked: boolean;
}

export interface Semester {
  id: UUID;
  name: string;
  season: SemesterSeason;
  year: number;
  position?: number;
  totalCredits: number;
  courses: Course[];
}

export interface PlanPreferences {
  maxCreditsPerSemester: number;
  electivePriority: ElectivePriority;
  summerCourses: boolean;
  winterimCourses: boolean;
  onlineCoursesAllowed: boolean;
}

export interface AcademicPlan {
  id: UUID;
  name: string;
  majors: Major[];
  minors: Minor[];
  startSemester: SemesterInfo;
  endSemester: SemesterInfo;
  semesters: Semester[];
  preferences: PlanPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagnosticsMessage {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SemesterInfo {
  season: SemesterSeason;
  year: number;
}

export interface GeneratePlanRequest {
  majors: UUID[];
  minors: UUID[];
  startSemester: SemesterInfo;
  endSemester: SemesterInfo;
  preferences: PlanPreferences;
}

export interface GeneratePlanApiRequest {
  majorIds: UUID[];
  minorIds?: UUID[];
  takenCourseIds: UUID[];
  transferCredits?: number;
  semestersRemaining: number;
  prefersSummer?: boolean;
  maxCreditsPerSemester: number;
  allowOverload?: boolean;
  targetGraduateEarly?: boolean;
  startSeason: string;
  startYear: number;
}

export interface ApiError {
  code: 'unauthorized' | 'validation_failed' | 'not_found' | 'conflict' | 'rate_limit_exceeded' | 'internal';
  message: string;
  details?: unknown;
}