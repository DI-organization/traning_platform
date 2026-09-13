import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createProgramSchema,
  updateProgramSchema,
  createWeekSchema,
  createPhaseSchema,
  updatePhaseSchema,
} from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /programs:
 *   get:
 *     tags: [Programs]
 *     summary: List all training programs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of training programs }
 *   post:
 *     tags: [Programs]
 *     summary: Create a training program (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               totalWeeks: { type: integer, default: 12 }
 *               weekUnlockStrategy: { type: string, enum: [MANUAL, AUTOMATIC_BY_DATE] }
 *     responses:
 *       201: { description: Program created }
 *       403: { description: Not a trainer }
 */
router.get("/", programController.listPrograms);
router.post("/", authorize(Role.TRAINER), validate(createProgramSchema), programController.createProgram);

/**
 * @openapi
 * /programs/{id}:
 *   get:
 *     tags: [Programs]
 *     summary: Get a program with all of its weeks, topics, resources, tasks and research questions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Full program tree }
 *       404: { description: Program not found }
 *   patch:
 *     tags: [Programs]
 *     summary: Update program settings (trainer only)
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
 *               title: { type: string }
 *               description: { type: string }
 *               weekUnlockStrategy: { type: string, enum: [MANUAL, AUTOMATIC_BY_DATE] }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Program updated }
 *       403: { description: Not a trainer }
 */
router.get("/:id", programController.getProgram);
router.patch("/:id", authorize(Role.TRAINER), validate(updateProgramSchema), programController.updateProgram);

/**
 * @openapi
 * /programs/{programId}/weeks:
 *   post:
 *     tags: [Programs]
 *     summary: Add a new week to a program (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [weekNumber, title, description]
 *             properties:
 *               weekNumber: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *               objectives: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Week created }
 *       409: { description: A week with this number already exists for the program }
 */
router.post("/:programId/weeks", authorize(Role.TRAINER), validate(createWeekSchema), programController.createWeek);

/**
 * @openapi
 * /programs/{programId}/phases:
 *   post:
 *     tags: [Programs]
 *     summary: Add a phase to a program (trainer only)
 *     description: A phase groups a run of weeks under one track (e.g. "Phase 1 — Frontend Fundamentals").
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phaseNumber, title]
 *             properties:
 *               phaseNumber: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *               order: { type: integer, default: 0 }
 *     responses:
 *       201: { description: Phase created }
 *       409: { description: A phase with this number already exists for the program }
 */
router.post("/:programId/phases", authorize(Role.TRAINER), validate(createPhaseSchema), programController.createPhase);

/**
 * @openapi
 * /programs/phases/{phaseId}:
 *   patch:
 *     tags: [Programs]
 *     summary: Update a phase (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: phaseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Phase updated }
 *       403: { description: Not a trainer }
 *   delete:
 *     tags: [Programs]
 *     summary: Delete an empty phase (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: phaseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Phase deleted }
 *       400: { description: The phase still has weeks assigned to it }
 */
router.patch("/phases/:phaseId", authorize(Role.TRAINER), validate(updatePhaseSchema), programController.updatePhase);
router.delete("/phases/:phaseId", authorize(Role.TRAINER), programController.deletePhase);

export default router;
