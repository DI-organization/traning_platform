import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as githubService from "../services/github.service";

export const refetchSubmissionMetadata = asyncHandler(async (req: Request, res: Response) => {
  await githubService.refetchSubmissionMetadata(req.params.submissionId);
  sendSuccess(res, { message: "Refetch triggered" });
});

/** Lightweight repo lookup used to validate a URL while a trainee is filling out the submission form. */
export const lookupRepository = asyncHandler(async (req: Request, res: Response) => {
  const url = req.query.url as string | undefined;
  if (!url) throw ApiError.badRequest("Missing url query parameter");

  const parsed = githubService.parseRepositoryUrl(url);
  if (!parsed) throw ApiError.badRequest("Not a valid GitHub repository URL", "INVALID_GITHUB_URL");

  const meta = await githubService.fetchRepositoryMetadata(parsed.owner, parsed.repo);
  sendSuccess(res, { owner: parsed.owner, repo: parsed.repo, ...meta });
});
