import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as submissionService from "../services/submission.service";

export const createSubmission = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const submission = await submissionService.createSubmission(req.user.userId, req.body);
  sendSuccess(res, submission, 201);
});

export const updateSubmission = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const submission = await submissionService.updateSubmission(req.params.id, req.user.userId, req.body);
  sendSuccess(res, submission);
});

export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

  // Trainees can only ever list their own submissions
  const userId = req.user.role === "TRAINEE" ? req.user.userId : (req.query.userId as string | undefined);

  const result = await submissionService.listSubmissions({
    page,
    limit,
    userId,
    weekId: req.query.weekId as string | undefined,
    taskId: req.query.taskId as string | undefined,
    status: req.query.status as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  });
  sendSuccess(res, result.data, 200, result.pagination);
});

export const getSubmission = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const submission = await submissionService.getSubmissionDetail(req.params.id);

  if (req.user.role === "TRAINEE" && submission.userId !== req.user.userId) {
    throw ApiError.forbidden("You can only view your own submissions");
  }

  sendSuccess(res, submission);
});
