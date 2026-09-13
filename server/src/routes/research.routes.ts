import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { answerResearchQuestionSchema, scoreResearchAnswerSchema } from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /research/answers/me:
 *   get:
 *     tags: [Research]
 *     summary: List the current trainee's own research answers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The trainee's answers, each with its question, score and feedback if reviewed }
 *       403: { description: Not a trainee }
 */
router.get("/answers/me", authorize(Role.TRAINEE), programController.listMyResearchAnswers);

/**
 * @openapi
 * /research/questions/{questionId}/answers:
 *   post:
 *     tags: [Research]
 *     summary: Submit or update an answer to a research question (trainee only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer: { type: string }
 *     responses:
 *       201: { description: Answer saved; any prior score/feedback is cleared pending re-review }
 *       403: { description: Not a trainee }
 */
router.post(
  "/questions/:questionId/answers",
  authorize(Role.TRAINEE),
  validate(answerResearchQuestionSchema),
  programController.answerResearchQuestion
);

/**
 * @openapi
 * /research/answers/{answerId}/score:
 *   patch:
 *     tags: [Research]
 *     summary: Score and give feedback on a trainee's research answer (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [score]
 *             properties:
 *               score: { type: integer, minimum: 0, maximum: 100 }
 *               feedback: { type: string }
 *     responses:
 *       200: { description: Answer scored }
 *       403: { description: Not a trainer }
 */
router.patch(
  "/answers/:answerId/score",
  authorize(Role.TRAINER),
  validate(scoreResearchAnswerSchema),
  programController.scoreResearchAnswer
);

export default router;
