import { PrismaClient, TaskDifficulty } from "@prisma/client";
import bcrypt from "bcrypt";
import { weeksData } from "./seedData";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

async function main() {
  console.log("Seeding database...");

  // Clean slate (dev-only, respects FK order via cascading deletes on children)
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.researchAnswer.deleteMany();
  await prisma.researchQuestion.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.submissionReview.deleteMany();
  await prisma.gitHubRepository.deleteMany();
  await prisma.gitHubPullRequest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.week.deleteMany();
  await prisma.programEnrollment.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.gitHubProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const trainer = await prisma.user.create({
    data: {
      firstName: "Laith",
      lastName: "Tanirah",
      email: "trainer@example.com",
      passwordHash,
      role: "TRAINER",
      isActive: true,
    },
  });

  const trainee1 = await prisma.user.create({
    data: {
      firstName: "Ahmad",
      lastName: "Yousef",
      email: "trainee1@example.com",
      passwordHash,
      role: "TRAINEE",
      githubUsername: "octocat",
      isActive: true,
    },
  });
  await prisma.gitHubProfile.create({
    data: { userId: trainee1.id, username: "octocat", profileUrl: "https://github.com/octocat" },
  });

  const trainee2 = await prisma.user.create({
    data: {
      firstName: "Sara",
      lastName: "Khalil",
      email: "trainee2@example.com",
      passwordHash,
      role: "TRAINEE",
      githubUsername: "torvalds",
      isActive: true,
    },
  });
  await prisma.gitHubProfile.create({
    data: { userId: trainee2.id, username: "torvalds", profileUrl: "https://github.com/torvalds" },
  });

  const program = await prisma.trainingProgram.create({
    data: {
      title: "Full-Stack Software Development Training",
      description:
        "A 12-week intensive program covering JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Prisma, REST APIs, Git/GitHub, testing and deployment.",
      totalWeeks: 12,
      weekUnlockStrategy: "MANUAL",
      isActive: true,
    },
  });

  console.log(`Created program: ${program.title}`);

  const weekRecords: { weekNumber: number; id: string; taskIdsByCode: Record<string, string> }[] = [];

  // Anchor the program so "today" falls inside week 4 (Ahmad's current week):
  // weeks 1-3 are fully in the past (due dates passed), week 4 is in progress,
  // and weeks 5-12 are still ahead — so unstarted future tasks read as
  // "pending", not "overdue".
  const DAY_MS = 24 * 60 * 60 * 1000;
  const programStart = new Date(Date.now() - 3 * 7 * DAY_MS);

  for (const weekDef of weeksData) {
    const weekStart = new Date(programStart.getTime() + (weekDef.weekNumber - 1) * 7 * DAY_MS);
    const weekEnd = new Date(programStart.getTime() + weekDef.weekNumber * 7 * DAY_MS);

    const week = await prisma.week.create({
      data: {
        programId: program.id,
        weekNumber: weekDef.weekNumber,
        title: weekDef.title,
        description: weekDef.description,
        objectives: weekDef.objectives,
        weeklyProjectTitle: weekDef.weeklyProjectTitle,
        weeklyProjectDescription: weekDef.weeklyProjectDescription,
        submissionRequirements: weekDef.submissionRequirements,
        // First 4 weeks ship unlocked so the seeded data is immediately explorable;
        // the rest stay locked, matching MANUAL unlock strategy.
        isLocked: weekDef.weekNumber > 4,
        startDate: weekStart,
        endDate: weekEnd,
        topics: {
          create: weekDef.topics.map((title, i) => ({ title, order: i })),
        },
        resources: {
          create: weekDef.resources.map((r, i) => ({ ...r, order: i })),
        },
        researchQuestions: {
          create: weekDef.researchQuestions.map((question, i) => ({ question, order: i })),
        },
      },
    });

    const taskIdsByCode: Record<string, string> = {};
    let order = 0;
    for (const taskDef of weekDef.tasks) {
      const dueDate = new Date(week.endDate as Date);
      dueDate.setDate(dueDate.getDate() + (taskDef.isWeeklyProject ? 2 : 0));

      const task = await prisma.task.create({
        data: {
          code: taskDef.code,
          title: taskDef.title,
          description: taskDef.description,
          weekId: week.id,
          type: taskDef.type,
          priority: taskDef.priority,
          difficulty: taskDef.difficulty,
          points: taskDef.points,
          estimatedHours: taskDef.estimatedHours,
          dueDate,
          instructions: taskDef.instructions,
          acceptanceCriteria: taskDef.acceptanceCriteria,
          isWeeklyProject: Boolean(taskDef.isWeeklyProject),
          order: order++,
          createdById: trainer.id,
        },
      });
      taskIdsByCode[task.code] = task.id;
    }

    weekRecords.push({ weekNumber: week.weekNumber, id: week.id, taskIdsByCode });
    console.log(`  Week ${week.weekNumber}: ${week.title} (${Object.keys(taskIdsByCode).length} tasks)`);
  }

  await prisma.programEnrollment.create({
    data: { userId: trainee1.id, programId: program.id, currentWeek: 4, status: "ACTIVE" },
  });
  await prisma.programEnrollment.create({
    data: { userId: trainee2.id, programId: program.id, currentWeek: 2, status: "ACTIVE" },
  });

  // ── Sample submission history so the app looks populated ────────────────

  function scoresFor(difficulty: TaskDifficulty) {
    const base = difficulty === "HARD" ? 78 : difficulty === "MEDIUM" ? 85 : 92;
    return {
      taskCompletion: base,
      functionality: base - 2,
      codeQuality: base - 5,
      architecture: base - 6,
      gitUsage: base + 2 > 100 ? 100 : base + 2,
      problemSolving: base - 3,
      documentation: base - 8,
      testing: base - 10,
      technicalUnderstanding: base - 4,
    };
  }

  async function submitAndApprove(userId: string, taskId: string, difficulty: TaskDifficulty, repo: string) {
    const submission = await prisma.submission.create({
      data: {
        taskId,
        userId,
        attemptNumber: 1,
        repositoryUrl: `https://github.com/${repo}`,
        branchName: "main",
        notes: "Completed all acceptance criteria.",
        status: "APPROVED",
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.taskAssignment.upsert({
      where: { taskId_userId: { taskId, userId } },
      update: { status: "APPROVED", startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      create: { taskId, userId, status: "APPROVED", startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    });
    await prisma.submissionReview.create({
      data: {
        submissionId: submission.id,
        reviewerId: trainer.id,
        decision: "APPROVED",
        feedback: "Great work — clean implementation and good use of the concepts from this week.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });
    const scores = scoresFor(difficulty);
    const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);
    await prisma.evaluation.create({
      data: { submissionId: submission.id, evaluatorId: trainer.id, ...scores, totalScore: total },
    });
    return submission;
  }

  async function submitPendingReview(userId: string, taskId: string, repo: string) {
    const submission = await prisma.submission.create({
      data: {
        taskId,
        userId,
        attemptNumber: 1,
        repositoryUrl: `https://github.com/${repo}`,
        branchName: "main",
        notes: "Ready for review.",
        status: "SUBMITTED",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.taskAssignment.upsert({
      where: { taskId_userId: { taskId, userId } },
      update: { status: "SUBMITTED", startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      create: { taskId, userId, status: "SUBMITTED", startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    });
    return submission;
  }

  async function markInProgress(userId: string, taskId: string) {
    await prisma.taskAssignment.upsert({
      where: { taskId_userId: { taskId, userId } },
      update: { status: "IN_PROGRESS", startedAt: new Date() },
      create: { taskId, userId, status: "IN_PROGRESS", startedAt: new Date() },
    });
  }

  const byWeek = (n: number) => weekRecords.find((w) => w.weekNumber === n)!;
  const taskDefByCode = new Map(weeksData.flatMap((w) => w.tasks.map((t) => [t.code, t] as const)));

  // Trainee 1 (Ahmad): weeks 1-3 fully approved, week 4 in progress with one pending review
  for (const weekNumber of [1, 2, 3]) {
    const week = byWeek(weekNumber);
    for (const code of Object.keys(week.taskIdsByCode)) {
      const def = taskDefByCode.get(code)!;
      await submitAndApprove(trainee1.id, week.taskIdsByCode[code], def.difficulty, `ahmad-dev/${code.toLowerCase()}`);
    }
  }
  {
    const week4 = byWeek(4);
    const codes = Object.keys(week4.taskIdsByCode);
    await submitAndApprove(trainee1.id, week4.taskIdsByCode[codes[0]], taskDefByCode.get(codes[0])!.difficulty, `ahmad-dev/${codes[0].toLowerCase()}`);
    await submitPendingReview(trainee1.id, week4.taskIdsByCode[codes[1]], `ahmad-dev/${codes[1].toLowerCase()}`);
    await markInProgress(trainee1.id, week4.taskIdsByCode[codes[2]]);
  }

  // Trainee 2 (Sara): week 1 fully approved, week 2 partly in progress / one pending review
  {
    const week1 = byWeek(1);
    for (const code of Object.keys(week1.taskIdsByCode)) {
      const def = taskDefByCode.get(code)!;
      await submitAndApprove(trainee2.id, week1.taskIdsByCode[code], def.difficulty, `sara-codes/${code.toLowerCase()}`);
    }
    const week2 = byWeek(2);
    const codes = Object.keys(week2.taskIdsByCode);
    await submitPendingReview(trainee2.id, week2.taskIdsByCode[codes[0]], `sara-codes/${codes[0].toLowerCase()}`);
    await markInProgress(trainee2.id, week2.taskIdsByCode[codes[1]]);
  }

  // ── Sample research answers ──────────────────────────────────────────
  const week1Questions = await prisma.researchQuestion.findMany({ where: { weekId: byWeek(1).id } });
  for (const q of week1Questions) {
    await prisma.researchAnswer.create({
      data: {
        questionId: q.id,
        userId: trainee1.id,
        answer:
          "var is function-scoped and hoisted with an initial value of undefined; let and const are block-scoped and live in the temporal dead zone until initialized. const additionally disallows reassignment.",
        score: 90,
        feedback: "Solid, precise answer.",
        reviewedAt: new Date(),
      },
    });
  }

  // ── Notifications ────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: trainee1.id,
        title: "Changes requested",
        message: "Your trainer left feedback on a recent submission.",
        type: "CHANGES_REQUESTED",
        isRead: false,
      },
      {
        userId: trainee1.id,
        title: "New week available",
        message: "Week 4: React Fundamentals is now unlocked.",
        type: "WEEK_AVAILABLE",
        isRead: true,
      },
      {
        userId: trainee2.id,
        title: "Submission received",
        message: "Your submission is now awaiting trainer review.",
        type: "SUBMISSION_RECEIVED",
        isRead: false,
      },
      {
        userId: trainer.id,
        title: "Submission received",
        message: "Sara submitted work for review.",
        type: "SUBMISSION_RECEIVED",
        isRead: false,
      },
    ],
  });

  // ── Activity log ─────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { userId: trainee1.id, type: "WEEK_COMPLETED", description: "Ahmad completed Week 3: Git & GitHub + TypeScript" },
      { userId: trainee2.id, type: "SUBMISSION_CREATED", description: "Sara submitted work for review" },
      { userId: trainer.id, type: "SUBMISSION_REVIEWED", description: "Trainer reviewed Ahmad's submission" },
    ],
  });

  console.log("\nSeed complete.");
  console.log("Demo accounts (see README for details):");
  console.log(`  Trainer:   trainer@example.com   / ${DEMO_PASSWORD}`);
  console.log(`  Trainee 1: trainee1@example.com  / ${DEMO_PASSWORD}`);
  console.log(`  Trainee 2: trainee2@example.com  / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
