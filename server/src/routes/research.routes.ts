import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { answerResearchQuestionSchema, scoreResearchAnswerSchema } from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

router.get("/answers/me", authorize(Role.TRAINEE), programController.listMyResearchAnswers);
router.post(
  "/questions/:questionId/answers",
  authorize(Role.TRAINEE),
  validate(answerResearchQuestionSchema),
  programController.answerResearchQuestion
);
router.patch(
  "/answers/:answerId/score",
  authorize(Role.TRAINER),
  validate(scoreResearchAnswerSchema),
  programController.scoreResearchAnswer
);

export default router;
