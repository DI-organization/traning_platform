import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateWeekSchema, createTopicSchema, createResearchQuestionSchema } from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /weeks/{weekId}:
 *   get:
 *     tags: [Weeks]
 *     summary: Get a single week with its topics, resources, tasks and research questions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Week detail }
 *       404: { description: Week not found }
 *   patch:
 *     tags: [Weeks]
 *     summary: Update a week's content (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               objectives: { type: array, items: { type: string } }
 *               isLocked: { type: boolean }
 *     responses:
 *       200: { description: Week updated }
 *       403: { description: Not a trainer }
 */
router.get("/:weekId", programController.getWeek);
router.patch("/:weekId", authorize(Role.TRAINER), validate(updateWeekSchema), programController.updateWeek);

/**
 * @openapi
 * /weeks/{weekId}/lock:
 *   patch:
 *     tags: [Weeks]
 *     summary: Lock or unlock a week for trainees (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isLocked]
 *             properties:
 *               isLocked: { type: boolean }
 *     responses:
 *       200: { description: Lock state updated; unlocking notifies enrolled trainees }
 *       403: { description: Not a trainer }
 */
router.patch("/:weekId/lock", authorize(Role.TRAINER), programController.setWeekLock);

router.post("/:weekId/topics", authorize(Role.TRAINER), validate(createTopicSchema), programController.createTopic);
router.delete("/:weekId/topics/:topicId", authorize(Role.TRAINER), programController.deleteTopic);

/**
 * @openapi
 * /weeks/{weekId}/research-questions:
 *   post:
 *     tags: [Weeks]
 *     summary: Add a research question to a week (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question: { type: string }
 *               order: { type: integer, default: 0 }
 *     responses:
 *       201: { description: Research question created }
 *       403: { description: Not a trainer }
 */
router.post(
  "/:weekId/research-questions",
  authorize(Role.TRAINER),
  validate(createResearchQuestionSchema),
  programController.createResearchQuestion
);
router.delete("/:weekId/research-questions/:questionId", authorize(Role.TRAINER), programController.deleteResearchQuestion);

export default router;
