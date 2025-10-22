import {
  pgEnum,
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const programKind = pgEnum("program_kind", ["major", "minor"]);
export const courseType = pgEnum("course_type", [
  "Major",
  "Core",
  "GenEd",
  "LP",
  "Elective",
  "Minor",
]);
export const courseSource = pgEnum("course_source", [
  "user",
  "generator",
  "transfer",
  "ap",
]);
export const prerequisiteType = pgEnum("prerequisite_type", [
  "course",
  "corequisite",
  "recommended",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: programKind("kind").notNull(),
  name: text("name").notNull(),
  department: text("department"),
  credits: integer("credits").notNull(),
  programType: varchar("program_type", { length: 20 }).default("major"),
  isMajor: boolean("is_major").default(true),
  isMinor: boolean("is_minor").default(false),
  faculty: jsonb("faculty").$type<string[]>().default([]),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  credits: integer("credits").notNull(),
  type: courseType("type").notNull(),
  programId: uuid("program_id").references(() => programs.id),
  learningPerspectiveCode: varchar("learning_perspective_code", { length: 2 }),
  courseType: varchar("course_type_enhanced", { length: 50 }).default("core"),
});

export const coursePrerequisites = pgTable(
  "course_prerequisites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .references(() => courses.id)
      .notNull(),
    prerequisiteCourseId: uuid("prerequisite_course_id")
      .references(() => courses.id)
      .notNull(),
    isRequired: boolean("is_required").default(true),
    prerequisiteType: varchar("prerequisite_type", { length: 20 }).default(
      "course"
    ),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t: any) => ({
    pk: primaryKey({ columns: [t.id] }),
    unique: unique().on(t.courseId, t.prerequisiteCourseId, t.prerequisiteType),
  })
);

export const courseAlternativeGroups = pgTable("course_alternative_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const courseAlternatives = pgTable(
  "course_alternatives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => courseAlternativeGroups.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t: any) => ({ unique: unique().on(t.groupId, t.courseId) })
);

export const coursePrereqAlternatives = pgTable(
  "course_prereq_alternatives",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    prereqGroupId: uuid("prereq_group_id")
      .notNull()
      .references(() => courseAlternativeGroups.id, { onDelete: "cascade" }),
  },
  (t: any) => ({ pk: primaryKey({ columns: [t.courseId, t.prereqGroupId] }) })
);

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  startSeason: text("start_season").notNull(),
  startYear: integer("start_year").notNull(),
  endSeason: text("end_season"),
  endYear: integer("end_year"),
  preferences: jsonb("preferences")
    .notNull()
    .$type<Record<string, unknown>>()
    .default({}),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const planSemesters = pgTable("plan_semesters", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  season: text("season").notNull(),
  year: integer("year").notNull(),
  position: integer("position").notNull(),
  totalCredits: integer("total_credits").notNull().default(0),
});

export const planCourses = pgTable(
  "plan_courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planSemesterId: uuid("plan_semester_id")
      .notNull()
      .references(() => planSemesters.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    source: courseSource("source").notNull().default("generator"),
    isLocked: boolean("is_locked").notNull().default(false),
  },
  (t: any) => ({ uniq: unique().on(t.planSemesterId, t.courseId) })
);

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const requestLog = pgTable("request_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").notNull(),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  prefs: jsonb("prefs").notNull().$type<Record<string, unknown>>().default({}),
});

export const plansRelations = relations(plans, ({ many, one }: any) => ({
  semesters: many(planSemesters),
  user: one(users, { fields: [plans.userId], references: [users.id] }),
}));

export const planSemestersRelations = relations(
  planSemesters,
  ({ many, one }: any) => ({
    plan: one(plans, {
      fields: [planSemesters.planId],
      references: [plans.id],
    }),
    courses: many(planCourses),
  })
);

export const planCoursesRelations = relations(planCourses, ({ one }: any) => ({
  semester: one(planSemesters, {
    fields: [planCourses.planSemesterId],
    references: [planSemesters.id],
  }),
  course: one(courses, {
    fields: [planCourses.courseId],
    references: [courses.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many, one }) => ({
  program: one(programs, {
    fields: [courses.programId],
    references: [programs.id],
  }),
  prerequisites: many(coursePrerequisites, {
    relationName: "coursePrerequisites",
  }),
  dependentCourses: many(coursePrerequisites, {
    relationName: "prerequisiteCourses",
  }),
  learningPerspectives: many(courseLearningPerspectives),
  planCourses: many(planCourses),
  alternatives: many(courseAlternatives),
  studentFulfillments: many(studentLpFulfillment),
}));

// Enhanced Learning Perspectives lookup table
export const learningPerspectives = pgTable("learning_perspectives", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 2 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Junction table for course-learning perspective relationships
export const courseLearningPerspectives = pgTable(
  "course_learning_perspectives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    learningPerspectiveCode: varchar("learning_perspective_code", { length: 2 })
      .notNull()
      .references(() => learningPerspectives.code),
    isPrimary: boolean("is_primary").default(true),
    fulfillmentStrength: varchar("fulfillment_strength", {
      length: 20,
    }).default("full"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t: any) => ({
    unique: unique().on(t.courseId, t.learningPerspectiveCode),
  })
);

// Student LP fulfillment tracking
export const studentLpFulfillment = pgTable(
  "student_lp_fulfillment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    learningPerspectiveCode: varchar("learning_perspective_code", { length: 2 })
      .notNull()
      .references(() => learningPerspectives.code),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    fulfilledDate: timestamp("fulfilled_date", {
      withTimezone: true,
    }).defaultNow(),
    semester: varchar("semester", { length: 20 }),
    academicYear: varchar("academic_year", { length: 9 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t: any) => ({
    unique: unique().on(t.userId, t.learningPerspectiveCode, t.courseId),
  })
);

// Relations for new tables
export const learningPerspectivesRelations = relations(
  learningPerspectives,
  ({ many }) => ({
    courseLearningPerspectives: many(courseLearningPerspectives),
    studentFulfillments: many(studentLpFulfillment),
  })
);

export const courseLearningPerspectivesRelations = relations(
  courseLearningPerspectives,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseLearningPerspectives.courseId],
      references: [courses.id],
    }),
    learningPerspective: one(learningPerspectives, {
      fields: [courseLearningPerspectives.learningPerspectiveCode],
      references: [learningPerspectives.code],
    }),
  })
);

export const coursePrerequisitesRelations = relations(
  coursePrerequisites,
  ({ one }) => ({
    course: one(courses, {
      fields: [coursePrerequisites.courseId],
      references: [courses.id],
    }),
    prerequisiteCourse: one(courses, {
      fields: [coursePrerequisites.prerequisiteCourseId],
      references: [courses.id],
    }),
  })
);

export const studentLpFulfillmentRelations = relations(
  studentLpFulfillment,
  ({ one }) => ({
    user: one(users, {
      fields: [studentLpFulfillment.userId],
      references: [users.id],
    }),
    learningPerspective: one(learningPerspectives, {
      fields: [studentLpFulfillment.learningPerspectiveCode],
      references: [learningPerspectives.code],
    }),
    course: one(courses, {
      fields: [studentLpFulfillment.courseId],
      references: [courses.id],
    }),
  })
);
