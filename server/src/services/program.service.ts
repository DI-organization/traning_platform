import { Prisma, WeekUnlockStrategy } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function getActiveProgram() {
  return prisma.trainingProgram.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
}

export async function listPrograms() {
  return prisma.trainingProgram.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createProgram(data: {
  title: string;
  description: string;
  totalWeeks: number;
  weekUnlockStrategy: WeekUnlockStrategy;
}) {
  return prisma.trainingProgram.create({ data });
}

export async function updateProgram(id: string, data: Prisma.TrainingProgramUpdateInput) {
  const program = await prisma.trainingProgram.findUnique({ where: { id } });
  if (!program) throw ApiError.notFound("Training program not found");
  return prisma.trainingProgram.update({ where: { id }, data });
}

export async function getProgramWithWeeks(id: string) {
  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          topics: { orderBy: { order: "asc" } },
          resources: { orderBy: { order: "asc" } },
          tasks: { orderBy: { order: "asc" } },
          researchQuestions: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!program) throw ApiError.notFound("Training program not found");
  return program;
}

export async function createWeek(programId: string, data: Omit<Prisma.WeekUncheckedCreateInput, "programId">) {
  const program = await prisma.trainingProgram.findUnique({ where: { id: programId } });
  if (!program) throw ApiError.notFound("Training program not found");

  const existing = await prisma.week.findUnique({
    where: { programId_weekNumber: { programId, weekNumber: data.weekNumber } },
  });
  if (existing) {
    throw ApiError.conflict(`Week ${data.weekNumber} already exists for this program`, "WEEK_EXISTS");
  }

  return prisma.week.create({ data: { ...data, programId } });
}

export async function updateWeek(weekId: string, data: Prisma.WeekUpdateInput) {
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw ApiError.notFound("Week not found");
  return prisma.week.update({ where: { id: weekId }, data });
}

export async function setWeekLock(weekId: string, isLocked: boolean) {
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw ApiError.notFound("Week not found");
  return prisma.week.update({ where: { id: weekId }, data: { isLocked } });
}

export async function getWeekDetail(weekId: string) {
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      topics: { orderBy: { order: "asc" } },
      resources: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      researchQuestions: { orderBy: { order: "asc" } },
    },
  });
  if (!week) throw ApiError.notFound("Week not found");
  return week;
}

export async function createTopic(weekId: string, title: string, order: number) {
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw ApiError.notFound("Week not found");
  return prisma.topic.create({ data: { weekId, title, order } });
}

export async function deleteTopic(topicId: string) {
  await prisma.topic.delete({ where: { id: topicId } });
}

export async function createResearchQuestion(weekId: string, question: string, order: number) {
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw ApiError.notFound("Week not found");
  return prisma.researchQuestion.create({ data: { weekId, question, order } });
}

export async function deleteResearchQuestion(id: string) {
  await prisma.researchQuestion.delete({ where: { id } });
}

export async function answerResearchQuestion(questionId: string, userId: string, answer: string) {
  const question = await prisma.researchQuestion.findUnique({ where: { id: questionId } });
  if (!question) throw ApiError.notFound("Research question not found");

  return prisma.researchAnswer.upsert({
    where: { questionId_userId: { questionId, userId } },
    update: { answer, submittedAt: new Date(), score: null, feedback: null, reviewedAt: null },
    create: { questionId, userId, answer },
  });
}

export async function scoreResearchAnswer(answerId: string, score: number, feedback?: string) {
  const answer = await prisma.researchAnswer.findUnique({ where: { id: answerId } });
  if (!answer) throw ApiError.notFound("Research answer not found");
  return prisma.researchAnswer.update({
    where: { id: answerId },
    data: { score, feedback, reviewedAt: new Date() },
  });
}

export async function listResearchAnswersForUser(userId: string) {
  return prisma.researchAnswer.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { submittedAt: "desc" },
  });
}
