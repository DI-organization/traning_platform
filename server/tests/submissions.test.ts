import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app, loginAs, prisma } from "./helpers";

describe("Submission workflow", () => {
  let trainerToken: string;
  let traineeToken: string;
  let taskId: string;
  let traineeId: string;

  beforeAll(async () => {
    trainerToken = await loginAs("trainer@example.com");
    traineeToken = await loginAs("trainee2@example.com");

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${traineeToken}`);
    traineeId = me.body.data.id;

    const programs = await request(app).get("/api/programs").set("Authorization", `Bearer ${trainerToken}`);
    const programId = programs.body.data[0].id;
    const program = await request(app).get(`/api/programs/${programId}`).set("Authorization", `Bearer ${trainerToken}`);
    const weekId = program.body.data.phases[0].weeks[0].id;

    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${trainerToken}`)
      .send({
        code: `TEST-${Date.now()}`,
        title: "Temporary test task",
        description: "Created by the automated test suite.",
        weekId,
        type: "CODING",
        priority: "LOW",
        difficulty: "EASY",
        points: 10,
        estimatedHours: 1,
        instructions: "N/A",
        acceptanceCriteria: ["Works"],
      });
    taskId = taskRes.body.data.id;
  });

  afterAll(async () => {
    if (taskId) {
      await prisma.task.delete({ where: { id: taskId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it("lets a trainee create a submission", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .set("Authorization", `Bearer ${traineeToken}`)
      .send({ taskId, repositoryUrl: "https://github.com/octocat/hello-world", notes: "First attempt" });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("SUBMITTED");
    expect(res.body.data.attemptNumber).toBe(1);
  });

  it("rejects a second submission while one is still pending review", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .set("Authorization", `Bearer ${traineeToken}`)
      .send({ taskId, repositoryUrl: "https://github.com/octocat/hello-world-again" });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("SUBMISSION_PENDING");
  });

  it("blocks a trainee from reviewing their own submission", async () => {
    const list = await request(app).get(`/api/submissions?taskId=${taskId}`).set("Authorization", `Bearer ${traineeToken}`);
    const submissionId = list.body.data[0].id;

    const res = await request(app)
      .post(`/api/submissions/${submissionId}/reviews`)
      .set("Authorization", `Bearer ${traineeToken}`)
      .send({ decision: "APPROVED", feedback: "Nice work" });

    expect(res.status).toBe(403);
  });

  it("lets a trainer request changes on a submission", async () => {
    const list = await request(app).get(`/api/submissions?taskId=${taskId}`).set("Authorization", `Bearer ${trainerToken}`);
    const submissionId = list.body.data[0].id;

    const res = await request(app)
      .post(`/api/submissions/${submissionId}/reviews`)
      .set("Authorization", `Bearer ${trainerToken}`)
      .send({ decision: "CHANGES_REQUESTED", feedback: "Please add tests." });

    expect(res.status).toBe(201);

    const submission = await request(app).get(`/api/submissions/${submissionId}`).set("Authorization", `Bearer ${trainerToken}`);
    expect(submission.body.data.status).toBe("CHANGES_REQUESTED");
  });

  it("allows resubmission after changes were requested, creating a new attempt", async () => {
    const res = await request(app)
      .post("/api/submissions")
      .set("Authorization", `Bearer ${traineeToken}`)
      .send({ taskId, repositoryUrl: "https://github.com/octocat/hello-world-fixed" });

    expect(res.status).toBe(201);
    expect(res.body.data.attemptNumber).toBe(2);
  });

  it("lets a trainer approve a submission and records an evaluation score", async () => {
    const list = await request(app).get(`/api/submissions?taskId=${taskId}`).set("Authorization", `Bearer ${trainerToken}`);
    const submissionId = list.body.data[0].id;

    const res = await request(app)
      .post(`/api/submissions/${submissionId}/reviews`)
      .set("Authorization", `Bearer ${trainerToken}`)
      .send({ decision: "APPROVED", feedback: "Great job!", scores: { taskCompletion: 90, codeQuality: 85 } });

    expect(res.status).toBe(201);

    const submission = await request(app).get(`/api/submissions/${submissionId}`).set("Authorization", `Bearer ${trainerToken}`);
    expect(submission.body.data.status).toBe("APPROVED");
    expect(submission.body.data.evaluation.totalScore).toBeGreaterThan(0);

    const assignment = await prisma.taskAssignment.findUnique({ where: { taskId_userId: { taskId, userId: traineeId } } });
    expect(assignment?.status).toBe("APPROVED");
  });
});
