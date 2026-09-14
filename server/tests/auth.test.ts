import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./helpers";

const TRAINER_EMAIL = "qa-trainer@example.com";
const TRAINEE_EMAIL = "trainee1@example.com";
const PASSWORD = "Password123!";

describe("POST /api/auth/login", () => {
  it("logs in successfully with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TRAINER_EMAIL, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf("string");
    expect(res.body.data.user.email).toBe(TRAINER_EMAIL);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects an invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TRAINER_EMAIL, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a malformed request body", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/auth/me", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: TRAINEE_EMAIL, password: PASSWORD });
    const token = login.body.data.token;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TRAINEE_EMAIL);
    expect(res.body.data.role).toBe("TRAINEE");
  });
});

describe("Role authorization", () => {
  it("blocks a trainee from a trainer-only endpoint", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: TRAINEE_EMAIL, password: PASSWORD });
    const token = login.body.data.token;

    const res = await request(app).get("/api/trainees").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("allows a trainer to access a trainer-only endpoint", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: TRAINER_EMAIL, password: PASSWORD });
    const token = login.body.data.token;

    const res = await request(app).get("/api/trainees").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
