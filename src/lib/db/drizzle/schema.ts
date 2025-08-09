import { pgEnum, pgTable, text, uuid, integer, timestamp, boolean, jsonb, primaryKey, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const programKind = pgEnum('program_kind', ['major', 'minor']);
export const courseType = pgEnum('course_type', ['Major', 'Core', 'GenEd', 'LP', 'Elective', 'Minor']);
export const courseSource = pgEnum('course_source', ['user', 'generator', 'transfer', 'ap']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: programKind('kind').notNull(),
  name: text('name').notNull(),
  department: text('department'),
  credits: integer('credits').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  credits: integer('credits').notNull(),
  type: courseType('type').notNull(),
  programId: uuid('program_id').references(() => programs.id),
});

export const coursePrereqs = pgTable('course_prereqs', {
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  prereqCourseId: uuid('prereq_course_id').references(() => courses.id).notNull(),
}, (t: any) => ({ pk: primaryKey({ columns: [t.courseId, t.prereqCourseId] }) }));

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  startSeason: text('start_season').notNull(),
  startYear: integer('start_year').notNull(),
  endSeason: text('end_season'),
  endYear: integer('end_year'),
  preferences: jsonb('preferences').notNull().$type<Record<string, unknown>>().default({}),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const planSemesters = pgTable('plan_semesters', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  season: text('season').notNull(),
  year: integer('year').notNull(),
  position: integer('position').notNull(),
  totalCredits: integer('total_credits').notNull().default(0),
});

export const planCourses = pgTable('plan_courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  planSemesterId: uuid('plan_semester_id').notNull().references(() => planSemesters.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  source: courseSource('source').notNull().default('generator'),
  isLocked: boolean('is_locked').notNull().default(false),
}, (t: any) => ({ uniq: unique().on(t.planSemesterId, t.courseId) }));

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const requestLog = pgTable('request_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull(),
  kind: text('kind').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  prefs: jsonb('prefs').notNull().$type<Record<string, unknown>>().default({}),
});

export const plansRelations = relations(plans, ({ many, one }: any) => ({
  semesters: many(planSemesters),
  user: one(users, { fields: [plans.userId], references: [users.id] }),
}));

export const planSemestersRelations = relations(planSemesters, ({ many, one }: any) => ({
  plan: one(plans, { fields: [planSemesters.planId], references: [plans.id] }),
  courses: many(planCourses),
}));

export const planCoursesRelations = relations(planCourses, ({ one }: any) => ({
  semester: one(planSemesters, { fields: [planCourses.planSemesterId], references: [planSemesters.id] }),
  course: one(courses, { fields: [planCourses.courseId], references: [courses.id] }),
}));

