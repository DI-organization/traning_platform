import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/config/prisma";

export const app = createApp();

export async function loginAs(email: string, password = "Password123!") {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token as string;
}

export { prisma };
