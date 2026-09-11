import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import traineeRoutes from "./trainee.routes";
import programRoutes from "./program.routes";
import weekRoutes from "./week.routes";
import researchRoutes from "./research.routes";
import taskRoutes from "./task.routes";
import resourceRoutes from "./resource.routes";
import submissionRoutes from "./submission.routes";
import notificationRoutes from "./notification.routes";
import analyticsRoutes from "./analytics.routes";
import githubRoutes from "./github.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trainees", traineeRoutes);
router.use("/programs", programRoutes);
router.use("/weeks", weekRoutes);
router.use("/research", researchRoutes);
router.use("/tasks", taskRoutes);
router.use("/resources", resourceRoutes);
router.use("/submissions", submissionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/github", githubRoutes);

export default router;
