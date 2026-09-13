import { Router } from "express";
import { Role } from "@prisma/client";
import * as submissionController from "../controllers/submission.controller";
import * as reviewController from "../controllers/review.controller";
import * as githubController from "../controllers/github.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createSubmissionSchema, updateSubmissionSchema, listSubmissionsQuerySchema, createReviewSchema } from "../schemas/submission.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /submissions:
 *   post:
 *     tags: [Submissions]
 *     summary: Submit work for a task (trainee only)
 *     description: Rejected with 409 if the trainee already has a pending (SUBMITTED/UNDER_REVIEW) submission for this task — update it instead via PATCH.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId]
 *             properties:
 *               taskId: { type: string, format: uuid }
 *               repositoryUrl: { type: string, format: uri }
 *               branchName: { type: string }
 *               pullRequestUrl: { type: string, format: uri }
 *               liveDemoUrl: { type: string, format: uri }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Submission created }
 *       400: { description: Neither a repository URL nor a pull request URL was provided }
 *       409: { description: A pending submission already exists for this task }
 *   get:
 *     tags: [Submissions]
 *     summary: List submissions (paginated). Trainees only ever see their own.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: userId
 *         schema: { type: string, format: uuid }
 *         description: Trainer only — filter to one trainee
 *       - in: query
 *         name: taskId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: weekId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED] }
 *     responses:
 *       200: { description: Paginated list of submissions }
 */
router.post("/", authorize(Role.TRAINEE), validate(createSubmissionSchema), submissionController.createSubmission);
router.get("/", validate(listSubmissionsQuerySchema), submissionController.listSubmissions);

/**
 * @openapi
 * /submissions/{id}:
 *   get:
 *     tags: [Submissions]
 *     summary: Get full submission detail, including attempt history and GitHub metadata
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Submission detail }
 *       403: { description: A trainee tried to view another trainee's submission }
 *       404: { description: Submission not found }
 *   patch:
 *     tags: [Submissions]
 *     summary: Update a pending submission (trainee only, owner only)
 *     description: Only allowed while the submission's status is SUBMITTED or UNDER_REVIEW.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               repositoryUrl: { type: string, format: uri }
 *               branchName: { type: string }
 *               pullRequestUrl: { type: string, format: uri }
 *               liveDemoUrl: { type: string, format: uri }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Submission updated }
 *       400: { description: The submission is no longer pending and cannot be edited }
 *       403: { description: Not the owner of this submission }
 */
router.get("/:id", submissionController.getSubmission);
router.patch("/:id", authorize(Role.TRAINEE), validate(updateSubmissionSchema), submissionController.updateSubmission);

/**
 * @openapi
 * /submissions/{submissionId}/reviews:
 *   post:
 *     tags: [Submissions]
 *     summary: Review a submission — approve or request changes (trainer only)
 *     description: Creates a review record (history is never overwritten), updates the submission and task-assignment status, and optionally records an Evaluation score.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision, feedback]
 *             properties:
 *               decision: { type: string, enum: [APPROVED, CHANGES_REQUESTED] }
 *               feedback: { type: string }
 *               scores:
 *                 type: object
 *                 description: Optional, 0-100 each; averaged into the evaluation's totalScore
 *                 properties:
 *                   taskCompletion: { type: integer }
 *                   functionality: { type: integer }
 *                   codeQuality: { type: integer }
 *                   architecture: { type: integer }
 *                   gitUsage: { type: integer }
 *                   problemSolving: { type: integer }
 *                   documentation: { type: integer }
 *                   testing: { type: integer }
 *                   technicalUnderstanding: { type: integer }
 *     responses:
 *       201: { description: Review recorded }
 *       403: { description: Not a trainer }
 *       404: { description: Submission not found }
 */
router.post(
  "/:submissionId/reviews",
  authorize(Role.TRAINER),
  validate(createReviewSchema),
  reviewController.createReview
);

/**
 * @openapi
 * /submissions/{submissionId}/github/refetch:
 *   post:
 *     tags: [Submissions]
 *     summary: Re-fetch GitHub repository/PR metadata for a submission
 *     description: Best-effort — a GitHub API failure never fails this request or the submission itself.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Refetch triggered }
 */
router.post("/:submissionId/github/refetch", githubController.refetchSubmissionMetadata);

export default router;
