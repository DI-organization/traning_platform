import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export async function createResource(data: Prisma.ResourceUncheckedCreateInput) {
  const week = await prisma.week.findUnique({ where: { id: data.weekId } });
  if (!week) throw ApiError.notFound("Week not found");
  return prisma.resource.create({ data });
}

export async function updateResource(id: string, data: Prisma.ResourceUpdateInput) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound("Resource not found");
  return prisma.resource.update({ where: { id }, data });
}

export async function deleteResource(id: string) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw ApiError.notFound("Resource not found");
  await prisma.resource.delete({ where: { id } });
}

export async function listResourcesByWeek(weekId: string) {
  return prisma.resource.findMany({ where: { weekId }, orderBy: { order: "asc" } });
}
