import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { logActivity } from "./activityLog.service";
import { createNotification } from "./notification.service";

interface ReviewScores {
  taskCompletion?: number;
  functionality?: number;
  codeQuality?: number;
  architecture?: number;
  gitUsage?: number;
  problemSolving?: number;
  documentation?: number;
  testing?: number;
  technicalUnderstanding?: number;
}

interface CreateReviewInput {
  decision: "APPROVED" | "CHANGES_REQUESTED";
  feedback: string;
  scores?: ReviewScores;
}

function totalScore(scores: ReviewScores): number {
  const values = Object.values(scores).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export async function createReview(submissionId: string, reviewerId: string, input: CreateReviewInput) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { task: true },
  });
  if (!submission) throw ApiError.notFound("Submission not found");

  const review = await prisma.submissionReview.create({
    data: {
      submissionId,
      reviewerId,
      decision: input.decision,
      feedback: input.feedback,
    },
  });

  const newSubmissionStatus = input.decision === "APPROVED" ? "APPROVED" : "CHANGES_REQUESTED";
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: newSubmissionStatus, reviewedAt: new Date() },
  });

  await prisma.taskAssignment.updateMany({
    where: { taskId: submission.taskId, userId: submission.userId },
    data: { status: newSubmissionStatus, ...(input.decision === "APPROVED" ? { completedAt: new Date() } : {}) },
  });

  if (input.scores) {
    const total = totalScore(input.scores);
    await prisma.evaluation.upsert({
      where: { submissionId },
      update: { ...input.scores, totalScore: total, evaluatorId: reviewerId },
      create: { submissionId, evaluatorId: reviewerId, ...input.scores, totalScore: total },
    });
  }

  await logActivity(
    reviewerId,
    input.decision === "APPROVED" ? "SUBMISSION_APPROVED" : "CHANGES_REQUESTED",
    `${input.decision === "APPROVED" ? "Approved" : "Requested changes for"} ${submission.task.code} submission`,
    { submissionId }
  );

  await createNotification(
    submission.userId,
    input.decision === "APPROVED" ? "Submission approved" : "Changes requested",
    input.decision === "APPROVED"
      ? `Your submission for ${submission.task.code} was approved`
      : `Your submission for ${submission.task.code} needs changes: ${input.feedback}`,
    input.decision === "APPROVED" ? "SUBMISSION_APPROVED" : "CHANGES_REQUESTED",
    `/trainee/tasks/${submission.taskId}`
  );

  return review;
}
