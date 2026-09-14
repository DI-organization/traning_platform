import { PrismaClient } from "@prisma/client";

const SEED_ACCOUNT_EMAILS = ["qa-trainer@example.com", "trainee1@example.com", "trainee2@example.com"];

/**
 * The test suite runs against the real configured DATABASE_URL (there is no
 * separate test database), so every login/submission/review it performs
 * writes real ActivityLog and Notification rows against the seeded demo
 * accounts. Without cleanup, running `npm test` repeatedly would permanently
 * clutter the trainer's "Recent Activity" feed and notification bell.
 * This records the run's start time and wipes anything the suite created
 * for the known seed accounts once every test file has finished.
 */
export default async function setup() {
  const prisma = new PrismaClient();
  const startedAt = new Date();

  return async function teardown() {
    await prisma.activityLog.deleteMany({
      where: {
        createdAt: { gte: startedAt },
        user: { email: { in: SEED_ACCOUNT_EMAILS } },
      },
    });
    await prisma.notification.deleteMany({
      where: {
        createdAt: { gte: startedAt },
        user: { email: { in: SEED_ACCOUNT_EMAILS } },
      },
    });
    await prisma.$disconnect();
  };
}
