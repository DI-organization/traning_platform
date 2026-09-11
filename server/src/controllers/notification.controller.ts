import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as notificationService from "../services/notification.service";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const unreadOnly = req.query.unread === "true";
  const [notifications, unreadCount] = await Promise.all([
    notificationService.listNotifications(req.user.userId, unreadOnly),
    notificationService.unreadCount(req.user.userId),
  ]);
  sendSuccess(res, { notifications, unreadCount });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markAsRead(req.user.userId, req.params.id);
  sendSuccess(res, { message: "Marked as read" });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markAllAsRead(req.user.userId);
  sendSuccess(res, { message: "All notifications marked as read" });
});
