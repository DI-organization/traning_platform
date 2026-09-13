import { Router } from "express";
import { Role } from "@prisma/client";
import * as taskController from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  reorderTasksSchema,
  updateAssignmentStatusSchema,
} from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks (paginated). Trainees see their own assignment status merged in.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: weekId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [LEARNING, CODING, PROBLEM_SOLVING, RESEARCH, PROJECT] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [NOT_STARTED, IN_PROGRESS, SUBMITTED, CHANGES_REQUESTED, APPROVED, OVERDUE] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of tasks }
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task (trainer only)
 *     description: Auto-assigns a TaskAssignment and sends a notification to every active trainee currently enrolled in the task's program.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, title, description, weekId, instructions]
 *             properties:
 *               code: { type: string, example: JS-001 }
 *               title: { type: string }
 *               description: { type: string }
 *               weekId: { type: string, format: uuid }
 *               type: { type: string, enum: [LEARNING, CODING, PROBLEM_SOLVING, RESEARCH, PROJECT] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               difficulty: { type: string, enum: [EASY, MEDIUM, HARD] }
 *               points: { type: integer }
 *               estimatedHours: { type: number }
 *               dueDate: { type: string, format: date-time }
 *               instructions: { type: string }
 *               acceptanceCriteria: { type: array, items: { type: string } }
 *               isWeeklyProject: { type: boolean }
 *     responses:
 *       201: { description: Task created }
 *       403: { description: Not a trainer }
 *       409: { description: Task code already in use }
 */
router.get("/", validate(listTasksQuerySchema), taskController.listTasks);
router.post("/", authorize(Role.TRAINER), validate(createTaskSchema), taskController.createTask);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task detail. Includes the caller's assignment and submission history when authenticated as a trainee.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Task detail }
 *       404: { description: Task not found }
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Task updated }
 *       403: { description: Not a trainer }
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Task deleted }
 *       403: { description: Not a trainer }
 */
router.get("/:id", taskController.getTask);
router.patch("/:id", authorize(Role.TRAINER), validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", authorize(Role.TRAINER), taskController.deleteTask);

/**
 * @openapi
 * /tasks/{id}/start:
 *   post:
 *     tags: [Tasks]
 *     summary: Mark a task as started for the current trainee
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Assignment status set to IN_PROGRESS (idempotent) }
 *       403: { description: Not a trainee }
 */
router.post("/:id/start", authorize(Role.TRAINEE), taskController.startTask);

/**
 * @openapi
 * /tasks/{id}/assignments/{userId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Manually set a trainee's assignment status for a task (trainer only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [NOT_STARTED, IN_PROGRESS, SUBMITTED, CHANGES_REQUESTED, APPROVED, OVERDUE] }
 *     responses:
 *       200: { description: Assignment status updated }
 *       403: { description: Not a trainer }
 */
router.patch(
  "/:id/assignments/:userId",
  authorize(Role.TRAINER),
  validate(updateAssignmentStatusSchema),
  taskController.updateAssignmentStatus
);

/**
 * @openapi
 * /tasks/week/{weekId}/reorder:
 *   post:
 *     tags: [Tasks]
 *     summary: Reorder tasks within a week (trainer only)
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
 *             required: [taskIds]
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: Task IDs in the new display order
 *     responses:
 *       200: { description: Tasks reordered }
 *       403: { description: Not a trainer }
 */
router.post("/week/:weekId/reorder", authorize(Role.TRAINER), validate(reorderTasksSchema), taskController.reorderTasks);

export default router;
