import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as analyticsService from "../services/analytics.service";
import * as activityLogService from "../services/activityLog.service";
import * as programService from "../services/program.service";

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [kpis, traineeProgress, pendingReviews, recentActivity] = await Promise.all([
    analyticsService.getDashboardKpis(),
    analyticsService.getTraineeProgressTable(),
    analyticsService.getPendingReviews(8),
    activityLogService.getRecentActivity(15),
  ]);
  sendSuccess(res, { kpis, traineeProgress, pendingReviews, recentActivity });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const program = await programService.getActiveProgram();
  if (!program) throw ApiError.notFound("No active training program");

  const [kpis, weeklyCompletion, scoreDistribution, taskStatusDistribution, taskDifficultyPerformance, traineeProgress] =
    await Promise.all([
      analyticsService.getDashboardKpis(),
      analyticsService.getWeeklyCompletionChart(program.id),
      analyticsService.getScoreDistribution(),
      analyticsService.getTaskStatusDistribution(),
      analyticsService.getTaskDifficultyPerformance(),
      analyticsService.getTraineeProgressTable(),
    ]);

  sendSuccess(res, {
    kpis,
    weeklyCompletion,
    scoreDistribution,
    taskStatusDistribution,
    taskDifficultyPerformance,
    traineeComparison: traineeProgress,
  });
});
