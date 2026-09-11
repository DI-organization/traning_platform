import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "./auth.service";
import { buildPagination } from "../utils/apiResponse";
import { getAverageScore, getLastActivityAt, getOverallProgress } from "./progress.service";
import { getActiveProgram } from "./program.service";

export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  avatar: true,
  phone: true,
  githubUsername: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

interface CreateTraineeInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  githubUsername?: string;
  programId?: string;
}

export async function createTrainee(input: CreateTraineeInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw ApiError.conflict("A user with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);

  const program = input.programId
    ? await prisma.trainingProgram.findUnique({ where: { id: input.programId } })
    : await getActiveProgram();

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      passwordHash,
      role: Role.TRAINEE,
      phone: input.phone,
      githubUsername: input.githubUsername,
      ...(program
        ? {
            enrollments: {
              create: { programId: program.id, currentWeek: 1 },
            },
          }
        : {}),
    },
    select: safeUserSelect,
  });

  if (input.githubUsername) {
    await prisma.gitHubProfile.create({
      data: {
        userId: user.id,
        username: input.githubUsername,
        profileUrl: `https://github.com/${input.githubUsername}`,
      },
    });
  }

  return user;
}

interface ListTraineesParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export async function listTrainees({ page, limit, search, status }: ListTraineesParams) {
  const where: Prisma.UserWhereInput = {
    role: Role.TRAINEE,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        ...safeUserSelect,
        enrollments: {
          take: 1,
          orderBy: { enrolledAt: "desc" },
          select: { id: true, currentWeek: true, status: true, programId: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const enriched = await Promise.all(
    users.map(async (user) => {
      const enrollment = user.enrollments[0];
      const progress = enrollment
        ? await getOverallProgress(user.id, enrollment.programId)
        : { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, progressPercent: 0 };
      const averageScore = await getAverageScore(user.id);
      const lastActivityAt = await getLastActivityAt(user.id);
      return {
        ...user,
        currentWeek: enrollment?.currentWeek ?? null,
        enrollmentStatus: enrollment?.status ?? null,
        progress,
        averageScore,
        lastActivityAt,
      };
    })
  );

  return { data: enriched, pagination: buildPagination(page, limit, total) };
}

export async function getTraineeDetail(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: Role.TRAINEE },
    select: {
      ...safeUserSelect,
      enrollments: {
        take: 1,
        orderBy: { enrolledAt: "desc" },
        include: { program: true },
      },
      githubProfile: true,
    },
  });
  if (!user) throw ApiError.notFound("Trainee not found");

  const enrollment = user.enrollments[0];
  const overallProgress = enrollment
    ? await getOverallProgress(user.id, enrollment.programId)
    : { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, progressPercent: 0 };
  const averageScore = await getAverageScore(user.id);

  const submissions = await prisma.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 20,
    include: {
      task: { select: { id: true, code: true, title: true, weekId: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 1 },
      evaluation: true,
    },
  });

  const activity = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return {
    ...user,
    enrollment: enrollment ?? null,
    overallProgress,
    averageScore,
    submissions,
    activity,
  };
}

export async function updateUser(userId: string, data: Partial<{ firstName: string; lastName: string; phone: string | null; githubUsername: string | null; avatar: string | null }>) {
  const user = await prisma.user.update({ where: { id: userId }, data, select: safeUserSelect });
  return user;
}

export async function setUserActiveStatus(userId: string, isActive: boolean) {
  return prisma.user.update({ where: { id: userId }, data: { isActive }, select: safeUserSelect });
}
