import { Router } from "express";
import { Role } from "@prisma/client";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize(Role.TRAINER));

/**
 * @openapi
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Trainer dashboard data (trainer only)
 *     description: KPIs, per-trainee progress table, pending reviews and recent activity feed.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard data }
 *       403: { description: Not a trainer }
 */
router.get("/dashboard", analyticsController.getDashboard);

/**
 * @openapi
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Program-wide analytics (trainer only)
 *     description: KPIs plus weekly completion, score distribution, task status distribution, task-difficulty performance and a full trainee comparison table.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Analytics data }
 *       403: { description: Not a trainer }
 *       404: { description: No active training program }
 */
router.get("/", analyticsController.getAnalytics);

export default router;
