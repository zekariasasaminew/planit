import { Major, Minor, Course, Semester, AcademicPlan, PlanPreferences } from '@/types';

export const mockMajors: Major[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    department: 'College of Engineering',
    credits: 120,
  },
  {
    id: 'math',
    name: 'Mathematics',
    department: 'College of Liberal Arts',
    credits: 120,
  },
  {
    id: 'business',
    name: 'Business Administration',
    department: 'College of Business',
    credits: 120,
  },
  {
    id: 'psychology',
    name: 'Psychology',
    department: 'College of Liberal Arts',
    credits: 120,
  },
  {
    id: 'biology',
    name: 'Biology',
    department: 'College of Science',
    credits: 120,
  },
  {
    id: 'english',
    name: 'English Literature',
    department: 'College of Liberal Arts',
    credits: 120,
  },
];

export const mockMinors: Minor[] = [
  {
    id: 'data-science',
    name: 'Data Science',
    department: 'College of Engineering',
    credits: 18,
  },
  {
    id: 'business-minor',
    name: 'Business',
    department: 'College of Business',
    credits: 18,
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    department: 'College of Liberal Arts',
    credits: 18,
  },
  {
    id: 'spanish',
    name: 'Spanish',
    department: 'College of Liberal Arts',
    credits: 18,
  },
  {
    id: 'music',
    name: 'Music',
    department: 'College of Fine Arts',
    credits: 18,
  },
];

export const mockCourses: Course[] = [
  // Computer Science courses
  {
    id: 'cs101',
    code: 'CS 101',
    title: 'Introduction to Programming',
    credits: 3,
    type: 'Major',
  },
  {
    id: 'cs201',
    code: 'CS 201',
    title: 'Data Structures',
    credits: 3,
    type: 'Major',
    prerequisites: ['cs101'],
  },
  {
    id: 'cs301',
    code: 'CS 301',
    title: 'Algorithms',
    credits: 3,
    type: 'Major',
    prerequisites: ['cs201'],
  },
  {
    id: 'cs401',
    code: 'CS 401',
    title: 'Software Engineering',
    credits: 3,
    type: 'Major',
    prerequisites: ['cs301'],
  },
  // Math courses
  {
    id: 'math151',
    code: 'MATH 151',
    title: 'Calculus I',
    credits: 4,
    type: 'Core',
  },
  {
    id: 'math152',
    code: 'MATH 152',
    title: 'Calculus II',
    credits: 4,
    type: 'Core',
    prerequisites: ['math151'],
  },
  // Gen Ed courses
  {
    id: 'eng101',
    code: 'ENG 101',
    title: 'English Composition',
    credits: 3,
    type: 'Gen Ed',
  },
  {
    id: 'hist101',
    code: 'HIST 101',
    title: 'World History',
    credits: 3,
    type: 'Gen Ed',
  },
  {
    id: 'phys101',
    code: 'PHYS 101',
    title: 'General Physics I',
    credits: 4,
    type: 'LP',
  },
  // Electives
  {
    id: 'art101',
    code: 'ART 101',
    title: 'Introduction to Art',
    credits: 3,
    type: 'Elective',
  },
];

export const mockSemesters: Semester[] = [
  {
    id: 'fall2024',
    name: 'Fall 2024',
    year: 2024,
    season: 'Fall',
    courses: [
      mockCourses[0], // CS 101
      mockCourses[4], // MATH 151
      mockCourses[6], // ENG 101
      mockCourses[7], // HIST 101
    ],
    totalCredits: 13,
  },
  {
    id: 'spring2025',
    name: 'Spring 2025',
    year: 2025,
    season: 'Spring',
    courses: [
      mockCourses[1], // CS 201
      mockCourses[5], // MATH 152
      mockCourses[8], // PHYS 101
      mockCourses[9], // ART 101
    ],
    totalCredits: 14,
  },
  {
    id: 'fall2025',
    name: 'Fall 2025',
    year: 2025,
    season: 'Fall',
    courses: [
      mockCourses[2], // CS 301
      mockCourses[3], // CS 401
    ],
    totalCredits: 6,
  },
];

export const defaultPreferences: PlanPreferences = {
  maxCreditsPerSemester: 16,
  electivePriority: 'distributed',
  summerCourses: false,
  winterimCourses: false,
  onlineCoursesAllowed: true,
};

export const mockAcademicPlan: AcademicPlan = {
  id: 'plan1',
  name: 'Computer Science Degree Plan',
  majors: [mockMajors[0]], // Computer Science
  minors: [mockMinors[0]], // Data Science
  startSemester: {
    season: 'Fall',
    year: 2024,
  },
  endSemester: {
    season: 'Spring',
    year: 2028,
  },
  semesters: mockSemesters,
  preferences: defaultPreferences,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export const mockSavedPlans: AcademicPlan[] = [
  mockAcademicPlan,
  {
    ...mockAcademicPlan,
    id: 'plan2',
    name: 'Business Administration Plan',
    majors: [mockMajors[2]], // Business
    minors: [],
  },
]; 