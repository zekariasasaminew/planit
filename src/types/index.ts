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
  type: 'Core' | 'LP' | 'Elective' | 'Gen Ed' | 'Major' | 'Minor';
  prerequisites?: string[];
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  season: 'Fall' | 'Spring' | 'Summer';
  courses: Course[];
  totalCredits: number;
}

export interface AcademicPlan {
  id: string;
  name: string;
  majors: Major[];
  minors: Minor[];
  startSemester: {
    season: 'Fall' | 'Spring' | 'Summer';
    year: number;
  };
  endSemester: {
    season: 'Fall' | 'Spring' | 'Summer';
    year: number;
  };
  semesters: Semester[];
  preferences: PlanPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanPreferences {
  maxCreditsPerSemester: number;
  electivePriority: 'early' | 'late' | 'distributed';
  summerCourses: boolean;
  winterimCourses: boolean;
  onlineCoursesAllowed: boolean;
}

export interface GeneratePlanRequest {
  majors: string[];
  minors: string[];
  startSemester: {
    season: 'Fall' | 'Spring' | 'Summer';
    year: number;
  };
  endSemester: {
    season: 'Fall' | 'Spring' | 'Summer';
    year: number;
  };
  preferences: PlanPreferences;
} 