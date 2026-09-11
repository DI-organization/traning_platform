import { z } from "zod";
import { TaskType, TaskPriority, TaskDifficulty, AssignmentStatus } from "@prisma/client";

export const createTaskSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    weekId: z.string().uuid(),
    type: z.nativeEnum(TaskType).default("CODING"),
    priority: z.nativeEnum(TaskPriority).default("MEDIUM"),
    difficulty: z.nativeEnum(TaskDifficulty).default("MEDIUM"),
    points: z.number().int().min(0).default(10),
    estimatedHours: z.number().min(0).default(2),
    dueDate: z.coerce.date().optional(),
    instructions: z.string().min(1),
    acceptanceCriteria: z.array(z.string()).default([]),
    isWeeklyProject: z.boolean().default(false),
    order: z.number().int().default(0),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    type: z.nativeEnum(TaskType).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    difficulty: z.nativeEnum(TaskDifficulty).optional(),
    points: z.number().int().min(0).optional(),
    estimatedHours: z.number().min(0).optional(),
    dueDate: z.coerce.date().optional().nullable(),
    instructions: z.string().min(1).optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    order: z.number().int().optional(),
  }),
});

export const listTasksQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    weekId: z.string().uuid().optional(),
    type: z.nativeEnum(TaskType).optional(),
    status: z.nativeEnum(AssignmentStatus).optional(),
    search: z.string().optional(),
  }),
});

export const reorderTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().uuid()).min(1),
  }),
});

export const updateAssignmentStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AssignmentStatus),
  }),
});
