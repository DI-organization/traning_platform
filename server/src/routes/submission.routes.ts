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
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Submission created }
 *       409: { description: A pending submission already exists for this task }
 */
router.post("/", authorize(Role.TRAINEE), validate(createSubmissionSchema), submissionController.createSubmission);
router.get("/", validate(listSubmissionsQuerySchema), submissionController.listSubmissions);
router.get("/:id", submissionController.getSubmission);
router.patch("/:id", authorize(Role.TRAINEE), validate(updateSubmissionSchema), submissionController.updateSubmission);

router.post(
  "/:submissionId/reviews",
  authorize(Role.TRAINER),
  validate(createReviewSchema),
  reviewController.createReview
);

router.post("/:submissionId/github/refetch", githubController.refetchSubmissionMetadata);

export default router;
