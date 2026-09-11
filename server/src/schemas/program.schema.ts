import { z } from "zod";
import { WeekUnlockStrategy } from "@prisma/client";

export const createProgramSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    totalWeeks: z.number().int().min(1).max(52).default(12),
    weekUnlockStrategy: z.nativeEnum(WeekUnlockStrategy).default("MANUAL"),
  }),
});

export const updateProgramSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    weekUnlockStrategy: z.nativeEnum(WeekUnlockStrategy).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createWeekSchema = z.object({
  body: z.object({
    weekNumber: z.number().int().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    objectives: z.array(z.string()).default([]),
    weeklyProjectTitle: z.string().optional(),
    weeklyProjectDescription: z.string().optional(),
    submissionRequirements: z.array(z.string()).default([]),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export const updateWeekSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    objectives: z.array(z.string()).optional(),
    weeklyProjectTitle: z.string().optional(),
    weeklyProjectDescription: z.string().optional(),
    submissionRequirements: z.array(z.string()).optional(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    isLocked: z.boolean().optional(),
  }),
});

export const createTopicSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    order: z.number().int().default(0),
  }),
});

export const createResearchQuestionSchema = z.object({
  body: z.object({
    question: z.string().min(1),
    order: z.number().int().default(0),
  }),
});

export const answerResearchQuestionSchema = z.object({
  body: z.object({
    answer: z.string().min(1),
  }),
});

export const scoreResearchAnswerSchema = z.object({
  body: z.object({
    score: z.number().int().min(0).max(100),
    feedback: z.string().optional(),
  }),
});
