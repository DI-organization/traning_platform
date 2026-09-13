import { Router } from "express";
import * as githubController from "../controllers/github.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /github/lookup:
 *   get:
 *     tags: [GitHub]
 *     summary: Look up public repository metadata by URL
 *     description: Used to validate/preview a repository URL while a trainee is filling out the submission form. Uses GitHub's public API; an optional server-side GITHUB_TOKEN raises rate limits but is never required.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema: { type: string, format: uri }
 *         example: https://github.com/octocat/hello-world
 *     responses:
 *       200: { description: Repository metadata, or a fetchStatus of NOT_FOUND/FAILED if unavailable }
 *       400: { description: Not a valid GitHub repository URL }
 */
router.get("/lookup", githubController.lookupRepository);

export default router;
