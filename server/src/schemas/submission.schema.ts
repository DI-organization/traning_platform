import { z } from "zod";
import { ReviewDecision } from "@prisma/client";
import { optionalUrl } from "./common";

export const createSubmissionSchema = z.object({
  body: z
    .object({
      taskId: z.string().uuid(),
      repositoryUrl: optionalUrl(),
      branchName: z.string().optional(),
      pullRequestUrl: optionalUrl(),
      liveDemoUrl: optionalUrl(),
      notes: z.string().optional(),
    })
    .refine((data) => Boolean(data.repositoryUrl || data.pullRequestUrl), {
      message: "Provide at least a repository URL or a pull request URL",
      path: ["repositoryUrl"],
    }),
});

export const updateSubmissionSchema = z.object({
  body: z.object({
    repositoryUrl: optionalUrl(),
    branchName: z.string().optional(),
    pullRequestUrl: optionalUrl(),
    liveDemoUrl: optionalUrl(),
    notes: z.string().optional(),
  }),
});

export const listSubmissionsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    userId: z.string().uuid().optional(),
    weekId: z.string().uuid().optional(),
    taskId: z.string().uuid().optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    decision: z.nativeEnum(ReviewDecision),
    feedback: z.string().min(1, "Feedback is required"),
    scores: z
      .object({
        taskCompletion: z.number().int().min(0).max(100).optional(),
        functionality: z.number().int().min(0).max(100).optional(),
        codeQuality: z.number().int().min(0).max(100).optional(),
        architecture: z.number().int().min(0).max(100).optional(),
        gitUsage: z.number().int().min(0).max(100).optional(),
        problemSolving: z.number().int().min(0).max(100).optional(),
        documentation: z.number().int().min(0).max(100).optional(),
        testing: z.number().int().min(0).max(100).optional(),
        technicalUnderstanding: z.number().int().min(0).max(100).optional(),
      })
      .optional(),
  }),
});
