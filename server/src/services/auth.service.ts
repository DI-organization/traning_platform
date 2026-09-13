import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { logActivity } from "./activityLog.service";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated. Contact your trainer.", "ACCOUNT_INACTIVE");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logActivity(user.id, "USER_LOGGED_IN", `${user.firstName} ${user.lastName} logged in`);

  const token = signToken({ userId: user.id, role: user.role });
  const { passwordHash: _passwordHash, ...safeUser } = user;

  return { token, user: safeUser };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw ApiError.badRequest("Current password is incorrect", "INVALID_PASSWORD");
  }
  const passwordHash = await hashPassword(newPassword);
  return getMe((await prisma.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: false } })).id);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      githubUsername: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}
