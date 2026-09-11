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
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of tasks }
 */
router.get("/", validate(listTasksQuerySchema), taskController.listTasks);
router.post("/", authorize(Role.TRAINER), validate(createTaskSchema), taskController.createTask);
router.get("/:id", taskController.getTask);
router.patch("/:id", authorize(Role.TRAINER), validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", authorize(Role.TRAINER), taskController.deleteTask);
router.post("/:id/start", authorize(Role.TRAINEE), taskController.startTask);
router.patch(
  "/:id/assignments/:userId",
  authorize(Role.TRAINER),
  validate(updateAssignmentStatusSchema),
  taskController.updateAssignmentStatus
);
router.post("/week/:weekId/reorder", authorize(Role.TRAINER), validate(reorderTasksSchema), taskController.reorderTasks);

export default router;
