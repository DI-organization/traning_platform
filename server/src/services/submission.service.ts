import { Prisma, Role, SubmissionStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPagination } from "../utils/apiResponse";
import { logActivity } from "./activityLog.service";
import { createNotification } from "./notification.service";
import { fetchAndStoreGitHubMetadata } from "./github.service";

const PENDING_STATUSES: SubmissionStatus[] = ["SUBMITTED", "UNDER_REVIEW"];

interface SubmissionInput {
  taskId: string;
  repositoryUrl?: string;
  branchName?: string;
  pullRequestUrl?: string;
  liveDemoUrl?: string;
  notes?: string;
}

export async function createSubmission(userId: string, input: SubmissionInput) {
  const task = await prisma.task.findUnique({ where: { id: input.taskId }, include: { week: true } });
  if (!task) throw ApiError.notFound("Task not found");
  if (task.week.isLocked) throw ApiError.forbidden("This week is not unlocked yet", "WEEK_LOCKED");

  const latest = await prisma.submission.findFirst({
    where: { taskId: input.taskId, userId },
    orderBy: { attemptNumber: "desc" },
  });

  if (latest && PENDING_STATUSES.includes(latest.status)) {
    throw ApiError.conflict(
      "You already have a submission awaiting review for this task. Update it instead of creating a new one.",
      "SUBMISSION_PENDING"
    );
  }

  const submission = await prisma.submission.create({
    data: {
      taskId: input.taskId,
      userId,
      attemptNumber: (latest?.attemptNumber ?? 0) + 1,
      repositoryUrl: input.repositoryUrl,
      branchName: input.branchName,
      pullRequestUrl: input.pullRequestUrl,
      liveDemoUrl: input.liveDemoUrl,
      notes: input.notes,
      status: "SUBMITTED",
    },
  });

  await prisma.taskAssignment.upsert({
    where: { taskId_userId: { taskId: input.taskId, userId } },
    update: { status: "SUBMITTED" },
    create: { taskId: input.taskId, userId, status: "SUBMITTED", startedAt: new Date() },
  });

  await logActivity(userId, "SUBMISSION_CREATED", `Submitted work for ${task.code}: ${task.title}`, {
    taskId: task.id,
    submissionId: submission.id,
  });

  const trainers = await prisma.user.findMany({ where: { role: Role.TRAINER, isActive: true }, select: { id: true } });
  await Promise.all(
    trainers.map((t) =>
      createNotification(
        t.id,
        "Submission received",
        `New submission for ${task.code} awaiting review`,
        "SUBMISSION_RECEIVED",
        `/trainer/submissions?submissionId=${submission.id}`
      )
    )
  );

  // GitHub metadata is best-effort: a failure here must never break submission creation.
  fetchAndStoreGitHubMetadata(submission.id, {
    repositoryUrl: input.repositoryUrl,
    pullRequestUrl: input.pullRequestUrl,
  }).catch(() => undefined);

  return submission;
}

export async function updateSubmission(submissionId: string, userId: string, input: Partial<SubmissionInput>) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) throw ApiError.notFound("Submission not found");
  if (submission.userId !== userId) throw ApiError.forbidden("You can only update your own submissions");
  if (!PENDING_STATUSES.includes(submission.status)) {
    throw ApiError.badRequest("Only pending submissions can be updated", "SUBMISSION_NOT_EDITABLE");
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      repositoryUrl: input.repositoryUrl ?? submission.repositoryUrl,
      branchName: input.branchName ?? submission.branchName,
      pullRequestUrl: input.pullRequestUrl ?? submission.pullRequestUrl,
      liveDemoUrl: input.liveDemoUrl ?? submission.liveDemoUrl,
      notes: input.notes ?? submission.notes,
    },
  });

  await logActivity(userId, "SUBMISSION_UPDATED", "Updated a pending submission", { submissionId });

  fetchAndStoreGitHubMetadata(submission.id, {
    repositoryUrl: updated.repositoryUrl ?? undefined,
    pullRequestUrl: updated.pullRequestUrl ?? undefined,
  }).catch(() => undefined);

  return updated;
}

interface ListSubmissionsParams {
  page: number;
  limit: number;
  userId?: string;
  weekId?: string;
  taskId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function listSubmissions(params: ListSubmissionsParams) {
  const { page, limit, userId, weekId, taskId, status, from, to } = params;

  const where: Prisma.SubmissionWhereInput = {
    ...(userId ? { userId } : {}),
    ...(taskId ? { taskId } : {}),
    ...(weekId ? { task: { weekId } } : {}),
    ...(status ? { status: status as SubmissionStatus } : {}),
    ...(from || to
      ? {
          submittedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        task: { select: { id: true, code: true, title: true, weekId: true, points: true } },
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, githubUsername: true } },
        githubRepository: true,
        githubPullRequest: true,
        evaluation: true,
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return { data, pagination: buildPagination(page, limit, total) };
}

export async function getSubmissionDetail(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      task: { include: { week: { select: { id: true, weekNumber: true, title: true, programId: true } } } },
      user: { select: { id: true, firstName: true, lastName: true, avatar: true, githubUsername: true } },
      reviews: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { id: true, firstName: true, lastName: true } } } },
      evaluation: true,
      githubRepository: true,
      githubPullRequest: true,
    },
  });
  if (!submission) throw ApiError.notFound("Submission not found");

  const history = await prisma.submission.findMany({
    where: { taskId: submission.taskId, userId: submission.userId },
    orderBy: { attemptNumber: "asc" },
    select: { id: true, attemptNumber: true, status: true, submittedAt: true },
  });

  return { ...submission, history };
}
