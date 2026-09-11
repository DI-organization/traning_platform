import { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function logActivity(
  userId: string,
  type: ActivityType,
  description: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.activityLog.create({
    data: { userId, type, description, metadata },
  });
}

export async function getActivityForUser(userId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRecentActivity(limit = 20) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
    },
  });
}
