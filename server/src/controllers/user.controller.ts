import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as userService from "../services/user.service";

export const createTrainee = asyncHandler(async (req: Request, res: Response) => {
  const trainee = await userService.createTrainee(req.body);
  sendSuccess(res, trainee, 201);
});

export const listTrainees = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const status = req.query.status as "active" | "inactive" | undefined;

  const result = await userService.listTrainees({ page, limit, search, status });
  sendSuccess(res, result.data, 200, result.pagination);
});

export const getTraineeDetail = asyncHandler(async (req: Request, res: Response) => {
  const trainee = await userService.getTraineeDetail(req.params.id);
  sendSuccess(res, trainee);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.id ?? req.user?.userId;
  if (!targetId) throw ApiError.badRequest("Missing user id");

  if (req.user?.role === "TRAINEE" && targetId !== req.user.userId) {
    throw ApiError.forbidden("You can only edit your own profile");
  }

  const updated = await userService.updateUser(targetId, req.body);
  sendSuccess(res, updated);
});

export const setTraineeStatus = asyncHandler(async (req: Request, res: Response) => {
  const updated = await userService.setUserActiveStatus(req.params.id, req.body.isActive);
  sendSuccess(res, updated);
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const trainee = await userService.getTraineeDetail(req.user.userId);
  sendSuccess(res, trainee);
});
