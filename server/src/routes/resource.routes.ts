import { Router } from "express";
import { Role } from "@prisma/client";
import * as resourceController from "../controllers/resource.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createResourceSchema, updateResourceSchema } from "../schemas/resource.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /resources:
 *   post:
 *     tags: [Resources]
 *     summary: Add a learning resource to a week (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weekId, title, description, url]
 *             properties:
 *               weekId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               url: { type: string, format: uri }
 *               type: { type: string, enum: [DOCUMENTATION, ARTICLE, VIDEO, COURSE, BOOK, OTHER] }
 *               isRequired: { type: boolean }
 *               estimatedMinutes: { type: integer }
 *     responses:
 *       201: { description: Resource created }
 *       403: { description: Not a trainer }
 */
router.post("/", authorize(Role.TRAINER), validate(createResourceSchema), resourceController.createResource);

/**
 * @openapi
 * /resources/{id}:
 *   patch:
 *     tags: [Resources]
 *     summary: Update a resource (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resource updated }
 *       403: { description: Not a trainer }
 *   delete:
 *     tags: [Resources]
 *     summary: Delete a resource (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resource deleted }
 *       403: { description: Not a trainer }
 */
router.patch("/:id", authorize(Role.TRAINER), validate(updateResourceSchema), resourceController.updateResource);
router.delete("/:id", authorize(Role.TRAINER), resourceController.deleteResource);

/**
 * @openapi
 * /resources/week/{weekId}:
 *   get:
 *     tags: [Resources]
 *     summary: List all resources for a week
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of resources ordered for display }
 */
router.get("/week/:weekId", resourceController.listResourcesByWeek);

export default router;
