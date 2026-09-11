import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/apiResponse";

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.code, err.details);
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, "Validation failed", "VALIDATION_ERROR", err.flatten());
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return sendError(res, 409, `A record with this ${(err.meta?.target as string[])?.join(", ") ?? "value"} already exists`, "DUPLICATE_RECORD");
    }
    if (err.code === "P2025") {
      return sendError(res, 404, "Record not found", "NOT_FOUND");
    }
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return sendError(res, 500, "Internal server error", "INTERNAL_ERROR");
}
