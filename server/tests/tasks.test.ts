import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app, loginAs } from "./helpers";

describe("GET /api/tasks", () => {
  let trainerToken: string;
  let traineeToken: string;

  beforeAll(async () => {
    trainerToken = await loginAs("trainer@example.com");
    traineeToken = await loginAs("trainee1@example.com");
  });

  it("returns a paginated list of tasks for a trainer", async () => {
    const res = await request(app).get("/api/tasks?page=1&limit=5").set("Authorization", `Bearer ${trainerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 5 });
  });

  it("merges the trainee's own assignment status into each task", async () => {
    const res = await request(app).get("/api/tasks?page=1&limit=5").set("Authorization", `Bearer ${traineeToken}`);

    expect(res.status).toBe(200);
    for (const task of res.body.data) {
      expect(task).toHaveProperty("assignmentStatus");
    }
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });
});
