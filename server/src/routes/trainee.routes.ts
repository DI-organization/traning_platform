import { Router } from "express";
import { Role } from "@prisma/client";
import * as userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createTraineeSchema, updateUserSchema, updateUserStatusSchema, listUsersQuerySchema } from "../schemas/user.schema";

const router = Router();

router.use(authenticate, authorize(Role.TRAINER));

/**
 * @openapi
 * /trainees:
 *   get:
 *     tags: [Trainees]
 *     summary: List trainees (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive] }
 *     responses:
 *       200: { description: Paginated list of trainees }
 *   post:
 *     tags: [Trainees]
 *     summary: Create a trainee account (trainer only)
 *     description: Trainees can never self-register — only a trainer can create an account. Password is set by the trainer as a temporary credential.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               phone: { type: string }
 *               githubUsername: { type: string }
 *     responses:
 *       201: { description: Trainee created and enrolled in the active program }
 *       409: { description: A user with this email already exists }
 */
router.get("/", validate(listUsersQuerySchema), userController.listTrainees);
router.post("/", validate(createTraineeSchema), userController.createTrainee);

/**
 * @openapi
 * /trainees/{id}:
 *   get:
 *     tags: [Trainees]
 *     summary: Get full trainee detail — progress, submissions, activity (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Trainee detail }
 *       404: { description: Trainee not found }
 *   patch:
 *     tags: [Trainees]
 *     summary: Update a trainee's profile fields (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Trainee updated }
 */
router.get("/:id", userController.getTraineeDetail);
router.patch("/:id", validate(updateUserSchema), userController.updateUser);

/**
 * @openapi
 * /trainees/{id}/status:
 *   patch:
 *     tags: [Trainees]
 *     summary: Activate or deactivate a trainee account (trainer only)
 *     description: A deactivated trainee cannot log in.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch("/:id/status", validate(updateUserStatusSchema), userController.setTraineeStatus);

export default router;
