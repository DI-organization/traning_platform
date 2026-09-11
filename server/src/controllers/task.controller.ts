import { Request, Response } from "express";
import { AssignmentStatus } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as taskService from "../services/task.service";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const task = await taskService.createTask({ ...req.body, createdById: req.user.userId });
  sendSuccess(res, task, 201);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await taskService.updateTask(req.params.id, req.body));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id);
  sendSuccess(res, { message: "Task deleted" });
});

export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await taskService.reorderTasks(req.params.weekId, req.body.taskIds));
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

  // Trainees only ever see their own assignment status; trainers can inspect any trainee via ?userId=
  const userId = req.user.role === "TRAINEE" ? req.user.userId : (req.query.userId as string | undefined);

  const result = await taskService.listTasks({
    page,
    limit,
    weekId: req.query.weekId as string | undefined,
    type: req.query.type as string | undefined,
    status: req.query.status as AssignmentStatus | undefined,
    search: req.query.search as string | undefined,
    userId,
  });
  sendSuccess(res, result.data, 200, result.pagination);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.role === "TRAINEE" ? req.user.userId : (req.query.userId as string | undefined);
  sendSuccess(res, await taskService.getTaskDetail(req.params.id, userId));
});

export const startTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  sendSuccess(res, await taskService.startTask(req.params.id, req.user.userId));
});

export const updateAssignmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  sendSuccess(res, await taskService.updateAssignmentStatus(req.params.id, userId, req.body.status));
});
