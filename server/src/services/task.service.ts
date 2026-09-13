import { AssignmentStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPagination } from "../utils/apiResponse";
import { logActivity } from "./activityLog.service";
import { createNotification } from "./notification.service";

export async function createTask(data: Prisma.TaskUncheckedCreateInput) {
  const week = await prisma.week.findUnique({ where: { id: data.weekId } });
  if (!week) throw ApiError.notFound("Week not found");

  const existingCode = await prisma.task.findUnique({ where: { code: data.code } });
  if (existingCode) throw ApiError.conflict(`Task code "${data.code}" is already in use`, "TASK_CODE_TAKEN");

  const task = await prisma.task.create({ data });

  // Auto-assign to every currently active trainee enrolled in this week's program
  const trainees = await prisma.user.findMany({
    where: { role: Role.TRAINEE, isActive: true, enrollments: { some: { programId: week.programId } } },
    select: { id: true },
  });

  if (trainees.length > 0) {
    await prisma.taskAssignment.createMany({
      data: trainees.map((t) => ({ taskId: task.id, userId: t.id, dueDate: task.dueDate })),
      skipDuplicates: true,
    });
    await Promise.all(
      trainees.map((t) =>
        createNotification(
          t.id,
          "New task assigned",
          `${task.code}: ${task.title}`,
          "TASK_ASSIGNED",
          `/trainee/tasks/${task.id}`
        )
      )
    );
  }

  return task;
}

export async function updateTask(id: string, data: Prisma.TaskUpdateInput) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound("Task not found");
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound("Task not found");
  await prisma.task.delete({ where: { id } });
}

export async function reorderTasks(weekId: string, taskIds: string[]) {
  await prisma.$transaction(
    taskIds.map((id, index) => prisma.task.update({ where: { id }, data: { order: index } }))
  );
  return prisma.task.findMany({ where: { weekId }, orderBy: { order: "asc" } });
}

interface ListTasksParams {
  page: number;
  limit: number;
  weekId?: string;
  type?: string;
  status?: AssignmentStatus;
  search?: string;
  userId?: string; // when set, merges per-user assignment status
  hideLockedWeeks?: boolean; // trainees never see tasks from a week that isn't unlocked yet
}

export async function listTasks(params: ListTasksParams) {
  const { page, limit, weekId, type, search, userId, status, hideLockedWeeks } = params;

  const where: Prisma.TaskWhereInput = {
    ...(weekId ? { weekId } : {}),
    ...(type ? { type: type as never } : {}),
    ...(hideLockedWeeks ? { week: { isLocked: false } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && userId ? { assignments: { some: { userId, status } } } : {}),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ week: { weekNumber: "asc" } }, { order: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        week: { select: { id: true, weekNumber: true, title: true } },
        assignments: userId ? { where: { userId } } : false,
      },
    }),
    prisma.task.count({ where }),
  ]);

  const data = tasks.map((task) => ({
    ...task,
    assignmentStatus: userId ? task.assignments[0]?.status ?? "NOT_STARTED" : undefined,
    assignments: undefined,
  }));

  return { data, pagination: buildPagination(page, limit, total) };
}

export async function getTaskDetail(taskId: string, userId?: string, enforceLock = false) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      week: { select: { id: true, weekNumber: true, title: true, programId: true, isLocked: true } },
    },
  });
  if (!task) throw ApiError.notFound("Task not found");

  if (enforceLock && task.week.isLocked) {
    throw ApiError.forbidden("This week is not unlocked yet", "WEEK_LOCKED");
  }

  let assignment = null;
  let submissions: Awaited<ReturnType<typeof prisma.submission.findMany>> = [];
  if (userId) {
    assignment = await prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    submissions = await prisma.submission.findMany({
      where: { taskId, userId },
      orderBy: { attemptNumber: "desc" },
      include: { reviews: { orderBy: { createdAt: "desc" } }, evaluation: true },
    });
  }

  return { ...task, assignment, submissions };
}

async function ensureAssignment(taskId: string, userId: string) {
  const existing = await prisma.taskAssignment.findUnique({ where: { taskId_userId: { taskId, userId } } });
  if (existing) return existing;
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  return prisma.taskAssignment.create({ data: { taskId, userId, dueDate: task.dueDate } });
}

export async function startTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { week: { select: { isLocked: true } } } });
  if (!task) throw ApiError.notFound("Task not found");
  if (task.week.isLocked) throw ApiError.forbidden("This week is not unlocked yet", "WEEK_LOCKED");

  const assignment = await ensureAssignment(taskId, userId);
  if (assignment.status === "NOT_STARTED") {
    const updated = await prisma.taskAssignment.update({
      where: { id: assignment.id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
    await logActivity(userId, "TASK_STARTED", `Started task ${task.code}: ${task.title}`, { taskId });
    return updated;
  }
  return assignment;
}

export async function updateAssignmentStatus(taskId: string, userId: string, status: AssignmentStatus) {
  const assignment = await ensureAssignment(taskId, userId);
  return prisma.taskAssignment.update({
    where: { id: assignment.id },
    data: { status, ...(status === "APPROVED" ? { completedAt: new Date() } : {}) },
  });
}

