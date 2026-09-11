import { z } from "zod";
import { ResourceType } from "@prisma/client";
import { optionalUrl } from "./common";

export const createResourceSchema = z.object({
  body: z.object({
    weekId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().min(1),
    url: z.string().url(),
    type: z.nativeEnum(ResourceType).default("DOCUMENTATION"),
    isRequired: z.boolean().default(false),
    estimatedMinutes: z.number().int().min(0).optional(),
    topic: z.string().optional(),
    order: z.number().int().default(0),
  }),
});

export const updateResourceSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    url: optionalUrl(),
    type: z.nativeEnum(ResourceType).optional(),
    isRequired: z.boolean().optional(),
    estimatedMinutes: z.number().int().min(0).optional().nullable(),
    topic: z.string().optional().nullable(),
    order: z.number().int().optional(),
  }),
});
