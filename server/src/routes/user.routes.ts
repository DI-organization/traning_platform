import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateUserSchema } from "../schemas/user.schema";

const router = Router();

/**
 * @openapi
 * /users/me/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the current trainee's full profile (progress, submissions, activity)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Full trainee profile }
 */
router.get("/me/profile", authenticate, userController.getMyProfile);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update the current user's own profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string, nullable: true }
 *               githubUsername: { type: string, nullable: true }
 *               avatar: { type: string, nullable: true }
 *     responses:
 *       200: { description: Profile updated }
 */
router.patch("/me", authenticate, validate(updateUserSchema), userController.updateUser);

export default router;
