import { Router } from "express";
import { Role } from "@prisma/client";
import * as analyticsController from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize(Role.TRAINER));

router.get("/dashboard", analyticsController.getDashboard);
router.get("/", analyticsController.getAnalytics);

export default router;
