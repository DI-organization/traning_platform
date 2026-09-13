import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as programService from "../services/program.service";
import { createNotification } from "../services/notification.service";
import { logActivity } from "../services/activityLog.service";
import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export const listPrograms = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await programService.listPrograms());
});

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await programService.createProgram(req.body), 201);
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await programService.updateProgram(req.params.id, req.body));
});

export const getProgram = asyncHandler(async (req: Request, res: Response) => {
  const viewer = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
  sendSuccess(res, await programService.getProgramWithWeeks(req.params.id, viewer));
});

export const createPhase = asyncHandler(async (req: Request, res: Response) => {
  const phase = await programService.createPhase(req.params.programId, req.body);
  sendSuccess(res, phase, 201);
});

export const updatePhase = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await programService.updatePhase(req.params.phaseId, req.body));
});

export const deletePhase = asyncHandler(async (req: Request, res: Response) => {
  await programService.deletePhase(req.params.phaseId);
  sendSuccess(res, { message: "Phase deleted" });
});

export const createWeek = asyncHandler(async (req: Request, res: Response) => {
  const week = await programService.createWeek(req.params.programId, req.body);
  sendSuccess(res, week, 201);
});

export const updateWeek = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await programService.updateWeek(req.params.weekId, req.body));
});

export const getWeek = asyncHandler(async (req: Request, res: Response) => {
  const viewer = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
  sendSuccess(res, await programService.getWeekDetail(req.params.weekId, viewer));
});

export const setWeekLock = asyncHandler(async (req: Request, res: Response) => {
  const isLocked = req.body.isLocked as boolean;
  const week = await programService.setWeekLock(req.params.weekId, isLocked);

  if (!isLocked) {
    const trainees = await prisma.user.findMany({
      where: { role: Role.TRAINEE, isActive: true, enrollments: { some: { programId: week.programId } } },
      select: { id: true },
    });
    await Promise.all(
      trainees.map((t) =>
        createNotification(t.id, "New week available", `Week ${week.weekNumber}: ${week.title} is now unlocked`, "WEEK_AVAILABLE", "/trainee/program")
      )
    );
  }

  sendSuccess(res, week);
});

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  const topic = await programService.createTopic(req.params.weekId, req.body.title, req.body.order ?? 0);
  sendSuccess(res, topic, 201);
});

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  await programService.deleteTopic(req.params.topicId);
  sendSuccess(res, { message: "Topic deleted" });
});

export const createResearchQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await programService.createResearchQuestion(req.params.weekId, req.body.question, req.body.order ?? 0);
  sendSuccess(res, question, 201);
});

export const deleteResearchQuestion = asyncHandler(async (req: Request, res: Response) => {
  await programService.deleteResearchQuestion(req.params.questionId);
  sendSuccess(res, { message: "Research question deleted" });
});

export const answerResearchQuestion = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const answer = await programService.answerResearchQuestion(req.params.questionId, req.user.userId, req.body.answer);
  await logActivity(req.user.userId, "RESEARCH_ANSWER_SUBMITTED", "Submitted a research answer", { questionId: req.params.questionId });
  sendSuccess(res, answer, 201);
});

export const scoreResearchAnswer = asyncHandler(async (req: Request, res: Response) => {
  const answer = await programService.scoreResearchAnswer(req.params.answerId, req.body.score, req.body.feedback);
  sendSuccess(res, answer);
});

export const listMyResearchAnswers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  sendSuccess(res, await programService.listResearchAnswersForUser(req.user.userId));
});
