import { z } from 'zod';
import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const UUID = z.string().uuid();

export const GeneratePlanRequestSchema = registry.register(
  'GeneratePlanRequest',
  z.object({
    majorIds: z.array(UUID).min(1),
    minorIds: z.array(UUID).optional(),
    takenCourseIds: z.array(UUID).default([]),
    transferCredits: z.number().int().nonnegative().optional(),
    semestersRemaining: z.number().int().positive(),
    prefersSummer: z.boolean().default(false),
    maxCreditsPerSemester: z.number().int().positive(),
    allowOverload: z.boolean().default(false),
    targetGraduateEarly: z.boolean().default(false),
    startSeason: z.string().min(2),
    startYear: z.number().int().gte(1900),
  })
);

export const PlanCreateSchema = registry.register(
  'PlanCreate',
  z.object({
    name: z.string().min(1),
    startSeason: z.string().min(2),
    startYear: z.number().int().gte(1900),
    preferences: z
      .object({
        prefersSummer: z.boolean().optional(),
        maxCreditsPerSemester: z.number().int().positive(),
        allowOverload: z.boolean().optional(),
        targetGraduateEarly: z.boolean().optional(),
        transferCredits: z.number().int().nonnegative().optional(),
      })
      .strict(),
  })
);

export const PlanUpdateSchema = registry.register(
  'PlanUpdate',
  z.object({
    name: z.string().min(1).optional(),
    preferences: PlanCreateSchema.shape.preferences.optional(),
    reorder: z
      .array(
        z.object({
          semesterId: UUID,
          position: z.number().int().nonnegative(),
        })
      )
      .optional(),
  })
);

export const SemesterCreateSchema = registry.register(
  'SemesterCreate',
  z.object({
    season: z.string().min(2),
    year: z.number().int(),
    position: z.number().int().nonnegative(),
  })
);

export const SemesterDeleteSchema = registry.register(
  'SemesterDelete',
  z.object({})
);

export const CourseAddSchema = registry.register(
  'CourseAdd',
  z.object({
    courseId: UUID,
  })
);

export const CourseRemoveSchema = registry.register(
  'CourseRemove',
  z.object({})
);

export const ShareCreateSchema = registry.register(
  'ShareCreate',
  z.object({
    planId: UUID,
    expiresAt: z.string().datetime().optional(),
    isPublic: z.boolean().default(true).optional(),
  })
);

export const ProfileUpdateSchema = registry.register(
  'ProfileUpdate',
  z.object({
    full_name: z.string().min(1).optional(),
    avatar_url: z.string().url().optional(),
  })
);

export const SettingsUpdateSchema = registry.register(
  'SettingsUpdate',
  z.object({
    prefs: z.record(z.any()),
  })
);

export type ApiError = {
  code: 'unauthorized' | 'validation_failed' | 'not_found' | 'conflict' | 'rate_limit_exceeded' | 'internal';
  message: string;
  details?: unknown;
};

export function apiError(code: ApiError['code'], message: string, details?: unknown): ApiError {
  return { code, message, details };
}

