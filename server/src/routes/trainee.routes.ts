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
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Trainee created }
 */
router.get("/", validate(listUsersQuerySchema), userController.listTrainees);
router.post("/", validate(createTraineeSchema), userController.createTrainee);
router.get("/:id", userController.getTraineeDetail);
router.patch("/:id", validate(updateUserSchema), userController.updateUser);
router.patch("/:id/status", validate(updateUserStatusSchema), userController.setTraineeStatus);

export default router;
