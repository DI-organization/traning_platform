import { Router } from "express";
import { Role } from "@prisma/client";
import * as resourceController from "../controllers/resource.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createResourceSchema, updateResourceSchema } from "../schemas/resource.schema";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.TRAINER), validate(createResourceSchema), resourceController.createResource);
router.patch("/:id", authorize(Role.TRAINER), validate(updateResourceSchema), resourceController.updateResource);
router.delete("/:id", authorize(Role.TRAINER), resourceController.deleteResource);
router.get("/week/:weekId", resourceController.listResourcesByWeek);

export default router;
