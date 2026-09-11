import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateUserSchema } from "../schemas/user.schema";

const router = Router();

router.get("/me/profile", authenticate, userController.getMyProfile);
router.patch("/me", authenticate, validate(updateUserSchema), userController.updateUser);

export default router;
