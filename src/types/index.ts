export interface Major {
  id: string;
  name: string;
  department: string;
  credits: number;
}

export interface Minor {
  id: string;
  name: string;
  department: string;
  credits: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  type: CourseType;
  prerequisites?: string[];
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  season: SemesterSeason;
  courses: Course[];
  totalCredits: number;
}

export interface AcademicPlan {
  id: string;
  name: string;
  majors: Major[];
  minors: Minor[];
  startSemester: {
    season: SemesterSeason;
    year: number;
  };
  endSemester: {
    season: SemesterSeason;
    year: number;
  };
  semesters: Semester[];
  preferences: PlanPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanPreferences {
  maxCreditsPerSemester: number;
  electivePriority: ElectivePriority;
  summerCourses: boolean;
  winterimCourses: boolean;
  onlineCoursesAllowed: boolean;
}

export interface GeneratePlanRequest {
  majors: string[];
  minors: string[];
  startSemester: {
    season: SemesterSeason;
    year: number;
  };
  endSemester: {
    season: SemesterSeason;
    year: number;
  };
  preferences: PlanPreferences;
}

// UI Component Types
export type ChipColor = 
  | "primary"
  | "secondary" 
  | "success"
  | "warning"
  | "info"
  | "error"
  | "default";

export type SemesterSeason = 'Fall' | 'Spring' | 'Summer';

export type CourseType = 'Core' | 'LP' | 'Elective' | 'Gen Ed' | 'Major' | 'Minor';

export type ElectivePriority = 'early' | 'late' | 'distributed'; 