import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { getAverageScore, getLastActivityAt, getOverallProgress } from "./progress.service";

export async function getDashboardKpis() {
  const [totalTrainees, activeTrainees, tasksCompleted, tasksPending, overdueTasks, pendingReviews, avgScore] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.TRAINEE } }),
      prisma.user.count({ where: { role: Role.TRAINEE, isActive: true } }),
      prisma.taskAssignment.count({ where: { status: "APPROVED" } }),
      prisma.taskAssignment.count({ where: { status: { in: ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "CHANGES_REQUESTED"] } } }),
      prisma.taskAssignment.count({ where: { status: "OVERDUE" } }),
      prisma.submission.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.evaluation.aggregate({ _avg: { totalScore: true } }),
    ]);

  const totalAssignments = tasksCompleted + tasksPending + overdueTasks;
  const overallCompletionPercent = totalAssignments === 0 ? 0 : Math.round((tasksCompleted / totalAssignments) * 1000) / 10;

  return {
    totalTrainees,
    activeTrainees,
    overallCompletionPercent,
    tasksCompleted,
    tasksPending,
    overdueTasks,
    pendingReviews,
    averageScore: Math.round((avgScore._avg.totalScore ?? 0) * 10) / 10,
  };
}

export async function getTraineeProgressTable() {
  const trainees = await prisma.user.findMany({
    where: { role: Role.TRAINEE },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      isActive: true,
      enrollments: { take: 1, orderBy: { enrolledAt: "desc" }, select: { currentWeek: true, programId: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    trainees.map(async (trainee) => {
      const enrollment = trainee.enrollments[0];
      const progress = enrollment
        ? await getOverallProgress(trainee.id, enrollment.programId)
        : { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, progressPercent: 0 };
      const averageScore = await getAverageScore(trainee.id);
      const lastActivityAt = await getLastActivityAt(trainee.id);

      return {
        id: trainee.id,
        firstName: trainee.firstName,
        lastName: trainee.lastName,
        avatar: trainee.avatar,
        isActive: trainee.isActive,
        currentWeek: enrollment?.currentWeek ?? null,
        enrollmentStatus: enrollment?.status ?? null,
        completedTasks: progress.completedTasks,
        totalTasks: progress.totalTasks,
        progressPercent: progress.progressPercent,
        averageScore,
        lastActivityAt,
      };
    })
  );
}

export async function getPendingReviews(limit = 10) {
  return prisma.submission.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    orderBy: { submittedAt: "asc" },
    take: limit,
    include: {
      task: { select: { id: true, code: true, title: true, weekId: true } },
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
}

export async function getWeeklyCompletionChart(programId: string) {
  const weeks = await prisma.week.findMany({
    where: { programId },
    orderBy: { weekNumber: "asc" },
    select: {
      id: true,
      weekNumber: true,
      title: true,
      tasks: { select: { id: true, assignments: { select: { status: true } } } },
    },
  });

  return weeks.map((week) => {
    const allAssignments = week.tasks.flatMap((t) => t.assignments);
    const completed = allAssignments.filter((a) => a.status === "APPROVED").length;
    const total = allAssignments.length;
    return {
      weekNumber: week.weekNumber,
      title: week.title,
      completionPercent: total === 0 ? 0 : Math.round((completed / total) * 1000) / 10,
    };
  });
}

export async function getScoreDistribution() {
  const evaluations = await prisma.evaluation.findMany({ select: { totalScore: true } });
  const buckets = { excellent: 0, good: 0, needsImprovement: 0, improvementRequired: 0 };
  for (const evalItem of evaluations) {
    if (evalItem.totalScore >= 85) buckets.excellent++;
    else if (evalItem.totalScore >= 75) buckets.good++;
    else if (evalItem.totalScore >= 65) buckets.needsImprovement++;
    else buckets.improvementRequired++;
  }
  return buckets;
}

export async function getTaskStatusDistribution() {
  const statuses = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "CHANGES_REQUESTED", "APPROVED", "OVERDUE"] as const;
  const counts = await Promise.all(statuses.map((status) => prisma.taskAssignment.count({ where: { status } })));
  return statuses.map((status, i) => ({ status, count: counts[i] }));
}

export async function getTaskDifficultyPerformance() {
  const evaluations = await prisma.evaluation.findMany({
    select: { totalScore: true, submission: { select: { task: { select: { difficulty: true } } } } },
  });
  const groups: Record<string, number[]> = { EASY: [], MEDIUM: [], HARD: [] };
  for (const e of evaluations) {
    groups[e.submission.task.difficulty].push(e.totalScore);
  }
  return Object.entries(groups).map(([difficulty, scores]) => ({
    difficulty,
    averageScore: scores.length === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    count: scores.length,
  }));
}
