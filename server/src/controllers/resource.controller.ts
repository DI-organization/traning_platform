import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as resourceService from "../services/resource.service";

export const createResource = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await resourceService.createResource(req.body), 201);
});

export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await resourceService.updateResource(req.params.id, req.body));
});

export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  await resourceService.deleteResource(req.params.id);
  sendSuccess(res, { message: "Resource deleted" });
});

export const listResourcesByWeek = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await resourceService.listResourcesByWeek(req.params.weekId));
});
