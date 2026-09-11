import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  progressPercent: number;
}

/**
 * Progress is derived strictly from TaskAssignment.status === APPROVED.
 * A task that was merely opened/started never counts toward completion
 * (business rule: do not count tasks as done simply because they were viewed).
 */
async function computeProgress(userId: string, taskWhere: Prisma.TaskWhereInput): Promise<ProgressSummary> {
  const tasks = await prisma.task.findMany({
    where: taskWhere,
    select: {
      id: true,
      dueDate: true,
      assignments: { where: { userId }, select: { status: true } },
    },
  });

  const now = new Date();
  let completedTasks = 0;
  let overdueTasks = 0;

  for (const task of tasks) {
    const status = task.assignments[0]?.status ?? "NOT_STARTED";
    if (status === "APPROVED") {
      completedTasks++;
    } else if (task.dueDate && task.dueDate < now) {
      overdueTasks++;
    }
  }

  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - completedTasks - overdueTasks;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 1000) / 10;

  return { totalTasks, completedTasks, pendingTasks, overdueTasks, progressPercent };
}

export function getOverallProgress(userId: string, programId: string) {
  return computeProgress(userId, { week: { programId } });
}

export function getWeekProgress(userId: string, weekId: string) {
  return computeProgress(userId, { weekId });
}

export async function getAverageScore(userId: string): Promise<number> {
  const result = await prisma.evaluation.aggregate({
    where: { submission: { userId } },
    _avg: { totalScore: true },
  });
  return Math.round((result._avg.totalScore ?? 0) * 10) / 10;
}

export async function getLastActivityAt(userId: string): Promise<Date | null> {
  const last = await prisma.activityLog.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return last?.createdAt ?? null;
}

export function performanceLevel(score: number): "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "IMPROVEMENT_REQUIRED" {
  if (score >= 85) return "EXCELLENT";
  if (score >= 75) return "GOOD";
  if (score >= 65) return "NEEDS_IMPROVEMENT";
  return "IMPROVEMENT_REQUIRED";
}
