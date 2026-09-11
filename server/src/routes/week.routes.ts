import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateWeekSchema, createTopicSchema, createResearchQuestionSchema } from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

router.get("/:weekId", programController.getWeek);
router.patch("/:weekId", authorize(Role.TRAINER), validate(updateWeekSchema), programController.updateWeek);
router.patch("/:weekId/lock", authorize(Role.TRAINER), programController.setWeekLock);

router.post("/:weekId/topics", authorize(Role.TRAINER), validate(createTopicSchema), programController.createTopic);
router.delete("/:weekId/topics/:topicId", authorize(Role.TRAINER), programController.deleteTopic);

router.post(
  "/:weekId/research-questions",
  authorize(Role.TRAINER),
  validate(createResearchQuestionSchema),
  programController.createResearchQuestion
);
router.delete("/:weekId/research-questions/:questionId", authorize(Role.TRAINER), programController.deleteResearchQuestion);

export default router;
