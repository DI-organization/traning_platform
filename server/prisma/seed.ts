import { PrismaClient, TaskDifficulty } from "@prisma/client";
import bcrypt from "bcrypt";
import { phasesData } from "./seedData";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";
const CURRENT_WEEK_AHMAD = 8;
const CURRENT_WEEK_SARA = 2;

// Overridable so a real trainer identity never has to be committed to this
// file — set SEED_TRAINER_EMAIL/SEED_TRAINER_PASSWORD in server/.env (not
// tracked by git) instead. Falls back to the shared demo account otherwise.
const TRAINER_EMAIL = process.env.SEED_TRAINER_EMAIL || "trainer@example.com";
const TRAINER_PASSWORD = process.env.SEED_TRAINER_PASSWORD || DEMO_PASSWORD;
const TRAINER_IS_CUSTOM = Boolean(process.env.SEED_TRAINER_EMAIL || process.env.SEED_TRAINER_PASSWORD);

// A fixed, never-overridden trainer account the test suite logs in as, so
// running the tests never depends on (or collides with) whichever trainer
// identity happens to be configured above.
const QA_TRAINER_EMAIL = "qa-trainer@example.com";

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
  await prisma.phase.deleteMany();
  await prisma.programEnrollment.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.gitHubProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const trainerPasswordHash = TRAINER_IS_CUSTOM ? await bcrypt.hash(TRAINER_PASSWORD, 12) : passwordHash;

  const trainer = await prisma.user.create({
    data: {
      firstName: "Laith",
      lastName: "Tanirah",
      email: TRAINER_EMAIL,
      passwordHash: trainerPasswordHash,
      role: "TRAINER",
      isActive: true,
    },
  });

  // Dedicated fixture account for the test suite (see QA_TRAINER_EMAIL above).
  await prisma.user.create({
    data: {
      firstName: "QA",
      lastName: "Trainer",
      email: QA_TRAINER_EMAIL,
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

  const totalWeeks = phasesData.reduce((sum, p) => sum + p.weeks.length, 0);

  const program = await prisma.trainingProgram.create({
    data: {
      title: "Full-Stack Software Development Training",
      description:
        "A 3-phase, cohort-based full-stack program: frontend fundamentals, then backend & React, then databases, TypeScript and team projects.",
      totalWeeks,
      weekUnlockStrategy: "MANUAL",
      isActive: true,
    },
  });

  console.log(`Created program: ${program.title}`);

  const weekRecords: { weekNumber: number; id: string; taskIdsByCode: Record<string, string> }[] = [];

  // Anchor the program so "today" falls inside week 8 (Ahmad's current
  // week, the more advanced trainee, at the end of Phase 2): earlier weeks
  // are fully in the past (due dates passed), week 8 is in progress, and
  // Phase 3 (weeks 9-12) is still ahead — so unstarted future tasks read as
  // "pending", not "overdue".
  const DAY_MS = 24 * 60 * 60 * 1000;
  const programStart = new Date(Date.now() - (CURRENT_WEEK_AHMAD - 1) * 7 * DAY_MS);

  for (const phaseDef of phasesData) {
    const phase = await prisma.phase.create({
      data: {
        programId: program.id,
        phaseNumber: phaseDef.phaseNumber,
        title: phaseDef.title,
        description: phaseDef.description,
        order: phaseDef.phaseNumber,
      },
    });
    console.log(`Phase ${phase.phaseNumber}: ${phase.title}`);

    for (const weekDef of phaseDef.weeks) {
      const weekStart = new Date(programStart.getTime() + (weekDef.weekNumber - 1) * 7 * DAY_MS);
      const weekEnd = new Date(programStart.getTime() + weekDef.weekNumber * 7 * DAY_MS);

      const week = await prisma.week.create({
        data: {
          programId: program.id,
          phaseId: phase.id,
          weekNumber: weekDef.weekNumber,
          title: weekDef.title,
          description: weekDef.description,
          objectives: weekDef.objectives,
          weeklyProjectTitle: weekDef.weeklyProjectTitle,
          weeklyProjectDescription: weekDef.weeklyProjectDescription,
          submissionRequirements: weekDef.submissionRequirements,
          // Weeks up to Ahmad's current week ship unlocked so the seeded
          // data is immediately explorable; the rest stay locked, matching
          // MANUAL unlock strategy — the trainer unlocks the next week as
          // the cohort progresses.
          isLocked: weekDef.weekNumber > CURRENT_WEEK_AHMAD,
          startDate: weekStart,
          endDate: weekEnd,
          topics: {
            create: weekDef.topics.map((topic, i) => ({ ...topic, order: i })),
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
  }

  await prisma.programEnrollment.create({
    data: { userId: trainee1.id, programId: program.id, currentWeek: CURRENT_WEEK_AHMAD, status: "ACTIVE" },
  });
  await prisma.programEnrollment.create({
    data: { userId: trainee2.id, programId: program.id, currentWeek: CURRENT_WEEK_SARA, status: "ACTIVE" },
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
  const taskDefByCode = new Map(
    phasesData.flatMap((p) => p.weeks.flatMap((w) => w.tasks.map((t) => [t.code, t] as const)))
  );

  function taskCodesInWeek(weekNumber: number): string[] {
    return Object.keys(byWeek(weekNumber).taskIdsByCode);
  }

  async function approveAllTasksInWeek(userId: string, weekNumber: number, repoPrefix: string) {
    for (const code of taskCodesInWeek(weekNumber)) {
      const taskId = byWeek(weekNumber).taskIdsByCode[code];
      const def = taskDefByCode.get(code)!;
      await submitAndApprove(userId, taskId, def.difficulty, `${repoPrefix}/${code.toLowerCase()}`);
    }
  }

  // Trainee 1 (Ahmad, at week 8, end of Phase 2): every earlier week's
  // tasks approved, week 8's task pending review — populates "Pending Reviews".
  for (const weekNumber of [1, 2, 3, 4, 5, 6, 7]) {
    await approveAllTasksInWeek(trainee1.id, weekNumber, "ahmad-dev");
  }
  {
    const code = taskCodesInWeek(8)[0];
    const taskId = byWeek(8).taskIdsByCode[code];
    await submitPendingReview(trainee1.id, taskId, `ahmad-dev/${code.toLowerCase()}`);
  }

  // Trainee 2 (Sara, at week 2): week 1 fully approved, week 2 has one task
  // pending review and the other in progress.
  await approveAllTasksInWeek(trainee2.id, 1, "sara-codes");
  {
    const [firstCode, secondCode] = taskCodesInWeek(2);
    const week2 = byWeek(2);
    await submitPendingReview(trainee2.id, week2.taskIdsByCode[firstCode], `sara-codes/${firstCode.toLowerCase()}`);
    if (secondCode) await markInProgress(trainee2.id, week2.taskIdsByCode[secondCode]);
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
        title: "Submission received",
        message: "Your Project 4 (Solo) submission is now awaiting trainer review.",
        type: "SUBMISSION_RECEIVED",
        isRead: false,
      },
      {
        userId: trainee1.id,
        title: "New week available",
        message: "Week 8: React Router, Redux & Project 4 is now unlocked.",
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
      { userId: trainee1.id, type: "WEEK_COMPLETED", description: "Ahmad completed Week 7: React Fundamentals" },
      { userId: trainee2.id, type: "SUBMISSION_CREATED", description: "Sara submitted work for review" },
      { userId: trainer.id, type: "SUBMISSION_REVIEWED", description: "Trainer reviewed Ahmad's submission" },
    ],
  });

  console.log("\nSeed complete.");
  console.log("Demo accounts (see README for details):");
  console.log(`  Trainer:   ${TRAINER_EMAIL}   / ${TRAINER_IS_CUSTOM ? "(from SEED_TRAINER_PASSWORD)" : TRAINER_PASSWORD}`);
  console.log(`  Trainee 1: trainee1@example.com  / ${DEMO_PASSWORD}`);
  console.log(`  Trainee 2: trainee2@example.com  / ${DEMO_PASSWORD}`);
  console.log(`  QA Trainer (tests only): ${QA_TRAINER_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
