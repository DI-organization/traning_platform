import { prisma } from "../config/prisma";
import { createNotification } from "./notification.service";

const ACTIVE_ASSIGNMENT_STATUSES = ["NOT_STARTED", "IN_PROGRESS"] as const;

/**
 * Flips any assignment whose task deadline has passed (and that hasn't been
 * submitted/approved) to OVERDUE, and notifies the trainee. Without this,
 * TaskAssignment.status never actually becomes OVERDUE on its own, and the
 * trainer dashboard's "Overdue Tasks" KPI (which counts stored status, not
 * a live date comparison) would silently stay at 0 forever.
 */
async function flagOverdueAssignments() {
  const now = new Date();

  const toFlag = await prisma.taskAssignment.findMany({
    where: {
      status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
      task: { dueDate: { lt: now } },
    },
    include: { task: { select: { id: true, code: true, title: true } } },
  });

  for (const assignment of toFlag) {
    await prisma.taskAssignment.update({ where: { id: assignment.id }, data: { status: "OVERDUE" } });
    await createNotification(
      assignment.userId,
      "Task overdue",
      `${assignment.task.code}: ${assignment.task.title} is now overdue.`,
      "TASK_OVERDUE",
      `/trainee/tasks/${assignment.task.id}`
    );
  }

  return toFlag.length;
}

/**
 * Notifies trainees about tasks due tomorrow. Guarded against duplicate
 * notifications (in case the job runs more than once in a day) by checking
 * for an existing DEADLINE_TOMORROW notification for the same task link
 * within the last 20 hours.
 */
async function sendDeadlineReminders() {
  const now = new Date();
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const dueTomorrow = await prisma.taskAssignment.findMany({
    where: {
      status: { in: [...ACTIVE_ASSIGNMENT_STATUSES] },
      task: { dueDate: { gte: startOfTomorrow, lt: startOfDayAfterTomorrow } },
    },
    include: { task: { select: { id: true, code: true, title: true } } },
  });

  let sent = 0;
  for (const assignment of dueTomorrow) {
    const link = `/trainee/tasks/${assignment.task.id}`;
    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        userId: assignment.userId,
        type: "DEADLINE_TOMORROW",
        link,
        createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
      },
    });
    if (alreadyNotified) continue;

    await createNotification(
      assignment.userId,
      "Deadline tomorrow",
      `${assignment.task.code}: ${assignment.task.title} is due tomorrow.`,
      "DEADLINE_TOMORROW",
      link
    );
    sent++;
  }

  return sent;
}

export async function runDailyMaintenanceJob() {
  const [overdueCount, reminderCount] = await Promise.all([flagOverdueAssignments(), sendDeadlineReminders()]);
  if (overdueCount || reminderCount) {
    // eslint-disable-next-line no-console
    console.log(`[scheduler] flagged ${overdueCount} overdue assignment(s), sent ${reminderCount} deadline reminder(s)`);
  }
  return { overdueCount, reminderCount };
}
