import { z } from "zod";
import { Role } from "@prisma/client";

export const createTraineeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
    githubUsername: z.string().optional(),
    programId: z.string().uuid().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    githubUsername: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});
