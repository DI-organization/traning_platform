import { Router } from "express";
import { Role } from "@prisma/client";
import * as programController from "../controllers/program.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createProgramSchema, updateProgramSchema, createWeekSchema } from "../schemas/program.schema";

const router = Router();

router.use(authenticate);

router.get("/", programController.listPrograms);
router.post("/", authorize(Role.TRAINER), validate(createProgramSchema), programController.createProgram);
router.get("/:id", programController.getProgram);
router.patch("/:id", authorize(Role.TRAINER), validate(updateProgramSchema), programController.updateProgram);
router.post("/:programId/weeks", authorize(Role.TRAINER), validate(createWeekSchema), programController.createWeek);

export default router;
