import { Prisma, Role, WeekUnlockStrategy } from "@prisma/client";
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

const weekInclude = {
  topics: { orderBy: { order: "asc" as const } },
  resources: { orderBy: { order: "asc" as const } },
  tasks: { orderBy: { order: "asc" as const } },
  researchQuestions: { orderBy: { order: "asc" as const } },
};

/**
 * For a trainee, a locked week's shell (title, dates, lock state) is
 * visible so the timeline renders, but its topics/tasks/resources/research
 * questions are stripped — the same "material doesn't all open at once"
 * rule enforced by getWeekDetail, applied here so the aggregate program
 * tree can't be used to bypass it.
 */
export async function getProgramWithWeeks(id: string, viewer?: Viewer) {
  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          weeks: {
            orderBy: { weekNumber: "asc" },
            include: weekInclude,
          },
        },
      },
    },
  });
  if (!program) throw ApiError.notFound("Training program not found");

  if (viewer?.role === Role.TRAINEE) {
    return {
      ...program,
      phases: program.phases.map((phase) => ({
        ...phase,
        weeks: phase.weeks.map((week) =>
          week.isLocked
            ? { ...week, topics: [], resources: [], tasks: [], researchQuestions: [] }
            : week
        ),
      })),
    };
  }

  return program;
}

// ── Phases ────────────────────────────────────────────────────────────

export async function createPhase(
  programId: string,
  data: { phaseNumber: number; title: string; description?: string; order?: number }
) {
  const program = await prisma.trainingProgram.findUnique({ where: { id: programId } });
  if (!program) throw ApiError.notFound("Training program not found");

  const existing = await prisma.phase.findUnique({
    where: { programId_phaseNumber: { programId, phaseNumber: data.phaseNumber } },
  });
  if (existing) {
    throw ApiError.conflict(`Phase ${data.phaseNumber} already exists for this program`, "PHASE_EXISTS");
  }

  return prisma.phase.create({ data: { ...data, programId } });
}

export async function updatePhase(phaseId: string, data: Prisma.PhaseUpdateInput) {
  const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
  if (!phase) throw ApiError.notFound("Phase not found");
  return prisma.phase.update({ where: { id: phaseId }, data });
}

export async function deletePhase(phaseId: string) {
  const phase = await prisma.phase.findUnique({ where: { id: phaseId }, include: { weeks: true } });
  if (!phase) throw ApiError.notFound("Phase not found");
  if (phase.weeks.length > 0) {
    throw ApiError.badRequest("Remove this phase's weeks before deleting it", "PHASE_HAS_WEEKS");
  }
  await prisma.phase.delete({ where: { id: phaseId } });
}

// ── Weeks ─────────────────────────────────────────────────────────────

export async function createWeek(
  programId: string,
  data: Omit<Prisma.WeekUncheckedCreateInput, "programId">
) {
  const program = await prisma.trainingProgram.findUnique({ where: { id: programId } });
  if (!program) throw ApiError.notFound("Training program not found");

  const phase = await prisma.phase.findUnique({ where: { id: data.phaseId } });
  if (!phase || phase.programId !== programId) {
    throw ApiError.badRequest("Phase not found in this program", "PHASE_NOT_FOUND");
  }

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

interface Viewer {
  userId: string;
  role: Role;
}

/**
 * A locked week is invisible to trainees at the API level, not just hidden
 * in the UI — this is the actual "material doesn't all open at once" gate.
 * Trainers always see full content regardless of lock state.
 */
export async function getWeekDetail(weekId: string, viewer?: Viewer) {
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: weekInclude,
  });
  if (!week) throw ApiError.notFound("Week not found");

  if (viewer?.role === Role.TRAINEE && week.isLocked) {
    throw ApiError.forbidden("This week is not unlocked yet", "WEEK_LOCKED");
  }

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
